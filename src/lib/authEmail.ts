import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** True when Supabase has recorded a confirmed email for this user. */
export function isEmailVerified(user: User | null): boolean {
  if (!user) return false;
  return Boolean(user.email_confirmed_at);
}

function adminEmailsFromEnv(): string[] {
  const raw = (import.meta as any).env?.VITE_ADMIN_EMAILS ?? (import.meta as any).env?.VITE_ADMIN_EMAIL ?? "";
  return String(raw)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether this account should be treated as an admin for email-verification gating.
 * Mirrors `useIsAdmin`: RPC `is_admin()`, then env emails, then `user_roles`.
 */
export async function isAdminAccount(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const { data, error } = await supabase.rpc("is_admin");
    if (!error && typeof data === "boolean") return data;
  } catch {
    /* RPC missing or not migrated */
  }
  const adminEmails = adminEmailsFromEnv();
  if (adminEmails.length > 0 && user.email) {
    return adminEmails.includes(user.email.toLowerCase());
  }
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

/** Admins must verify email before admin UI; returns true if we should send them to /verify-email. */
export async function adminRequiresEmailVerification(user: User | null): Promise<boolean> {
  if (!user || isEmailVerified(user)) return false;
  return isAdminAccount(user);
}
