import "server-only";
import { connectDB } from "./db";
import { Company } from "@/models/Company";
import { Question } from "@/models/Question";
import { Thought } from "@/models/Thought";
import { Profile } from "@/models/Profile";
import { companyLabel, dailyIndex, escapeRegex, type Difficulty, type Timeframe } from "./utils";

export type CompanyLite = {
  name: string;
  slug: string;
  logoUrl: string;
  questionCount: number;
};

export type QuestionLite = {
  leetcodeId: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  frequency: number;
  link: string;
  company: string;
  timeframe: string;
};

/** One row per problem across every company (the Questions page). */
export type ExploreQuestion = QuestionLite & { companyCount: number };

function mapCompany(d: Record<string, unknown>): CompanyLite {
  const slug = d.slug as string;
  return {
    name: companyLabel(d.name as string, slug),
    slug,
    logoUrl: (d.logoUrl as string) ?? "",
    questionCount: (d.questionCount as number) ?? 0,
  };
}

/** A small per-instance memo for data that changes rarely (the home page's showcase). */
const memoStore = new Map<string, { at: number; value: unknown }>();
async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = memoStore.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  memoStore.set(key, { at: Date.now(), value });
  return value;
}

export async function getCompanies(): Promise<CompanyLite[]> {
  await connectDB();
  const docs = await Company.find({}).sort({ questionCount: -1, name: 1 }).lean();
  return docs.map((d) => mapCompany(d as Record<string, unknown>));
}

export async function getCompany(slug: string): Promise<CompanyLite | null> {
  await connectDB();
  const d = await Company.findOne({ slug }).lean<Record<string, unknown>>();
  return d ? mapCompany(d) : null;
}

function mapQuestion(d: Record<string, unknown>): QuestionLite {
  return {
    leetcodeId: d.leetcodeId as number,
    title: d.title as string,
    difficulty: d.difficulty as Difficulty,
    acceptance: (d.acceptance as number) ?? 0,
    frequency: (d.frequency as number) ?? 0,
    link: (d.link as string) ?? "",
    company: d.company as string,
    timeframe: d.timeframe as string,
  };
}

export async function getCompanyQuestions(slug: string, timeframe: Timeframe): Promise<QuestionLite[]> {
  await connectDB();
  // Fall back to whatever timeframe exists if the requested one is empty.
  let docs = await Question.find({ company: slug, timeframe }).sort({ frequency: -1 }).lean();
  if (!docs.length) {
    docs = await Question.find({ company: slug }).sort({ frequency: -1 }).lean();
  }
  return docs.map((d) => mapQuestion(d as Record<string, unknown>));
}

export async function getAvailableTimeframes(slug: string): Promise<string[]> {
  await connectDB();
  return Question.distinct("timeframe", { company: slug });
}

export async function searchQuestions(opts: {
  q?: string;
  difficulty?: string;
  company?: string;
  limit?: number;
}): Promise<QuestionLite[]> {
  await connectDB();
  const filter: Record<string, unknown> = { timeframe: "alltime" };
  if (opts.q) filter.title = { $regex: escapeRegex(opts.q), $options: "i" };
  if (opts.difficulty) filter.difficulty = opts.difficulty;
  if (opts.company) filter.company = opts.company;
  const docs = await Question.find(filter)
    .sort({ frequency: -1 })
    .limit(opts.limit ?? 100)
    .lean();
  return docs.map((d) => mapQuestion(d as Record<string, unknown>));
}

/** Every problem once, with how many companies ask it (all time), most widely asked first. */
export async function getExploreQuestions(): Promise<ExploreQuestion[]> {
  await connectDB();
  const rows = await Question.aggregate<{
    _id: number;
    title: string;
    difficulty: Difficulty;
    acceptance: number;
    link: string;
    frequency: number;
    company: string;
    companyCount: number;
  }>([
    { $match: { timeframe: "alltime" } },
    { $sort: { frequency: -1 } },
    {
      $group: {
        _id: "$leetcodeId",
        title: { $first: "$title" },
        difficulty: { $first: "$difficulty" },
        acceptance: { $max: "$acceptance" },
        link: { $first: "$link" },
        frequency: { $max: "$frequency" },
        company: { $first: "$company" },
        companyCount: { $sum: 1 },
      },
    },
    { $sort: { companyCount: -1, frequency: -1, _id: 1 } },
  ]);
  return rows.map((r) => ({
    leetcodeId: r._id,
    title: r.title,
    difficulty: r.difficulty,
    acceptance: r.acceptance ?? 0,
    frequency: r.frequency ?? 0,
    link: r.link ?? "",
    company: r.company,
    timeframe: "alltime",
    companyCount: r.companyCount,
  }));
}

