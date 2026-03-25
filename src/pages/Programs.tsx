import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Dumbbell, Target, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const programs = [
  {
    title: "Beginner Strength",
    weeks: 8,
    days: "3-4 days/week",
    focus: "Technique + Foundational Strength",
    level: "Beginner",
    color: "from-emerald-500/20 to-emerald-900/10",
    desc: "Full-body workouts designed to build a solid foundation of strength and proper form.",
    tags: ["Full Body", "Compound Lifts", "Linear Progression"],
  },
  {
    title: "Hypertrophy Builder",
    weeks: 12,
    days: "5 days/week",
    focus: "Muscle Growth",
    level: "Intermediate",
    color: "from-blue-500/20 to-blue-900/10",
    desc: "Push/Pull/Legs split targeting maximum muscle hypertrophy with progressive overload.",
    tags: ["PPL Split", "High Volume", "Isolation Work"],
  },
  {
    title: "Fat Loss Shred",
    weeks: 10,
    days: "4-5 days/week",
    focus: "Fat Loss + Muscle Retention",
    level: "All Levels",
    color: "from-blue-500/20 to-slate-900/10",
    desc: "Strength training combined with HIIT and cardio conditioning for maximum fat loss.",
    tags: ["HIIT", "Strength", "Conditioning"],
  },
  {
    title: "Athlete Performance",
    weeks: 12,
    days: "5-6 days/week",
    focus: "Explosive Strength + Speed",
    level: "Advanced",
    color: "from-purple-500/20 to-purple-900/10",
    desc: "Plyometrics, sprint training, and explosive strength for athletic performance.",
    tags: ["Plyometrics", "Sprint", "Power"],
  },
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Training <span className="neon-text">Programs</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Scientifically designed programs for every goal and experience level.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden group hover:border-primary/30 transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${p.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{p.level}</span>
                      <h3 className="font-display text-xl font-bold mt-3">{p.title}</h3>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.weeks} weeks</div>
                      <div className="mt-1">{p.days}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{p.focus}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <Link to="/ai-coach">
                    <Button size="sm" className="gradient-neon-bg text-primary-foreground font-semibold w-full hover:opacity-90">
                      Start Program <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
