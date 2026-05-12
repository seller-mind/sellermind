"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HolidayForm } from "@/components/tools/HolidayForm";
import { HolidayResult } from "@/components/tools/HolidayResult";
import { Toast } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Holiday Marketing | Create Seasonal Marketing Copy | SellerMind",
  description: "Create compelling marketing copy for Christmas, Valentine's, Black Friday and more. AI-powered holiday marketing tool for Etsy sellers.",
  alternates: {
    canonical: "https://thesellermind.com/tools/holiday",
  },
  openGraph: {
    title: "Holiday Marketing | SellerMind",
    description: "Create compelling marketing copy for Christmas, Valentine's, Black Friday and more.",
    url: "https://thesellermind.com/tools/holiday",
    type: "website",
  },
};

interface HolidayData {
  holiday: string;
  shopInfo: string;
  promotionType: string;
  targetAudience: string;
}

export default function HolidayPage() {
  const [result, setResult] = React.useState<HolidayResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [lastData, setLastData] = React.useState<HolidayData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const generateCopy = async (data: HolidayData, isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setLastData(data);
    }
    setResult(null);

    try {
      const response = await fetch("/api/holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();

      if (!json.success) {
        showToast(json.error?.message || "Failed to generate marketing copy", "error");
        return;
      }

      setResult(json.data);
      showToast("Marketing copy generated successfully!", "success");
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
          🎉 Holiday Marketing
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Create compelling marketing copy for any holiday or promotion.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Enter your holiday campaign information</CardDescription>
          </CardHeader>
          <CardContent>
            <HolidayForm
              onSubmit={(data) => generateCopy(data)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <HolidayResult
              result={result}
              onRegenerate={() => lastData && generateCopy(lastData, true)}
              isRegenerating={isRegenerating}
            />
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary">
                  <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="text-foreground-muted">Your marketing copy will appear here</p>
                <p className="mt-1 text-xs text-foreground-muted">Supports Shop, Instagram, Pinterest & Email</p>
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

interface HolidayResultData {
  shop_announcement: string;
  instagram_post: { text: string; hashtags: string };
  pinterest_pin: { title: string; description: string };
  email_template: { subject: string; preview_text: string; body: string };
}
