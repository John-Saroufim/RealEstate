import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Dumbbell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Exercise = {
  name: string;
  muscles: string[];
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  instructions: string[];
  category: string;
};

const exercises: Exercise[] = [
  { name: "Barbell Bench Press", muscles: ["Chest", "Triceps", "Shoulders"], equipment: "Barbell + Bench", difficulty: "Intermediate", category: "Chest", instructions: ["Lie on a flat bench with feet on the floor", "Grip the bar slightly wider than shoulder-width", "Unrack and lower the bar to mid-chest", "Press the bar back up to full extension"] },
  { name: "Barbell Back Squat", muscles: ["Quads", "Glutes", "Hamstrings"], equipment: "Barbell + Rack", difficulty: "Intermediate", category: "Legs", instructions: ["Position bar on upper traps", "Feet shoulder-width apart, toes slightly out", "Descend by breaking at hips and knees", "Drive through heels to stand"] },
  { name: "Conventional Deadlift", muscles: ["Back", "Glutes", "Hamstrings"], equipment: "Barbell", difficulty: "Advanced", category: "Back", instructions: ["Stand with feet hip-width, bar over mid-foot", "Hinge at hips, grip bar outside knees", "Brace core, drive through legs", "Lock out hips at the top"] },
  { name: "Pull Up", muscles: ["Lats", "Biceps", "Rear Delts"], equipment: "Pull-Up Bar", difficulty: "Intermediate", category: "Back", instructions: ["Hang with overhand grip, shoulder-width", "Pull chest toward bar by driving elbows down", "Chin above bar at top", "Lower with control"] },
  { name: "Overhead Press", muscles: ["Shoulders", "Triceps"], equipment: "Barbell", difficulty: "Intermediate", category: "Shoulders", instructions: ["Stand with bar at collarbone", "Brace core, press overhead", "Lock out arms fully", "Lower with control to start"] },
  { name: "Barbell Row", muscles: ["Back", "Biceps", "Rear Delts"], equipment: "Barbell", difficulty: "Intermediate", category: "Back", instructions: ["Hinge forward ~45 degrees", "Pull bar to lower chest", "Squeeze shoulder blades", "Lower with control"] },
  { name: "Dumbbell Incline Press", muscles: ["Upper Chest", "Triceps"], equipment: "Dumbbells + Bench", difficulty: "Beginner", category: "Chest", instructions: ["Set bench to 30-45 degrees", "Press dumbbells up from shoulder level", "Lower with control", "Keep feet flat"] },
  { name: "Lat Pulldown", muscles: ["Lats", "Biceps"], equipment: "Cable Machine", difficulty: "Beginner", category: "Back", instructions: ["Grip bar wider than shoulders", "Pull to upper chest", "Squeeze lats at bottom", "Control the eccentric"] },
  { name: "Leg Press", muscles: ["Quads", "Glutes"], equipment: "Leg Press Machine", difficulty: "Beginner", category: "Legs", instructions: ["Place feet shoulder-width on platform", "Lower sled by bending knees", "Press through heels to extend", "Don't lock out knees fully"] },
  { name: "Romanian Deadlift", muscles: ["Hamstrings", "Glutes", "Lower Back"], equipment: "Barbell", difficulty: "Intermediate", category: "Legs", instructions: ["Hold bar at hip height", "Hinge at hips, slight knee bend", "Lower bar along legs to mid-shin", "Squeeze glutes to return"] },
  { name: "Dumbbell Lateral Raise", muscles: ["Side Delts"], equipment: "Dumbbells", difficulty: "Beginner", category: "Shoulders", instructions: ["Stand with dumbbells at sides", "Raise arms to shoulder height", "Slight bend in elbows", "Lower with control"] },
  { name: "Cable Fly", muscles: ["Chest"], equipment: "Cable Machine", difficulty: "Beginner", category: "Chest", instructions: ["Set cables at chest height", "Step forward, slight lean", "Bring handles together in arc", "Squeeze chest at center"] },
  { name: "Tricep Pushdown", muscles: ["Triceps"], equipment: "Cable Machine", difficulty: "Beginner", category: "Arms", instructions: ["Grip bar overhand at cable station", "Keep elbows pinned to sides", "Extend arms fully", "Control the return"] },
  { name: "Barbell Curl", muscles: ["Biceps"], equipment: "Barbell", difficulty: "Beginner", category: "Arms", instructions: ["Stand with underhand grip", "Curl bar to shoulder height", "Keep elbows stationary", "Lower with control"] },
  { name: "Plank", muscles: ["Core", "Shoulders"], equipment: "Bodyweight", difficulty: "Beginner", category: "Core", instructions: ["Forearms on floor, elbows under shoulders", "Body in straight line", "Engage core, squeeze glutes", "Hold for time"] },
  { name: "Walking Lunges", muscles: ["Quads", "Glutes", "Hamstrings"], equipment: "Bodyweight/Dumbbells", difficulty: "Beginner", category: "Legs", instructions: ["Step forward into lunge", "Both knees at 90 degrees", "Drive through front heel", "Alternate legs"] },
  { name: "Face Pull", muscles: ["Rear Delts", "Upper Back"], equipment: "Cable Machine", difficulty: "Beginner", category: "Shoulders", instructions: ["Set cable at face height with rope", "Pull toward face, elbows high", "Separate rope ends at ears", "Squeeze rear delts"] },
  { name: "Dumbbell Shoulder Press", muscles: ["Shoulders", "Triceps"], equipment: "Dumbbells", difficulty: "Beginner", category: "Shoulders", instructions: ["Sit with dumbbells at shoulder height", "Press overhead until arms extended", "Lower to start position", "Keep core braced"] },
  { name: "Hip Thrust", muscles: ["Glutes", "Hamstrings"], equipment: "Barbell + Bench", difficulty: "Intermediate", category: "Legs", instructions: ["Upper back on bench, bar on hips", "Feet flat, knees at 90 degrees", "Drive hips up, squeezing glutes", "Lower with control"] },
  { name: "Cable Row", muscles: ["Back", "Biceps"], equipment: "Cable Machine", difficulty: "Beginner", category: "Back", instructions: ["Sit at cable row station", "Pull handle to lower chest", "Squeeze shoulder blades together", "Extend arms with control"] },
  { name: "Push Up", muscles: ["Chest", "Triceps", "Shoulders"], equipment: "Bodyweight", difficulty: "Beginner", category: "Chest", instructions: ["Hands shoulder-width, body straight", "Lower chest to floor", "Push back up to full extension", "Keep core engaged throughout"] },
  { name: "Leg Curl", muscles: ["Hamstrings"], equipment: "Machine", difficulty: "Beginner", category: "Legs", instructions: ["Lie face down on machine", "Pad above ankles", "Curl legs up toward glutes", "Lower with control"] },
  { name: "Dumbbell Fly", muscles: ["Chest"], equipment: "Dumbbells + Bench", difficulty: "Beginner", category: "Chest", instructions: ["Lie on flat bench, arms extended", "Lower dumbbells in wide arc", "Slight elbow bend throughout", "Squeeze chest to return"] },
  { name: "Hammer Curl", muscles: ["Biceps", "Forearms"], equipment: "Dumbbells", difficulty: "Beginner", category: "Arms", instructions: ["Hold dumbbells with neutral grip", "Curl up keeping palms facing in", "Squeeze at the top", "Lower with control"] },
];

