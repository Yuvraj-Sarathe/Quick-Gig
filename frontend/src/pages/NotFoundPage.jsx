import { Container, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 4,
          borderRadius: '16px',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M17.5 6 9 18h5.5L14 26l8.5-12H17z" fill="#FAFBF9" />
        </svg>
      </Box>
      <Typography
        variant="h1"
        component="p"
        sx={{ fontSize: { xs: '4rem', md: '5.5rem' } }}
      >
        404
      </Typography>
      <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', fontWeight: 500 }}>
        That gig (or page) isn't on the board. It may have been taken down — or it was never posted.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
        <Button component={Link} to="/" variant="contained" size="large">
          Back home
        </Button>
        <Button component={Link} to="/jobs" variant="outlined" size="large">
          Browse gigs
        </Button>
      </Box>
    </Container>
  )
}
