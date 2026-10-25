import { Box, TextField, Button, Alert, Link as MuiLink, Typography, ToggleButtonGroup, ToggleButton, FormHelperText } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/common/AuthShell'
import GoogleButton from '../components/auth/GoogleButton'
import AuthDivider from '../components/auth/AuthDivider'
import { supabaseConfigHint } from '../lib/supabase'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', user_type: 'individual', location: '', bio: ''
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const { register, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await register(form)
      if (result.needsConfirmation) {
        setSentTo(result.email)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        heading="Check your email"
        subtitle={`We sent a confirmation link to ${sentTo}.`}
        footer={<>Already confirmed? <MuiLink component={Link} to="/login" sx={{ color: 'green.dark', fontWeight: 600 }}>Log in</MuiLink></>}
      >
        <Alert severity="success">
          Open that link to finish creating your account. Nothing else is needed — your role and details are already saved.
        </Alert>
        <Button component={Link} to="/login" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
          Go to log in
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      heading="Create your account"
      subtitle="One account, either side of the fence — pick what you came for."
      footer={<>Already have an account? <MuiLink component={Link} to="/login" sx={{ color: 'green.dark', fontWeight: 600 }}>Log in</MuiLink></>}
    >
      {!isConfigured && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          Sign-up isn't connected yet. {supabaseConfigHint}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <ToggleButtonGroup
        value={form.user_type}
        exclusive
        fullWidth
        sx={{ mb: 1 }}
        onChange={(e, val) => val && setForm({ ...form, user_type: val })}
      >
        <ToggleButton
          value="individual"
          sx={{ alignItems: 'flex-start', textAlign: 'left', py: 1.5, px: 2, borderRadius: '12px 0 0 12px' }}
        >
          <Box>
            <Typography variant="subtitle2">I'm looking for work</Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 500, color: 'inherit', opacity: 0.75 }}>
              Browse gigs and apply near you
            </Typography>
          </Box>
        </ToggleButton>
        <ToggleButton
          value="organization"
          sx={{ alignItems: 'flex-start', textAlign: 'left', py: 1.5, px: 2, borderRadius: '0 12px 12px 0' }}
        >
          <Box>
            <Typography variant="subtitle2">I'm an organization</Typography>
            <Typography variant="caption" display="block" sx={{ fontWeight: 500, color: 'inherit', opacity: 0.75 }}>
              Post gigs and hire locals
            </Typography>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
      <FormHelperText sx={{ mb: 2.5, ml: 0.5 }}>
        This sets your dashboard and whether you can post gigs.
      </FormHelperText>

      <GoogleButton label="Sign up with Google" userType={form.user_type} returnTo="/dashboard" />

      <AuthDivider />

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
          <TextField label="First name" fullWidth required autoComplete="given-name" value={form.first_name} onChange={handleChange('first_name')} />
          <TextField label="Last name" fullWidth required autoComplete="family-name" value={form.last_name} onChange={handleChange('last_name')} />
        </Box>
        <TextField label="Email" type="email" fullWidth required autoComplete="email" value={form.email} onChange={handleChange('email')} sx={{ mb: 2.5 }} />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          autoComplete="new-password"
          helperText="6+ characters"
          value={form.password}
          onChange={handleChange('password')}
          sx={{ mb: 2.5 }}
        />
        <TextField
          label="Location"
          fullWidth
          autoComplete="address-level2"
          placeholder="Kolar Road, Bhopal"
          helperText="Helps match you with gigs nearby."
          value={form.location}
          onChange={handleChange('location')}
          sx={{ mb: 3 }}
        />
        <Button type="submit" variant="contained" fullWidth size="large" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </Box>
    </AuthShell>
  )
}
