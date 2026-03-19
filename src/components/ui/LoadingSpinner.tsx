import { cn } from "@/lib/utils";

export function LoadingSpinner({
  label,
  size = 20,
}: {
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className={cn(
          "h-5 w-5 animate-spin rounded-full border-2 border-crestline-gold/30 border-t-crestline-gold"
        )}
        style={{ width: size, height: size }}
      />
      {label ? <div className="text-sm text-crestline-muted">{label}</div> : null}
    </div>
  );
}

