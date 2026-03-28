import * as React from "react";

import { cn } from "@/lib/utils";

const INPUT_TYPES_SKIP_UIVERSE = new Set([
  "hidden",
  "checkbox",
  "radio",
  "file",
  "range",
  "color",
  "button",
  "submit",
  "reset",
  "image",
]);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const skipUiverse = type != null && INPUT_TYPES_SKIP_UIVERSE.has(type);

    const inputEl = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-colors transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-crestline-gold/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (skipUiverse) return inputEl;

    return <div className="uiverse-input-wrap w-full min-w-0">{inputEl}</div>;
  },
);
Input.displayName = "Input";

export { Input };
