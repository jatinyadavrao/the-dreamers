import type { HomeShowcase } from "@/lib/data";

/** The reference design's example rows, shown only when the database is empty or unreachable. */
export const FALLBACK_SHOWCASE: HomeShowcase = {
  companies: [
    { name: "Amazon", slug: "amazon" },
    { name: "Google", slug: "google" },
    { name: "Microsoft", slug: "microsoft" },
    { name: "Facebook", slug: "facebook" },
    { name: "Bloomberg", slug: "bloomberg" },
  ],
  hero: {
    company: "Amazon",
    rows: [
      { leetcodeId: 1, title: "Two Sum", difficulty: "Easy", acceptance: 45.6 },
      { leetcodeId: 146, title: "LRU Cache", difficulty: "Medium", acceptance: 33.2 },
      { leetcodeId: 200, title: "Number of Islands", difficulty: "Medium", acceptance: 46.8 },
      { leetcodeId: 56, title: "Merge Intervals", difficulty: "Medium", acceptance: 39.3 },
      { leetcodeId: 42, title: "Trapping Rain Water", difficulty: "Hard", acceptance: 48.9 },
      { leetcodeId: 347, title: "Top K Frequent Elements", difficulty: "Medium", acceptance: 61.2 },
      { leetcodeId: 994, title: "Rotting Oranges", difficulty: "Medium", acceptance: 49.2 },
    ],
  },
  mostAsked: [
    { leetcodeId: 1, title: "Two Sum", difficulty: "Easy", companyCount: 72 },
    { leetcodeId: 200, title: "Number of Islands", difficulty: "Medium", companyCount: 58 },
    { leetcodeId: 146, title: "LRU Cache", difficulty: "Medium", companyCount: 55 },
    { leetcodeId: 20, title: "Valid Parentheses", difficulty: "Easy", companyCount: 52 },
    { leetcodeId: 56, title: "Merge Intervals", difficulty: "Medium", companyCount: 45 },
    { leetcodeId: 15, title: "3Sum", difficulty: "Medium", companyCount: 41 },
    { leetcodeId: 121, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", companyCount: 38 },
    { leetcodeId: 2, title: "Add Two Numbers", difficulty: "Medium", companyCount: 37 },
    { leetcodeId: 42, title: "Trapping Rain Water", difficulty: "Hard", companyCount: 36 },
  ],
  open: {
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: 45.6,
    total: 72,
    companies: [
      { name: "Amazon", slug: "amazon", frequency: 5.3 },
      { name: "Google", slug: "google", frequency: 4.4 },
      { name: "Facebook", slug: "facebook", frequency: 3.9 },
      { name: "Microsoft", slug: "microsoft", frequency: 3.2 },
      { name: "Apple", slug: "apple", frequency: 2.7 },
      { name: "Bloomberg", slug: "bloomberg", frequency: 2.2 },
      { name: "Adobe", slug: "adobe", frequency: 1.9 },
      { name: "Uber", slug: "uber", frequency: 1.4 },
      { name: "Yahoo", slug: "yahoo", frequency: 1.1 },
    ],
  },
  pair: {
    a: "Amazon",
    b: "Google",
    shared: [
      { title: "LRU Cache", difficulty: "Medium" },
      { title: "Merge Intervals", difficulty: "Medium" },
      { title: "Word Ladder", difficulty: "Hard" },
    ],
  },
  daily: { title: "Merge Intervals", difficulty: "Medium" },
};
