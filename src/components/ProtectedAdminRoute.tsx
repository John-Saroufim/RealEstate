import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { isEmailVerified } from "@/lib/authEmail";
import { PENDING_ADMIN_OTP_EMAIL_KEY } from "@/lib/adminLoginOtp";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    if (user && isAdmin) {
      sessionStorage.removeItem(PENDING_ADMIN_OTP_EMAIL_KEY);
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/crestline" replace />;
  }

  if (user && !isEmailVerified(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}

