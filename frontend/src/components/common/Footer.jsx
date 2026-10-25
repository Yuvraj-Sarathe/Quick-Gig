import { Box, Container, Typography, Link as MuiLink } from '@mui/material'
import { Link } from 'react-router-dom'
import { Wordmark } from '../Navbar'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'green.tint', mt: 8 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 6 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 8 }, justifyContent: 'space-between' }}>
          <Box sx={{ maxWidth: 320 }}>
            <Wordmark />
            <Typography variant="body2" sx={{ mt: 1.5, color: 'green.dark' }}>
              Short-term gigs posted by real organizations across Bhopal. Pick up work — or the perfect hire — in minutes.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'green.dark', mb: 1.5 }}>Explore</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/jobs" sx={{ color: 'green.dark', fontWeight: 600, fontSize: 14 }}>Browse Jobs</MuiLink>
              <MuiLink component={Link} to="/register" sx={{ color: 'green.dark', fontWeight: 600, fontSize: 14 }}>Create Account</MuiLink>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'green.dark', mb: 1.5 }}>For organizations</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/post-job" sx={{ color: 'green.dark', fontWeight: 600, fontSize: 14 }}>Post a Job</MuiLink>
              <MuiLink component={Link} to="/login" sx={{ color: 'green.dark', fontWeight: 600, fontSize: 14 }}>Log In</MuiLink>
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', color: 'green.dark' }}>
          © {new Date().getFullYear()} QuickGig — demo build. Listings and accounts on this deployment are sample data.
        </Typography>
      </Container>
    </Box>
  )
}
