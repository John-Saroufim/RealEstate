import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewStars({
  rating,
  sizeClassName = "h-4 w-4",
  className,
}: {
  rating: number;
  sizeClassName?: string;
  className?: string;
}) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <div className={cn("group flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= safeRating;
        return (
          <Star
            key={n}
            className={cn(
              sizeClassName,
              "transition-transform duration-200",
              filled
                ? "text-crestline-gold fill-crestline-gold group-hover:scale-105"
                : "text-slate-300 fill-transparent group-hover:scale-105",
            )}
          />
        );
      })}
    </div>
  );
}

