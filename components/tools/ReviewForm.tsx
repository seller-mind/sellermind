"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  onSubmit: (data: { reviewContent: string; isSellerFault: string; tonePreference: string }) => void;
  isLoading: boolean;
}

export function ReviewForm({ onSubmit, isLoading }: ReviewFormProps) {
  const [reviewContent, setReviewContent] = React.useState("");
  const [isSellerFault, setIsSellerFault] = React.useState("no");
  const [tonePreference, setTonePreference] = React.useState("solution");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!reviewContent.trim()) {
      newErrors.reviewContent = "Please paste the review content";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      reviewContent: reviewContent.trim(),
      isSellerFault,
      tonePreference,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Review Content */}
      <Textarea
        label="Negative Review Content"
        placeholder="Paste the negative review here..."
        value={reviewContent}
        onChange={(e) => setReviewContent(e.target.value)}
        className="min-h-[160px]"
        required
        error={errors.reviewContent}
        hint="Copy and paste the full review text from the buyer"
      />

      {/* Seller Fault Toggle */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">
          Is this your fault?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsSellerFault("yes")}
            className={cn(
              "flex-1 rounded-xl border-2 p-4 text-center transition-all duration-200",
              isSellerFault === "yes"
                ? "border-red-400 bg-red-50"
                : "border-border bg-white hover:border-red-200"
            )}
          >
            <span className={cn(
              "block text-2xl mb-1",
            )}>😔</span>
            <span className={cn(
              "text-sm font-semibold",
              isSellerFault === "yes" ? "text-red-600" : "text-foreground-primary"
            )}>
              Yes, it's my fault
            </span>
            <span className="mt-1 block text-xs text-foreground-muted">
              Quality issue, wrong item, etc.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsSellerFault("no")}
            className={cn(
              "flex-1 rounded-xl border-2 p-4 text-center transition-all duration-200",
              isSellerFault === "no"
                ? "border-secondary bg-secondary-light"
                : "border-border bg-white hover:border-secondary/50"
            )}
          >
            <span className="block text-2xl mb-1">🤷</span>
            <span className={cn(
              "text-sm font-semibold",
              isSellerFault === "no" ? "text-secondary" : "text-foreground-primary"
            )}>
              No, not my fault
            </span>
            <span className="mt-1 block text-xs text-foreground-muted">
              Shipping delay, buyer misunderstanding
            </span>
          </button>
        </div>
      </div>

      {/* Tone Preference */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">
          Response Focus
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTonePreference("apologetic")}
            className={cn(
              "flex-1 rounded-xl border-2 p-4 text-center transition-all duration-200",
              tonePreference === "apologetic"
                ? "border-primary bg-primary-light"
                : "border-border bg-white hover:border-primary/50"
            )}
          >
            <span className="block text-2xl mb-1">🙏</span>
            <span className={cn(
              "text-sm font-semibold",
              tonePreference === "apologetic" ? "text-primary" : "text-foreground-primary"
            )}>
              Apologize First
            </span>
            <span className="mt-1 block text-xs text-foreground-muted">
              Sincere apology with solution
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTonePreference("solution")}
            className={cn(
              "flex-1 rounded-xl border-2 p-4 text-center transition-all duration-200",
              tonePreference === "solution"
                ? "border-primary bg-primary-light"
                : "border-border bg-white hover:border-primary/50"
            )}
          >
            <span className="block text-2xl mb-1">💡</span>
            <span className={cn(
              "text-sm font-semibold",
              tonePreference === "solution" ? "text-primary" : "text-foreground-primary"
            )}>
              Solution First
            </span>
            <span className="mt-1 block text-xs text-foreground-muted">
              Focus on fixing the problem
            </span>
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Generate Review Response
      </Button>
    </form>
  );
}
