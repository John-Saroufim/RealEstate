import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Eye, EyeOff, Loader2, Shield } from "lucide-react";
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

  const adminEmailsRaw = (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
  const adminEmails = String(adminEmailsRaw)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    // If admin emails are configured, route immediately.
    // Otherwise, route guards decide whether user can access admin pages.
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
    } else {
      // After signing in, route based on admin email.
      // If admin emails aren't configured, route guards will redirect non-admins automatically.
      if (adminEmails.length > 0) {
        if (adminEmails.includes(email.toLowerCase())) {
          navigate("/crestline/admin/listings");
        } else {
          navigate("/crestline");
        }
      } else {
        navigate("/crestline/admin/listings");
      }
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />
      <div className="pt-28 pb-16 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/crestline" className="inline-flex items-center gap-2 mb-6 justify-center">
              <Shield className="h-8 w-8 text-crestline-gold" />
              <span className="font-serif text-2xl font-bold">
                RealEstate
              </span>
            </Link>
            <h1 className="font-serif text-3xl font-bold">Login</h1>
            <p className="text-crestline-muted text-sm mt-2">
              Sign in to add and edit listings. Non-admins will return to the public site.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-crestline-surface border border-slate-200 p-6 space-y-4">
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
                className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-none"
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
                  className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted pr-10 rounded-none"
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
              className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-none font-semibold"
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
