"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
  onSubmit: (data: { scenario: string; buyerMessage: string; tone: number }) => void;
  isLoading: boolean;
}

const SCENARIOS = [
  {
    value: "order_inquiry",
    label: "Order Inquiry",
    description: "Questions about order status, details, or modifications",
    icon: "📦",
  },
  {
    value: "custom_request",
    label: "Custom Request",
    description: "Requests for personalized or custom items",
    icon: "🎨",
  },
  {
    value: "shipping",
    label: "Shipping",
    description: "Questions about shipping, tracking, or delivery",
    icon: "🚚",
  },
  {
    value: "damaged_item",
    label: "Damaged Item",
    description: "Reports of items arriving damaged or defective",
    icon: "📦",
  },
  {
    value: "refund",
    label: "Refund Request",
    description: "Requests for returns, refunds, or cancellations",
    icon: "💰",
  },
  {
    value: "general",
    label: "General",
    description: "Other questions or general inquiries",
    icon: "💬",
  },
];

export function ReplyForm({ onSubmit, isLoading }: ReplyFormProps) {
  const [scenario, setScenario] = React.useState("order_inquiry");
  const [buyerMessage, setBuyerMessage] = React.useState("");
  const [tone, setTone] = React.useState(3);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!buyerMessage.trim()) {
      newErrors.buyerMessage = "Please enter the buyer's message";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ scenario, buyerMessage: buyerMessage.trim(), tone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Scenario Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">
          Scenario Type
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScenario(s.value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-200",
                scenario === s.value
                  ? "border-primary bg-primary-light"
                  : "border-border bg-white hover:border-primary/50"
              )}
            >
              <span className="text-lg">{s.icon}</span>
              <span className={cn(
                "text-xs font-semibold",
                scenario === s.value ? "text-primary" : "text-foreground-primary"
              )}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Buyer Message */}
      <Textarea
        label="Buyer's Message"
        placeholder="Paste the buyer's message here..."
        value={buyerMessage}
        onChange={(e) => setBuyerMessage(e.target.value)}
        className="min-h-[140px]"
        required
        error={errors.buyerMessage}
      />

      {/* Tone Slider */}
      <Slider
        label="Response Tone"
        value={tone}
        onChange={setTone}
        min={1}
        max={5}
        step={1}
        leftLabel="Formal"
        rightLabel="Friendly"
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Generate Reply
      </Button>
    </form>
  );
}
