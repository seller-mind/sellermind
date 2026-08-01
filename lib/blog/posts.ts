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
    slug: "etsy-fees-explained-2026",
    title: "Etsy Fees Explained: The Complete Guide for Sellers in 2026",
    description:
      "Every Etsy fee explained in plain English — listing fee, transaction fee, payment processing, and how to calculate your real profit per sale. Updated for 2026.",
    date: "2026-07-31",
    author: "SellerMind team",
    keywords: [
      "etsy fees",
      "etsy fee structure",
      "etsy fees 2026",
      "etsy seller fees",
      "etsy transaction fee",
      "etsy listing fee",
      "etsy payment processing",
      "etsy profit calculator",
    ],
    file: "etsy-fees-explained-2026.md",
  },
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
  {
    slug: "etsy-listing-optimization-seo-strategies-2026",
    title: "Etsy Listing Optimization: 12 Proven SEO Strategies That Actually Work in 2026",
    description:
      "Master Etsy listing optimization with 12 actionable SEO strategies for 2026 — from keyword research and title structure to tags, attributes, and AI-powered tools that save hours of manual work.",
    date: "2026-08-01",
    author: "SellerMind team",
    keywords: [
      "etsy seo",
      "etsy listing optimization",
      "etsy seo 2026",
      "etsy keyword research",
      "etsy tags",
      "etsy title optimization",
      "etsy search algorithm",
      "etsy listing tips",
      "ai listing generator",
      "etsy fee calculator",
    ],
    file: "etsy-listing-optimization-seo-strategies-2026.md",
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
