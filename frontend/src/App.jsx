import { BrowserRouter, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { buildTheme } from './theme'
import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/common/Footer'
import AppRouter from './Router'

// The reel feed owns the whole viewport, so it renders without the footer
// (which would otherwise add a page scrollbar under a full-height scroller).
function Shell({ mode, onToggleMode }) {
  const { pathname } = useLocation()
  const immersive = pathname.startsWith('/feed')
  return (
    <>
      <Navbar mode={mode} onToggleMode={onToggleMode} />
      <AppRouter />
      {!immersive && <Footer />}
    </>
  )
}

export default function App() {
  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  // URL override (?light=1 / ?dark=1) — applied once, then stripped from the
  // address bar so the link stays shareable as plain "/".
  const forcedMode = (() => {
    try {
      const q = new URLSearchParams(window.location.search)
      return q.get('light') === '1' ? 'light' : q.get('dark') === '1' ? 'dark' : null
    } catch {
      return null
    }
  })()

  const [mode, setModeRaw] = useState(() => {
    try {
      return localStorage.getItem('quickgig_theme') === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })
  if (forcedMode && mode !== forcedMode) {
    setModeRaw(forcedMode)
    if (window.history?.replaceState) window.history.replaceState(null, '', window.location.pathname)
  }
  const setMode = setModeRaw

  const theme = useMemo(() => buildTheme(mode), [mode])

  // Keep browser-level surfaces (scrollbars, selection) in sync from first paint;
  // index.html already sets data-mode pre-paint for dark users.
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem('quickgig_theme', mode)
    } catch {
      /* private mode — theme just doesn't persist */
    }
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Shell mode={mode} onToggleMode={toggleMode} />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
