import type { Metadata } from "next";
import { FeeCalculatorClient } from "./client";

const TITLE = "Free Etsy Fee Calculator 2026 — See Your Real Profit Per Sale · SellerMind";
const DESC = "Calculate Etsy fees accurately: listing fee, transaction fee, payment processing & shipping. See exactly how much you keep per sale. Free, no sign-up.";
const URL = "https://thesellermind.com/tools/fee-calculator";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "website",
    siteName: "SellerMind",
    images: [{ url: "https://thesellermind.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["https://thesellermind.com/og-image.png"],
  },
};

export default function Page() {
  return <FeeCalculatorClient />;
}
