'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MockTitle } from './mock-titles';
import { pickMockGroup } from './mock-titles';

// v0.05 client — pure front-end mock. Rate-limit counter lives in localStorage
// under the key `sm-etsy-title-gen-count-v1`. D13/D14 will swap this for a
// real Worker + Upstash quota (see D12 spec).

const RL_KEY = 'sm-etsy-title-gen-count-v1';
const RL_MAX = 5; // 5 gen / IP / day (mock — cannot actually gate by IP client-side)
const FAKE_LATENCY_MS = 800;

type RLState = { date: string; count: number };

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function readRL(): RLState {
  if (typeof window === 'undefined') return { date: todayIso(), count: 0 };
  try {
    const raw = window.localStorage.getItem(RL_KEY);
    if (!raw) return { date: todayIso(), count: 0 };
    const parsed = JSON.parse(raw) as RLState;
    if (parsed.date !== todayIso()) return { date: todayIso(), count: 0 };
    return parsed;
  } catch {
    return { date: todayIso(), count: 0 };
  }
}

function writeRL(next: RLState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RL_KEY, JSON.stringify(next));
  } catch {
    // swallow — quota / private-mode
  }
}

export default function EtsyTitleGenClient() {
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<MockTitle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rl, setRl] = useState<RLState>({ date: todayIso(), count: 0 });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setRl(readRL());
  }, []);

  const remaining = useMemo(() => Math.max(0, RL_MAX - rl.count), [rl.count]);
  const disabled = loading || product.trim().length < 3 || remaining <= 0;

  async function handleGenerate() {
    setError(null);
    setTitles(null);
    setCopiedIdx(null);

    if (product.trim().length < 3) {
      setError('Please enter at least 3 characters describing your product.');
      return;
    }
    if (remaining <= 0) {
      setError('Daily preview quota reached (5 / day). Come back tomorrow, or try the SEO Checker below.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, FAKE_LATENCY_MS));

    const group = pickMockGroup(product);
    setTitles(group.titles);

    const next: RLState = { date: todayIso(), count: rl.count + 1 };
    setRl(next);
    writeRL(next);
    setLoading(false);
  }

  async function handleCopy(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1200);
    } catch {
      setError('Copy failed — please select and copy manually.');
    }
  }

  return (
    <section className="mt-6">
      {/* Rate-limit banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white/60 px-4 py-3 text-sm text-stone-600">
        <span>
          Preview quota today: <strong className="text-stone-900">{remaining}</strong> / {RL_MAX} left
        </span>
        <span className="text-xs text-stone-500">v0.05 preview · mock titles for design review</span>
      </div>

      {/* Input */}
      <label htmlFor="product-input" className="block text-sm font-medium text-stone-800">
        Product name or short description
      </label>
      <textarea
        id="product-input"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="e.g. handmade silver ring with turquoise stone, boho style"
        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 shadow-sm outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/30"
      />
      <div className="mt-1 text-right text-xs text-stone-500">{product.length} / 500</div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled}
        className="mt-3 w-full rounded-xl bg-[#E07A5F] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#c9684f] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
      >
        {loading ? 'Generating…' : 'Generate 10 Etsy titles'}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 space-y-3" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />
          ))}
        </div>
      )}

      {/* Results */}
      {titles && !loading && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-stone-600">
            10 SEO-optimized title drafts (preview / mock). Character counts and scores are indicative — the D13
            production build will score each title with a real LLM.
          </p>
          <ul className="space-y-3">
            {titles.map((t, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-[#E07A5F]/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="flex-1 text-sm font-medium leading-snug text-stone-900">{t.title}</p>
                  <span className="rounded-full bg-[#FFF5EE] px-3 py-1 text-xs font-semibold text-[#E07A5F]">
                    {t.score} / 100
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                  <span>{t.title.length} chars</span>
                  <span>·</span>
                  <span>{t.tags.length} suggested tags</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(idx, t.title)}
                    className="ml-auto rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:border-[#E07A5F] hover:text-[#E07A5F]"
                  >
                    {copiedIdx === idx ? 'Copied ✓' : 'Copy title'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  <span className="font-medium text-stone-600">Tags:</span> {t.tags.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
