import { supabase } from "@/integrations/supabase/client";

/** Set in sessionStorage after password step so the OTP page knows which inbox to reference. */
export const PENDING_ADMIN_OTP_EMAIL_KEY = "pending_admin_otp_email";

export async function sendAdminLoginOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${window.location.origin}/crestline/admin/listings`,
    },
  });
}

export async function verifyAdminLoginOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "email",
  });
}
