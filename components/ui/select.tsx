import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-foreground-primary"
          >
            {label}
            {props.required && <span className="ml-1 text-primary">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border-2 border-border bg-white px-4 py-2 pr-10 text-base text-foreground-primary transition-all duration-200",
              "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-light",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-400 focus:border-red-500 focus:ring-red-100",
              !props.value && "text-foreground-muted",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-5 w-5 text-foreground-muted"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
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
Select.displayName = "Select";

// Shadcn-style Select sub-components for compatibility with SEO pages
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-xl border-2 border-border bg-white px-4 py-2 text-base text-foreground-primary transition-all duration-200",
      "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-light",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <svg className="h-5 w-5 text-foreground-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className={placeholder ? "text-foreground-muted" : ""}>{placeholder}</span>
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 mt-1 max-h-60 overflow-auto rounded-xl border-2 border-border bg-white p-1 shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg px-4 py-2 text-sm text-foreground-primary outline-none transition-colors",
      "hover:bg-primary-light hover:text-primary-dark",
      "focus:bg-primary-light focus:text-primary-dark",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
