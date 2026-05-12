"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  className?: string;
}

function Slider({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  label,
  leftLabel,
  rightLabel,
  showValue = true,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground-primary">
            {label}
          </label>
          {showValue && (
            <span className="text-sm font-semibold text-primary">
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <div className="flex items-center gap-3">
          {leftLabel && (
            <span className="whitespace-nowrap text-xs text-foreground-muted">
              {leftLabel}
            </span>
          )}
          <div className="relative flex-1">
            <div className="h-2 w-full rounded-full bg-background-secondary" />
            <div
              className="absolute top-0 left-0 h-2 rounded-full bg-primary transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-md transition-all duration-150"
              style={{ left: `calc(${percentage}% - 8px)` }}
            />
          </div>
          {rightLabel && (
            <span className="whitespace-nowrap text-xs text-foreground-muted">
              {rightLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { Slider };
