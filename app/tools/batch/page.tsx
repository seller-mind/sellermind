import type { Metadata } from "next";
import { BatchClient } from "./client";

const TITLE = "Free Etsy Bulk Listing Analyzer — AI Batch Optimization · SellerMind";
const DESC = "Paste multiple Etsy listings and optimize them in one click. Free AI batch analyzer diagnoses titles, tags, and descriptions with before/after SEO scores.";
const URL = "https://thesellermind.com/tools/batch";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "website",
    siteName: "SellerMind",
    images: [{ url: 'https://thesellermind.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ['https://thesellermind.com/og-image.png'],
  },
};

export default function Page() {
  return <BatchClient />;
}
