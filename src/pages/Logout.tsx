import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut();
      navigate("/crestline", { replace: true });
    };
    run();
  }, [navigate]);

  return null;
}

