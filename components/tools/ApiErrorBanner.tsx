"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolApiError } from "@/lib/api-client";

interface ApiErrorBannerProps {
  error: ToolApiError | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Persistent error banner used by every AI tool page.
 *
 * P0 fix (2026-06-20): replaces the previous behaviour where 403 LIMIT_EXCEEDED
 * responses were dumped into a 3-second auto-dismissing toast WITHOUT the
 * upgrade CTA — making the buttons feel dead to NAT'd users.
 *
 * UX contract:
 *   - Stays visible until the user clicks Dismiss or fires another request.
 *   - Renders an "Upgrade to Pro" link button whenever `error.upgradeUrl` is set
 *     (the listing/reply/review/holiday/batch endpoints all return /pricing).
 *   - Falls back to a generic copy when the API didn\'t supply a message.
 */
export function ApiErrorBanner({ error, onDismiss, className }: ApiErrorBannerProps) {
  if (!error) return null;

  const isQuotaError =
    error.code === "LIMIT_EXCEEDED" ||
    error.code === "SUBSCRIPTION_EXPIRED" ||
    !!error.upgradeUrl;

  const headline = isQuotaError ? "You\'ve reached your free limit" : "We couldn\'t generate that";

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="api-error-banner"
      className={cn(
        "rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm",
        "dark:border-red-500/40 dark:bg-red-950/30",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900 dark:text-red-100">
            {headline}
          </p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">
            {error.message}
          </p>

          {error.retryAfterSeconds ? (
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              Try again in about {error.retryAfterSeconds}s.
            </p>
          ) : null}

          <p className="mt-2 text-[11px] uppercase tracking-wide text-red-600/70 dark:text-red-400/70">
            Error code: {error.code}
          </p>

          {error.upgradeUrl ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={error.upgradeUrl}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg",
                  "bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm",
                  "transition hover:bg-red-700",
                  "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                )}
                data-testid="api-error-upgrade-cta"
              >
                Upgrade to Pro
              </Link>
              <span className="text-xs text-red-700 dark:text-red-300">
                Unlimited generations · cancel anytime
              </span>
            </div>
          ) : null}
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className={cn(
              "ml-2 rounded-md p-1 text-red-600/70 transition hover:bg-red-100 hover:text-red-800",
              "dark:text-red-400/70 dark:hover:bg-red-900/40 dark:hover:text-red-200",
              "focus:outline-none focus:ring-2 focus:ring-red-500"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
