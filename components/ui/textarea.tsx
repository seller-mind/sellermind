import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-foreground-primary"
          >
            {label}
            {props.required && <span className="ml-1 text-primary">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base text-foreground-primary transition-all duration-200",
            "placeholder:text-foreground-muted",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-light",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-foreground-muted">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
