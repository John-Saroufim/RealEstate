import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Brain, TrendingUp, BarChart3, Utensils, Users, Zap, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import heroImage from "@/assets/hero-fitness.jpg";

const features = [
  { icon: Brain, title: "AI Workout Generator", desc: "Personalized programs built by AI based on your goals, equipment, and experience." },
  { icon: Dumbbell, title: "Workout Tracker", desc: "Log every set, rep, and weight. Track PRs and total volume automatically." },
  { icon: TrendingUp, title: "Progress Analytics", desc: "Visual dashboards showing strength gains, body composition, and consistency." },
  { icon: Utensils, title: "Nutrition Guidance", desc: "Calorie and macro calculators with meal plan suggestions for your goals." },
  { icon: BarChart3, title: "Smart Programming", desc: "Progressive overload built in. Your program evolves as you get stronger." },
  { icon: Users, title: "Community", desc: "Share workouts, celebrate PRs, and compete on leaderboards." },
];

const stats = [
  { value: "50K+", label: "Active Athletes" },
  { value: "2M+", label: "Workouts Logged" },
  { value: "98%", label: "Satisfaction" },
  { value: "150+", label: "Exercise Library" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Athlete training" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>
        <div className="relative container-max px-4 sm:px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered Fitness Coaching</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Train Smarter.
              <br />
              <span className="neon-text">Get Stronger.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Your AI coach creates personalized workout programs, tracks your progress, and adapts to help you crush every goal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="gradient-neon-bg text-primary-foreground font-semibold text-base px-8 hover:opacity-90 transition-opacity">
                  Start Training Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-base px-8">
                  Browse Programs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding border-y border-border">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold neon-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Everything You Need to <span className="neon-text">Dominate</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">One platform for AI programming, workout tracking, nutrition, and analytics.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card p-6 group hover:border-primary/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card neon-border p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to Transform?</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Join thousands of athletes using AI to train smarter and see real results.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gradient-neon-bg text-primary-foreground font-semibold text-base px-10 hover:opacity-90">
                  Get Started Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
