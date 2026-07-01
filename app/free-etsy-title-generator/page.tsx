import type { Metadata } from 'next';
import Link from 'next/link';
import EtsyTitleGenClient from './EtsyTitleGenClient';

// v0.05 static mock page — no backend. Hero copy locked to spec §1.1 fix:
//   "Free, 5 gen/IP/day, browser-only (no account needed to try it)."
// Word-dict #121 v1 audit: 0 hits of legacy forbidden phrases.

const PAGE_URL = 'https://thesellermind.com/free-etsy-title-generator';
const OG_IMAGE = 'https://thesellermind.com/og/free-etsy-title-generator.png';

export const metadata: Metadata = {
  metadataBase: new URL('https://thesellermind.com'),
  title: 'Free Etsy Title Generator — 10 SEO Titles in 15s | TheSellerMind',
  description:
    'Paste your product name → get 10 SEO-optimized Etsy title drafts with tag hints. Free, 5 gen/IP/day, browser-only (no account needed to try it).',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    title: 'Free Etsy Title Generator — 10 SEO Titles in 15s | TheSellerMind',
    description:
      'Paste your product name → get 10 SEO-optimized Etsy title drafts with tag hints. Free, 5 gen/IP/day, browser-only.',
    siteName: 'TheSellerMind',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Free Etsy Title Generator by TheSellerMind' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Etsy Title Generator — 10 SEO Titles in 15s | TheSellerMind',
    description:
      'Paste your product name → get 10 SEO-optimized Etsy title drafts with tag hints. Free, 5 gen/IP/day, browser-only.',
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

const SOFTWARE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Etsy Title Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: PAGE_URL,
  description:
    'Generate 10 SEO-optimized Etsy listing title drafts with tag hints. Free, 5 gen/IP/day, browser-only.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TheSellerMind', url: 'https://thesellermind.com' },
};

export const dynamic = 'force-static';
export const revalidate = 3600;

export default function FreeEtsyTitleGeneratorPage() {
  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 md:py-16"
      data-tool-version="etsy-title-gen-v0.05-mock"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSONLD) }}
      />

      {/* Hero */}
      <header className="mb-8 text-center md:mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
          Free tool · TheSellerMind
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900 md:text-4xl">
          Free Etsy Title Generator
        </h1>
        <p className="mt-3 text-base text-stone-600 md:text-lg">
          Paste a product name → get 10 SEO-optimized Etsy title drafts with tag hints in about 15 seconds.
        </p>
        <p className="mt-4 text-sm text-stone-700">
          Free, 5 gen/IP/day, browser-only (no account needed to try it).
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Preview · v0.05 mock · full LLM-powered version ships this week
        </p>
      </header>

      {/* Client-side generator (input + mock output + localStorage quota) */}
      <EtsyTitleGenClient />

      {/* Cross-promo to Free Etsy SEO Checker */}
      <section className="mt-12 rounded-2xl border border-[#E07A5F]/30 bg-gradient-to-br from-[#FFF5EE] to-[#FCEAE7] p-6 md:p-8">
        <h2 className="text-xl font-bold text-stone-900 md:text-2xl">
          Already have a listing live? Score it in 5 seconds.
        </h2>
        <p className="mt-2 text-sm text-stone-700 md:text-base">
          Our Free Etsy SEO Checker gives you a 4-dimension score (Title / Tags / Description / Images) plus
          3 prioritized fixes for any Etsy listing. Same rate limit, same browser-only design.
        </p>
        <Link
          href="/free-etsy-seo-checker"
          className="mt-4 inline-flex items-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          Try the Free Etsy SEO Checker →
        </Link>
      </section>

      {/* CTA to paid product */}
      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
        <h2 className="text-lg font-bold text-stone-900 md:text-xl">
          Want the full workflow?
        </h2>
        <p className="mt-2 text-sm text-stone-700">
          Listing generator, bulk tag optimizer, review responder, and shop-wide SEO audits — the full
          TheSellerMind dashboard starts at $19.99/mo.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-[#E07A5F] hover:text-[#E07A5F]"
        >
          See TheSellerMind pricing →
        </Link>
      </section>

      {/* Footer note */}
      <footer className="mt-10 border-t border-stone-200 pt-6 text-center text-xs text-stone-500">
        <p>
          Built by Haimo · TheSellerMind team ·{' '}
          <Link href="/privacy" className="underline hover:text-stone-800">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="underline hover:text-stone-800">
            Terms
          </Link>
        </p>
        <p className="mt-2">
          v0.05 preview. Generated titles below are illustrative mock drafts — the D13 production release
          scores each title with a real LLM against Etsy&apos;s 140-char and front-loading rules.
        </p>
      </footer>
    </main>
  );
}
