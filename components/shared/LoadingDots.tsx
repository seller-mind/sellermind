"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  text?: string;
  color?: "primary" | "white" | "secondary";
}

function LoadingDots({ className, text, color = "primary" }: LoadingDotsProps) {
  const colorMap = {
    primary: "bg-primary",
    white: "bg-white",
    secondary: "bg-secondary",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 animate-bounce rounded-full",
              colorMap[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
      {text && (
        <span className="text-sm text-foreground-secondary">{text}</span>
      )}
    </div>
  );
}

export { LoadingDots };
