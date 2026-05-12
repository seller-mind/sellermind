"use client";

import * as React from "react";
import { ResultCard } from "@/components/shared/ResultCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ListingResultProps {
  result: {
    title: string;
    description: string;
    tags: string[];
    seo_score: number;
    optimizationTips?: string[]; // BUG 3 FIX: Added optimization tips support
    seo_notes?: {
      primary_keyword: string;
      title_strategy: string;
      character_count_title: number;
      character_count_tags: number[];
      tag_coverage_analysis: string;
      seo_warnings: string;
    };
  } | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function ListingResult({ result, onRegenerate, isRegenerating }: ListingResultProps) {
  if (!result) return null;

  const titleCount = result.title.length;
  const descriptionWordCount = result.description.split(/\s+/).filter(Boolean).length;
  const tagsText = result.tags.join(", ");
  const fullText = `TITLE:\n${result.title}\n\nTAGS:\n${tagsText}\n\nDESCRIPTION:\n${result.description}`;

  const scoreColor =
    result.seo_score >= 80
      ? "success"
      : result.seo_score >= 60
      ? "warning"
      : "error";

  return (
    <div className="space-y-4">
      {/* SEO Score */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground-secondary">SEO Score:</span>
        <Badge variant={scoreColor}>
          {result.seo_score}/100
        </Badge>
        <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              result.seo_score >= 80
                ? "bg-secondary"
                : result.seo_score >= 60
                ? "bg-amber-400"
                : "bg-red-400"
            }`}
            style={{ width: `${result.seo_score}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <ResultCard
        title="SEO-Optimized Title"
        badge={`${titleCount}/140 chars`}
        badgeVariant={titleCount > 140 ? "error" : titleCount < 120 ? "warning" : "success"} // BUG 2 FIX: Show warning if under 120
        fullCopyText={result.title}
      >
        <p className="text-foreground-primary leading-relaxed">{result.title}</p>
        {/* BUG 2 FIX: Warning for short titles */}
        {titleCount < 120 && (
          <p className="mt-2 text-xs text-amber-600">
            ⚠️ Title is under 120 characters. Etsy titles should use at least 120 of the 140 available characters for better SEO.
          </p>
        )}
      </ResultCard>

      {/* Tags */}
      <ResultCard
        title="13 Tags"
        badge={`${result.tags.length} tags`}
        fullCopyText={tagsText}
      >
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag, i) => {
            const tagLength = tag.length;
            const isOverLimit = tagLength > 20; // BUG 1 FIX: Highlight tags exceeding 20 chars
            return (
              <div key={i} className="group relative">
                <span 
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    isOverLimit 
                      ? "bg-red-100 text-red-700 border border-red-300" // BUG 1 FIX: Visual warning for over-limit tags
                      : "bg-primary-light text-primary"
                  }`}
                  title={isOverLimit ? `⚠️ Tag exceeds 20 character limit (${tagLength}/20)` : `✓ ${tagLength}/20 chars`}
                >
                  {isOverLimit ? `⚠️ ${tag}` : tag}
                </span>
                <CopyButton text={tag} size="sm" className="absolute -right-1 -top-1 hidden h-5 w-5 rounded-full bg-secondary text-white group-hover:flex items-center justify-center" />
              </div>
            );
          })}
        </div>
        {result.seo_notes?.tag_coverage_analysis && (
          <p className="mt-3 text-xs text-foreground-muted">
            {result.seo_notes.tag_coverage_analysis}
          </p>
        )}
        {/* BUG 1 FIX: Summary warning if any tags exceed limit */}
        {result.tags.some(tag => tag.length > 20) && (
          <p className="mt-2 text-xs text-red-600 font-medium">
            ⚠️ Some tags exceed Etsy's 20 character limit. Etsy will reject these tags.
          </p>
        )}
      </ResultCard>

      {/* Description */}
      <ResultCard
        title="Product Description"
        badge={`~${descriptionWordCount} words`}
        fullCopyText={result.description}
      >
        <div className="space-y-4 min-h-[4rem] overflow-y-auto">
          {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
          {result.description.split("\n\n").filter(Boolean).map((paragraph, i) => (
            <p key={i} className="text-foreground-primary leading-relaxed whitespace-pre-wrap overflow-wrap-break-word">
              {paragraph}
            </p>
          ))}
        </div>
      </ResultCard>

      {/* SEO Notes */}
      {result.seo_notes && (
        <ResultCard title="SEO Notes">
          <div className="space-y-2">
            {result.seo_notes.primary_keyword && (
              <div className="flex gap-2">
                <span className="text-xs font-medium text-foreground-secondary">Primary Keyword:</span>
                <Badge variant="accent">{result.seo_notes.primary_keyword}</Badge>
              </div>
            )}
            {result.seo_notes.title_strategy && (
              <div className="flex gap-2">
                <span className="text-xs font-medium text-foreground-secondary">Strategy:</span>
                <span className="text-xs text-foreground-muted">{result.seo_notes.title_strategy}</span>
              </div>
            )}
            {result.seo_notes.seo_warnings && (
              <p className="text-xs text-amber-600">⚠️ {result.seo_notes.seo_warnings}</p>
            )}
          </div>
        </ResultCard>
      )}

      {/* BUG 3 FIX: Optimization Tips */}
      {result.optimizationTips && result.optimizationTips.length > 0 && (
        <ResultCard title="Optimization Tips" badge={`${result.optimizationTips.length} tips`} badgeVariant="success">
          <ul className="space-y-2">
            {result.optimizationTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-primary">
                <span className="mt-1 text-green-500">✓</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      <div className="flex gap-3">
        <Button onClick={onRegenerate} variant="secondary" className="flex-1" isLoading={isRegenerating}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </Button>
        <CopyButton text={fullText} className="flex-1" label="Copy All" />
      </div>
    </div>
  );
}
