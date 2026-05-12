"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReviewForm } from "@/components/tools/ReviewForm";
import { ReviewResult } from "@/components/tools/ReviewResult";
import { Toast } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Review Handler | Transform Negative Reviews into Opportunities | SellerMind",
  description: "Transform negative reviews into opportunities with expert response strategies. AI-powered review handler for Etsy sellers.",
  alternates: {
    canonical: "https://thesellermind.com/tools/review",
  },
  openGraph: {
    title: "Review Handler | SellerMind",
    description: "Transform negative reviews into opportunities with expert response strategies.",
    url: "https://thesellermind.com/tools/review",
    type: "website",
  },
};

interface ReviewData {
  reviewContent: string;
  isSellerFault: string;
  tonePreference: string;
}

export default function ReviewPage() {
  const [result, setResult] = React.useState<ReviewResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [lastData, setLastData] = React.useState<ReviewData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const generateResponse = async (data: ReviewData, isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setLastData(data);
    }
    setResult(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();

      if (!json.success) {
        showToast(json.error?.message || "Failed to generate response", "error");
        return;
      }

      setResult(json.data);
      showToast("Review response generated!", "success");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          ⭐ Review Handler
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Transform negative reviews into opportunities with expert response strategies.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>Paste the negative review and describe the situation</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm
              onSubmit={(data) => generateResponse(data)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <ReviewResult
              result={result}
              onRegenerate={() => lastData && generateResponse(lastData, true)}
              isRegenerating={isRegenerating}
            />
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary">
                  <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-foreground-muted">Your review response will appear here</p>
                <p className="mt-1 text-xs text-foreground-muted">Includes public reply, private message & compensation advice</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}

interface ReviewResultData {
  scenario: { type: string; seller_fault: string; buyer_tone: string; severity: string };
  public_response: string;
  private_message: string;
  compensation: { type: string; amount_or_percentage: string; reason: string };
  improvement_actions: string[];
  compliance_check: { inducement_risk: string; policy_violation_risk: string; notes: string };
  follow_up_required: string;
}
