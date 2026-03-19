import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      setIsAdmin(null);

      // Preferred: determine admin by configured email(s).
      // Set in `.env.local` as: VITE_ADMIN_EMAILS="a@b.com,c@d.com"
      const adminEmailsRaw =
        (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
      const adminEmails = String(adminEmailsRaw)
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.length > 0 && user.email) {
        setIsAdmin(adminEmails.includes(user.email.toLowerCase()));
        return;
      }

      // Fallback: determine admin by `public.user_roles` (role-based setup).
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(Boolean(data));
    };

    check();
  }, [user]);

  return { user, loading, isAdmin };
}

