import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(null);
        setChecking(false);
        return;
      }
      setChecking(true);
      setIsAdmin(null);

      // Prefer: DB-level truth via `public.is_admin()`.
      // This keeps authorization consistent even if someone bypasses the frontend.
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error && typeof data === "boolean") {
          setIsAdmin(data);
          setChecking(false);
          return;
        }
      } catch {
        // Fall back to client-side checks (keeps existing dev flow if the SQL migration
        // hasn't been applied to the DB yet).
      }

      // Fallback: determine admin by configured email(s).
      // Set in `.env.local` as: VITE_ADMIN_EMAILS="a@b.com,c@d.com"
      const adminEmailsRaw =
        (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
      const adminEmails = String(adminEmailsRaw)
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.length > 0 && user.email) {
        setIsAdmin(adminEmails.includes(user.email.toLowerCase()));
        setChecking(false);
        return;
      }

      // Fallback 2: determine admin by `public.user_roles` (role-based setup).
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      setIsAdmin(Boolean(data));
      setChecking(false);
    };

    check();
  }, [user]);

  return { user, loading: authLoading, isAdmin, checking };
}

