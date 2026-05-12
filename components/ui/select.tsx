"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Context for Radix-style Select ──────────────────────────────────────
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  return ctx;
}

// ─── Native Select Props ─────────────────────────────────────────────────
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, placeholder, id, onValueChange, onChange, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    // Radix UI pattern: when children are provided, render custom dropdown
    if (children) {
      return (
        <RadixSelectWrapper
          value={(props.value as string) || ""}
          onValueChange={onValueChange || (() => {})}
        >
          {children}
        </RadixSelectWrapper>
      );
    }

    // Native select pattern (original behavior)
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
            onChange={
              onValueChange
                ? (e) => onValueChange(e.target.value)
                : onChange
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {(options || []).map((option) => (
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

// ─── Radix-style Select wrapper with state management ────────────────────
function RadixSelectWrapper({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="w-full relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger - button that toggles the dropdown ─────────────────────
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useSelectContext();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border-2 border-border bg-white px-4 py-2 text-base text-foreground-primary transition-all duration-200",
        "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-light",
        "disabled:cursor-not-allowed disabled:opacity-50",
        ctx?.open && "border-primary ring-4 ring-primary-light",
        className
      )}
      onClick={() => ctx?.setOpen((prev) => !prev)}
      {...props}
    >
      {children}
      <svg
        className="h-5 w-5 text-foreground-muted shrink-0"
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
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

// ─── SelectValue - displays the current value or placeholder ──────────────
const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = useSelectContext();
  return (
    <span className={ctx?.value ? "" : "text-foreground-muted"}>
      {ctx?.value || placeholder}
    </span>
  );
};
SelectValue.displayName = "SelectValue";

// ─── SelectContent - dropdown container ───────────────────────────────────
const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useSelectContext();
  if (!ctx?.open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border-2 border-border bg-white p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

// ─── SelectItem - individual option ───────────────────────────────────────
const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, value: itemValue, ...props }, ref) => {
  const ctx = useSelectContext();
  const isSelected = ctx?.value === itemValue;
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-4 py-2 text-sm text-foreground-primary outline-none transition-colors",
        "hover:bg-primary-light hover:text-primary-dark",
        "focus:bg-primary-light focus:text-primary-dark",
        isSelected && "bg-primary-light font-medium",
        className
      )}
      onClick={() => {
        if (itemValue !== undefined) {
          ctx?.onValueChange(itemValue);
        }
        ctx?.setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
