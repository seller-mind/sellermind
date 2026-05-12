"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "error" | "accent";
  actions?: React.ReactNode;
  fullCopyText?: string;
  isLoading?: boolean;
}

function ResultCard({
  title,
  children,
  className,
  badge,
  badgeVariant = "default",
  actions,
  fullCopyText,
  isLoading,
}: ResultCardProps) {
  return (
    <Card className={cn("animate-in fade-in-0 slide-in-from-top-2 duration-300", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground-primary">{title}</h3>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {fullCopyText && <CopyButton text={fullCopyText} size="sm" />}
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 animate-bounce rounded-full bg-primary"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-foreground-muted">Generating...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-wrap-break-word min-h-[2rem]">
          {children}
        </div>
      )}
      {/* AI Output Disclaimer */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-foreground-muted italic">
          ⚠️ AI-generated content is for reference only. Please review and edit before publishing.
        </p>
      </div>
    </Card>
  );
}

export { ResultCard };
