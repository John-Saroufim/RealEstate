import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CrestlineHome from "./pages/crestline/CrestlineHome";
import CrestlineProperties from "./pages/crestline/CrestlineProperties";
import CrestlineAbout from "./pages/crestline/CrestlineAbout";
import CrestlineContact from "./pages/crestline/CrestlineContact";
import CrestlinePropertyDetails from "./pages/crestline/CrestlinePropertyDetails";
import AdminListings from "./pages/crestline/AdminListings";
import EditListing from "./pages/crestline/EditListing";
import AdminStatus from "./pages/crestline/AdminStatus";
import AdminInquiries from "./pages/crestline/AdminInquiries";
import InquiryDetail from "./pages/crestline/InquiryDetail";
import AdminAgents from "./pages/crestline/AdminAgents";
import EditAgent from "./pages/crestline/EditAgent";
import AdminReviews from "./pages/crestline/AdminReviews";
import Logout from "./pages/Logout";
import { CrestlineAiChatDock } from "@/components/crestline/CrestlineAiChatDock";
import { EntrySplashHost } from "@/components/EntrySplashHost";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/crestline" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/crestline" element={<CrestlineHome />} />
          <Route path="/crestline/properties" element={<CrestlineProperties />} />
          <Route path="/crestline/properties/:id" element={<CrestlinePropertyDetails />} />
          <Route path="/crestline/about" element={<CrestlineAbout />} />
          <Route path="/crestline/contact" element={<CrestlineContact />} />
          <Route
            path="/crestline/admin/listings"
            element={
              <ProtectedAdminRoute>
                <AdminListings />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/listings/new"
            element={
              <ProtectedAdminRoute>
                <EditListing />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/listings/:id"
            element={
              <ProtectedAdminRoute>
                <EditListing />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/status"
            element={
              <ProtectedRoute>
                <AdminStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crestline/admin/inquiries"
            element={
              <ProtectedAdminRoute>
                <AdminInquiries />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/inquiries/:id"
            element={
              <ProtectedAdminRoute>
                <InquiryDetail />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/reviews"
            element={
              <ProtectedAdminRoute>
                <AdminReviews />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/agents"
            element={
              <ProtectedAdminRoute>
                <AdminAgents />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/agents/new"
            element={
              <ProtectedAdminRoute>
                <EditAgent />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/crestline/admin/agents/:id"
            element={
              <ProtectedAdminRoute>
                <EditAgent />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop smooth />
        <AuthProvider>
          <CrestlineAiChatDock />
          <EntrySplashHost />
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
