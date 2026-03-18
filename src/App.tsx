import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import CrestlineHome from "./pages/crestline/CrestlineHome";
import CrestlineProperties from "./pages/crestline/CrestlineProperties";
import CrestlineAbout from "./pages/crestline/CrestlineAbout";
import CrestlineContact from "./pages/crestline/CrestlineContact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workout-tracker" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
            <Route path="/crestline" element={<CrestlineHome />} />
            <Route path="/crestline/properties" element={<CrestlineProperties />} />
            <Route path="/crestline/about" element={<CrestlineAbout />} />
            <Route path="/crestline/contact" element={<CrestlineContact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
