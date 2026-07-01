import type { Metadata } from "next";
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
  return <EtsyTagGeneratorClient />;
}
