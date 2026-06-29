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
    a: "Yes. No signup, no email, no card. The tool is capped at 5 audits per IP per day to keep AI costs sustainable for a small indie team.",
  },
  {
    q: "Do you store my listing URL or content?",
    a: "We don't persist your listing title, description, or URL. The 6-hour cache only stores the audit JSON output keyed by a hash of the URL, so a repeat of the same URL is cheap.",
  },
  {
    q: "Why do you cap audits at 5 per day?",
    a: "Each audit costs about $0.004 in DeepSeek API spend. As a single-founder indie tool we cap total spend at $0.20/day. If you want to audit your full store, the paid TheSellerMind dashboard does bulk audits.",
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
          Paste your Etsy listing URL. Get a 4-dimension score (Title / Tags /
          Description / Images) plus 3 prioritized fixes in 10&nbsp;seconds.
        </p>
        <p className="mt-4 text-xs text-stone-500">
          Free • No signup • Privacy-first • Open methodology
        </p>
      </header>

      {/* Tool widget */}
      <EtsyAuditWidget />

      {/* How it works */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-stone-900">How it works</h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 1</p>
            <p className="mt-1 text-sm text-stone-700">
              Paste any public Etsy listing URL. We read the public page only.
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 2</p>
            <p className="mt-1 text-sm text-stone-700">
              We parse title, tags, description, and image gallery — then send a
              compact summary to DeepSeek for scoring.
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm font-semibold text-[#E07A5F]">Step 3</p>
            <p className="mt-1 text-sm text-stone-700">
              Get a 0–100 score, 3 prioritized fixes, and a title rewrite. Download
              a PDF if you want to share with a co-seller.
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
        </p>
      </section>
    </main>
  );
}
