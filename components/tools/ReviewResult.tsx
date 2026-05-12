"use client";

import * as React from "react";
import { ResultCard } from "@/components/shared/ResultCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReviewResultProps {
  result: {
    scenario: {
      type: string;
      seller_fault: string;
      buyer_tone: string;
      severity: string;
    };
    public_response: string;
    private_message: string;
    compensation: {
      type: string;
      amount_or_percentage: string;
      reason: string;
    };
    improvement_actions: string[];
    compliance_check: {
      inducement_risk: string;
      policy_violation_risk: string;
      notes: string;
    };
    follow_up_required: string;
  } | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const scenarioLabels: Record<string, string> = {
  quality_issue: "Quality Issue",
  shipping_delay: "Shipping Delay",
  misrepresentation: "Misrepresentation",
  communication: "Communication Issue",
  malicious: "Malicious Review",
  force_majeure: "External Factors",
};

const severityColors: Record<string, "success" | "warning" | "error" | "accent"> = {
  low: "success",
  medium: "warning",
  high: "error",
  critical: "accent",
};

export function ReviewResult({ result, onRegenerate, isRegenerating }: ReviewResultProps) {
  if (!result) return null;

  return (
    <div className="space-y-4">
      {/* Scenario Info */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{scenarioLabels[result.scenario.type] || result.scenario.type}</Badge>
        <Badge variant={severityColors[result.scenario.severity] || "default"}>
          Severity: {result.scenario.severity}
        </Badge>
        <Badge variant={result.scenario.seller_fault === "yes" ? "error" : "secondary"}>
          {result.scenario.seller_fault === "yes" ? "Seller at Fault" : "Not Seller's Fault"}
        </Badge>
      </div>

      {/* Public Response */}
      <ResultCard title="Public Review Response" fullCopyText={result.public_response}>
        <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
          {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
          <p className="whitespace-pre-wrap text-foreground-primary leading-relaxed overflow-wrap-break-word">
            {result.public_response}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          <CopyButton text={result.public_response} size="sm" />
        </div>
      </ResultCard>

      {/* Private Message */}
      {result.private_message && (
        <ResultCard
          title="Private Message (Optional)"
          badge="Send separately"
          badgeVariant="secondary"
          fullCopyText={result.private_message}
        >
          <div className="rounded-xl bg-blue-50 p-4 min-h-[2rem] overflow-y-auto">
            {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
            <p className="whitespace-pre-wrap text-foreground-primary leading-relaxed overflow-wrap-break-word">
              {result.private_message}
            </p>
          </div>
          <div className="mt-3 flex justify-end">
            <CopyButton text={result.private_message} size="sm" />
          </div>
        </ResultCard>
      )}

      {/* Compensation — For Seller Reference Only */}
      {result.compensation.type && result.compensation.type !== "none" && (
        <Card className="border-amber-200 bg-amber-50/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground-primary">💡 Suggested Compensation (For Your Reference Only)</h4>
          </div>
          <p className="mb-2 text-xs text-amber-700 font-medium">
            ⚠️ This is NOT included in the response above. For your private decision only — do not mention these details in your reply to the buyer.
          </p>
          <div className="space-y-1">
            <p className="text-sm text-foreground-secondary">
              <span className="font-medium">Type you might consider:</span> {result.compensation.type.replace("_", " ")}
            </p>
            {result.compensation.amount_or_percentage && (
              <p className="text-sm text-foreground-secondary">
                <span className="font-medium">Suggested range:</span> {result.compensation.amount_or_percentage}
              </p>
            )}
            {result.compensation.reason && (
              <p className="text-xs text-foreground-muted">
                Why: {result.compensation.reason}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Improvement Actions */}
      {result.improvement_actions && result.improvement_actions.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground-primary">🔧 Improvement Actions</h4>
          <ul className="space-y-1">
            {result.improvement_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                <span className="mt-1 text-primary">•</span>
                {action}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Compliance Warning */}
      {(result.compliance_check.inducement_risk === "medium" || result.compliance_check.inducement_risk === "high") && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700">
            <strong>⚠️ Compliance Warning:</strong> {result.compliance_check.notes || "Review inducement risk detected. Do not offer compensation in exchange for review changes."}
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
        <CopyButton text={result.public_response} className="flex-1" label="Copy Response" />
      </div>
    </div>
  );
}
