import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_RESOLVE_MS = 2000;

function adminEmailsFromEnv(): string[] {
  const adminEmailsRaw =
    (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
  return String(adminEmailsRaw)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminByEnvEmail(user: User): boolean {
  const emails = adminEmailsFromEnv();
  if (emails.length === 0 || !user.email) return false;
  return emails.includes(user.email.toLowerCase());
}

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      setChecking(false);
      return;
    }

    let cancelled = false;
    let settled = false;
    setChecking(true);
    setIsAdmin(null);

    const resolveFull = async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error && typeof data === "boolean") return data;
      } catch {
        /* fall through */
      }

      if (adminEmailsFromEnv().length > 0 && user.email) {
        return isAdminByEnvEmail(user);
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) return false;
        return Boolean(data);
      } catch {
        return false;
      }
    };

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || settled) return;
      settled = true;
      setIsAdmin(isAdminByEnvEmail(user));
      setChecking(false);
    }, ADMIN_RESOLVE_MS);

    void resolveFull()
      .then((value) => {
        if (cancelled) return;
        window.clearTimeout(fallbackTimer);
        if (settled) {
          /* Prefer DB/RPC truth if it arrives after the 2s email fallback */
          setIsAdmin(value);
          return;
        }
        settled = true;
        setIsAdmin(value);
        setChecking(false);
      })
      .catch(() => {
        if (cancelled) return;
        window.clearTimeout(fallbackTimer);
        if (settled) return;
        settled = true;
        setIsAdmin(isAdminByEnvEmail(user));
        setChecking(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [user]);

  return { user, loading: authLoading, isAdmin, checking };
}
