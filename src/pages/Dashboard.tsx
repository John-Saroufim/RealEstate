import { motion } from "framer-motion";
import { Flame, Dumbbell, TrendingUp, Calendar, Trophy, Target, Clock, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";

const strengthData = [
  { week: "W1", bench: 60, squat: 80, deadlift: 100 },
  { week: "W2", bench: 62.5, squat: 85, deadlift: 105 },
  { week: "W3", bench: 65, squat: 87.5, deadlift: 110 },
  { week: "W4", bench: 65, squat: 90, deadlift: 112.5 },
  { week: "W5", bench: 67.5, squat: 92.5, deadlift: 115 },
  { week: "W6", bench: 70, squat: 95, deadlift: 120 },
  { week: "W7", bench: 72.5, squat: 100, deadlift: 125 },
  { week: "W8", bench: 75, squat: 102.5, deadlift: 130 },
];

const weightData = [
  { week: "W1", weight: 82 },
  { week: "W2", weight: 81.5 },
  { week: "W3", weight: 81.8 },
  { week: "W4", weight: 81.2 },
  { week: "W5", weight: 80.8 },
  { week: "W6", weight: 80.5 },
  { week: "W7", weight: 80.2 },
  { week: "W8", weight: 79.8 },
];

const todayWorkout = [
  { exercise: "Bench Press", sets: "5x5", weight: "75kg" },
  { exercise: "Incline DB Press", sets: "4x10", weight: "28kg" },
  { exercise: "Cable Fly", sets: "3x12", weight: "15kg" },
  { exercise: "Tricep Pushdown", sets: "3x12", weight: "25kg" },
  { exercise: "Overhead Extension", sets: "3x12", weight: "20kg" },
];

const weekSchedule = [
  { day: "Mon", workout: "Chest + Triceps", done: true },
  { day: "Tue", workout: "Back + Biceps", done: true },
  { day: "Wed", workout: "Rest", done: true },
  { day: "Thu", workout: "Legs", done: false },
  { day: "Fri", workout: "Shoulders + Arms", done: false },
  { day: "Sat", workout: "Full Body", done: false },
  { day: "Sun", workout: "Rest", done: false },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, <span className="neon-text">Athlete</span>
            </h1>
            <p className="text-muted-foreground">Here's your training overview.</p>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Flame, label: "Calories Burned", value: "2,450", sub: "This week" },
              { icon: Dumbbell, label: "Workouts", value: "12", sub: "This month" },
              { icon: Trophy, label: "Streak", value: "8 days", sub: "Personal best!" },
              { icon: TrendingUp, label: "Volume", value: "34,500 kg", sub: "+12% vs last week" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <div className="font-display text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Workout */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold">Today's Workout</h2>
                <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Chest + Triceps</span>
              </div>
              <div className="space-y-3">
                {todayWorkout.map((e) => (
                  <div key={e.exercise} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="text-sm font-medium">{e.exercise}</div>
                      <div className="text-xs text-muted-foreground">{e.sets}</div>
                    </div>
                    <span className="text-sm text-primary font-mono">{e.weight}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Schedule */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold">This Week</h2>
              </div>
              <div className="space-y-2">
                {weekSchedule.map((d) => (
                  <div key={d.day} className={`flex items-center justify-between p-2.5 rounded-lg ${d.done ? "bg-primary/5" : "bg-secondary/50"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold w-8">{d.day}</span>
                      <span className="text-sm">{d.workout}</span>
                    </div>
                    {d.done && <Zap className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* PRs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold">Personal Records</h2>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Bench Press", pr: "100 kg", date: "Feb 28" },
                  { name: "Squat", pr: "140 kg", date: "Mar 5" },
                  { name: "Deadlift", pr: "170 kg", date: "Mar 10" },
                  { name: "Overhead Press", pr: "65 kg", date: "Mar 1" },
                ].map((pr) => (
                  <div key={pr.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="text-sm font-medium">{pr.name}</div>
                      <div className="text-xs text-muted-foreground">{pr.date}</div>
                    </div>
                    <span className="font-display font-bold neon-text">{pr.pr}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
              <h3 className="font-display font-bold mb-4">Strength Progress (kg)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={strengthData}>
                  <XAxis dataKey="week" stroke="hsl(0 0% 40%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 40%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", color: "hsl(0 0% 96%)" }} />
                  <Line type="monotone" dataKey="bench" stroke="hsl(152 100% 50%)" strokeWidth={2} name="Bench" dot={false} />
                  <Line type="monotone" dataKey="squat" stroke="hsl(200 100% 55%)" strokeWidth={2} name="Squat" dot={false} />
                  <Line type="monotone" dataKey="deadlift" stroke="hsl(40 100% 55%)" strokeWidth={2} name="Deadlift" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
              <h3 className="font-display font-bold mb-4">Body Weight (kg)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weightData}>
                  <XAxis dataKey="week" stroke="hsl(0 0% 40%)" fontSize={12} />
                  <YAxis domain={[78, 84]} stroke="hsl(0 0% 40%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", color: "hsl(0 0% 96%)" }} />
                  <Area type="monotone" dataKey="weight" stroke="hsl(152 100% 50%)" fill="hsl(152 100% 50% / 0.1)" strokeWidth={2} />
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
