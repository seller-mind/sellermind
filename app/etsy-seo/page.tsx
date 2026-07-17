import type { Metadata } from "next";
import Link from "next/link";
import { etsySeoSlugs } from "@/data/etsy-seo-slugs";

// P1-E fix (2026-07-17): /etsy-seo/ index page — previously the root path
// returned 308→404 (rewrite matched /etsy-seo/:slug but no /etsy-seo root
// route existed), breaking 30 landing-page footers and the llms.txt entry.
// This index links to all 30 Etsy SEO programmatic pages.

export const metadata: Metadata = {
  title: "Etsy SEO Guides — 30 Category-Specific Playbooks (2026) · SellerMind",
  description:
    "Category-by-category Etsy SEO playbooks: keyword picks, 2026 title formula, 13-tag templates, and listing description structure for 30 popular niches on Etsy.",
  alternates: {
    canonical: "https://thesellermind.com/etsy-seo",
  },
  openGraph: {
    title: "Etsy SEO Guides — 30 Category-Specific Playbooks (2026)",
    description:
      "Free Etsy SEO playbooks by category — handmade jewelry, printables, home decor, and more. Title formula, 13-tag templates, description structure.",
    url: "https://thesellermind.com/etsy-seo",
    siteName: "SellerMind",
    type: "website",
    images: [
      { url: "https://thesellermind.com/og-image.png", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Etsy SEO Guides — 30 Category-Specific Playbooks (2026)",
    description:
      "Free Etsy SEO playbooks by category — 2026 title formula, 13-tag templates, listing description structure.",
    images: ["https://thesellermind.com/og-image.png"],
  },
};

// Convert slug -> human-readable label
// "etsy-seo-guide-for-handmade-earrings-sellers" -> "Handmade Earrings"
function slugToLabel(slug: string): string {
  return slug
    .replace(/^etsy-seo-guide-for-/, "")
    .replace(/-sellers$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Loose category grouping for UX
function categoryOf(label: string): string {
  const lc = label.toLowerCase();
  if (lc.includes("printable")) return "Printables";
  if (lc.includes("decor") || lc.includes("wall art") || lc.includes("throw") || lc.includes("mirror") || lc.includes("plant"))
    return "Home Decor";
  return "Handmade Jewelry & Accessories";
}

export default function EtsySeoIndex() {
  const groups: Record<string, string[]> = {};
  for (const slug of etsySeoSlugs) {
    const label = slugToLabel(slug);
    const cat = categoryOf(label);
    (groups[cat] ||= []).push(slug);
  }
  const order = ["Handmade Jewelry & Accessories", "Home Decor", "Printables"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span className="mx-2">›</span>
        <span>Etsy SEO Guides</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Etsy SEO Guides (2026)
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Category-by-category Etsy SEO playbooks. Each guide covers the 2026 keyword picks,
        title formula, 13-tag template, and listing description structure specific to that niche.
        Pair any guide with our{" "}
        <Link href="/tools/etsy-title-generator" className="text-orange-600 underline">
          free Etsy Title Generator
        </Link>{" "}
        and{" "}
        <Link href="/tools/etsy-tag-generator" className="text-orange-600 underline">
          Tag Generator
        </Link>{" "}
        to apply the templates in under 5 minutes per listing.
      </p>

      {order.map((cat) => {
        const slugs = groups[cat];
        if (!slugs || slugs.length === 0) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {cat}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({slugs.length} guides)
              </span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {slugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/etsy-seo/${slug}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
                  >
                    <span className="font-medium text-gray-900">
                      Etsy SEO Guide for {slugToLabel(slug)} Sellers
                    </span>
                    <span className="text-sm text-gray-500 block mt-1">
                      Title formula · 13-tag template · description structure
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 p-6 bg-orange-50 border border-orange-200 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Want to apply these to your Etsy shop?
        </h3>
        <p className="text-gray-700 mb-4">
          Every guide references the same free helper tools. Use them alongside the
          playbook — no signup, no credit card. 3 free AI uses per month across all
          10 tools; upgrade to Pro for unlimited access.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tools/etsy-title-generator"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
          >
            Free Title Generator →
          </Link>
          <Link
            href="/tools/etsy-tag-generator"
            className="px-4 py-2 bg-white border-2 border-orange-600 text-orange-700 rounded-lg font-medium hover:bg-orange-50"
          >
            Free Tag Generator →
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-500"
          >
            See Pro Pricing →
          </Link>
        </div>
      </section>

      <p className="mt-8 text-xs text-gray-500 italic">
        SellerMind is an independent third-party tool, not affiliated with, endorsed
        by, or connected to Etsy, Inc. Etsy is a trademark of Etsy, Inc.
      </p>
    </div>
  );
}
