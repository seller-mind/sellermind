"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";

interface ListingOptimization {
  original: {
    title: string;
    tags: string;
    description: string;
  };
  diagnosis: {
    title_issues: string[];
    tag_issues: string[];
    description_issues: string[];
  };
  optimized: {
    title: string;
    tags: string[];
    description: string;
  };
  comparison: {
    title_char_before: number;
    title_char_after: number;
    tags_count_before: number;
    tags_count_after: number;
    description_word_count_before: number;
    description_word_count_after: number;
  };
  seo_score_before: number;
  seo_score_after: number;
  key_changes: string[];
}

interface BatchResultProps {
  result: {
    listings: ListingOptimization[];
  } | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function ListingCard({ listing, index }: { listing: ListingOptimization; index: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const improvement = listing.seo_score_after - listing.seo_score_before;
  const improvementColor = improvement >= 20 ? "success" : improvement >= 10 ? "warning" : "default";

  const fullOptimizedText = `TITLE:\n${listing.optimized.title}\n\nTAGS:\n${listing.optimized.tags.join(", ")}\n\nDESCRIPTION:\n${listing.optimized.description}`;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
            {index + 1}
          </span>
          <h4 className="font-semibold text-foreground-primary">Listing {index + 1}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{listing.seo_score_before} → {listing.seo_score_after}</Badge>
          <Badge variant={improvementColor}>+{improvement}</Badge>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Title Comparison */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground-muted">Title</p>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-xs text-red-400 line-through">
              {listing.original.title.substring(0, 60)}
              {listing.original.title.length > 60 ? "..." : ""}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-xs text-green-700">
              {listing.optimized.title.substring(0, 60)}
              {listing.optimized.title.length > 60 ? "..." : ""}
            </p>
          </div>
        </div>

        {/* Tags Comparison */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground-muted">Tags</p>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-xs text-red-400">
              {listing.comparison.tags_count_before} tags
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-xs text-green-700">
              {listing.comparison.tags_count_after} tags
            </p>
          </div>
        </div>

        {/* Description Comparison */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground-muted">Description</p>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-xs text-red-400">
              ~{listing.comparison.description_word_count_before} words
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-2">
            <p className="text-xs text-green-700">
              ~{listing.comparison.description_word_count_after} words
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Diagnosis */}
          {(listing.diagnosis.title_issues.length > 0 || listing.diagnosis.tag_issues.length > 0) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 text-xs font-semibold text-amber-700">Issues Found</p>
              <div className="space-y-1">
                {listing.diagnosis.title_issues.map((issue, i) => (
                  <p key={`t-${i}`} className="text-xs text-amber-600">• {issue}</p>
                ))}
                {listing.diagnosis.tag_issues.map((issue, i) => (
                  <p key={`g-${i}`} className="text-xs text-amber-600">• {issue}</p>
                ))}
              </div>
            </div>
          )}

          {/* Key Changes */}
          {listing.key_changes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground-muted">Key Changes</p>
              <ul className="space-y-0.5">
                {listing.key_changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground-secondary">
                    <span className="mt-1 text-green-500">✓</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Optimized Content */}
          <div className="rounded-xl border border-border bg-background-secondary p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground-muted">Optimized Content</p>
              <CopyButton text={fullOptimizedText} size="sm" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Title:</p>
                <p className="text-sm text-foreground-primary">{listing.optimized.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Tags:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {listing.optimized.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Description:</p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-foreground-primary leading-relaxed">
                  {listing.optimized.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function BatchResult({ result, onRegenerate, isRegenerating }: BatchResultProps) {
  if (!result) return null;

  const totalImprovement = result.listings.reduce(
    (sum, l) => sum + (l.seo_score_after - l.seo_score_before),
    0
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-gradient-to-r from-secondary-light to-accent/20 p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{result.listings.length}</p>
          <p className="text-xs text-foreground-muted">Listings</p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">+{totalImprovement}</p>
          <p className="text-xs text-foreground-muted">Total SEO Points</p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            +{Math.round(totalImprovement / result.listings.length)}
          </p>
          <p className="text-xs text-foreground-muted">Avg. Improvement</p>
        </div>
      </div>

      {/* Individual Listing Cards */}
      <div className="space-y-3">
        {result.listings.map((listing, i) => (
          <ListingCard key={i} listing={listing} index={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onRegenerate} variant="secondary" className="flex-1" isLoading={isRegenerating}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate All
        </Button>
      </div>
    </div>
  );
}
