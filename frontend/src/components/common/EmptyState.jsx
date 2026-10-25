import { Box, Typography, Button } from '@mui/material'

// Honest empty state: tinted disc icon + title + one line + optional action.
export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 14,
        bgcolor: 'transparent',
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            bgcolor: 'greenFaint',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'success.dark',
            '& svg': { fontSize: 26 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
        {message}
      </Typography>
      {actionLabel && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
