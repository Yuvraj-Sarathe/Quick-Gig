// QuickGig theme — see DESIGN.md. Light + dark modes from one source.
import { createTheme } from '@mui/material'

const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)'
export { easeOut }

const sans = `'Work Sans', 'Segoe UI', system-ui, sans-serif`
const serif = `'Fraunces', Georgia, 'Times New Roman', serif`

// Mode-dependent color sets. Plain hex (MUI's darken()/lighten() math needs it).
export function buildColors(mode = 'light') {
  if (mode === 'dark') {
    return {
      bg: '#0F1711',
      surface: '#17211B',
      primary: '#217A44',
      primaryDark: '#1B6B3C',
      textBody: '#C7D2CA',
      textMuted: '#8FA096',
      ink: '#EDF3EE',
      line: '#263129',
      lineHover: '#3A4A40',
      greenDark: '#4CB473',   // "readable green" on dark surfaces
      greenBright: '#66C98F',
      greenTint: '#1A2E22',
      greenFaint: '#14231A',
      amber: '#B7791F',
      amberDark: '#D9A843',
      red: '#E07B6F',
      blue: '#7FA9DF',
      paper: '#FFFFFF',
      shadow: '0 8px 14px -10px rgba(0, 0, 0, 0.5)',
    }
  }
  return {
    bg: '#FAFBF9',
    surface: '#FFFFFF',
    primary: '#217A44',
    primaryDark: '#175C34',
    textBody: '#33413A',
    textMuted: '#5A6962',
    ink: '#1C231F',
    line: '#E2E8E3',
    lineHover: '#CBD8CF',
    greenDark: '#175C34',
    greenBright: '#217A44',
    greenTint: '#E7F2EA',
    greenFaint: '#F3F8F4',
    amber: '#B7791F',
    amberDark: '#8C5A10',
    red: '#C0392B',
    blue: '#2A6FDB',
    paper: '#FAFBF9',
    shadow: '0 8px 14px -10px rgba(28, 35, 31, 0.25)',
  }
}

// Status chip colors for ApplicationCard, per mode.
export function buildStatusChips(mode = 'light') {
  if (mode === 'dark') {
    return {
      PENDING:   { bg: 'rgba(183, 121, 31, 0.18)',  color: '#D9A843' },
      ACCEPTED:  { bg: 'rgba(76, 177, 115, 0.16)',  color: '#7FCE9F' },
      REJECTED:  { bg: 'rgba(224, 123, 111, 0.18)', color: '#E8978D' },
      COMPLETED: { bg: 'rgba(127, 169, 223, 0.18)', color: '#92B7E4' },
      WITHDRAWN: { bg: 'rgba(143, 160, 150, 0.16)', color: '#AEB9B2' },
    }
  }
  return {
    PENDING:   { bg: '#F6ECDC', color: '#7A4E12' },
    ACCEPTED:  { bg: '#E7F2EA', color: '#175C34' },
    REJECTED:  { bg: '#F9E4E1', color: '#8E2A20' },
    COMPLETED: { bg: '#E4EDF7', color: '#254F76' },
    WITHDRAWN: { bg: '#EDEFEA', color: '#4C554F' },
  }
}

export function buildTheme(mode = 'light') {
  const k = buildColors(mode)
  const dark = mode === 'dark'

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: k.primary, dark: k.primaryDark, contrastText: '#FFFFFF' },
      secondary: { main: k.primaryDark },
      background: { default: k.bg, paper: k.surface },
      text: { primary: k.textBody, secondary: k.textMuted },
      divider: k.line,
      error: { main: k.red },
      warning: { main: k.amber, dark: k.amberDark },
      info: { main: k.blue },
      success: { main: k.primary, dark: dark ? '#4CB473' : '#175C34' },
      // Custom groups so sx paths like `green.tint` / `ink.main` resolve.
      green: {
        main: k.primary,
        dark: k.greenDark,
        bright: k.greenBright,
        tint: k.greenTint,
        faint: k.greenFaint,
      },
      ink: { main: k.ink },
      line: { main: k.line, hover: k.lineHover },
      paper: { main: k.paper },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: sans,
      h1: {
        fontFamily: serif, fontWeight: 600, color: k.ink,
        fontSize: 'clamp(2.375rem, 4.5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.015em',
      },
      h2: {
        fontFamily: serif, fontWeight: 600, color: k.ink,
        fontSize: { xs: '1.75rem', sm: '2.25rem' }, lineHeight: 1.15, letterSpacing: '-0.01em',
      },
      h3: { fontWeight: 700, color: k.ink, fontSize: '1.375rem', lineHeight: 1.3 },
      h4: { fontWeight: 700, color: k.ink, fontSize: '1.75rem', lineHeight: 1.25 },
      h5: { fontWeight: 600, color: k.ink, fontSize: '1.375rem' },
      h6: { fontWeight: 600, color: k.ink, fontSize: '1.0625rem', letterSpacing: '-0.005em' },
      subtitle1: { fontWeight: 600, color: k.ink, fontSize: '1rem' },
      subtitle2: { fontWeight: 600, color: k.ink, fontSize: '0.875rem' },
      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      caption: { fontSize: '0.8rem', lineHeight: 1.5 },
      button: { fontWeight: 600, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@global': {
            'html, body': { backgroundColor: k.bg },
            'html': { colorScheme: mode },
          },
        },
      },
      MuiAppBar: {
        defaultProps: { position: 'sticky', elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: { backgroundColor: k.bg, borderBottom: `1px solid ${k.line}` },
        },
      },
      MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999, textTransform: 'none', fontWeight: 600,
            paddingLeft: 18, paddingRight: 18, transition: `all .16s ${easeOut}`,
          },
          sizeLarge: { paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10 },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none', backgroundColor: k.primaryDark },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: `1px solid ${k.line}`, borderRadius: 14, backgroundImage: 'none' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 14 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
          outlined: { borderColor: k.line },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: `box-shadow .16s ${easeOut}, border-color .16s ${easeOut}`,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: k.lineHover },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: k.primary, borderWidth: 1.5 },
          },
          notchedOutline: { borderColor: k.line },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontWeight: 500, color: k.textMuted } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 600, borderRadius: 10,
            borderWidth: 1, borderColor: k.line, color: k.textBody,
            '&.Mui-selected': { backgroundColor: k.greenTint, color: k.greenDark, borderColor: k.lineHover },
            '&:hover': { backgroundColor: k.greenFaint },
          },
        },
      },
      MuiDialog: {
        defaultProps: { PaperProps: { sx: { borderRadius: '16px' } } },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontWeight: 700, color: k.ink, fontSize: '1.25rem' } },
      },
    },
  })

  return theme
}
