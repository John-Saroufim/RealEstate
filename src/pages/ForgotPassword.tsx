import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Loader2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { toast.error(error.message); } else { setSent(true); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/crestline" className="inline-flex items-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold">
              RealEstate
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Reset broker password</h1>
          <p className="text-muted-foreground text-sm mt-1">We’ll send a reset link to your email</p>
        </div>

        {sent ? (
          <div className="glass-card p-6 text-center">
            <p className="text-foreground mb-2">Check your email</p>
            <p className="text-sm text-muted-foreground mb-4">We sent a password reset link to <span className="text-primary">{email}</span></p>
            <Link to="/login"><Button variant="outline" className="border-border">Back to sign in</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
