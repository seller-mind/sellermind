'use client';

import { useState } from 'react';

/**
 * Drag-to-bookmarks button. Must be a client component because the
 * `<a href="javascript:...">` element uses `onClick={(e)=>e.preventDefault()}`
 * to suppress single-click navigation (users should drag, not click).
 *
 * The bookmarklet is intentionally short: it loads sm-bookmarklet.js from
 * the same domain so we can update the DOM extractor without users
 * having to re-install the bookmark.
 */
const BOOKMARKLET_HREF =
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  "javascript:(function(){var s=document.createElement('script');s.src='https://thesellermind.com/sm-bookmarklet.js?'+Date.now();s.charset='utf-8';document.body.appendChild(s);})();";

export default function BookmarkletButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <a
        href={BOOKMARKLET_HREF}
        onClick={(e) => {
          e.preventDefault();
          setClicked(true);
          // Auto-hide hint after a few seconds
          setTimeout(() => setClicked(false), 4000);
        }}
        className="inline-block cursor-grab rounded-lg bg-[#E07A5F] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C96A52] active:cursor-grabbing"
        title="Drag me to your bookmarks bar"
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
          ☝️ Don&apos;t click — <em>drag</em> the button into your bookmarks bar.
        </p>
      )}
    </div>
  );
}
