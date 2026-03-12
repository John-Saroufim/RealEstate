import { motion } from "framer-motion";
import { Dumbbell, Target, Users, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const values = [
  { icon: Target, title: "Science-Driven", desc: "Every program is built on exercise science and progressive overload principles." },
  { icon: Sparkles, title: "AI-Powered", desc: "Machine learning adapts your training based on your progress and recovery." },
  { icon: Users, title: "Community-First", desc: "Built by lifters, for lifters. We train alongside our users every day." },
  { icon: Dumbbell, title: "Results-Focused", desc: "We measure success by your PRs, not vanity metrics." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mb-16">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              Built for Athletes Who <span className="neon-text">Train Hard</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              IronForge AI was born out of frustration with generic workout apps that treat every lifter the same. We built the coach we always wanted — one that understands progressive overload, periodization, and individual recovery.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our AI engine combines decades of exercise science research with real-time performance data to create truly personalized training programs that evolve with you.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <v.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-8 text-center">
            <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              To democratize elite-level coaching. Every athlete deserves a smart training program, regardless of budget. IronForge AI makes world-class programming accessible to everyone.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
