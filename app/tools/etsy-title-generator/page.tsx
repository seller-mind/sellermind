import type { Metadata } from "next";
import { EtsyTitleGeneratorClient } from "./client";

export const metadata: Metadata = {
  title: 'Free Etsy Title Generator — AI-Powered SEO Titles · SellerMind',
  description: 'Generate high-CTR Etsy listing titles with AI in seconds. Free tool optimized for the Etsy search algorithm — no signup, no credit card required.',
  alternates: {
    canonical: 'https://thesellermind.com/tools/etsy-title-generator',
  },
  openGraph: {
    title: 'Free Etsy Title Generator — AI-Powered SEO Titles · SellerMind',
    description: 'Generate high-CTR Etsy listing titles with AI in seconds. Free tool optimized for the Etsy search algorithm — no signup, no credit card required.',
    url: 'https://thesellermind.com/tools/etsy-title-generator',
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Free Etsy Title Generator — AI-Powered SEO Titles · SellerMind',
    description: 'Generate high-CTR Etsy listing titles with AI in seconds. Free tool optimized for the Etsy search algorithm — no signup, no credit card required.',
  },
};

export default function Page() {
  return <EtsyTitleGeneratorClient />;
}
