/** User-facing copy when Supabase throttles auth emails (sign-in OTP, resend, etc.). */
export function formatAuthEmailError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("rate limit") ||
    m.includes("over_email_send_rate_limit") ||
    m.includes("email rate limit")
  ) {
    return "Too many emails sent—wait a few minutes and try again. Supabase limits auth emails per hour; use custom SMTP under Authentication → Emails to raise it.";
  }
  return message;
}
