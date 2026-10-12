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
    slug: "etsy-titles-that-get-clicks-2026",
    title: "How to Write Etsy Titles That Actually Get Clicks in 2026",
    description:
      "Learn the 3-part title formula that doubles click-through rates. Master Etsy title optimization with real examples, mobile tips, and A/B testing strategies.",
    date: "2026-10-12",
    author: "SellerMind team",
    keywords: [
      "etsy title optimization",
      "etsy titles 2026",
      "how to write etsy titles",
      "etsy title formula",
      "etsy click through rate",
      "etsy seo tips",
      "etsy listing optimization",
      "etsy title best practices",
      "mobile etsy optimization",
      "etsy title length",
    ],
    file: "etsy-titles-that-get-clicks-2026.md",
  },
  {
    slug: "etsy-tags-guide-2026",
    title: "Etsy Tags Explained: How to Use All 13 Tags Effectively in 2026",
    description:
      "Stop wasting your 13 Etsy tags. Learn the 3 rules of effective tag usage, the 13-tag strategy for maximum coverage, and common mistakes that hurt your ranking.",
    date: "2026-10-12",
    author: "SellerMind team",
    keywords: [
      "etsy tags",
      "etsy tags 2026",
      "how to use etsy tags",
      "etsy tag strategy",
      "etsy 13 tags",
      "etsy tag optimization",
      "etsy tag research",
      "etsy tag mistakes",
      "etsy seo tags",
      "etsy tag ideas",
    ],
    file: "etsy-tags-guide-2026.md",
  },
  {
    slug: "best-free-etsy-seo-tools-2026",
    title: "Best Free Etsy SEO Tools in 2026 (No Credit Card Required)",
    description:
      "You don't need to spend $20/month. These 7 free tools give you everything to rank higher: SellerMind, eRank, Google Trends, and more. Complete workflow included.",
    date: "2026-10-12",
    author: "SellerMind team",
    keywords: [
      "free etsy seo tools",
      "etsy seo tools 2026",
      "best etsy tools free",
      "etsy keyword research free",
      "etsy optimization tools",
      "etsy seo without paying",
      "free etsy tools no credit card",
      "etsy listing optimization tools",
      "etsy analytics tools",
      "etsy seo software",
    ],
    file: "best-free-etsy-seo-tools-2026.md",
  },
  {
    slug: "etsy-holiday-sales-optimization-2026",
    title: "How to Optimize Your Etsy Shop for Holiday Sales in 2026",
    description:
      "Holiday season = 30-40% of annual sales. Learn the exact timeline, keywords, and strategies to capture holiday traffic. Checklist included.",
    date: "2026-10-12",
    author: "SellerMind team",
    keywords: [
      "etsy holiday sales",
      "etsy christmas 2026",
      "etsy holiday optimization",
      "etsy holiday keywords",
      "etsy gift ideas",
      "etsy holiday marketing",
      "etsy holiday strategy",
      "etsy holiday checklist",
      "etsy holiday ads",
      "etsy holiday shipping",
    ],
    file: "etsy-holiday-sales-optimization-2026.md",
  },
  {
    slug: "etsy-seo-vs-google-seo-2026",
    title: "Etsy SEO vs Google SEO: Key Differences Every Seller Should Know in 2026",
    description:
      "If you're used to Google SEO, Etsy SEO will feel different. Here are 10 key differences—and why your Google knowledge might hurt you on Etsy.",
    date: "2026-10-12",
    author: "SellerMind team",
    keywords: [
      "etsy seo vs google seo",
      "etsy seo differences",
      "etsy seo guide",
      "etsy seo 2026",
      "etsy ranking factors",
      "etsy algorithm",
      "etsy vs google",
      "etsy seo strategy",
      "etsy seo tips",
      "etsy keyword research",
    ],
    file: "etsy-seo-vs-google-seo-2026.md",
  },
  {
    slug: "etsy-fee-calculation-guide",
    title: "The Complete Guide to Etsy Fee Calculation in 2026",
    description:
      "Learn exactly how Etsy fees work in 2026: listing fees, transaction fees, payment processing, and offsite ads. Calculate your true profit per sale with our breakdown.",
    date: "2026-08-19",
    author: "SellerMind team",
    keywords: [
      "etsy fees",
      "etsy fee calculator",
      "etsy fees 2026",
      "etsy fee structure",
      "etsy transaction fee",
      "etsy listing fee",
      "etsy payment processing",
      "etsy profit calculator",
      "etsy offsite ads",
      "etsy seller fees",
    ],
    file: "etsy-fee-calculation-guide.md",
  },
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
