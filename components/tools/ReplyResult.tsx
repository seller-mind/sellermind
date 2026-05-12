"use client";

import * as React from "react";
import { ResultCard } from "@/components/shared/ResultCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReplyResultProps {
  result: {
    reply: string;
    scenario: string;
    tone: string;
    action_required: string;
    policy_notes: string;
  } | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function ReplyResult({ result, onRegenerate, isRegenerating }: ReplyResultProps) {
  if (!result) return null;

  const scenarioLabels: Record<string, string> = {
    order_inquiry: "Order Inquiry",
    custom_request: "Custom Request",
    shipping: "Shipping",
    damaged_item: "Damaged Item",
    refund: "Refund",
    general: "General",
  };

  return (
    <div className="space-y-4">
      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{scenarioLabels[result.scenario] || result.scenario}</Badge>
        <Badge variant="secondary">Tone: {result.tone}</Badge>
      </div>

      {/* Reply Content */}
      <ResultCard title="Generated Reply" fullCopyText={result.reply}>
        <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
          {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
          <p className="whitespace-pre-wrap text-foreground-primary leading-relaxed overflow-wrap-break-word">
            {result.reply}
          </p>
        </div>
      </ResultCard>

      {/* Action Required */}
      {result.action_required && result.action_required !== "none" && (
        <ResultCard title="Action Required">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-foreground-secondary">{result.action_required}</p>
          </div>
        </ResultCard>
      )}

      {/* Policy Notes */}
      {result.policy_notes && (
        <div className="rounded-lg border border-border bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            <strong>Policy Note:</strong> {result.policy_notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onRegenerate} variant="secondary" className="flex-1" isLoading={isRegenerating}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </Button>
        <CopyButton text={result.reply} className="flex-1" label="Copy Reply" />
      </div>
    </div>
  );
}
