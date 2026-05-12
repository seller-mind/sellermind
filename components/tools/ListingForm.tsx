"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

interface ListingFormProps {
  onSubmit: (data: {
    productName: string;
    sellingPoints: string[];
    category: string;
    tone: string;
  }) => void;
  isLoading: boolean;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "playful", label: "Playful" },
  { value: "elegant", label: "Elegant" },
];

export function ListingForm({ onSubmit, isLoading }: ListingFormProps) {
  const [productName, setProductName] = React.useState("");
  const [sellingPoints, setSellingPoints] = React.useState(["", "", ""]);
  const [category, setCategory] = React.useState("");
  const [tone, setTone] = React.useState("professional");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!sellingPoints[0].trim() || !sellingPoints[1].trim() || !sellingPoints[2].trim()) {
      newErrors.sellingPoints = "All 3 selling points are required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      productName: productName.trim(),
      sellingPoints: sellingPoints.map((s) => s.trim()),
      category,
      tone,
    });
  };

  const updateSellingPoint = (index: number, value: string) => {
    const updated = [...sellingPoints];
    updated[index] = value;
    setSellingPoints(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Product Name"
        placeholder="e.g., Handmade Ceramic Mug"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        required
        error={errors.productName}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">
          Selling Points <span className="ml-1 text-primary">*</span>
        </label>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              placeholder={`Selling point ${i + 1} (e.g., Made from organic materials)`}
              value={sellingPoints[i]}
              onChange={(e) => updateSellingPoint(i, e.target.value)}
            />
          ))}
        </div>
        {errors.sellingPoints && (
          <p className="text-xs text-red-500">{errors.sellingPoints}</p>
        )}
      </div>

      <Select
        label="Category"
        placeholder="Select a category (optional)"
        options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        hint="Helps generate more targeted keywords"
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground-primary">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTone(option.value)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                tone === option.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-background-secondary text-foreground-secondary hover:bg-primary-light hover:text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate Listing
      </Button>
    </form>
  );
}
