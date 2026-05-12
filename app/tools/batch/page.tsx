"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BatchForm } from "@/components/tools/BatchForm";
import { BatchResult } from "@/components/tools/BatchResult";
import { Toast } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Batch Optimizer | Analyze and Optimize Multiple Listings | SellerMind",
  description: "Analyze and optimize multiple listings at once with AI-powered suggestions. Batch optimizer for Etsy sellers.",
  alternates: {
    canonical: "https://thesellermind.com/tools/batch",
  },
  openGraph: {
    title: "Batch Optimizer | SellerMind",
    description: "Analyze and optimize multiple listings at once with AI-powered suggestions.",
    url: "https://thesellermind.com/tools/batch",
    type: "website",
  },
};

interface BatchData {
  listingsText: string;
}

export default function BatchPage() {
  const [result, setResult] = React.useState<BatchResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [lastData, setLastData] = React.useState<BatchData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const optimizeListings = async (data: BatchData, isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setLastData(data);
    }
    setResult(null);

    try {
      const response = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();

      if (!json.success) {
        showToast(json.error?.message || "Failed to optimize listings", "error");
        return;
      }

      setResult(json.data);
      showToast(`Optimized ${json.data.listings?.length || 0} listings!`, "success");
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
          🚀 Batch Optimizer
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Analyze and optimize multiple listings at once with AI-powered suggestions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Paste multiple listings for bulk optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <BatchForm
              onSubmit={(data) => optimizeListings(data)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <BatchResult
              result={result}
              onRegenerate={() => lastData && optimizeListings(lastData, true)}
              isRegenerating={isRegenerating}
            />
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary">
                  <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-foreground-muted">Optimized listings will appear here</p>
                <p className="mt-1 text-xs text-foreground-muted">Shows before/after comparison for each listing</p>
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

interface BatchResultData {
  listings: Array<{
    original: { title: string; tags: string; description: string };
    diagnosis: { title_issues: string[]; tag_issues: string[]; description_issues: string[] };
    optimized: { title: string; tags: string[]; description: string };
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
  }>;
}
