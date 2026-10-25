import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getProfile, friendlyAuthError } from '../api/authApi'
import {
  supabase,
  isSupabaseConfigured,
  supabaseConfigHint,
  startGoogleSignIn,
  clearOauthIntent,
} from '../lib/supabase'

const AuthContext = createContext(null)

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigHint)
  return supabase
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // The profile always comes from the API, never from stale local storage.
  const refreshProfile = useCallback(async () => {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setUser(null)
      return null
    }
    const profile = await getProfile()
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        const profile = await refreshProfile()
        if (!cancelled && profile) setUser(profile)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    if (!supabase) return undefined
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null)
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [refreshProfile])

  const login = async (email, password) => {
    const client = requireSupabase()
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(friendlyAuthError(error))
    return refreshProfile()
  }

  const register = async (form) => {
    const client = requireSupabase()
    const { data, error } = await client.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        // Metadata is how the role reaches the Flask profile row.
        data: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          user_type: form.user_type,
          location: form.location.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(friendlyAuthError(error))
    if (!data.session) {
      // Project still requires email confirmation — say so instead of faking a login.
      return { needsConfirmation: true, email: form.email.trim() }
    }
    return { needsConfirmation: false, user: await refreshProfile() }
  }

  const loginWithGoogle = async ({ userType, returnTo = '/dashboard' } = {}) => {
    requireSupabase()
    await startGoogleSignIn({ userType, returnTo })
  }

  // Google (or a confirmation link) lands back on /auth/callback with a code.
  const completeOauthSignIn = async ({ code, userType }) => {
    const client = requireSupabase()
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (error) throw new Error(friendlyAuthError(error))
    if (userType) {
      // Picked on the register page. Metadata only — an existing profile keeps
      // the role it already has, because the API only reads this on creation.
      await client.auth.updateUser({ data: { user_type: userType } })
      // The API reads the role out of the access token, which still carries the
      // pre-update metadata until the session is refreshed.
      await client.auth.refreshSession()
    }
    const profile = await getProfile()
    setUser(profile)
    return profile
  }

  const logout = async () => {
    clearOauthIntent()
    setUser(null)
    try {
      await supabase?.auth.signOut()
    } catch {
      /* already signed out */
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        register,
        loginWithGoogle,
        completeOauthSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
