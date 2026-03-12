import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Programs from "./pages/Programs";
import Exercises from "./pages/Exercises";
import Nutrition from "./pages/Nutrition";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import WorkoutTracker from "./pages/WorkoutTracker";
import Progress from "./pages/Progress";
import AICoach from "./pages/AICoach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-tracker" element={<WorkoutTracker />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
