import { Container, Avatar, Typography, Box, Chip, Paper, Rating, useTheme } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import StarIcon from '@mui/icons-material/StarRate'
import { buildColors } from '../theme'

function DetailRow({ label, value }) {
  return (
    <Box sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: 'ink.main', fontWeight: 500, whiteSpace: 'pre-line' }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const k = buildColors(useTheme().palette.mode)
  const hasRating = Number(user.rating) > 0

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
      <Paper sx={{ p: { xs: 3, sm: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={user.avatar_url || undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'primary.main',
              fontSize: 30,
              fontWeight: 600,
              border: '3px solid',
              borderColor: 'green.tint',
            }}
          >
            {user.first_name?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h2" component="h1" sx={{ fontSize: '1.75rem', lineHeight: 1.2 }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={user.user_type === 'organization' ? 'Organization' : 'Gig-seeker'}
                size="small"
                sx={{ bgcolor: 'green.tint', color: 'green.dark', height: 24 }}
              />
              {user.location && (
                <Typography variant="body2" color="text.secondary">{user.location}</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          {hasRating ? (
            <Box sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Rating</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: 'ink.main', fontWeight: 700, fontSize: '1.25rem' }}>
                  {Number(user.rating).toFixed(1)}
                </Typography>
                <Rating
                  value={Number(user.rating)}
                  precision={0.1}
                  readOnly
                  size="small"
                  icon={<StarIcon sx={{ fontSize: 18, color: k.amberDark }} />}
                  emptyIcon={<StarIcon sx={{ fontSize: 18, color: 'divider' }} />}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Rating</Typography>
              <Typography variant="body2" sx={{ color: 'ink.main', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <StarIcon sx={{ fontSize: 16, color: 'divider' }} /> No rating yet — it appears after your first completed gig.
              </Typography>
            </Box>
          )}
          <DetailRow label="Bio" value={user.bio} />
          <DetailRow label="Email" value={user.email} />
        </Box>
      </Paper>
    </Container>
  )
}
