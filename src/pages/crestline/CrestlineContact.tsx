import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { ContactPropertiesRippleButton } from "@/components/crestline/ContactPropertiesRippleButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MotionSection } from "@/components/MotionSection";

export default function CrestlineContact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    if (form.name.length > 100) e.name = "Name must be under 100 characters";
    if (form.message.length > 2000) e.message = "Message must be under 2000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),

        property_id: null,
        property_title_snapshot: null,
        agent_id: null,

        inquiry_type: "general_inquiry",
        status: "new",
        read: false,
        archived: false,
      };

              const { error } = await supabase.from("inquiries").insert(payload);
      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Inquiry Submitted",
        description: "Our team will be in touch within 24 hours.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setErrors({});
    } catch (err: any) {
      toast({
        title: "Could not submit inquiry",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      {/* Header */}
      <MotionSection className="pt-32 pb-12 bg-crestline-surface border-b border-crestline-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Get In Touch</p>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-crestline-muted max-w-xl">Ready to explore your next investment or dream home? Our advisors are here to help.</p>
        </div>
      </MotionSection>

      {/* Contact Content */}
      <MotionSection className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-sans text-xl font-semibold text-slate-900 mb-6">Our Offices</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <MapPin className="h-5 w-5 text-crestline-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">New York</p>
                      <p className="text-sm text-crestline-muted">200 Park Avenue, Suite 1500<br />New York, NY 10166</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="h-5 w-5 text-crestline-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Palm Beach</p>
                      <p className="text-sm text-crestline-muted">340 Royal Palm Way, Suite 200<br />Palm Beach, FL 33480</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-crestline-gold" />
                  <span className="text-sm text-crestline-muted">+1 (212) 555-0190</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-crestline-gold" />
                  <span className="text-sm text-crestline-muted">inquiries@crestlineestates.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-crestline-gold" />
                  <span className="text-sm text-crestline-muted">Mon–Fri: 9:00 AM – 6:00 PM EST</span>
                </div>
              </div>
              <div className="border border-slate-200 p-6 bg-crestline-surface">
                <p className="text-xs text-crestline-gold uppercase tracking-wider font-semibold mb-2">Private Consultations</p>
                <p className="text-sm text-crestline-muted leading-relaxed">
                  For high-value inquiries or confidential requirements, we offer private consultations by appointment at our offices or a location of your choosing.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-crestline-gold/20 p-12 text-center">
                  <CheckCircle2 className="h-14 w-14 text-crestline-gold mx-auto mb-6" />
                  <h3 className="font-sans text-2xl font-bold text-slate-900 mb-4">Thank You</h3>
                  <p className="text-crestline-muted max-w-md mx-auto">
                    Your inquiry has been received. A RealEstate advisor will contact you within 24 hours to discuss your requirements.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="border border-slate-200 p-8 sm:p-10 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Full Name *</label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="John Smith"
                        className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-12"
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Email *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-12"
                      />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Phone</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Message *</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us about your requirements..."
                      rows={5}
                      className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl resize-none"
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                  </div>

                  <ContactPropertiesRippleButton
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl min-h-12 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </ContactPropertiesRippleButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </MotionSection>

      <CrestlineFooter />
    </div>
  );
}
