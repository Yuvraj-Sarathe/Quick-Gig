import { Box, TextField, Button, Alert, Link as MuiLink, InputAdornment } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/common/AuthShell'
import GoogleButton from '../components/auth/GoogleButton'
import AuthDivider from '../components/auth/AuthDivider'
import { supabaseConfigHint } from '../lib/supabase'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      heading="Welcome back"
      subtitle="Log in to apply for gigs or manage the ones you've posted."
      footer={<>Don't have an account? <MuiLink component={Link} to="/register" sx={{ color: 'green.dark', fontWeight: 600 }}>Create one</MuiLink></>}
    >
      {!isConfigured && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          Sign-in isn't connected yet. {supabaseConfigHint}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <GoogleButton label="Continue with Google" returnTo="/dashboard" />

      <AuthDivider />

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 19, color: 'text.secondary' }} /></InputAdornment>,
          }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 19, color: 'text.secondary' }} /></InputAdornment>,
          }}
        />
        <Button type="submit" variant="contained" fullWidth size="large" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </Button>
      </Box>
    </AuthShell>
  )
}
