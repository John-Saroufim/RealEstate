import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { toast } from "sonner";
import { isAdminAccount, isEmailVerified } from "@/lib/authEmail";

export default function VerifyEmail() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      if (isEmailVerified(user)) {
        if (await isAdminAccount(user)) {
          navigate("/crestline/admin/listings", { replace: true });
        } else {
          navigate("/crestline", { replace: true });
        }
        return;
      }
      if (!(await isAdminAccount(user))) {
        navigate("/crestline", { replace: true });
      }
    })();
  }, [authLoading, user, navigate]);

  const handleResend = async () => {
    if (!user?.email || resendCooldown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success("Confirmation email sent. Check your inbox.");
      setResendCooldown(30);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not resend email.");
    } finally {
      setResending(false);
    }
  };

  if (authLoading || !user) {
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
              <Mail className="h-7 w-7 text-crestline-gold" />
            </div>
            <h1 className="font-serif text-3xl font-bold">Confirm your email</h1>
            <p className="text-crestline-muted text-sm mt-2">
              Admin access requires a verified email. We sent a link to <span className="font-medium text-slate-800">{user.email}</span>.
              Open it on this device, then return here and refresh.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] space-y-4">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-crestline-gold/40 to-transparent" />
            <Button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending || resendCooldown > 0}
              className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl font-semibold"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {resendCooldown > 0 ? `Resend confirmation email (${resendCooldown}s)` : "Resend confirmation email"}
            </Button>
            <p className="text-center text-xs text-crestline-muted">
              After confirming,{" "}
              <button
                type="button"
                className="text-crestline-gold font-medium hover:underline"
                onClick={() => window.location.reload()}
              >
                refresh this page
              </button>{" "}
              or sign in again.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/crestline" className="text-center text-sm text-crestline-gold hover:underline">
                Back to site
              </Link>
              <Link to="/logout" className="text-center text-sm text-crestline-muted hover:text-slate-900">
                Sign out
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <CrestlineFooter />
    </div>
  );
}
