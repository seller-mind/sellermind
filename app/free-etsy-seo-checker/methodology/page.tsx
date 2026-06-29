import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology · Free Etsy SEO Checker | TheSellerMind",
  description:
    "Exactly how we score your Etsy listing — the 4-dimension rubric, scoring weights, and the honest limitations of an LLM-powered audit.",
  alternates: { canonical: "https://thesellermind.com/free-etsy-seo-checker/methodology" },
  robots: { index: true, follow: true },
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E07A5F]">
          Free Etsy SEO Checker · Methodology
        </p>
        <h1 className="mt-3 text-2xl font-bold text-stone-900 md:text-3xl">
          How we score your Etsy listing — and where we&apos;re wrong
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated 2026-06-28 · Published for transparency (E-E-A-T).
        </p>
      </header>

      <section className="prose prose-stone mt-8 max-w-none text-stone-700">
        <h2 className="text-lg font-semibold text-stone-900">The 4 dimensions</h2>
        <p>
          We split a listing into four scorable surfaces, each worth 0–25 points
          (100 total). The breakdown mirrors how Etsy&apos;s public ranking
          factors interact with buyer behavior.
        </p>

        <h3 className="mt-5 text-base font-semibold text-stone-900">
          1. Title (0–25)
        </h3>
        <ul className="list-disc space-y-1 pl-6">
          <li>120–140 chars is the sweet spot (+10). Below 80 chars (+1).</li>
          <li>Front-loaded buyer keyword in the first 30 chars (+8).</li>
          <li>Pipe / comma separator structure helps scannability (+4).</li>
          <li>Long-tail phrase coverage (+3).</li>
          <li>Penalties: ALL CAPS or keyword stuffing (-5, floored at 0).</li>
        </ul>

        <h3 className="mt-5 text-base font-semibold text-stone-900">
          2. Tags (0–25)
        </h3>
        <ul className="list-disc space-y-1 pl-6">
          <li>Etsy gives you 13 tag slots; use them all (+12).</li>
          <li>2–3 word phrases beat single words (+6).</li>
          <li>Buyer-intent words like &quot;gift for&quot; / &quot;personalized&quot; (+4).</li>
          <li>Long-tail mix (+3).</li>
          <li>Penalty: duplicated tags / comma-stuffed single tag (-3).</li>
        </ul>

        <h3 className="mt-5 text-base font-semibold text-stone-900">
          3. Description (0–25)
        </h3>
        <ul className="list-disc space-y-1 pl-6">
          <li>First-paragraph keyword density (+8).</li>
          <li>Length ≥ 160 chars (+5); ≥ 80 (+2).</li>
          <li>Buyer-intent hook in first 2 lines (+6).</li>
          <li>Section structure (Features / Materials / Shipping) (+4).</li>
          <li>CTA strength (+2).</li>
        </ul>

        <h3 className="mt-5 text-base font-semibold text-stone-900">
          4. Images + Alt (0–25)
        </h3>
        <ul className="list-disc space-y-1 pl-6">
          <li>Image count ≥ 10 (+10); 7–9 (+7); 4–6 (+4); &lt; 4 (+1).</li>
          <li>Alt text coverage × 10 (max +10).</li>
          <li>Primary image text overlay / branding signal (+5).</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          From score to grade
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>≥ 80 = A — competitive listing</li>
          <li>65–79 = B — solid, room to improve</li>
          <li>50–64 = C — needs work</li>
          <li>&lt; 50 = D — start over with the title and tags</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          Where we&apos;re wrong (limitations)
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>This is not the Etsy algorithm.</strong> Etsy&apos;s real
            ranking model is private and changes. Our rubric is an opinionated
            distillation of publicly stated factors and our own seller experience.
          </li>
          <li>
            <strong>LLM biases.</strong> We use DeepSeek to score the
            qualitative pieces (honest_take, next_step, title rewrite). The model
            can be confidently wrong, especially on niches it under-indexed.
          </li>
          <li>
            <strong>No traffic data.</strong> We don&apos;t see search volume,
            CTR, or competitor rank. The score is structural quality, not
            real-world performance.
          </li>
          <li>
            <strong>Parse failures.</strong> Etsy occasionally rotates page
            layout. When we can&apos;t parse a field, we mark the audit
            quality as &quot;low&quot; and the score reflects partial data.
          </li>
          <li>
            <strong>One listing at a time.</strong> Real SEO insight comes
            from auditing your whole store and tracking changes over weeks —
            that&apos;s what the paid TheSellerMind dashboard is for.
          </li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-stone-900">
          What we explicitly do NOT do
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Connect to your Etsy account or scrape your shop.</li>
          <li>Store your listing content beyond a 6-hour cache of the score JSON.</li>
          <li>Collect emails. There is no signup, ever.</li>
          <li>Show fabricated &quot;X audits today&quot; counters.</li>
          <li>Use a payment SEO data source (Ahrefs / Semrush) — pure LLM + rubric.</li>
        </ul>

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
