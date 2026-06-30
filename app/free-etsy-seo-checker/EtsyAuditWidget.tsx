"use client";

/**
 * SM Free Etsy SEO Checker — interactive client component.
 *
 * Responsibility:
 *   - Validate URL client-side (mirror of server regex)
 *   - Submit to /api/etsy-audit
 *   - Render 4-dimension dashboard + top 3 priorities + before/after
 *   - Trigger PDF download via /api/etsy-audit/pdf
 *   - Loading-phase UX (porting Validator CRO P0 patch)
 *   - 429 friendly fallback message (alias=Haimo)
 *
 * Hardening:
 *   - All AuditResult string fields are React children (auto-escaped — XSS safe)
 *   - PDF download flow does its own POST instead of constructing a URL
 *   - No external fetch calls outside same origin
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AuditApiResponse,
  AuditResult,
  DimensionScore,
  Grade,
  ImpactLevel,
} from "@/lib/etsy-types";

const ETSY_URL_RE =
  /^https?:\/\/(www\.)?etsy\.com\/listing\/\d+(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i;

const LOADING_PHASES: { ms: number; text: string }[] = [
  { ms: 0, text: "Fetching your listing from Etsy…" },
  { ms: 2500, text: "Parsing title, tags, description, images…" },
  { ms: 5000, text: "Scoring 4 SEO dimensions…" },
  { ms: 8000, text: "Drafting your prioritized fixes…" },
];

function gradeStyles(g: Grade): string {
  switch (g) {
    case "A":
      return "bg-emerald-500 text-white";
    case "B":
      return "bg-amber-400 text-stone-900";
    case "C":
      return "bg-orange-500 text-white";
    default:
      return "bg-red-600 text-white";
  }
}

function impactStyles(i: ImpactLevel): string {
  switch (i) {
    case "High":
      return "bg-red-100 text-red-800 border-red-300";
    case "Medium":
      return "bg-amber-100 text-amber-900 border-amber-300";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
  }
}

function DimensionCard({
  name,
  dim,
}: {
  name: string;
  dim: DimensionScore;
}) {
  const pct = Math.round((dim.score / 25) * 100);
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">{name}</h3>
        <span className="text-sm font-mono font-semibold text-[#E07A5F]">
          {dim.score} / 25
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-2 rounded-full bg-[#E07A5F] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-stone-600">{dim.honest_take}</p>
      <p className="mt-2 text-sm font-medium text-stone-800">→ {dim.next_step}</p>
    </div>
  );
}

export default function EtsyAuditWidget() {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // === Bookmarklet result hash receiver ===
  // sm-bookmarklet.js POSTs to /api/etsy-audit-from-browser, then opens
  // /free-etsy-seo-checker?from=bm#r=<base64-json>. We decode it on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.startsWith("#r=")) return;
    try {
      const b64 = window.location.hash.substring(3);
      const json = decodeURIComponent(escape(window.atob(b64)));
      const parsed = JSON.parse(json) as AuditResult;
      if (
        parsed &&
        typeof parsed.total_score === "number" &&
        parsed.dimensions &&
        parsed.dimensions.title
      ) {
        setAudit(parsed);
        // Strip the payload from the URL bar so refresh doesn't replay it.
        const { pathname, search } = window.location;
        window.history.replaceState(null, "", pathname + search);
      }
    } catch {
      /* malformed — ignore silently */
    }
  }, []);

  const urlValid = useMemo(() => ETSY_URL_RE.test(url.trim()), [url]);

  // Loading-phase rotator
  useEffect(() => {
    if (!submitting) {
      setPhase(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      let idx = 0;
      for (let i = 0; i < LOADING_PHASES.length; i++) {
        if (elapsed >= LOADING_PHASES[i].ms) idx = i;
      }
      setPhase(idx);
    }, 400);
    return () => clearInterval(timer);
  }, [submitting]);

  // Scroll to result on success/failure
  useEffect(() => {
    if (audit || error) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [audit, error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setAudit(null);

    try {
      const res = await fetch("/api/etsy-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as AuditApiResponse;
      if (!data.success) {
        if (res.status === 429) {
          setError(
            data.error.message ||
              "Slow down — please wait ~30 seconds between audits. — Haimo"
          );
        } else {
          setError(data.error.message || "Something went wrong. Please try again.");
        }
        return;
      }
      setAudit(data.data);
    } catch {
      setError("Network error — please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadPdf() {
    if (!audit || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch("/api/etsy-audit/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError("Couldn't generate the PDF right now. " + txt.slice(0, 120));
        return;
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `sellermind_etsy_audit_${audit.total_score}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 4000);
    } catch {
      setError("PDF download failed — please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  function handleReset() {
    setAudit(null);
    setError(null);
    setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="w-full">
      {/* ===== form card ===== */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"
      >
        {/* Banner — recommend the bookmarklet flow (more reliable than URL fetch) */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>⚡ Faster, more reliable:</strong> install the{" "}
          <a href="#install-bookmarklet" className="font-semibold text-[#B45309] underline">
            SellerMind bookmarklet
          </a>{" "}
          (30s, one-time). Then click it on any Etsy listing tab to audit
          instantly — no URL pasting, no fetch failures.
        </div>
        <label htmlFor="etsy-url" className="block text-sm font-medium text-stone-800">
          Your Etsy listing URL
        </label>
        <input
          id="etsy-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.etsy.com/listing/123456789/your-product-name"
          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/30"
          disabled={submitting}
          maxLength={2048}
          required
        />
        <p className="mt-2 text-xs text-stone-500">
          {urlValid
            ? "Looks like a valid Etsy listing URL ✓"
            : "Paste a full URL like https://www.etsy.com/listing/123/your-product"}
        </p>
        <button
          type="submit"
          disabled={!urlValid || submitting}
          className="mt-4 w-full rounded-lg bg-[#E07A5F] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C96A52] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {submitting ? LOADING_PHASES[phase].text : "Get my SEO score →"}
        </button>
        <p className="mt-3 text-center text-xs text-stone-500">
          Free • No signup • Privacy-first • 5 audits/IP/day · URL fetch may fail (Etsy DataDome) — bookmarklet is the reliable path
        </p>
      </form>

      {/* ===== error / result region ===== */}
      <div ref={resultRef} className="mt-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-medium">We couldn&apos;t complete that audit.</p>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-3 text-xs text-red-700/70">
              If this keeps happening, paste the title / tags / description into{" "}
              <a className="underline" href="/tools/etsy-seo-tool">
                our other free tool
              </a>{" "}
              instead.
            </p>
          </div>
        )}

        {audit && (
          <div className="space-y-6">
            {/* score header */}
            <div className="rounded-2xl bg-gradient-to-br from-[#FCEAE7] to-[#FFF5EE] p-6 md:p-8">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    Your listing score
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-[#E07A5F]">
                      {audit.total_score}
                    </span>
                    <span className="text-2xl text-stone-400">/100</span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-4 py-1.5 text-lg font-bold ${gradeStyles(
                    audit.overall_grade
                  )}`}
                >
                  Grade {audit.overall_grade}
                </span>
              </div>
              <blockquote className="mt-5 border-l-4 border-[#E07A5F] pl-4 italic text-stone-700">
                &ldquo;{audit.one_brutal_line}&rdquo;
              </blockquote>
              {audit.meta.cached && (
                <p className="mt-3 text-xs text-stone-500">
                  Cached audit (same URL within 6h). It didn&apos;t count against
                  your daily quota.
                </p>
              )}
            </div>

            {/* 4 dimensions */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DimensionCard name="Title" dim={audit.dimensions.title} />
              <DimensionCard name="Tags" dim={audit.dimensions.tags} />
              <DimensionCard name="Description" dim={audit.dimensions.description} />
              <DimensionCard name="Images + Alt" dim={audit.dimensions.images_alt} />
            </div>

            {/* top 3 priorities */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-stone-900">
                Top 3 priorities (start here)
              </h2>
              <ol className="mt-4 space-y-3">
                {audit.top_3_priorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E07A5F] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-stone-800">{p.issue}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${impactStyles(
                            p.impact
                          )}`}
                        >
                          {p.impact}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">→ {p.fix}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* title before / after */}
            <div className="rounded-2xl border border-stone-200 bg-[#E8F3ED] p-6">
              <h2 className="text-lg font-semibold text-stone-900">
                Title rewrite suggestion
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Before
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    {audit.title_before_after.current}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    After (suggested)
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {audit.title_before_after.improved}
                  </p>
                </div>
              </div>
            </div>

            {/* action row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-5 py-3 font-medium text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadingPdf ? "Generating PDF…" : "📄 Download PDF report"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-5 py-3 font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Audit another listing
              </button>
            </div>

            {/* CTA tail — single exit to main product */}
            <div className="rounded-2xl bg-[#3D405B] p-6 text-white md:p-8">
              <p className="text-lg font-medium">
                Audit your entire store, track keywords over 14 days, and A/B test
                titles — all in one place.
              </p>
              <a
                href="https://thesellermind.com/?utm_source=etsy-seo-checker&utm_medium=micro_tool"
                className="mt-4 inline-block rounded-lg bg-[#E07A5F] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C96A52]"
              >
                Try TheSellerMind (14-day free trial) →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