const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Exercises() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || e.category === category;
    const matchDiff = difficulty === "All" || e.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const diffColor = (d: string) => d === "Beginner" ? "text-emerald-400 bg-emerald-400/10" : d === "Intermediate" ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Exercise <span className="neon-text">Library</span>
            </h1>
            <p className="text-muted-foreground text-lg">Browse {exercises.length}+ exercises with detailed instructions.</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search exercises or muscle groups..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}
                  className={category === c ? "gradient-neon-bg text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}>
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            {difficulties.map((d) => (
              <Button key={d} size="sm" variant={difficulty === d ? "default" : "outline"} onClick={() => setDifficulty(d)}
                className={difficulty === d ? "gradient-neon-bg text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}>
                {d}
              </Button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {filtered.map((e, i) => (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === e.name ? null : e.name)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{e.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {e.muscles.map((m) => (
                          <span key={m} className="text-xs text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffColor(e.difficulty)}`}>{e.difficulty}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === e.name ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expanded === e.name && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
                    <div className="p-4 space-y-3">
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Equipment: <span className="text-foreground">{e.equipment}</span></span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Instructions</h4>
                        <ol className="space-y-1.5">
                          {e.instructions.map((step, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary font-mono text-xs mt-0.5">{idx + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No exercises found matching your filters.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
