"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-foreground-muted border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-foreground-muted border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-foreground-muted border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-foreground-muted border-y-transparent border-l-transparent",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-lg bg-foreground-primary px-3 py-1.5 text-xs text-white shadow-lg",
            positionClasses[side],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute border-4",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  );
}

export { Tooltip };
