import { motion } from "framer-motion";
import { Check, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    desc: "Get started with basic features",
    icon: Star,
    features: ["5 workouts/month", "Basic exercise library", "Simple tracking", "Community access"],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    desc: "Unlock the full fitness experience",
    icon: Zap,
    features: ["Unlimited workouts", "AI Coach access", "Full exercise library", "Progress analytics", "Nutrition calculator", "Workout history", "PR tracking"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Elite",
    price: "$29",
    period: "/month",
    desc: "For serious athletes and coaches",
    icon: Crown,
    features: ["Everything in Pro", "Custom AI programs", "Advanced analytics", "Personalized nutrition plans", "Priority support", "Coach dashboard", "Export data"],
    cta: "Go Elite",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Simple <span className="neon-text">Pricing</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Start free, upgrade when you're ready. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 relative ${p.featured ? "neon-border" : ""}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-neon-bg text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <p.icon className={`h-8 w-8 mx-auto mb-3 ${p.featured ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <div className="mt-2">
                    <span className="font-display text-4xl font-bold">{p.price}</span>
                    <span className="text-muted-foreground text-sm">{p.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{p.desc}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full font-semibold ${p.featured ? "gradient-neon-bg text-primary-foreground hover:opacity-90" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                  {p.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
