import type { Metadata } from "next";
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
  return <EtsyReviewResponseClient />;
}
