"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BatchFormProps {
  onSubmit: (data: { listingsText: string }) => void;
  isLoading: boolean;
}

export function BatchForm({ onSubmit, isLoading }: BatchFormProps) {
  const [listingsText, setListingsText] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!listingsText.trim()) {
      setErrors({ listingsText: "Please paste your listings" });
      return;
    }

    if (listingsText.trim().length < 20) {
      setErrors({ listingsText: "Please provide more listing content" });
      return;
    }

    setErrors({});
    onSubmit({ listingsText: listingsText.trim() });
  };

  const handleSample = () => {
    setListingsText(`Listing 1:
Title: Handmade Soap
Tags: soap, handmade, lavender, natural, gift, bath, skin care, organic, gift for her
Description: Lavender soap made with natural ingredients. Good for sensitive skin. Smells great. Makes a nice gift.

Listing 2:
Title: Ceramic Mug
Tags: mug, ceramic, coffee, handmade, kitchen, gift
Description: Beautiful ceramic mug for coffee or tea. Handmade with care. Great gift idea.`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Textarea
        label="Paste Your Listings"
        placeholder={`Paste your listings here. Each listing should include:\n- Title\n- Tags\n- Description\n\nExample:\nListing 1:\nTitle: Handmade Soap\nTags: soap, handmade, lavender\nDescription: Lavender soap made with natural ingredients...\n\nListing 2:\nTitle: Ceramic Mug\nTags: mug, ceramic, coffee\nDescription: Beautiful ceramic mug...`}
        value={listingsText}
        onChange={(e) => setListingsText(e.target.value)}
        className="min-h-[250px] font-mono text-xs"
        required
        error={errors.listingsText}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSample}
          className="text-xs"
        >
          <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Load Sample
        </Button>
        <span className="flex items-center text-xs text-foreground-muted">
          Supports pasting multiple listings
        </span>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Analyze & Optimize Listings
      </Button>
    </form>
  );
}
