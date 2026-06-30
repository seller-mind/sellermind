import type { Metadata } from "next";
import Link from "next/link";
import {
  etsySeoCheckerMetadata,
  SOFTWARE_APPLICATION_JSONLD,
  FAQ_JSONLD,
} from "./metadata";
import EtsyAuditWidget from "./EtsyAuditWidget";

export const metadata: Metadata = etsySeoCheckerMetadata;
export const dynamic = "force-static";
export const revalidate = 3600;

const FAQS = [
  {
    q: "Is this Etsy SEO checker really free?",
    a: "Yes. No signup, no email, no card. Free for everyone — capped at 5 audits per IP per day to keep AI costs sustainable for a small indie team.",
  },
  {
    q: "Do you store my listing URL or content?",
    a: "No raw listing content is persisted on our servers. The bookmarklet runs in your browser, sends a compact summary to our API, and the listing data is discarded once the audit completes. We only log anonymous telemetry (HTTP status, score bucket, latency) for monitoring.",
  },
  {
    q: "Why do you cap audits at 5 per day?",
    a: "Each audit costs about $0.0004 in Groq API spend. As a single-founder indie tool we cap total spend at $0.20/day. If you want to audit your full store, the paid TheSellerMind dashboard does bulk audits.",
  },
  {
    q: "How accurate is the score?",
    a: "Treat it as a directional signal. The 4-dimension rubric is published on our methodology page so you can decide whether you agree with the weights. The model has biases — use the score as a starting point.",
  },
  {
    q: "Will you send me marketing emails?",
    a: "No. There is no email field anywhere on this tool. Your PDF downloads directly. You can come back any day and run another audit without leaving any data behind.",
  },
];

export default function FreeEtsySeoCheckerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16" data-tool-version="etsy-seo-v0.1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APPLICATION_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />

      {/* Hero */}
      <header className="mb-8 text-center md:mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
          Free tool · TheSellerMind
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900 md:text-4xl">
          Free Etsy Listing SEO Checker
        </h1>
        <p className="mt-3 text-base text-stone-600 md:text-lg">
          Install our one-click bookmarklet, then click it on any Etsy listing tab —
          get a 4-dimension score (Title / Tags / Description / Images) plus
          3 prioritized fixes in 5&nbsp;seconds.
        </p>
        <p className="mt-4 text-xs text-stone-500">
          Free • No signup • Privacy-first • Open methodology
        </p>
      </header>

      {/* Bookmarklet install zone */}
      <section
        id="install-bookmarklet"
        className="mb-10 rounded-2xl border border-[#E07A5F]/30 bg-gradient-to-br from-[#FFF5EE] to-[#FCEAE7] p-6 md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
          Recommended · 30-second setup
        </p>
        <h2 className="mt-2 text-2xl font-bold text-stone-900">
          Install the SellerMind bookmarklet
        </h2>
        <p className="mt-2 text-sm text-stone-700">
          Etsy uses anti-bot protection that blocks direct URL fetches from cloud
          servers. The bookmarklet runs in <em>your own browser</em>, so it always
          works on any public Etsy listing you can view.
        </p>

        <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm font-semibold text-stone-800">
            Step 1 — Drag this button to your bookmarks bar:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={'javascript:(function(){var s=document.createElement(\'script\');s.src=\'https://thesellermind.com/sm-bookmarklet.js?\'+Date.now();s.charset=\'utf-8\';document.body.appendChild(s);})();'}
              onClick={(e) => e.preventDefault()}
              className="inline-block cursor-grab rounded-lg bg-[#E07A5F] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C96A52] active:cursor-grabbing"
              title="Drag me to your bookmarks bar"
            >
              📌 Etsy SEO Checker
            </a>
            <p className="text-xs text-stone-600">
              ← Drag this orange button into your browser&apos;s bookmarks bar.
              <br />
              On Chrome/Edge: press <kbd className="rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl/⌘+Shift+B</kbd>{" "}
              first to show the bar.
            </p>
          </div>

          <p className="mt-5 text-sm font-semibold text-stone-800">
            Step 2 — Open any Etsy listing and click the bookmark.
          </p>
          <p className="mt-2 text-sm text-stone-700">
            A small orange box appears in the top-right corner. After a few
            seconds your audit report opens in a new tab — no URL pasting, no
            sign-up.
          </p>
        </div>

        <p className="mt-4 text-xs text-stone-500">
          <strong>Privacy:</strong> the bookmarklet only reads the listing page
          you&apos;re viewing. We don&apos;t log you in to Etsy, don&apos;t touch your
          private dashboard data, and don&apos;t store the listing content on our
          servers. See{" "}
          <Link href="/legal/etsy-seo-checker-terms" className="text-[#E07A5F] underline">
            Terms of Use
          </Link>{" "}
          for the full plain-English version.
        </p>
      </section>

      {/* Tool widget */}
      <EtsyAuditWidget />

      {/* How it works */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-stone-900">How it works</h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 1</p>
            <p className="mt-1 text-sm text-stone-700">
              Drag our bookmarklet button to your bookmarks bar (30s, one-time).
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 2</p>
            <p className="mt-1 text-sm text-stone-700">
              Open any public Etsy listing in your browser and click the bookmark.
              It reads the page in <em>your</em> browser and POSTs a compact
              summary to our scoring API.
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 3</p>
            <p className="mt-1 text-sm text-stone-700">
              Your audit opens in a new tab: 0–100 score, 4-dimension breakdown,
              3 prioritized fixes, and a title rewrite. Download a PDF if you want.
            </p>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-stone-900">Frequently asked</h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl border border-stone-200 bg-white p-4 open:bg-stone-50"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-stone-800">
                {f.q}
                <span className="float-right text-[#E07A5F] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-stone-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Disclosure */}
      <section className="mt-14 rounded-xl bg-stone-50 p-5 text-sm text-stone-600">
        <p>
          <strong className="text-stone-800">Honest disclosure.</strong> This is an
          opinionated tool built by Haimo (an indie hacker behind TheSellerMind).
          The LLM has biases and can be wrong — treat the score as a directional
          signal, not gospel. This audit is offered free because it&apos;s
          top-of-funnel for TheSellerMind&apos;s paid product, but there are no
          upsell pop-ups, no email capture, and no retargeting pixels.
        </p>
        <p className="mt-3">
          <Link className="text-[#E07A5F] underline" href="/free-etsy-seo-checker/privacy">
            Privacy
          </Link>
          {" · "}
          <Link
            className="text-[#E07A5F] underline"
            href="/free-etsy-seo-checker/methodology"
          >
            Methodology
          </Link>
          {" · "}
          <Link className="text-[#E07A5F] underline" href="/terms">
            Terms
          </Link>
          {" · "}
          <Link className="text-[#E07A5F] underline" href="/legal/etsy-seo-checker-terms">
            Bookmarklet Terms
          </Link>
        </p>
      </section>
    </main>
  );
}

