import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Dumbbell, Zap, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type UserProfile = {
  age: string; weight: string; height: string; gender: string;
  goal: string; level: string; equipment: string; days: string;
};

type WorkoutDay = { day: string; focus: string; exercises: { name: string; sets: string; reps: string; rest: string }[] };

const generateProgram = (profile: UserProfile): WorkoutDay[] => {
  const days = Number(profile.days);
  const isStrength = profile.goal === "strength";
  const isMuscle = profile.goal === "muscle";

  const templates: WorkoutDay[] = [
    {
      day: "Day 1", focus: "Chest + Triceps",
      exercises: [
        { name: "Bench Press", sets: isStrength ? "5" : "4", reps: isStrength ? "5" : "10", rest: isStrength ? "3 min" : "90s" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "10", rest: "90s" },
        { name: "Cable Fly", sets: "3", reps: "12", rest: "60s" },
        { name: "Tricep Pushdown", sets: "3", reps: "12", rest: "60s" },
        { name: "Overhead Tricep Extension", sets: "3", reps: "12", rest: "60s" },
      ],
    },
    {
      day: "Day 2", focus: "Back + Biceps",
      exercises: [
        { name: "Deadlift", sets: isStrength ? "5" : "3", reps: isStrength ? "5" : "8", rest: "3 min" },
        { name: "Barbell Row", sets: "4", reps: "8", rest: "90s" },
        { name: "Lat Pulldown", sets: "3", reps: "12", rest: "60s" },
        { name: "Cable Row", sets: "3", reps: "12", rest: "60s" },
        { name: "Barbell Curl", sets: "3", reps: "12", rest: "60s" },
      ],
    },
    {
      day: "Day 3", focus: "Legs",
      exercises: [
        { name: "Barbell Back Squat", sets: isStrength ? "5" : "4", reps: isStrength ? "5" : "10", rest: "3 min" },
        { name: "Romanian Deadlift", sets: "4", reps: "10", rest: "90s" },
        { name: "Leg Press", sets: "3", reps: "12", rest: "90s" },
        { name: "Leg Curl", sets: "3", reps: "12", rest: "60s" },
        { name: "Walking Lunges", sets: "3", reps: "12 each", rest: "60s" },
      ],
    },
    {
      day: "Day 4", focus: "Shoulders + Arms",
      exercises: [
        { name: "Overhead Press", sets: "4", reps: isStrength ? "5" : "8", rest: "2 min" },
        { name: "Dumbbell Lateral Raise", sets: "4", reps: "12", rest: "60s" },
        { name: "Face Pull", sets: "3", reps: "15", rest: "60s" },
        { name: "Hammer Curl", sets: "3", reps: "12", rest: "60s" },
        { name: "Tricep Pushdown", sets: "3", reps: "12", rest: "60s" },
      ],
    },
    {
      day: "Day 5", focus: "Full Body Power",
      exercises: [
        { name: "Bench Press", sets: "3", reps: "5", rest: "3 min" },
        { name: "Barbell Back Squat", sets: "3", reps: "5", rest: "3 min" },
        { name: "Barbell Row", sets: "3", reps: "8", rest: "2 min" },
        { name: "Overhead Press", sets: "3", reps: "8", rest: "2 min" },
        { name: "Pull Up", sets: "3", reps: "AMRAP", rest: "2 min" },
      ],
    },
    {
      day: "Day 6", focus: "Hypertrophy + Conditioning",
      exercises: [
        { name: "Dumbbell Fly", sets: "4", reps: "12", rest: "60s" },
        { name: "Cable Row", sets: "4", reps: "12", rest: "60s" },
        { name: "Leg Press", sets: "4", reps: "15", rest: "60s" },
        { name: "Lateral Raise", sets: "4", reps: "15", rest: "45s" },
        { name: "Plank", sets: "3", reps: "60s hold", rest: "60s" },
      ],
    },
  ];

  return templates.slice(0, days);
};

const options = {
  goals: [
    { value: "muscle", label: "Build Muscle", icon: "💪" },
    { value: "fat", label: "Lose Fat", icon: "🔥" },
    { value: "strength", label: "Increase Strength", icon: "🏋️" },
    { value: "endurance", label: "Improve Endurance", icon: "🏃" },
  ],
  levels: [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ],
  equipment: [
    { value: "full", label: "Full Gym" },
    { value: "dumbbells", label: "Dumbbells Only" },
    { value: "home", label: "Home Gym" },
    { value: "bodyweight", label: "Bodyweight" },
  ],
  days: ["3", "4", "5", "6"],
};

