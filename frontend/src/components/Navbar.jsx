import { AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem, ListItemIcon, Container, IconButton, Typography, Divider } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLayoutEffect, useRef, useState } from 'react'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import WorkIcon from '@mui/icons-material/Work'
import MenuIcon from '@mui/icons-material/Menu'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

export function Wordmark({ variant = 'dark' }) {
  return (
    <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M17.5 6 9 18h5.5L14 26l8.5-12H17z" fill="#FAFBF9" />
        </svg>
      </Box>
      <Typography
        sx={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          fontSize: '1.3rem',
          letterSpacing: '-0.01em',
          color: variant === 'light' ? '#FAFBF9' : 'ink.main',
        }}
      >
        QuickGig
      </Typography>
    </Box>
  )
}

export default function Navbar({ mode = 'light', onToggleMode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const appBarRef = useRef(null)

  // Publish the real navbar height so full-height pages (the feed) can size
  // themselves exactly — never hardcode 60/64px again.
  useLayoutEffect(() => {
    const el = appBarRef.current
    if (!el) return undefined
    const apply = () => {
      document.documentElement.style.setProperty(
        '--qg-nav-h',
        `${Math.round(el.getBoundingClientRect().height)}px`
      )
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleLogout = () => {
    logout()
    setAnchorEl(null)
    navigate('/')
  }

  const navLinks = (
    <>
      <Button component={Link} to="/jobs" sx={{ color: 'text.primary', fontWeight: 500 }}>Browse Jobs</Button>
      <Button component={Link} to="/feed" sx={{ color: 'text.primary', fontWeight: 500 }}>Feed</Button>
      {user && <Button component={Link} to="/dashboard" sx={{ color: 'text.primary', fontWeight: 500 }}>Dashboard</Button>}
    </>
  )

  return (
    <AppBar ref={appBarRef}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1, minHeight: { xs: 60, sm: 64 } }}>
          <Wordmark />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Theme toggle */}
            <IconButton
              onClick={onToggleMode}
              sx={{ color: 'text.secondary', display: { xs: 'none', md: 'inline-flex' } }}
              aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              {navLinks}
              {user ? (
                <>
                  <Button component={Link} to="/post-job" variant="outlined" startIcon={<WorkIcon sx={{ fontSize: 18 }} />}>
                    Post a Job
                  </Button>
                  <Avatar
                    component="button"
                    src={user.avatar_url || undefined}
                    sx={{
                      cursor: 'pointer', bgcolor: 'primary.main', width: 36, height: 36,
                      ml: 0.5, fontSize: '0.95rem', fontWeight: 600,
                      fontFamily: 'inherit', border: '2px solid', borderColor: 'green.tint',
                    }}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                    aria-label="Account menu"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    {user.first_name?.[0]}
                  </Avatar>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 1.5, py: 1 }}>
                      <Typography variant="subtitle2">{user.first_name} {user.last_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                      <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={{ color: 'text.primary', fontWeight: 500 }}>Log In</Button>
                  <Button component={Link} to="/register" variant="contained">Sign Up</Button>
                </>
              )}
            </Box>

            {/* Mobile menu */}
            <IconButton
              sx={{ display: { md: 'none' }, color: 'text.primary' }}
              aria-label="Open menu"
              aria-haspopup="true"
              onClick={(e) => setMobileOpen(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileOpen}
              open={Boolean(mobileOpen)}
              onClose={() => setMobileOpen(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{ display: { md: 'none' } }}
            >
              <MenuItem
                onClick={() => {
                  setMobileOpen(null)
                  onToggleMode?.()
                }}
              >
                <ListItemIcon>{mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}</ListItemIcon>
                {mode === 'dark' ? 'Light mode' : 'Dark mode'}
              </MenuItem>
              <Divider />
              <MenuItem component={Link} to="/jobs" onClick={() => setMobileOpen(null)}>Browse Jobs</MenuItem>
              <MenuItem component={Link} to="/feed" onClick={() => setMobileOpen(null)}>Gig Feed</MenuItem>
              {user ? (
                <>
                  <MenuItem component={Link} to="/post-job" onClick={() => setMobileOpen(null)}>Post a Job</MenuItem>
                  <MenuItem component={Link} to="/dashboard" onClick={() => setMobileOpen(null)}>Dashboard</MenuItem>
                  <MenuItem component={Link} to="/profile" onClick={() => setMobileOpen(null)}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={Link} to="/login" onClick={() => setMobileOpen(null)}>Log In</MenuItem>
                  <MenuItem component={Link} to="/register" onClick={() => setMobileOpen(null)}>Sign Up</MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
