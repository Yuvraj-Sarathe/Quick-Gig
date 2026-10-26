import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Skeleton } from '@mui/material'
import AuthShell from '../components/common/AuthShell'
import { useAuth } from '../context/AuthContext'
import { clearOauthIntent, isSupabaseConfigured, readOauthIntent, supabaseConfigHint } from '../lib/supabase'

// Google (and Supabase email-confirmation links) land here with a one-time
// code. Exchange it exactly once, then hand off to the app.
export default function AuthCallbackPage() {
  const { completeOauthSignIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const reason =
      query.get('error_description') ||
      hash.get('error_description') ||
      query.get('error') ||
      hash.get('error')
    const code = query.get('code')

    // Drop the one-time code so a refresh can't replay it.
    window.history.replaceState(null, '', window.location.pathname)

    if (reason) {
      setError(reason.replace(/\+/g, ' '))
      return
    }
    if (!isSupabaseConfigured) {
      setError(supabaseConfigHint)
      return
    }
    if (!code) {
      setError('That sign-in link is missing its code. Start again from the login page.')
      return
    }

    const intent = readOauthIntent()
    completeOauthSignIn({ code, userType: intent?.userType })
      .then(() => {
        clearOauthIntent()
        navigate(intent?.returnTo || '/dashboard', { replace: true })
      })
      .catch((err) => setError(err.message || 'We could not finish signing you in.'))
  }, [completeOauthSignIn, navigate])

  if (error) {
    return (
      <AuthShell heading="Sign-in didn't finish" subtitle="Nothing was changed on your account.">
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/login" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
          Back to log in
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell heading="Signing you in" subtitle="One moment while we set up your session.">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} aria-busy="true" aria-live="polite">
        <Skeleton variant="rounded" height={46} />
        <Skeleton variant="rounded" height={46} />
        <Skeleton variant="rounded" height={46} width="60%" />
      </Box>
    </AuthShell>
  )
}
