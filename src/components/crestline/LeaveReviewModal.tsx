import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Star } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function StarRatingPicker({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (next: number) => void;
  error?: string | null;
}) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">Rating</div>
        <div className="text-xs text-crestline-muted">{value}/5</div>
      </div>

      <div role="radiogroup" aria-label="Select rating" className="flex gap-1.5 flex-wrap">
        {stars.map((n) => {
          const displayFilled = (hoverValue ?? value) >= n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              onMouseEnter={() => setHoverValue(n)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => onChange(n)}
              className={cn(
                "rounded-xl p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-crestline-bg/0 transition-transform duration-200",
                "hover:scale-[1.06]",
              )}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-transform duration-200",
                  displayFilled ? "text-crestline-gold fill-crestline-gold" : "text-slate-300 fill-transparent",
                  "transition-transform hover:scale-[1.12]",
                )}
              />
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function LeaveReviewModal({
  triggerLabel = "Leave a Review",
  triggerClassName,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success">("idle");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    rating?: string;
    message?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSubmitState("idle");
      setErrors({});
      setName("");
      setEmail("");
      setRating(5);
      setMessage("");
    }
  }, [open]);

  const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Please enter your name.";
    if (!email.trim() || !emailOk(email)) nextErrors.email = "Please enter a valid email address.";
    if (rating < 1 || rating > 5) nextErrors.rating = "Rating must be between 1 and 5.";
    if (!message.trim()) nextErrors.message = "Please write a short message.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrors({});

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        rating,
        message: message.trim(),
        status: "pending",
      };

      const { error } = await (supabase as any).from("reviews").insert(payload);
      if (error) throw error;

      setSubmitState("success");
      toast({
        title: "Review submitted",
        description: "Thank you. Your review is awaiting approval.",
      });

      // Keep their inputs intact until they close (premium UX), but clear message slightly to reduce accidental resubmits.
      setMessage("");
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.message ?? "Please try again.",
      });
      setErrors({ form: "We couldn't submit your review. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={cn(
            "bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl h-9 px-5 font-semibold transition-colors duration-200",
            triggerClassName,
          )}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-crestline-bg border border-slate-200 text-slate-900 p-6 max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-2xl">Leave a Review</DialogTitle>
          <DialogDescription className="text-crestline-muted">
            Your feedback helps future clients trust our process. Reviews are approved by our team before they appear publicly.
          </DialogDescription>
        </DialogHeader>

        {submitState === "success" ? (
          <div className="mt-4 border border-slate-200 bg-crestline-surface p-5">
            <div className="text-crestline-gold font-semibold mb-2">Submitted</div>
            <p className="text-sm text-crestline-muted leading-relaxed">
              Thank you. Your review is currently <span className="text-slate-800 font-semibold">pending</span> approval.
              We’ll publish it once it’s reviewed by the admin team.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl">
                  Done
                </Button>
              </DialogClose>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-crestline-muted">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
                {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-crestline-muted">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                />
                {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
              </div>
            </div>

            <StarRatingPicker value={rating} onChange={setRating} error={errors.rating} />

            <div className="space-y-2">
              <label className="text-sm text-crestline-muted">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your experience with RealEstate..."
                className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl resize-none min-h-[130px]"
              />
              {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
            </div>

            {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl disabled:opacity-60 disabled:hover:bg-crestline-gold"
              >
                {submitting ? <LoadingSpinner size={18} /> : "Submit Review"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

