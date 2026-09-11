import "server-only";
import { connectDB } from "./db";
import { Company } from "@/models/Company";
import { Question } from "@/models/Question";
import { Thought } from "@/models/Thought";
import { Profile } from "@/models/Profile";
import type { Difficulty, Timeframe } from "./utils";

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

export async function getCompanies(): Promise<CompanyLite[]> {
  await connectDB();
  const docs = await Company.find({})
    .sort({ questionCount: -1, name: 1 })
    .lean();
  return docs.map((d: Record<string, unknown>) => ({
    name: d.name as string,
    slug: d.slug as string,
    logoUrl: (d.logoUrl as string) ?? "",
    questionCount: (d.questionCount as number) ?? 0,
  }));
}

export async function getCompany(slug: string): Promise<CompanyLite | null> {
  await connectDB();
  const d = await Company.findOne({ slug }).lean<Record<string, unknown>>();
  if (!d) return null;
  return {
    name: d.name as string,
    slug: d.slug as string,
    logoUrl: (d.logoUrl as string) ?? "",
    questionCount: (d.questionCount as number) ?? 0,
  };
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

export async function getCompanyQuestions(
  slug: string,
  timeframe: Timeframe
): Promise<QuestionLite[]> {
  await connectDB();
  // Fall back to whatever timeframe exists if the requested one is empty.
  let docs = await Question.find({ company: slug, timeframe })
    .sort({ frequency: -1 })
    .lean();
  if (!docs.length) {
    docs = await Question.find({ company: slug }).sort({ frequency: -1 }).lean();
  }
  return docs.map(mapQuestion);
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
  if (opts.q) filter.title = { $regex: opts.q, $options: "i" };
  if (opts.difficulty) filter.difficulty = opts.difficulty;
  if (opts.company) filter.company = opts.company;
  const docs = await Question.find(filter)
    .sort({ frequency: -1 })
    .limit(opts.limit ?? 100)
    .lean();
  return docs.map(mapQuestion);
}

export async function compareCompanies(a: string, b: string) {
  await connectDB();
  const [qa, qb] = await Promise.all([
    getCompanyQuestions(a, "alltime"),
    getCompanyQuestions(b, "alltime"),
  ]);
  const mapA = new Map(qa.map((q) => [q.leetcodeId, q]));
  const mapB = new Map(qb.map((q) => [q.leetcodeId, q]));
  const shared = qa
    .filter((q) => mapB.has(q.leetcodeId))
    .sort((x, y) => y.frequency - x.frequency);
  const onlyA = qa.filter((q) => !mapB.has(q.leetcodeId));
  const onlyB = qb.filter((q) => !mapA.has(q.leetcodeId));
  return { shared, onlyA, onlyB, countA: qa.length, countB: qb.length };
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

export async function getStats() {
  await connectDB();
  const [companies, questions] = await Promise.all([
    Company.countDocuments({}),
    Question.distinct("leetcodeId", { timeframe: "alltime" }),
  ]);
  return { companies, questions: questions.length };
}
