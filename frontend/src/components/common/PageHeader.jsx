import { Box, Container, Typography } from '@mui/material'

// Page header used by app pages: plain h1 + one quiet line. No eyebrows.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Container disableGutters maxWidth={false}>
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  )
}
