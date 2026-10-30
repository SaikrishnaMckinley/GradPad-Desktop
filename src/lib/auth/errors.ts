/** Map Supabase Auth errors to clearer user-facing copy. */
export function mapAuthErrorMessage(message: string, code?: string): string {
  if (code === "over_email_send_rate_limit") {
    return (
      "Supabase is trying to send verification emails and hit its send limit. " +
      "Turn off “Confirm email” under Supabase → Authentication → Providers → Email, " +
      "wait a minute, then try again."
    );
  }

  const lower = message.toLowerCase();

  if (lower.includes("email address") && lower.includes("invalid")) {
    return (
      "This email address was rejected by Supabase Auth. Some projects block generic " +
      "addresses (for example demo@…). Use a real inbox you control, or check " +
      "Supabase → Authentication → Email for domain restrictions."
    );
  }

  if (
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit")
  ) {
    return (
      "Supabase is trying to send verification emails and hit its send limit. " +
      "For instant signup without email, turn off “Confirm email” under " +
      "Supabase → Authentication → Sign in / Providers → Email, then try again in a minute."
    );
  }

  if (lower.includes("rate limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }

  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (lower.includes("password") && lower.includes("weak")) {
    return "Choose a stronger password (at least 8 characters).";
  }

  return message;
}
