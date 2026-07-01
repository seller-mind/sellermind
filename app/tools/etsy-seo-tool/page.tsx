import type { Metadata } from "next";
import { EtsySeoToolClient } from "./client";

export const metadata: Metadata = {
  title: 'Free Etsy SEO Tool — Audit & Score Your Listings · SellerMind',
  description: 'Audit and score your Etsy listings for SEO in seconds — free tool checks title, tags, description, and keywords. No signup, actionable fixes fast.',
  alternates: {
    canonical: 'https://thesellermind.com/tools/etsy-seo-tool',
  },
  openGraph: {
    title: 'Free Etsy SEO Tool — Audit & Score Your Listings · SellerMind',
    description: 'Audit and score your Etsy listings for SEO in seconds — free tool checks title, tags, description, and keywords. No signup, actionable fixes fast.',
    url: 'https://thesellermind.com/tools/etsy-seo-tool',
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Free Etsy SEO Tool — Audit & Score Your Listings · SellerMind',
    description: 'Audit and score your Etsy listings for SEO in seconds — free tool checks title, tags, description, and keywords. No signup, actionable fixes fast.',
  },
};

export default function Page() {
  return <EtsySeoToolClient />;
}
