/**
 * Seed MongoDB from the LeetCode-Questions-CompanyWise GitHub repo.
 *
 *   npm run seed            # import everything
 *   SEED_LIMIT=5 npm run seed   # only the first 5 companies (quick test)
 *
 * Idempotent: re-running upserts, so no duplicates are created.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fall back to .env for any unset vars
import type mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import { connectDB } from "../src/lib/db";
import { Company } from "../src/models/Company";
import { Question } from "../src/models/Question";
import { prettifyCompany, slugify } from "../src/lib/utils";

const REPO = "krishnadey30/LeetCode-Questions-CompanyWise";
const BRANCH = "master";
const TIMEFRAMES = new Set(["alltime", "2year", "1year", "6months"]);
const CONCURRENCY = 12;

type FileEntry = { name: string; company: string; timeframe: string };

function normalizeDifficulty(raw: string): "Easy" | "Medium" | "Hard" {
  const d = (raw || "").trim().toLowerCase();
  if (d.startsWith("e")) return "Easy";
  if (d.startsWith("h")) return "Hard";
  return "Medium";
}

async function listCsvFiles(): Promise<FileEntry[]> {
  const url = `https://api.github.com/repos/${REPO}/contents/?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "the-dreamers-seed",
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const items = (await res.json()) as { name: string; type: string }[];
  const files: FileEntry[] = [];
  for (const it of items) {
    if (it.type !== "file" || !it.name.endsWith(".csv")) continue;
    const base = it.name.replace(/\.csv$/, "");
    const idx = base.lastIndexOf("_");
    if (idx === -1) continue;
    const company = base.slice(0, idx);
    const timeframe = base.slice(idx + 1);
    if (!TIMEFRAMES.has(timeframe)) continue;
    files.push({ name: it.name, company, timeframe });
  }
  return files;
}

async function fetchCsv(name: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${encodeURIComponent(
    name
  )}`;
  const res = await fetch(url, { headers: { "User-Agent": "the-dreamers-seed" } });
  if (!res.ok) throw new Error(`raw ${res.status} for ${name}`);
  return res.text();
}

async function importFile(f: FileEntry): Promise<number> {
  const csv = await fetchCsv(f.name);
  let rows: Record<string, string>[];
  try {
    rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  } catch {
    return 0;
  }
  const ops = rows
    .map((r) => {
      const id = parseInt(r["ID"], 10);
      if (Number.isNaN(id)) return null;
      const title = (r["Title"] || "").trim();
      const link = (r["Leetcode Question Link"] || "").trim();
      const doc = {
        leetcodeId: id,
        title,
        slug: slugify(title),
        difficulty: normalizeDifficulty(r["Difficulty"]),
        acceptance: parseFloat((r["Acceptance"] || "0").replace("%", "")) || 0,
        frequency: parseFloat(r["Frequency"]) || 0,
        link,
        company: f.company,
        timeframe: f.timeframe,
      };
      return {
        updateOne: {
          filter: { company: f.company, timeframe: f.timeframe, leetcodeId: id },
          update: { $set: doc },
          upsert: true,
        },
      };
    })
    .filter(Boolean) as mongoose.AnyBulkWriteOperation[];

  if (ops.length) await Question.bulkWrite(ops, { ordered: false });
  return ops.length;
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let i = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

async function main() {
  console.log("Connecting to MongoDB…");
  await connectDB();

  console.log("Listing CSV files from GitHub…");
  let files = await listCsvFiles();
  const companies = [...new Set(files.map((f) => f.company))].sort();
  console.log(`Found ${files.length} files across ${companies.length} companies.`);

  const limit = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : 0;
  const keep = limit ? new Set(companies.slice(0, limit)) : null;
  if (keep) files = files.filter((f) => keep.has(f.company));

  // Upsert companies.
  const companyList = keep ? [...keep] : companies;
  let order = 0;
  for (const slug of companyList) {
    await Company.updateOne(
      { slug },
      { $set: { name: prettifyCompany(slug), order: order++ } },
      { upsert: true }
    );
  }

  // Import question files with bounded concurrency.
  let done = 0;
  let total = 0;
  await runPool(files, async (f) => {
    try {
      const n = await importFile(f);
      total += n;
    } catch (e) {
      console.warn(`  ! ${f.name}: ${(e as Error).message}`);
    }
    done++;
    if (done % 25 === 0 || done === files.length) {
      console.log(`  [${done}/${files.length}] files, ${total} rows upserted`);
    }
  });

  // Recompute per-company question counts (distinct problems, alltime preferred).
  console.log("Recomputing question counts…");
  for (const slug of companyList) {
    const ids = await Question.distinct("leetcodeId", { company: slug });
    await Company.updateOne({ slug }, { $set: { questionCount: ids.length } });
  }

  console.log(`Done. ${total} question rows across ${companyList.length} companies.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