export type QuestionDetail = {
  leetcodeId: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  link: string;
  companies: { slug: string; name: string; frequency: number; timeframes: string[] }[];
};

/** Who asks one problem, most often first (all-time frequency, else the best of the others). */
export async function getQuestionDetail(leetcodeId: number): Promise<QuestionDetail | null> {
  await connectDB();
  const rows = await Question.find({ leetcodeId }).lean<Record<string, unknown>[]>();
  if (!rows.length) return null;
  const by = new Map<string, { all: number | null; best: number; tfs: Set<string> }>();
  for (const r of rows) {
    const slug = r.company as string;
    const e = by.get(slug) ?? { all: null, best: 0, tfs: new Set<string>() };
    const f = (r.frequency as number) ?? 0;
    if (r.timeframe === "alltime") e.all = f;
    e.best = Math.max(e.best, f);
    e.tfs.add(r.timeframe as string);
    by.set(slug, e);
  }
  const names = await Company.find({ slug: { $in: [...by.keys()] } }, { slug: 1, name: 1 }).lean<
    { slug: string; name: string }[]
  >();
  const nameOf = new Map(names.map((n) => [n.slug, companyLabel(n.name, n.slug)]));
  const first = (rows.find((r) => r.timeframe === "alltime") ?? rows[0]) as Record<string, unknown>;
  const order = ["6months", "1year", "2year", "alltime"];
  return {
    leetcodeId,
    title: first.title as string,
    difficulty: first.difficulty as Difficulty,
    acceptance: (first.acceptance as number) ?? 0,
    link: (first.link as string) ?? "",
    companies: [...by.entries()]
      .map(([slug, e]) => ({
        slug,
        name: nameOf.get(slug) ?? companyLabel(undefined, slug),
        frequency: e.all ?? e.best,
        timeframes: [...e.tfs].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
      }))
      .sort((a, b) => b.frequency - a.frequency || a.name.localeCompare(b.name)),
  };
}

export type SearchResult = {
  companies: { name: string; slug: string; questionCount: number }[];
  questions: { leetcodeId: number; title: string; difficulty: Difficulty; companyCount: number }[];
};

