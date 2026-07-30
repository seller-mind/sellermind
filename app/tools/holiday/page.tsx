import type { Metadata } from "next";
import { HolidayClient } from "./client";

const TITLE = "Free Etsy Holiday Marketing Assistant — Seasonal Campaigns · SellerMind";
const DESC = "Generate seasonal Etsy marketing copy for Christmas, Valentine's, Black Friday and more. Free AI holiday assistant creates shop banners, Instagram posts, Pinterest pins & email campaigns.";
const URL = "https://thesellermind.com/tools/holiday";

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
  return <HolidayClient />;
}