export default function AICoach() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    age: "25", weight: "80", height: "178", gender: "male",
    goal: "", level: "", equipment: "", days: "",
  });
  const [program, setProgram] = useState<WorkoutDay[] | null>(null);
  const [generating, setGenerating] = useState(false);

  const update = (field: keyof UserProfile, value: string) => setProfile({ ...profile, [field]: value });

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setProgram(generateProgram(profile));
      setGenerating(false);
    }, 1500);
  };

  const canProceed = () => {
    if (step === 0) return profile.age && profile.weight && profile.height;
    if (step === 1) return profile.goal;
    if (step === 2) return profile.level;
    if (step === 3) return profile.equipment;
    if (step === 4) return profile.days;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              AI Workout <span className="neon-text">Generator</span>
            </h1>
            <p className="text-muted-foreground">Tell us about yourself and get a personalized program.</p>
          </motion.div>

          {!program ? (
            <>
              {/* Progress bar */}
              <div className="flex gap-1 mb-8">
                {[0, 1, 2, 3, 4].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
                  {step === 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-bold">Your Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                          <input value={profile.age} onChange={(e) => update("age", e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                          <div className="flex gap-2">
                            {["male", "female"].map((g) => (
                              <Button key={g} size="sm" variant={profile.gender === g ? "default" : "outline"} onClick={() => update("gender", g)}
                                className={`flex-1 capitalize ${profile.gender === g ? "gradient-neon-bg text-primary-foreground" : "border-border text-muted-foreground"}`}>
                                {g}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                          <input value={profile.weight} onChange={(e) => update("weight", e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
                          <input value={profile.height} onChange={(e) => update("height", e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <h3 className="font-display text-lg font-bold mb-4">What's your goal?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {options.goals.map((g) => (
                          <button key={g.value} onClick={() => update("goal", g.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${profile.goal === g.value ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-muted-foreground"}`}>
                            <span className="text-2xl">{g.icon}</span>
                            <div className="font-medium text-sm mt-2">{g.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="font-display text-lg font-bold mb-4">Experience level?</h3>
                      <div className="space-y-3">
                        {options.levels.map((l) => (
                          <button key={l.value} onClick={() => update("level", l.value)}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${profile.level === l.value ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-muted-foreground"}`}>
                            <div className="font-medium">{l.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="font-display text-lg font-bold mb-4">Equipment access?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {options.equipment.map((e) => (
                          <button key={e.value} onClick={() => update("equipment", e.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${profile.equipment === e.value ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-muted-foreground"}`}>
                            <div className="font-medium text-sm">{e.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <h3 className="font-display text-lg font-bold mb-4">Training days per week?</h3>
                      <div className="flex gap-3">
                        {options.days.map((d) => (
                          <button key={d} onClick={() => update("days", d)}
                            className={`flex-1 p-4 rounded-xl border text-center font-display text-2xl font-bold transition-all ${profile.days === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="border-border text-muted-foreground">
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1 gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={generate} disabled={!canProceed() || generating} className="flex-1 gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
                    {generating ? (
                      <span className="flex items-center gap-2"><Brain className="h-4 w-4 animate-pulse-neon" /> Generating...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Generate Program</span>
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Generated Program */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold">Your Program</h2>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setProgram(null); setStep(0); }} className="border-border text-muted-foreground">
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {program.map((day, i) => (
                  <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div>
                        <span className="font-display font-bold">{day.day}</span>
                        <span className="text-sm text-primary ml-2">— {day.focus}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{day.exercises.length} exercises</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 mb-2 text-xs text-muted-foreground px-1">
                        <span>Exercise</span><span className="text-center">Sets</span><span className="text-center">Reps</span><span className="text-center">Rest</span>
                      </div>
                      {day.exercises.map((ex) => (
                        <div key={ex.name} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 py-2.5 border-b border-border last:border-0 items-center">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">{ex.name}</span>
                          </div>
                          <span className="text-sm text-center text-muted-foreground">{ex.sets}</span>
                          <span className="text-sm text-center text-muted-foreground">{ex.reps}</span>
                          <span className="text-sm text-center text-muted-foreground flex items-center justify-center gap-0.5">
                            <Clock className="h-3 w-3" />{ex.rest}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
