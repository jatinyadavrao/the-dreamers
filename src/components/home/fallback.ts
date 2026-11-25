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
  topCompanies: [
    ["Google", "google", 865], ["Amazon", "amazon", 780], ["Facebook", "facebook", 556], ["Microsoft", "microsoft", 514],
    ["Apple", "apple", 366], ["Bloomberg", "bloomberg", 348], ["Uber", "uber", 308], ["Adobe", "adobe", 235],
    ["Oracle", "oracle", 214], ["LinkedIn", "linkedin", 140], ["eBay", "ebay", 123], ["ByteDance", "bytedance", 116],
    ["Yahoo", "yahoo", 114], ["Goldman Sachs", "goldman-sachs", 112], ["VMware", "vmware", 102], ["Snapchat", "snapchat", 88],
  ].map(([name, slug, questionCount]) => ({ name: name as string, slug: slug as string, questionCount: questionCount as number })),
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
  searches: [
    {
      query: "sum",
      results: [
        { leetcodeId: 1, title: "Two Sum", difficulty: "Easy", companyCount: 72 },
        { leetcodeId: 15, title: "3Sum", difficulty: "Medium", companyCount: 41 },
        { leetcodeId: 560, title: "Subarray Sum Equals K", difficulty: "Medium", companyCount: 24 },
        { leetcodeId: 39, title: "Combination Sum", difficulty: "Medium", companyCount: 18 },
        { leetcodeId: 124, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", companyCount: 17 },
        { leetcodeId: 18, title: "4Sum", difficulty: "Medium", companyCount: 9 },
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
        ],
      },
    },
  ],
  pair: {
    a: "Amazon",
    b: "Google",
    sharedCount: 547,
    shared: [
      { title: "LRU Cache", difficulty: "Medium" },
      { title: "Merge Intervals", difficulty: "Medium" },
      { title: "Word Ladder", difficulty: "Hard" },
    ],
  },
  daily: { title: "Merge Intervals", difficulty: "Medium" },
  palette: {
    query: "two",
    companies: [{ name: "Two Sigma", questionCount: 20 }],
    questions: [
      { leetcodeId: 1, title: "Two Sum", difficulty: "Easy", companyCount: 72 },
      { leetcodeId: 2, title: "Add Two Numbers", difficulty: "Medium", companyCount: 37 },
      { leetcodeId: 21, title: "Merge Two Sorted Lists", difficulty: "Easy", companyCount: 33 },
      { leetcodeId: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", companyCount: 28 },
    ],
  },
};
