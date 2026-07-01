import type { Metadata } from "next";
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
  return <EtsyHolidayMarketingClient />;
}
