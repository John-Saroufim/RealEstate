import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const goals = ["Build Muscle", "Lose Fat", "Increase Strength", "Improve Endurance", "General Fitness", "Athletic Performance"];
const equipment = ["Full Gym", "Dumbbells Only", "Home Gym", "Resistance Bands", "Bodyweight Only"];
const experience = ["Beginner", "Intermediate", "Advanced"];
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const gymHome = ["Gym", "Home", "Both"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    experience_level: "",
    fitness_goal: "",
    injuries: "",
    training_days_per_week: "4",
    available_equipment: "",
    workout_duration_minutes: "60",
    gym_or_home: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const steps = [
    {
      title: "About You",
      subtitle: "Let's start with the basics",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" placeholder="25" value={form.age} onChange={(e) => update("age", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((g) => (
                  <button key={g} type="button" onClick={() => update("gender", g)} className={`px-3 py-2 text-xs rounded-lg border transition-all ${form.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" placeholder="175" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" placeholder="75" value={form.weight_kg} onChange={(e) => update("weight_kg", e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Goal",
      subtitle: "What are you training for?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {goals.map((g) => (
            <button key={g} type="button" onClick={() => update("fitness_goal", g)} className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${form.fitness_goal === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
              {form.fitness_goal === g && <Check className="h-4 w-4 mb-1" />}
              {g}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Experience",
      subtitle: "How would you describe your training level?",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {experience.map((e) => (
              <button key={e} type="button" onClick={() => update("experience_level", e)} className={`p-4 rounded-xl border text-sm font-medium text-center transition-all ${form.experience_level === e ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Any injuries or limitations?</Label>
            <Input placeholder="e.g., bad knee, shoulder issues (optional)" value={form.injuries} onChange={(e) => update("injuries", e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
      ),
    },
    {
      title: "Training Setup",
      subtitle: "How do you like to train?",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Equipment Available</Label>
            <div className="grid grid-cols-2 gap-3">
              {equipment.map((e) => (
                <button key={e} type="button" onClick={() => update("available_equipment", e)} className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${form.available_equipment === e ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Where do you train?</Label>
            <div className="grid grid-cols-3 gap-3">
              {gymHome.map((g) => (
                <button key={g} type="button" onClick={() => update("gym_or_home", g)} className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${form.gym_or_home === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Days per week</Label>
              <Input type="number" min="1" max="7" value={form.training_days_per_week} onChange={(e) => update("training_days_per_week", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Session length (min)</Label>
              <Input type="number" min="15" max="180" value={form.workout_duration_minutes} onChange={(e) => update("workout_duration_minutes", e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const canNext = () => {
    if (step === 0) return form.age && form.gender && form.height_cm && form.weight_kg;
    if (step === 1) return form.fitness_goal;
    if (step === 2) return form.experience_level;
    if (step === 3) return form.available_equipment && form.gym_or_home;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("onboarding_responses").upsert({
      user_id: user.id,
      age: Number(form.age),
      gender: form.gender,
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      experience_level: form.experience_level,
      fitness_goal: form.fitness_goal,
      injuries: form.injuries || null,
      training_days_per_week: Number(form.training_days_per_week),
      available_equipment: form.available_equipment,
      workout_duration_minutes: Number(form.workout_duration_minutes),
      gym_or_home: form.gym_or_home,
    } as any);
    setLoading(false);
    if (error) {
      toast.error("Failed to save onboarding data");
    } else {
      toast.success("Welcome to IronForge AI!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Dumbbell className="h-8 w-8 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold">Let's personalize your experience</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
            <h2 className="font-display text-xl font-bold mb-1">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{steps[step].subtitle}</p>
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-border text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading || !canNext()} className="gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
