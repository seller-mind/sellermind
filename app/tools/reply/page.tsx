import type { Metadata } from "next";
import { ReplyClient } from "./client";

const TITLE = "Free Etsy Message Reply Generator — AI Customer Replies · SellerMind";
const DESC = "Draft warm, professional Etsy customer replies in seconds. Free AI reply generator handles shipping, returns, custom orders, and complaint scenarios with the right tone.";
const URL = "https://thesellermind.com/tools/reply";

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
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
};

export default function Page() {
  return <ReplyClient />;
}
