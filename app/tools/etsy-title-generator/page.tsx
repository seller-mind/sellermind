import type { Metadata } from "next";
import { headers } from "next/headers";
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
  // P3 fix (2026-07-01): read the per-request CSP nonce set by
  // middleware.ts and thread it through the client component so any
  // inline <script> (JSON-LD schemas etc.) can be nonce-attributed.
  const nonce = headers().get("x-nonce") || undefined;
  return <EtsyTitleGeneratorClient nonce={nonce} />;
}
