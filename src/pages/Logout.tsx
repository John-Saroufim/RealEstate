import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PENDING_ADMIN_OTP_EMAIL_KEY } from "@/lib/adminLoginOtp";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      sessionStorage.removeItem(PENDING_ADMIN_OTP_EMAIL_KEY);
      await supabase.auth.signOut();
      navigate("/crestline", { replace: true });
    };
    run();
  }, [navigate]);

  return null;
}

