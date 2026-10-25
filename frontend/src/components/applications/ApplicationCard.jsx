import { Card, CardContent, Typography, Chip, Box, Link as MuiLink, Divider } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import { timeAgo, formatBytes } from '../../utils/format'
import { buildStatusChips } from '../../theme'

export default function ApplicationCard({ application, jobTitle }) {
  const { palette } = useTheme()
  const statusStyles = buildStatusChips(palette.mode)
  const chipStyle = statusStyles[application.status] || statusStyles.WITHDRAWN
  const files = application.files || []

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'transform .16s, border-color .16s, box-shadow .16s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--qg-card-shadow)',
          '& .qg-app-cta': { color: 'green.bright', '& svg': { transform: 'translateX(2px)' } },
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ lineHeight: 1.35 }}>
            <MuiLink
              component={Link}
              to={`/jobs/${application.job_id}`}
              sx={{ color: 'inherit', '&:hover': { color: 'green.bright' } }}
            >
              {jobTitle || `Job #${application.job_id}`}
            </MuiLink>
          </Typography>
          <Chip
            label={application.status.charAt(0) + application.status.slice(1).toLowerCase()}
            size="small"
            sx={{ bgcolor: chipStyle.bg, color: chipStyle.color, fontWeight: 600, height: 24 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
          {application.cover_letter}
        </Typography>

        {files.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', flexWrap: 'wrap' }}>
            <AttachFileIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">
              {files.map((f) => `${f.name} (${'size' in f ? formatBytes(f.size) : 'file'})`).join(' · ')}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Applied {new Date(application.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {timeAgo(application.applied_at)}
          </Typography>
          <Box className="qg-app-cta" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'green.dark', fontWeight: 600, fontSize: '0.85rem', transition: 'color .16s' }}>
            View gig
            <ArrowForwardIcon sx={{ fontSize: 14, transition: 'transform .16s cubic-bezier(0.22, 1, 0.36, 1)' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
