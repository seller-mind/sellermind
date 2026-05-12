"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListingForm } from "@/components/tools/ListingForm";
import { ListingResult } from "@/components/tools/ListingResult";
import { Toast } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Listing Generator | Create SEO-Optimized Etsy Listings | SellerMind",
  description: "Create SEO-optimized titles, descriptions, and tags for your Etsy products in seconds. AI-powered listing generator for Etsy sellers.",
  alternates: {
    canonical: "https://thesellermind.com/tools/listing",
  },
  openGraph: {
    title: "Listing Generator | SellerMind",
    description: "Create SEO-optimized titles, descriptions, and tags for your Etsy products in seconds.",
    url: "https://thesellermind.com/tools/listing",
    type: "website",
  },
};

interface ListingData {
  productName: string;
  sellingPoints: string[];
  category: string;
  tone: string;
}

export default function ListingPage() {
  const [result, setResult] = React.useState<ListingResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [lastData, setLastData] = React.useState<ListingData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const generateListing = async (data: ListingData, isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setLastData(data);
    }
    setResult(null);

    try {
      const response = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!json.success) {
        showToast(json.error?.message || "Failed to generate listing", "error");
        return;
      }

      setResult(json.data);
      showToast("Listing generated successfully!", "success");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleSubmit = (data: ListingData) => generateListing(data);
  const handleRegenerate = () => {
    if (lastData) generateListing(lastData, true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          ✨ Listing Generator
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Create SEO-optimized titles, descriptions, and tags for your Etsy products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter your product details to generate optimized content</CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm onSubmit={handleSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <ListingResult
              result={result}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary">
                  <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-foreground-muted">Your generated listing will appear here</p>
                <p className="mt-1 text-xs text-foreground-muted">Fill in the form and click Generate</p>
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

interface ListingResultData {
  title: string;
  description: string;
  tags: string[];
  seo_score: number;
  seo_notes?: {
    primary_keyword: string;
    title_strategy: string;
    character_count_title: number;
    character_count_tags: number[];
    tag_coverage_analysis: string;
    seo_warnings: string;
  };
}
