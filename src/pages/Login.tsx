import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  /** Prevents useEffect redirect from replacing handleSubmit navigation and stripping `reSplash` (splash stuck). */
  const skipAuthRedirectRef = useRef(false);

  const adminEmailsRaw = (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
  const adminEmails = String(adminEmailsRaw)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (skipAuthRedirectRef.current) {
      skipAuthRedirectRef.current = false;
      return;
    }

    if (adminEmails.length > 0) {
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        navigate("/crestline/admin/listings", { replace: true });
      } else {
        navigate("/crestline", { replace: true });
      }
    } else {
      navigate("/crestline/admin/listings", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    skipAuthRedirectRef.current = true;
    if (adminEmails.length > 0) {
      if (adminEmails.includes(email.toLowerCase())) {
        navigate("/crestline/admin/listings", { state: { reSplash: true } });
      } else {
        navigate("/crestline", { state: { reSplash: true } });
      }
    } else {
      navigate("/crestline/admin/listings", { state: { reSplash: true } });
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />
      <div className="pt-28 pb-16 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold">Login</h1>
            <p className="text-crestline-muted text-sm mt-2">
              Welcome back. Sign in to view saved homes, track inquiries, and continue your property search.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] space-y-4"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-crestline-gold/40 to-transparent" />
            <div className="space-y-2">
              <Label htmlFor="email" className="text-crestline-muted">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-crestline-muted">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs text-crestline-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-crestline-muted pr-10 rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-crestline-muted hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-crestline-muted mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-crestline-gold hover:underline font-medium">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      <CrestlineFooter />
    </div>
  );
}
