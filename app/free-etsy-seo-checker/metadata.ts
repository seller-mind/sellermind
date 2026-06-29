import type { Metadata } from "next";

const BASE = "https://thesellermind.com";
const URL = `${BASE}/free-etsy-seo-checker`;

export const etsySeoCheckerMetadata: Metadata = {
  title: "Free Etsy SEO Checker — Score Your Listing in 10 Seconds | TheSellerMind",
  description:
    "Paste your Etsy listing URL. Get a 4-dimension SEO score (Title / Tags / Description / Images) with 3 prioritized fixes — instantly, no signup, no email. Free preview from TheSellerMind.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Free Etsy SEO Checker",
    description: "4-dimension score on your Etsy listing in 10 seconds. Free, no signup.",
    url: URL,
    siteName: "TheSellerMind",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Etsy SEO Checker",
    description: "4-dimension score on your Etsy listing in 10 seconds. Free.",
    images: [`${BASE}/og-image.png`],
  },
  robots: { index: true, follow: true },
};

// JSON-LD: SoftwareApplication + FAQPage (FAQPage was the Validator audit gap)
export const SOFTWARE_APPLICATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Etsy Listing SEO Checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Free 4-dimensional Etsy listing SEO checker. Paste a URL, get an instant score with 3 prioritized fixes. No signup.",
  url: URL,
  publisher: {
    "@type": "Organization",
    name: "TheSellerMind",
    url: BASE,
  },
};

export const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this Etsy SEO checker really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no email, no card. The tool is capped at 5 audits per IP per day to keep AI costs sustainable for a small indie team.",
      },
    },
    {
      "@type": "Question",
      name: "Do you store my listing URL or content?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We don't persist your listing title, description, or URL. The 6-hour cache only stores the audit JSON output keyed by a hash of the URL, so a repeat of the same URL is cheap. Read the privacy page for the full disclosure.",
      },
    },
    {
      "@type": "Question",
      name: "Why do you cap audits at 5 per day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each audit costs us about $0.004 in DeepSeek API spend. As a single-founder indie tool we cap total spend at $0.20/day. If you want to audit your full store, the paid TheSellerMind dashboard does bulk audits.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Treat it as a directional signal. The 4-dimension rubric is published on our methodology page so you can decide whether you agree with the weights. The model has biases — use the score as a starting point, not gospel.",
      },
    },
    {
      "@type": "Question",
      name: "Will you send me marketing emails?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. There is no email field anywhere on this tool. Your PDF downloads directly. You can come back any day and run another audit without leaving any data behind.",
      },
    },
  ],
};
