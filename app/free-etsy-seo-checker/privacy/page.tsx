import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy · Free Etsy SEO Checker | TheSellerMind",
  description:
    "What we read, what we keep, what we don't keep — full GDPR Art.13 / Art.14 disclosure for the Free Etsy SEO Checker.",
  alternates: { canonical: "https://thesellermind.com/free-etsy-seo-checker/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
          Free Etsy SEO Checker · Privacy
        </p>
        <h1 className="mt-3 text-2xl font-bold text-stone-900 md:text-3xl">
          What we read, what we keep, what we don&apos;t keep
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated: 2026-06-28 · Plain English, GDPR Art.13 / Art.14 compliant.
        </p>
      </header>

      <section className="prose prose-stone mt-8 max-w-none text-stone-700">
        <h2 className="text-lg font-semibold text-stone-900">In one paragraph</h2>
        <p>
          You paste an Etsy listing URL. Our server fetches that public page from
          Etsy with a SellerMind-identifying User-Agent, parses the title, tags,
          description, and image stats, sends a compact summary to{" "}
          <strong>DeepSeek (deepseek.com)</strong> for scoring, and returns you a
          score + 3 prioritized fixes + an optional PDF. We don&apos;t require an
          email, account, or any payment. We don&apos;t store your listing
          content beyond a 6-hour cache of the audit JSON output (keyed on a
          hash of the URL).
        </p>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          1. Data controller &amp; contact
        </h2>
        <p>
          <strong>Operator:</strong> Haimo, founder of TheSellerMind (indie
          hacker, single-person team).<br />
          <strong>Email:</strong>{" "}
          <a className="text-[#E07A5F] underline" href="mailto:hello@thesellermind.com">
            hello@thesellermind.com
          </a>
          <br />
          <strong>Postal address:</strong> available on request.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          2. What we collect when you use this tool
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            The Etsy listing URL you paste (kept in volatile RAM during the
            audit; a SHA-256 hash of the URL is the cache key for 6 hours).
          </li>
          <li>
            Public content of that listing fetched from Etsy: title, tags
            (where available), description, image count, image alt-text coverage.
            We do NOT store this beyond the request lifecycle.
          </li>
          <li>
            A SHA-256 hash of your IP address (first 12 hex chars) is used to
            enforce the 5-audit-per-day rate limit. The plaintext IP is never
            written to storage.
          </li>
          <li>
            Anonymised request logs (timestamp, status code, score bucket,
            cached y/n, latency). No PII.
          </li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          3. Where your data goes
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>DeepSeek (api.deepseek.com)</strong> — receives the parsed
            listing summary for scoring. DeepSeek processes data in mainland
            China; transfer relies on the EU-China SCC (Module 2). DeepSeek
            states it does not use API requests to train its models. See their{" "}
            <a
              href="https://platform.deepseek.com/policy"
              className="text-[#E07A5F] underline"
              target="_blank"
              rel="noreferrer"
            >
              policy
            </a>
            .
          </li>
          <li>
            <strong>Etsy.com</strong> — receives our server&apos;s outbound
            fetch request (your IP is NOT forwarded to Etsy; the fetch comes
            from our Vercel function).
          </li>
          <li>
            <strong>Upstash Redis (US region)</strong> — stores rate-limit
            counters and the 6-hour audit cache. Keys are hashed; values are
            score JSON only.
          </li>
          <li>
            <strong>Vercel (US region)</strong> — hosts the server function and
            keeps standard request logs for ~14 days.
          </li>
        </ul>
        <p>
          We do NOT share your data with any other third party. No ad networks,
          no retargeting pixels, no email-marketing platform.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          4. Lawful basis (EU/UK)
        </h2>
        <p>
          <strong>Art.6(1)(b) GDPR — performance of a service you requested.</strong>{" "}
          We process the URL solely to deliver the audit you asked for.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          5. How long we keep it
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Listing content: 0 seconds beyond the request lifecycle.</li>
          <li>Audit JSON output (cached for fast re-fetch): 6 hours, then auto-purged.</li>
          <li>Hashed-IP rate-limit counters: 24 hours.</li>
          <li>Anonymised Vercel logs: ~14 days.</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          6. Your rights
        </h2>
        <p>
          Because we don&apos;t hold an account-linked record about you, most
          subject rights (access, erasure, portability) are moot — there&apos;s
          nothing to retrieve. You can still email{" "}
          <a className="text-[#E07A5F] underline" href="mailto:hello@thesellermind.com">
            hello@thesellermind.com
          </a>{" "}
          with any concern; we&apos;ll respond within 30 days. EU/UK users can
          also lodge a complaint with their national supervisory authority.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          7. Etsy ToS posture
        </h2>
        <p>
          We only read public listings you actively paste into the tool. We do
          not connect to your Etsy account, we do not scrape stores, and we
          identify ourselves to Etsy with a clear User-Agent (
          <code>SellerMindAudit/1.0</code>) and a contact email. Repeat audits
          of the same URL within 6 hours are served from cache to minimise load
          on Etsy.
        </p>

        <p className="mt-8 text-sm text-stone-500">
          Back to{" "}
          <Link className="text-[#E07A5F] underline" href="/free-etsy-seo-checker">
            the Etsy SEO checker
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
