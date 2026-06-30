'use client';

import { useState, useEffect } from 'react';

/**
 * Drag-to-bookmarks button. Client component because:
 *   1) `<a href="javascript:...">` uses `onClick={(e)=>e.preventDefault()}`
 *   2) The bookmarklet src must be the current origin so preview deploys
 *      load `sm-bookmarklet.js` from the same preview domain (CORS in the
 *      new audit API already allowlists preview origins).
 *
 * Production (thesellermind.com) and preview
 * (sellermind-git-*-sellermind-s-projects.vercel.app) both work.
 */
function buildHref(origin: string): string {
  // Strict allowlist: only use HTTPS Vercel hostnames or the canonical
  // production domain. Anything else falls back to production.
  const safe =
    /^https:\/\/(?:thesellermind\.com|www\.thesellermind\.com|sellermind-[a-z0-9-]+-sellermind-s-projects\.vercel\.app)$/i.test(
      origin,
    )
      ? origin
      : 'https://thesellermind.com';
  // Single-line javascript: URL — must avoid line breaks or browsers will
  // refuse to bookmark it.
  return (
    "javascript:(function(){var s=document.createElement('script');s.src='" +
    safe +
    "/sm-bookmarklet.js?'+Date.now();s.charset='utf-8';document.body.appendChild(s);})();"
  );
}

const FALLBACK_HREF = buildHref('https://thesellermind.com');

export default function BookmarkletButton() {
  const [clicked, setClicked] = useState(false);
  const [href, setHref] = useState<string>(FALLBACK_HREF);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setHref(buildHref(window.location.origin));
    }
  }, []);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          setClicked(true);
          setTimeout(() => setClicked(false), 5000);
        }}
        className="inline-block cursor-grab rounded-lg bg-[#E07A5F] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C96A52] active:cursor-grabbing"
        title="Drag me to your bookmarks bar — don't click"
        draggable
      >
        📌 Etsy SEO Checker
      </a>
      <p className="text-xs text-stone-600">
        ← Drag this orange button into your browser&apos;s bookmarks bar.
        <br />
        On Chrome/Edge: press{' '}
        <kbd className="rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl/⌘+Shift+B
        </kbd>{' '}
        first to show the bar.
      </p>
      {clicked && (
        <p className="mt-1 w-full text-xs font-medium text-[#C96A52]">
          ☝️ Don&apos;t click — please <em>drag</em> the orange button into your
          bookmarks bar instead.
        </p>
      )}
    </div>
  );
}
