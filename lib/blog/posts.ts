import fs from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
  author: string;
  keywords: string[];
  file: string; // relative path under content/blog
};

export const POSTS: BlogPost[] = [
  {
    slug: "sellermind-vs-marmalead-vs-erank-best-etsy-ai-tool-2026",
    title:
      "SellerMind vs Marmalead vs eRank: Best Etsy AI Tool for Sellers in 2026?",
    description:
      "Honest 2026 comparison of SellerMind, Marmalead and eRank for Etsy sellers — pricing model, AI features, who each tool actually fits, and how to stack them.",
    date: "2026-06-22",
    author: "SellerMind team",
    keywords: [
      "sellermind",
      "marmalead",
      "erank",
      "etsy ai tool",
      "etsy seo 2026",
      "etsy seller tools",
      "etsy keyword research",
    ],
    file: "sellermind-vs-marmalead-vs-erank.md",
  },
];

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPostContent(post: BlogPost): string {
  const filePath = path.join(process.cwd(), "content", "blog", post.file);
  return fs.readFileSync(filePath, "utf8");
}
