import type { Metadata } from "next";
import { headers } from "next/headers";
import { EtsyHolidayMarketingClient } from "./client";

export const metadata: Metadata = {
  title: 'Free Etsy Holiday Marketing Planner — Seasonal Campaigns · SellerMind',
  description: 'Plan Etsy holiday campaigns with AI — free seasonal marketing planner covers Q4 sales, gift guides, and email angles. No signup, no credit card.',
  alternates: {
    canonical: 'https://thesellermind.com/tools/etsy-holiday-marketing',
  },
  openGraph: {
    title: 'Free Etsy Holiday Marketing Planner — Seasonal Campaigns · SellerMind',
    description: 'Plan Etsy holiday campaigns with AI — free seasonal marketing planner covers Q4 sales, gift guides, and email angles. No signup, no credit card.',
    url: 'https://thesellermind.com/tools/etsy-holiday-marketing',
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Free Etsy Holiday Marketing Planner — Seasonal Campaigns · SellerMind',
    description: 'Plan Etsy holiday campaigns with AI — free seasonal marketing planner covers Q4 sales, gift guides, and email angles. No signup, no credit card.',
  },
};

export default function Page() {
  // P3 fix (2026-07-01): read the per-request CSP nonce set by
  // middleware.ts and thread it through the client component so any
  // inline <script> (JSON-LD schemas etc.) can be nonce-attributed.
  const nonce = headers().get("x-nonce") || undefined;
  return <EtsyHolidayMarketingClient nonce={nonce} />;
}
