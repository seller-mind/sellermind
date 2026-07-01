import type { Metadata } from "next";
import { headers } from "next/headers";
import { EtsyReviewResponseClient } from "./client";

export const metadata: Metadata = {
  title: 'Free Etsy Review Response Generator — AI Reply Templates · SellerMind',
  description: 'Craft professional Etsy review replies with AI — handle 5-star praise or tough negative feedback in seconds. Free templates, no signup, no credit card.',
  alternates: {
    canonical: 'https://thesellermind.com/tools/etsy-review-response',
  },
  openGraph: {
    title: 'Free Etsy Review Response Generator — AI Reply Templates · SellerMind',
    description: 'Craft professional Etsy review replies with AI — handle 5-star praise or tough negative feedback in seconds. Free templates, no signup, no credit card.',
    url: 'https://thesellermind.com/tools/etsy-review-response',
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Free Etsy Review Response Generator — AI Reply Templates · SellerMind',
    description: 'Craft professional Etsy review replies with AI — handle 5-star praise or tough negative feedback in seconds. Free templates, no signup, no credit card.',
  },
};

export default function Page() {
  // P3 fix (2026-07-01): read the per-request CSP nonce set by
  // middleware.ts and thread it through the client component so any
  // inline <script> (JSON-LD schemas etc.) can be nonce-attributed.
  const nonce = headers().get("x-nonce") || undefined;
  return <EtsyReviewResponseClient nonce={nonce} />;
}
