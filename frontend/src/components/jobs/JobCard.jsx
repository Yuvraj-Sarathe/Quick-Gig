import { Card, CardContent, CardActionArea, Typography, Chip, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import PlaceIcon from '@mui/icons-material/Place'
import ClockIcon from '@mui/icons-material/Schedule'
import NearMeIcon from '@mui/icons-material/NearMe'
import { payLabel, timeAgo } from '../../utils/format'
import { formatDistance } from '../../utils/geo'

// Decisive info order — see PRODUCT.md principle 1: pay, place, time.
export default function JobCard({ job }) {
  return (
    <Card
      component="div"
      sx={{
        height: '100%',
        display: 'flex',
        transition: 'transform .16s, border-color .16s, box-shadow .16s',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'line.hover',
          boxShadow: 'var(--qg-card-shadow)',
          '& .qg-card-cta': { color: 'green.bright', '& svg': { transform: 'translateX(2px)' } },
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/jobs/${job.id}`}
        sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
      >
        <CardContent sx={{ p: 2.5, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {job.image_url && (
            <Box
              component="img"
              src={job.image_url}
              alt={job.title}
              loading="lazy"
              sx={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                width: '100%',
                height: 150,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Chip
              label={job.category}
              size="small"
              sx={{ bgcolor: 'green.tint', color: 'green.dark', height: 24 }}
            />
            <Typography sx={{ color: 'ink.main', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              {payLabel(job)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom component="h3">
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="qg-line-clamp-2" sx={{ mt: -0.5 }}>
              {job.description}
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', columnGap: 1.75, rowGap: 0.5, flexWrap: 'wrap', color: 'text.secondary' }}>
            <Box className="qg-meta-item">
              <PlaceIcon fontSize="small" />
              <Typography variant="body2">{job.is_remote ? 'Remote' : job.location}</Typography>
            </Box>
            <Box className="qg-meta-item">
              <ClockIcon fontSize="small" />
              <Typography variant="body2">{job.duration_hours} hr</Typography>
            </Box>
            {typeof job.distance_km === 'number' && formatDistance(job.distance_km) && (
              <Box className="qg-meta-item">
                <NearMeIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'green.dark' }}>
                  {formatDistance(job.distance_km)}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
              {timeAgo(job.created_at)}
            </Typography>
          </Box>

          <Box
            className="qg-card-cta"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'green.dark', fontWeight: 600, fontSize: '0.9rem', transition: 'color .16s' }}
          >
            View details
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transition: 'transform .16s cubic-bezier(0.22, 1, 0.36, 1)' }}>
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
