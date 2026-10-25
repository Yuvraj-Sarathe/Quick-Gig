import { api } from './client'

// The profile row the Flask API keeps for the signed-in Supabase identity.
// Called on boot and after every sign-in — it also provisions the row on first
// sign-in, so Google users don't need a separate "create account" step.
export async function getProfile() {
  const { user } = await api('/auth/me')
  return user
}

// Supabase errors are accurate but terse; this keeps the UI plain-spoken.
const FRIENDLY = [
  [/invalid login credentials/i, 'Email or password is incorrect.'],
  [/email not confirmed/i, 'Confirm your email first — the link is in your inbox.'],
  [/user already registered/i, 'That email already has an account. Log in instead.'],
  [/password should be at least/i, 'Use at least 6 characters for your password.'],
  [/unable to validate email|invalid format/i, "That email address doesn't look right."],
  [/rate limit|too many requests|email rate limit/i, 'Too many attempts — wait a minute and try again.'],
  [/provider is not enabled|unsupported provider/i, "Google sign-in isn't enabled in Supabase yet — turn it on under Authentication → Providers."],
  [/redirect.*not allowed/i, 'Add this site to Supabase → Authentication → URL Configuration, then try again.'],
]

export function friendlyAuthError(error) {
  const message = error?.message || String(error || '')
  for (const [pattern, text] of FRIENDLY) {
    if (pattern.test(message)) return text
  }
  return message || 'Something went wrong. Please try again.'
}
