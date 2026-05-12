"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResultCard } from "@/components/shared/ResultCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";

interface HolidayResultProps {
  result: {
    shop_announcement: string;
    instagram_post: {
      text: string;
      hashtags: string;
    };
    pinterest_pin: {
      title: string;
      description: string;
    };
    email_template: {
      subject: string;
      preview_text: string;
      body: string;
    };
  } | null;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function HolidayResult({ result, onRegenerate, isRegenerating }: HolidayResultProps) {
  const [activeTab, setActiveTab] = React.useState("shop");

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto sm:flex-nowrap">
          <TabsTrigger value="shop" className="flex-1 text-xs sm:text-sm">
            🏪 Shop
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex-1 text-xs sm:text-sm">
            📸 Instagram
          </TabsTrigger>
          <TabsTrigger value="pinterest" className="flex-1 text-xs sm:text-sm">
            📌 Pinterest
          </TabsTrigger>
          <TabsTrigger value="email" className="flex-1 text-xs sm:text-sm">
            📧 Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <ResultCard
            title="Shop Announcement"
            fullCopyText={result.shop_announcement}
          >
            <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
              {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
              <p className="whitespace-pre-wrap text-foreground-primary leading-relaxed overflow-wrap-break-word">
                {result.shop_announcement}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <CopyButton text={result.shop_announcement} size="sm" />
            </div>
          </ResultCard>
        </TabsContent>

        <TabsContent value="instagram">
          <ResultCard
            title="Instagram Post"
            fullCopyText={`${result.instagram_post.text}\n\n${result.instagram_post.hashtags}`}
          >
            <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
              {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
              <p className="whitespace-pre-wrap text-foreground-primary leading-relaxed overflow-wrap-break-word">
                {result.instagram_post.text}
              </p>
              <p className="mt-3 text-xs text-foreground-muted overflow-wrap-break-word">
                {result.instagram_post.hashtags}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <CopyButton
                text={`${result.instagram_post.text}\n\n${result.instagram_post.hashtags}`}
                size="sm"
              />
            </div>
          </ResultCard>
        </TabsContent>

        <TabsContent value="pinterest">
          <ResultCard
            title="Pinterest Pin"
            badge="SEO-optimized"
            badgeVariant="secondary"
            fullCopyText={`${result.pinterest_pin.title}\n\n${result.pinterest_pin.description}`}
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-700">Pin Title</p>
                <p className="mt-1 text-sm text-foreground-primary overflow-wrap-break-word">
                  {result.pinterest_pin.title}
                </p>
              </div>
              <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
                {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
                <p className="text-xs font-medium text-foreground-muted mb-2">Pin Description</p>
                <p className="text-sm text-foreground-primary leading-relaxed overflow-wrap-break-word">
                  {result.pinterest_pin.description}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <CopyButton
                text={`${result.pinterest_pin.title}\n\n${result.pinterest_pin.description}`}
                size="sm"
              />
            </div>
          </ResultCard>
        </TabsContent>

        <TabsContent value="email">
          <ResultCard
            title="Email Template"
            badge="Includes subject + preview"
            badgeVariant="secondary"
            fullCopyText={`Subject: ${result.email_template.subject}\nPreview: ${result.email_template.preview_text}\n\n${result.email_template.body}`}
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-600">Subject Line</p>
                <p className="mt-1 text-sm font-medium text-foreground-primary overflow-wrap-break-word">
                  {result.email_template.subject}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-600">Preview Text</p>
                <p className="mt-1 text-sm text-foreground-primary overflow-wrap-break-word">
                  {result.email_template.preview_text}
                </p>
              </div>
              <div className="rounded-xl bg-background-secondary p-4 min-h-[2rem] overflow-y-auto">
                {/* BUG 4 FIX: Added min-height and overflow-y for text display */}
                <p className="text-xs font-medium text-foreground-muted mb-2">Email Body</p>
                <p className="whitespace-pre-wrap text-sm text-foreground-primary leading-relaxed overflow-wrap-break-word">
                  {result.email_template.body}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <CopyButton
                text={`Subject: ${result.email_template.subject}\nPreview: ${result.email_template.preview_text}\n\n${result.email_template.body}`}
                size="sm"
              />
            </div>
          </ResultCard>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button onClick={onRegenerate} variant="secondary" className="flex-1" isLoading={isRegenerating}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </Button>
      </div>
    </div>
  );
}
