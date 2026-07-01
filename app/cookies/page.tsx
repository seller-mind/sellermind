import type { Metadata } from "next";
import CookiesClient from "./CookiesClient";

export const metadata: Metadata = {
  title: "Cookie Preferences | SellerMind",
  description:
    "Manage your cookie preferences on SellerMind. Learn what cookies we use, how they work under GDPR / CCPA / VCDPA, and reset your consent at any time.",
  alternates: {
    canonical: "https://thesellermind.com/cookies",
  },
  openGraph: {
    title: "Cookie Preferences | SellerMind",
    description:
      "Manage your cookie preferences on SellerMind. GDPR / CCPA / VCDPA-compliant. Reset consent anytime.",
    url: "https://thesellermind.com/cookies",
    type: "website",
    siteName: "SellerMind",
  },
};

export default function CookiesPage() {
  return <CookiesClient />;
}
