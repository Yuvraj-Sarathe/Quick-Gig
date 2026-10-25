import { Box, CircularProgress } from '@mui/material'

export default function Spinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
      <CircularProgress size={30} thickness={4.5} sx={{ color: 'primary.main' }} />
    </Box>
  )
}
