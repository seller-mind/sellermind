"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReplyForm } from "@/components/tools/ReplyForm";
import { ReplyResult } from "@/components/tools/ReplyResult";
import { Toast } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Auto Reply | AI-Powered Customer Service Responses | SellerMind",
  description: "Generate professional, warm customer service responses for any inquiry scenario. AI-powered auto reply tool for Etsy sellers.",
  alternates: {
    canonical: "https://thesellermind.com/tools/reply",
  },
  openGraph: {
    title: "Auto Reply | SellerMind",
    description: "Generate professional, warm customer service responses for any inquiry scenario.",
    url: "https://thesellermind.com/tools/reply",
    type: "website",
  },
};

interface ReplyData {
  scenario: string;
  buyerMessage: string;
  tone: number;
}

export default function ReplyPage() {
  const [result, setResult] = React.useState<ReplyResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [lastData, setLastData] = React.useState<ReplyData | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const generateReply = async (data: ReplyData, isRegenerate = false) => {
    if (isRegenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
      setLastData(data);
    }
    setResult(null);

    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();

      if (!json.success) {
        showToast(json.error?.message || "Failed to generate reply", "error");
        return;
      }

      setResult(json.data);
      showToast("Reply generated successfully!", "success");
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
          💬 Auto Reply
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Generate professional, warm customer service responses for any inquiry.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Inquiry</CardTitle>
            <CardDescription>Select the scenario and enter the buyer's message</CardDescription>
          </CardHeader>
          <CardContent>
            <ReplyForm
              onSubmit={(data) => generateReply(data)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <ReplyResult
              result={result}
              onRegenerate={() => lastData && generateReply(lastData, true)}
              isRegenerating={isRegenerating}
            />
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary">
                  <svg className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-foreground-muted">Your generated reply will appear here</p>
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

interface ReplyResultData {
  reply: string;
  scenario: string;
  tone: string;
  action_required: string;
  policy_notes: string;
}
