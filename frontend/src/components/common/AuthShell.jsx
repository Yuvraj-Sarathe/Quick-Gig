import { Box, Container, Typography, Button, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Navbar'
import { CATEGORY_OPTIONS } from '../../utils/constants'

// Split auth layout: brand panel (md+) | centered form column.
export default function AuthShell({ heading, subtitle, children, footer }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.15fr' }, minHeight: { md: 'calc(100vh - 65px)' } }}>
      {/* Brand panel — same committed green as the landing hero */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'paper.main',
          p: { md: 6, lg: 8 },
        }}
      >
        <Wordmark variant="light" />
        <Box>
          <Typography
            className="qg-rise"
            sx={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              fontSize: '2.25rem',
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              maxWidth: 380,
            }}
          >
            Get to work faster.
          </Typography>
          <Typography
            className="qg-rise qg-rise-1"
            variant="body1"
            sx={{ mt: 2, maxWidth: 340, color: '#E9F3EA', fontWeight: 500 }}
          >
            Apply to gigs around Bhopal — MP Nagar to Kolar Road — or post one and let the
            neighborhood come to you.
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            className="qg-rise qg-rise-2"
            sx={{ mt: 3.5, flexWrap: 'wrap', gap: 1 }}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <Typography
                key={c}
                variant="caption"
                sx={{ px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'rgba(250, 251, 249, 0.14)', fontWeight: 600 }}
              >
                {c}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: '#E9F3EA' }}>
          Demo build — listings and accounts are sample data.
        </Typography>
      </Box>

      {/* Form column */}
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 420, mx: { xs: 'auto', md: 0 }, width: '100%' }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
            <Wordmark />
          </Box>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.25rem' } }}>
            {heading}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              {subtitle}
            </Typography>
          )}
          {children}
          {footer && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              {footer}
            </Typography>
          )}
          <Button
            component={Link}
            to="/"
            sx={{ mt: 2, px: 0, fontWeight: 500, color: 'text.secondary', '&:hover': { bgcolor: 'transparent', color: 'green.dark' } }}
          >
            ← Back to home
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