/** The command palette: companies by name, problems by title or number. */
export async function quickSearch(raw: string): Promise<SearchResult> {
  const term = raw.trim().slice(0, 80);
  if (!term) return { companies: [], questions: [] };
  await connectDB();
  const rx = new RegExp(escapeRegex(term), "i");
  const id = /^\d{1,5}$/.test(term) ? Number(term) : null;
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const want = squash(term);
  const [companies, questions] = await Promise.all([
    // ~200 small documents: match the shown name, the stored name and the slug, punctuation ignored
    want
      ? Company.find({}, { name: 1, slug: 1, logoUrl: 1, questionCount: 1 })
          .sort({ questionCount: -1 })
          .lean<Record<string, unknown>[]>()
          .then((all) =>
            all
              .filter((c) => {
                const slug = c.slug as string;
                return [companyLabel(c.name as string, slug), c.name as string, slug].some((n) => squash(n ?? "").includes(want));
              })
              .slice(0, 6)
          )
      : Promise.resolve([] as Record<string, unknown>[]),
    Question.aggregate<{ _id: number; title: string; difficulty: Difficulty; companyCount: number }>([
      { $match: { timeframe: "alltime", ...(id ? { $or: [{ leetcodeId: id }, { title: rx }] } : { title: rx }) } },
      {
        $group: {
          _id: "$leetcodeId",
          title: { $first: "$title" },
          difficulty: { $first: "$difficulty" },
          companyCount: { $sum: 1 },
        },
      },
      { $sort: { companyCount: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);
  return {
    companies: companies.map((c) => {
      const m = mapCompany(c);
      return { name: m.name, slug: m.slug, questionCount: m.questionCount };
    }),
    questions: questions
      .sort((a, b) => (id ? Number(b._id === id) - Number(a._id === id) : 0))
      .map((q) => ({ leetcodeId: q._id, title: q.title, difficulty: q.difficulty, companyCount: q.companyCount })),
  };
}

export async function compareCompanies(a: string, b: string) {
  await connectDB();
  const [qa, qb] = await Promise.all([getCompanyQuestions(a, "alltime"), getCompanyQuestions(b, "alltime")]);
  const mapA = new Map(qa.map((q) => [q.leetcodeId, q]));
  const mapB = new Map(qb.map((q) => [q.leetcodeId, q]));
  const shared = qa.filter((q) => mapB.has(q.leetcodeId)).sort((x, y) => y.frequency - x.frequency);
  const onlyA = qa.filter((q) => !mapB.has(q.leetcodeId));
  const onlyB = qb.filter((q) => !mapA.has(q.leetcodeId));
  // how often the other company asks each shared problem, for the side-by-side columns
  const sharedFreqB: Record<number, number> = {};
  for (const q of shared) sharedFreqB[q.leetcodeId] = mapB.get(q.leetcodeId)?.frequency ?? 0;
  return { shared, sharedFreqB, onlyA, onlyB, countA: qa.length, countB: qb.length };
}

/** Today's question: the same pick for everyone, from the most widely asked problems. */
export function pickDaily<T>(list: T[]): T | null {
  return list.length ? list[dailyIndex(list.length)] : null;
}

export type ThoughtLite = {
  id: string;
  text: string;
  author: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
};

export async function getThoughts(): Promise<ThoughtLite[]> {
  await connectDB();
  const docs = await Thought.find({}).sort({ createdAt: -1 }).lean();
  return docs.map((d: Record<string, unknown>) => ({
    id: String(d._id),
    text: d.text as string,
    author: (d.author as string) ?? "The Dreamer",
    category: (d.category as string) ?? "Motivation",
    isFeatured: Boolean(d.isFeatured),
    createdAt: (d.createdAt as Date)?.toISOString?.() ?? "",
  }));
}

export async function getFeaturedThought(): Promise<ThoughtLite | null> {
  const all = await getThoughts();
  return all.find((t) => t.isFeatured) ?? all[0] ?? null;
}

export type ProfileLite = {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  socials: Record<string, string>;
};

export async function getProfile(): Promise<ProfileLite> {
  await connectDB();
  let doc = await Profile.findOne({ key: "singleton" }).lean<Record<string, unknown>>();
  if (!doc) {
    const created = await Profile.create({ key: "singleton" });
    doc = created.toObject();
  }
  const d = doc as Record<string, unknown>;
  return {
    name: d.name as string,
    role: d.role as string,
    bio: d.bio as string,
    avatarUrl: (d.avatarUrl as string) ?? "",
    socials: (d.socials as Record<string, string>) ?? {},
  };
}

export async function getUserStats() {
  await connectDB();
  const { User } = await import("@/models/User");
  const [total, verified] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ emailVerified: true }),
  ]);
  return { total, verified };
}

export type UserRow = {
  email: string;
  name: string;
  provider: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export async function getUsers(limit = 500): Promise<UserRow[]> {
  await connectDB();
  const { User } = await import("@/models/User");
  const docs = await User.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((d: Record<string, unknown>) => ({
    email: d.email as string,
    name: (d.name as string) ?? "",
    provider: (d.provider as string) ?? "password",
    emailVerified: Boolean(d.emailVerified),
    createdAt: (d.createdAt as Date)?.toISOString?.() ?? "",
    lastLoginAt: (d.lastLoginAt as Date)?.toISOString?.() ?? null,
  }));
}

export async function getStats() {
  await connectDB();
  const [companies, questions] = await Promise.all([
    Company.countDocuments({}),
    Question.distinct("leetcodeId", { timeframe: "alltime" }),
  ]);
  return { companies, questions: questions.length };
}

/** Per company: how many of its problems this user has solved (any timeframe). */
export async function getCompanyProgress(solvedIds: number[]): Promise<Record<string, number>> {
  if (!solvedIds.length) return {};
  await connectDB();
  const rows = await Question.aggregate<{ _id: string; n: number }>([
    { $match: { leetcodeId: { $in: solvedIds } } },
    { $group: { _id: { c: "$company", id: "$leetcodeId" } } },
    { $group: { _id: "$_id.c", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n]));
}

/* ------------------------------------------------------------------ home page */

export type ShowcaseRow = { leetcodeId: number; title: string; difficulty: Difficulty; acceptance: number };
export type ShowcaseQuestion = { leetcodeId: number; title: string; difficulty: Difficulty; companyCount: number };
export type ShowcaseOpen = {
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  total: number;
  companies: { name: string; slug: string; frequency: number }[];
};
export type HomeShowcase = {
  companies: { name: string; slug: string }[];
  topCompanies: { name: string; slug: string; questionCount: number }[];
  hero: { company: string; rows: ShowcaseRow[] } | null;
  mostAsked: ShowcaseQuestion[];
  open: ShowcaseOpen | null;
  searches: { query: string; results: ShowcaseQuestion[]; open: ShowcaseOpen }[];
  pair: { a: string; b: string; sharedCount: number; shared: { title: string; difficulty: Difficulty }[] } | null;
  daily: { title: string; difficulty: Difficulty } | null;
  palette: { query: string; companies: { name: string; questionCount: number }[]; questions: ShowcaseQuestion[] } | null;
};

const SEARCHES = ["sum", "tree", "interval"];
const PALETTE_QUERY = "two";

function toOpen(detail: QuestionDetail, max = 7): ShowcaseOpen {
  return {
    title: detail.title,
    difficulty: detail.difficulty,
    acceptance: detail.acceptance,
    total: detail.companies.length,
    companies: detail.companies.slice(0, max).map((c) => ({ name: c.name, slug: c.slug, frequency: c.frequency })),
  };
}
const asShowcase = (q: ExploreQuestion): ShowcaseQuestion => ({
  leetcodeId: q.leetcodeId,
  title: q.title,
  difficulty: q.difficulty,
  companyCount: q.companyCount,
});

/** Real rows for the home page's product pictures (cached for 10 minutes per instance). */
export async function getHomeShowcase(): Promise<HomeShowcase> {
  return memo("home-showcase", 10 * 60 * 1000, async () => {
    const [companies, explore] = await Promise.all([getCompanies(), getExploreQuestions()]);
    const lead = companies.find((c) => c.slug === "amazon") ?? companies[0];
    const second = companies.find((c) => c.slug === "google" && c.slug !== lead?.slug) ?? companies.find((c) => c.slug !== lead?.slug);

    // what the search demo types, and what each query really finds (most widely asked first)
    const found = SEARCHES.map((query) => ({
      query,
      results: explore.filter((q) => q.title.toLowerCase().includes(query)).slice(0, 8),
    })).filter((x) => x.results.length >= 3);

    const [heroRows, detail, pairResult, searchDetails] = await Promise.all([
      lead ? getCompanyQuestions(lead.slug, "alltime").then((r) => r.slice(0, 7)) : Promise.resolve([]),
      explore[0] ? getQuestionDetail(explore[0].leetcodeId) : Promise.resolve(null),
      lead && second ? compareCompanies(lead.slug, second.slug) : Promise.resolve(null),
      Promise.all(found.map((x) => getQuestionDetail(x.results[0].leetcodeId))),
    ]);

    const sidebar = lead ? [lead, ...companies.filter((c) => c.slug !== lead.slug)].slice(0, 5) : companies.slice(0, 5);
    const daily = pickDaily(explore.slice(0, 600));
    const pq = PALETTE_QUERY;
    return {
      companies: sidebar.map((c) => ({ name: c.name, slug: c.slug })),
      topCompanies: companies.slice(0, 28).map((c) => ({ name: c.name, slug: c.slug, questionCount: c.questionCount })),
      hero: lead
        ? {
            company: lead.name,
            rows: heroRows.map((q) => ({ leetcodeId: q.leetcodeId, title: q.title, difficulty: q.difficulty, acceptance: q.acceptance })),
          }
        : null,
      mostAsked: explore.slice(0, 9).map(asShowcase),
      open: detail ? toOpen(detail, 9) : null,
      searches: found.flatMap((x, i) => {
        const d = searchDetails[i];
        return d ? [{ query: x.query, results: x.results.map(asShowcase), open: toOpen(d) }] : [];
      }),
      pair:
        lead && second && pairResult
          ? {
              a: lead.name,
              b: second.name,
              sharedCount: pairResult.shared.length,
              shared: pairResult.shared.slice(0, 3).map((q) => ({ title: q.title, difficulty: q.difficulty })),
            }
          : null,
      daily: daily ? { title: daily.title, difficulty: daily.difficulty } : null,
      palette: {
        query: pq,
        companies: companies
          .filter((c) => c.name.toLowerCase().includes(pq))
          .slice(0, 2)
          .map((c) => ({ name: c.name, questionCount: c.questionCount })),
        questions: explore.filter((q) => q.title.toLowerCase().includes(pq)).slice(0, 4).map(asShowcase),
      },
    };
  });
}

/** The ids of the questions this user has marked solved. */
export async function getSolvedIds(userId: string): Promise<number[]> {
  await connectDB();
  const { UserProgress } = await import("@/models/UserProgress");
  const rows = await UserProgress.find({ userId, solved: true }, { leetcodeId: 1 }).lean<{ leetcodeId: number }[]>();
  return rows.map((r) => r.leetcodeId);
}
