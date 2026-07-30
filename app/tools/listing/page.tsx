import type { Metadata } from "next";
import { ListingClient } from "./client";

const TITLE = "Free Etsy Listing Generator — AI Title, Tags & Description · SellerMind";
const DESC = "Generate SEO-optimized Etsy listing titles, 13 tags, and keyword-rich descriptions in seconds. Free AI listing generator built for the Etsy search algorithm.";
const URL = "https://thesellermind.com/tools/listing";

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
  return <ListingClient />;
}
