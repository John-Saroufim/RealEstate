import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Dumbbell, Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

type WorkoutSet = { weight: string; reps: string; rpe: string };
type ExerciseLog = { name: string; sets: WorkoutSet[] };

const exerciseOptions = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
  "Incline DB Press", "Lat Pulldown", "Leg Press", "Romanian Deadlift",
  "Cable Fly", "Tricep Pushdown", "Barbell Curl", "Dumbbell Lateral Raise",
];

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    { name: "Bench Press", sets: [{ weight: "80", reps: "8", rpe: "7" }, { weight: "80", reps: "8", rpe: "8" }, { weight: "85", reps: "6", rpe: "9" }] },
  ]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ weight: "", reps: "", rpe: "" }] }]);
  };

  const addSet = (exIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.push({ weight: "", reps: "", rpe: "" });
    setExercises(updated);
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.splice(setIdx, 1);
    setExercises(updated);
  };

  const removeExercise = (exIdx: number) => {
    setExercises(exercises.filter((_, i) => i !== exIdx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof WorkoutSet, value: string) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const updateExerciseName = (exIdx: number, name: string) => {
    const updated = [...exercises];
    updated[exIdx].name = name;
    setExercises(updated);
  };

  const totalVolume = exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, s) => setTotal + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  }, 0);

  const totalSets = exercises.reduce((t, e) => t + e.sets.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Workout <span className="neon-text">Tracker</span>
            </h1>
            <p className="text-muted-foreground">Log your sets, reps, and weights.</p>
          </motion.div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card text-center">
              <Dumbbell className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="font-display font-bold text-xl">{exercises.length}</div>
              <div className="text-xs text-muted-foreground">Exercises</div>
            </div>
            <div className="stat-card text-center">
              <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="font-display font-bold text-xl">{totalSets}</div>
              <div className="text-xs text-muted-foreground">Total Sets</div>
            </div>
            <div className="stat-card text-center">
              <div className="font-display font-bold text-xl neon-text">{totalVolume.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Volume (kg)</div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-6">
            {exercises.map((ex, exIdx) => (
              <motion.div key={exIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <select
                    value={ex.name}
                    onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select exercise...</option>
                    {exerciseOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <Button size="icon" variant="ghost" onClick={() => removeExercise(exIdx)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Header */}
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 mb-2 px-1">
                  <span className="text-xs text-muted-foreground">Set</span>
                  <span className="text-xs text-muted-foreground">Weight (kg)</span>
                  <span className="text-xs text-muted-foreground">Reps</span>
                  <span className="text-xs text-muted-foreground">RPE</span>
                  <span />
                </div>

                {ex.sets.map((s, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 mb-2 items-center">
                    <span className="text-sm font-mono text-primary text-center">{setIdx + 1}</span>
                    <Input value={s.weight} onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)} placeholder="0" className="bg-secondary border-border h-9 text-sm" />
                    <Input value={s.reps} onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)} placeholder="0" className="bg-secondary border-border h-9 text-sm" />
                    <Input value={s.rpe} onChange={(e) => updateSet(exIdx, setIdx, "rpe", e.target.value)} placeholder="—" className="bg-secondary border-border h-9 text-sm" />
                    <Button size="icon" variant="ghost" onClick={() => removeSet(exIdx, setIdx)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <Button size="sm" variant="outline" onClick={() => addSet(exIdx)} className="mt-2 border-border text-muted-foreground hover:text-foreground w-full">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Set
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={addExercise} variant="outline" className="flex-1 border-border text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Exercise
            </Button>
            <Button onClick={() => toast.success("Workout saved!")} className="flex-1 gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90">
              <Save className="h-4 w-4 mr-2" /> Save Workout
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
