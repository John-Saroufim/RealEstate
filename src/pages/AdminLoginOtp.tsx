import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import {
  PENDING_ADMIN_OTP_EMAIL_KEY,
  sendAdminLoginOtp,
  verifyAdminLoginOtp,
} from "@/lib/adminLoginOtp";

export default function AdminLoginOtp() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const initialCooldownApplied = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate("/crestline/admin/listings", { replace: true });
      return;
    }
    const pending = sessionStorage.getItem(PENDING_ADMIN_OTP_EMAIL_KEY);
    if (!pending) {
      navigate("/login", { replace: true });
      return;
    }
    setEmail(pending);
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (!email || initialCooldownApplied.current) return;
    initialCooldownApplied.current = true;
    setResendCooldown(30);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.replace(/\s/g, "");
    if (!trimmed || !email) {
      toast.error("Enter the code from your email.");
      return;
    }
    setSubmitting(true);
    const { error } = await verifyAdminLoginOtp(email, trimmed);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    sessionStorage.removeItem(PENDING_ADMIN_OTP_EMAIL_KEY);
    navigate("/crestline/admin/listings", { replace: true });
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    const { error } = await sendAdminLoginOtp(email);
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Email sent again.");
    setResendCooldown(30);
  };

  if (authLoading || !email) {
    return (
      <div className="min-h-screen bg-crestline-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-crestline-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />
      <div className="pt-28 pb-16 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-crestline-gold/30 bg-white shadow-sm">
              <Shield className="h-7 w-7 text-crestline-gold" />
            </div>
            <h1 className="font-serif text-3xl font-bold">Admin sign-in</h1>
            <p className="text-crestline-muted text-sm mt-2">
              We sent a sign-in link and one-time code to <span className="font-medium text-slate-800">{email}</span>.
              Enter the code below, or use the link in the email.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] space-y-4"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-crestline-gold/40 to-transparent" />
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-crestline-muted">
                One-time code
              </Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 12))}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl shadow-sm focus-visible:ring-crestline-gold/45 text-center text-lg tracking-widest font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Continue to admin
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={resending || resendCooldown > 0}
              onClick={() => void handleResend()}
              className="w-full rounded-xl border-slate-200"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
            </Button>
          </form>

          <p className="text-center text-sm text-crestline-muted mt-6">
            <Link to="/login" className="text-crestline-gold hover:underline font-medium">
              Back to password login
            </Link>
          </p>
        </motion.div>
      </div>
      <CrestlineFooter />
    </div>
  );
}
