import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Utensils, Apple, Beef, Droplets, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const mealPlans: Record<string, { name: string; meals: { meal: string; foods: string; cals: number }[] }> = {
  gain: {
    name: "Muscle Gain",
    meals: [
      { meal: "Breakfast", foods: "Oats, banana, whey protein, peanut butter", cals: 650 },
      { meal: "Snack", foods: "Greek yogurt, mixed berries, granola", cals: 350 },
      { meal: "Lunch", foods: "Chicken breast, brown rice, broccoli", cals: 700 },
      { meal: "Pre-Workout", foods: "Rice cakes, honey, protein shake", cals: 300 },
      { meal: "Dinner", foods: "Salmon, sweet potato, asparagus", cals: 650 },
      { meal: "Evening", foods: "Casein shake, almonds", cals: 350 },
    ],
  },
  loss: {
    name: "Fat Loss",
    meals: [
      { meal: "Breakfast", foods: "Egg whites, spinach, whole wheat toast", cals: 350 },
      { meal: "Snack", foods: "Apple, almond butter", cals: 200 },
      { meal: "Lunch", foods: "Turkey breast, quinoa, mixed greens", cals: 500 },
      { meal: "Snack", foods: "Protein shake, celery sticks", cals: 200 },
      { meal: "Dinner", foods: "White fish, zucchini noodles, tomato sauce", cals: 400 },
    ],
  },
};

export default function Nutrition() {
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("80");
  const [height, setHeight] = useState("178");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("gain");
  const [showResult, setShowResult] = useState(false);

  const activityMultipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
  const bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
  const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.55));
  const calories = goal === "gain" ? tdee + 400 : goal === "loss" ? tdee - 500 : tdee;

  const macros = goal === "gain"
    ? { protein: 30, carbs: 50, fat: 20 }
    : goal === "loss"
    ? { protein: 40, carbs: 35, fat: 25 }
    : { protein: 30, carbs: 40, fat: 30 };

  const proteinG = Math.round((calories * macros.protein) / 100 / 4);
  const carbsG = Math.round((calories * macros.carbs) / 100 / 4);
  const fatG = Math.round((calories * macros.fat) / 100 / 9);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Nutrition <span className="neon-text">Guide</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">Calculate your daily calorie needs and get macro targets.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Calorie Calculator</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Age</label><Input value={age} onChange={(e) => setAge(e.target.value)} className="bg-secondary border-border" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label><Input value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-secondary border-border" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label><Input value={height} onChange={(e) => setHeight(e.target.value)} className="bg-secondary border-border" /></div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Activity Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[["sedentary", "Sedentary"], ["light", "Light"], ["moderate", "Moderate"], ["active", "Active"], ["veryActive", "Very Active"]].map(([k, l]) => (
                      <Button key={k} size="sm" variant={activity === k ? "default" : "outline"} onClick={() => setActivity(k)}
                        className={activity === k ? "gradient-neon-bg text-primary-foreground" : "border-border text-muted-foreground"}>
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["gain", "Muscle Gain"], ["maintain", "Maintain"], ["loss", "Fat Loss"]].map(([k, l]) => (
                      <Button key={k} size="sm" variant={goal === k ? "default" : "outline"} onClick={() => setGoal(k)}
                        className={goal === k ? "gradient-neon-bg text-primary-foreground" : "border-border text-muted-foreground"}>
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setShowResult(true)} className="w-full gradient-neon-bg text-primary-foreground font-semibold hover:opacity-90">
                  Calculate
                </Button>
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-border">
                  <div className="text-center mb-6">
                    <div className="text-sm text-muted-foreground mb-1">Daily Calories</div>
                    <div className="font-display text-4xl font-bold neon-text">{calories}</div>
                    <div className="text-xs text-muted-foreground mt-1">kcal/day</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="stat-card text-center">
                      <Beef className="h-4 w-4 text-red-400 mx-auto mb-1" />
                      <div className="font-display font-bold text-lg">{proteinG}g</div>
                      <div className="text-xs text-muted-foreground">Protein ({macros.protein}%)</div>
                    </div>
                    <div className="stat-card text-center">
                      <Apple className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                      <div className="font-display font-bold text-lg">{carbsG}g</div>
                      <div className="text-xs text-muted-foreground">Carbs ({macros.carbs}%)</div>
                    </div>
                    <div className="stat-card text-center">
                      <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <div className="font-display font-bold text-lg">{fatG}g</div>
                      <div className="text-xs text-muted-foreground">Fat ({macros.fat}%)</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Meal Plans */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {Object.entries(mealPlans).map(([key, plan]) => (
                <div key={key} className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-lg font-bold">{plan.name} Meal Plan</h3>
                  </div>
                  <div className="space-y-3">
                    {plan.meals.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="text-sm font-medium text-foreground">{m.meal}</div>
                          <div className="text-xs text-muted-foreground">{m.foods}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Flame className="h-3 w-3 text-primary" />
                          {m.cals} kcal
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <span className="text-sm font-semibold text-primary">
                        Total: {plan.meals.reduce((a, m) => a + m.cals, 0)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
