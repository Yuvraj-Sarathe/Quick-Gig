// Supabase Auth is QuickGig's only identity source (Google + email/password).
// It lives in the browser; the Flask API verifies the access token server-side.
//
// Both values are public by design (they ship in the bundle). The project URL
// is what the backend needs too — see backend/.env.example.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabaseConfigHint =
  'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env (and SUPABASE_URL to backend/.env), then restart both servers. See README.md → Google & email sign-in.'

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // PKCE: the callback page exchanges the one-time code itself, which
        // keeps the round trip explicit and StrictMode-safe.
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'quickgig_supabase_auth',
      },
    })
  : null

export const OAUTH_CALLBACK_PATH = '/auth/callback'

export function oauthRedirectUrl() {
  return `${window.location.origin}${OAUTH_CALLBACK_PATH}`
}

// The role picked on the register page and where to land afterwards. sessionStorage
// survives the full-page Google round trip and stays scoped to this tab.
const INTENT_KEY = 'quickgig_oauth_intent'

export function rememberOauthIntent(intent) {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent))
  } catch {
    /* private mode — the callback just falls back to defaults */
  }
}

export function readOauthIntent() {
  try {
    return JSON.parse(sessionStorage.getItem(INTENT_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearOauthIntent() {
  try {
    sessionStorage.removeItem(INTENT_KEY)
  } catch {
    /* ignore */
  }
}

export async function startGoogleSignIn({ userType, returnTo = '/dashboard' } = {}) {
  if (!supabase) throw new Error(supabaseConfigHint)
  rememberOauthIntent({ userType, returnTo })
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: oauthRedirectUrl(),
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}
