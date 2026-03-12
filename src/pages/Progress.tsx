import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Scale, Ruler, Trophy, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { toast } from "sonner";

const bodyWeightData = [
  { date: "Jan", weight: 84 }, { date: "Feb", weight: 82.5 },
  { date: "Mar", weight: 81 }, { date: "Apr", weight: 80.2 },
  { date: "May", weight: 79.5 }, { date: "Jun", weight: 79.8 },
];

const strengthProgress = [
  { month: "Jan", bench: 60, squat: 80, deadlift: 100 },
  { month: "Feb", bench: 70, squat: 95, deadlift: 115 },
  { month: "Mar", bench: 75, squat: 102, deadlift: 130 },
  { month: "Apr", bench: 82, squat: 110, deadlift: 140 },
  { month: "May", bench: 90, squat: 120, deadlift: 150 },
  { month: "Jun", bench: 95, squat: 130, deadlift: 160 },
];

const consistencyData = [
  { week: "W1", workouts: 4 }, { week: "W2", workouts: 5 },
  { week: "W3", workouts: 3 }, { week: "W4", workouts: 5 },
  { week: "W5", workouts: 4 }, { week: "W6", workouts: 5 },
  { week: "W7", workouts: 4 }, { week: "W8", workouts: 5 },
];

const prs = [
  { exercise: "Bench Press", weight: "100 kg", date: "2025-02-28", prev: "95 kg" },
  { exercise: "Back Squat", weight: "140 kg", date: "2025-03-05", prev: "130 kg" },
  { exercise: "Deadlift", weight: "170 kg", date: "2025-03-10", prev: "160 kg" },
  { exercise: "Overhead Press", weight: "65 kg", date: "2025-03-01", prev: "60 kg" },
];

export default function Progress() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Progress <span className="neon-text">Tracker</span>
            </h1>
            <p className="text-muted-foreground">Track your body metrics and strength gains.</p>
          </motion.div>

          {/* Quick Log */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mb-8">
            <h3 className="font-display font-bold mb-4">Log Today's Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80.0" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Body Fat %</label>
                <Input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="15" className="bg-secondary border-border" />
              </div>
              <div className="col-span-2 flex items-end">
                <Button onClick={() => toast.success("Metrics logged!")} className="gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" /> Log Metrics
                </Button>
              </div>
            </div>
          </motion.div>

          {/* PR Tracker */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Personal Records</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {prs.map((pr) => (
                <div key={pr.exercise} className="stat-card">
                  <div className="text-sm text-muted-foreground mb-1">{pr.exercise}</div>
                  <div className="font-display text-2xl font-bold neon-text">{pr.weight}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous: {pr.prev} • {pr.date}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold">Body Weight</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={bodyWeightData}>
                  <XAxis dataKey="date" stroke="hsl(0 0% 40%)" fontSize={12} />
                  <YAxis domain={[78, 86]} stroke="hsl(0 0% 40%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", color: "hsl(0 0% 96%)" }} />
                  <Area type="monotone" dataKey="weight" stroke="hsl(152 100% 50%)" fill="hsl(152 100% 50% / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold">Strength Progress</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={strengthProgress}>
                  <XAxis dataKey="month" stroke="hsl(0 0% 40%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 40%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", color: "hsl(0 0% 96%)" }} />
                  <Line type="monotone" dataKey="bench" stroke="hsl(152 100% 50%)" strokeWidth={2} name="Bench" dot={false} />
                  <Line type="monotone" dataKey="squat" stroke="hsl(200 100% 55%)" strokeWidth={2} name="Squat" dot={false} />
                  <Line type="monotone" dataKey="deadlift" stroke="hsl(40 100% 55%)" strokeWidth={2} name="Deadlift" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold">Workout Consistency</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={consistencyData}>
                  <XAxis dataKey="week" stroke="hsl(0 0% 40%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 40%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", color: "hsl(0 0% 96%)" }} />
                  <Area type="monotone" dataKey="workouts" stroke="hsl(152 100% 50%)" fill="hsl(152 100% 50% / 0.15)" strokeWidth={2} name="Workouts" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
