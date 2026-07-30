import type { Metadata } from "next";
import { ReviewClient } from "./client";

const TITLE = "Free Etsy Review Analyzer — AI Review Insights · SellerMind";
const DESC = "Turn negative Etsy reviews into recovery wins. Free AI review analyzer drafts public replies, private messages, compensation guidance, and improvement actions.";
const URL = "https://thesellermind.com/tools/review";

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
    images: [{ url: 'https://thesellermind.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ['https://thesellermind.com/og-image.png'],
  },
};

export default function Page() {
  return <ReviewClient />;
}
