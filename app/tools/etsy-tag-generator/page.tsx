import type { Metadata } from "next";
import { headers } from "next/headers";
import { EtsyTagGeneratorClient } from "./client";

export const metadata: Metadata = {
  title: 'Free Etsy Tag Generator — 13 High-Traffic Tags · SellerMind',
  description: 'Generate all 13 high-traffic Etsy tags with AI in seconds — free tool surfaces long-tail keywords buyers actually search. No signup, no credit card.',
  alternates: {
    canonical: 'https://thesellermind.com/tools/etsy-tag-generator',
  },
  openGraph: {
    title: 'Free Etsy Tag Generator — 13 High-Traffic Tags · SellerMind',
    description: 'Generate all 13 high-traffic Etsy tags with AI in seconds — free tool surfaces long-tail keywords buyers actually search. No signup, no credit card.',
    url: 'https://thesellermind.com/tools/etsy-tag-generator',
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Free Etsy Tag Generator — 13 High-Traffic Tags · SellerMind',
    description: 'Generate all 13 high-traffic Etsy tags with AI in seconds — free tool surfaces long-tail keywords buyers actually search. No signup, no credit card.',
  },
};

export default function Page() {
  // P3 fix (2026-07-01): read the per-request CSP nonce set by
  // middleware.ts and thread it through the client component so any
  // inline <script> (JSON-LD schemas etc.) can be nonce-attributed.
  const nonce = headers().get("x-nonce") || undefined;
  return <EtsyTagGeneratorClient nonce={nonce} />;
}
