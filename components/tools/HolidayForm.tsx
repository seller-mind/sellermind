"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { HOLIDAYS, PROMOTION_TYPES } from "@/lib/constants/holidays";
import { cn } from "@/lib/utils";

interface HolidayFormProps {
  onSubmit: (data: {
    holiday: string;
    shopInfo: string;
    promotionType: string;
    targetAudience: string;
  }) => void;
  isLoading: boolean;
}

export function HolidayForm({ onSubmit, isLoading }: HolidayFormProps) {
  const [holiday, setHoliday] = React.useState("christmas");
  const [shopInfo, setShopInfo] = React.useState("");
  const [promotionType, setPromotionType] = React.useState("percentage_off");
  const [targetAudience, setTargetAudience] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!shopInfo.trim()) {
      newErrors.shopInfo = "Shop or product information is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      holiday,
      shopInfo: shopInfo.trim(),
      promotionType,
      targetAudience: targetAudience.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Holiday Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">
          Select Holiday <span className="ml-1 text-primary">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {HOLIDAYS.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => setHoliday(h.value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-200",
                holiday === h.value
                  ? "border-primary bg-primary-light"
                  : "border-border bg-white hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{h.emoji}</span>
              <span className={cn(
                "text-xs font-semibold",
                holiday === h.value ? "text-primary" : "text-foreground-primary"
              )}>
                {h.label}
              </span>
              <span className="text-[10px] text-foreground-muted">{h.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shop Info */}
      <Textarea
        label="Shop / Product Information"
        placeholder="Describe your shop and products (e.g., Handmade jewelry shop specializing in personalized necklaces and earrings)"
        value={shopInfo}
        onChange={(e) => setShopInfo(e.target.value)}
        className="min-h-[100px]"
        required
        error={errors.shopInfo}
        hint="Include your shop name, what you sell, and your brand style"
      />

      {/* Promotion Type */}
      <Select
        label="Promotion Type"
        options={PROMOTION_TYPES.map((p) => ({ value: p.value, label: `${p.icon} ${p.label}` }))}
        value={promotionType}
        onChange={(e) => setPromotionType(e.target.value)}
      />

      {/* Target Audience */}
      <Input
        label="Target Audience"
        placeholder="e.g., Gift shoppers, new moms, pet owners"
        value={targetAudience}
        onChange={(e) => setTargetAudience(e.target.value)}
        hint="Who are you trying to reach with this campaign?"
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        Generate Marketing Copy
      </Button>
    </form>
  );
}
