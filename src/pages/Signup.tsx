import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/crestline" className="inline-flex items-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-crestline-gold" />
            <span className="font-serif text-2xl font-bold">
              RealEstate
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold">Create account</h1>
          <p className="text-crestline-muted text-sm mt-1">You can add listings after you’re set up.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-crestline-surface border border-slate-200 p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-crestline-muted">Full Name</Label>
            <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-crestline-muted">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-crestline-muted">Password</Label>
            <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted pr-10 rounded-xl" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-crestline-muted hover:text-slate-900">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-crestline-muted">Confirm Password</Label>
            <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-crestline-bg/20 border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v as boolean)} />
            <Label htmlFor="terms" className="text-sm text-crestline-muted cursor-pointer">
              I accept the <span className="text-crestline-gold">Terms of Service</span> and <span className="text-crestline-gold">Privacy Policy</span>
            </Label>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-crestline-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-crestline-gold hover:underline font-medium">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
