import { Container, Typography, Box, Alert } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { getJobs } from '../api/jobsApi'
import JobCard from '../components/jobs/JobCard'
import JobFilters from '../components/jobs/JobFilters'
import JobCardSkeleton from '../components/common/JobCardSkeleton'
import EmptyState from '../components/common/EmptyState'
import Reveal from '../components/common/Reveal'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import { distanceToJob, NEAR_KM } from '../utils/geo'

export default function JobsListPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', category: '', remoteOnly: false })

  const [nearMe, setNearMe] = useState(false)
  const [nearMeStatus, setNearMeStatus] = useState('idle') // idle | locating | on | denied | unsupported
  const [userCoords, setUserCoords] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getJobs(filters).then((data) => {
      if (!cancelled) {
        setJobs(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [filters])

  const toggleNearMe = () => {
    if (nearMe) {
      setNearMe(false)
      setNearMeStatus('idle')
      return
    }
    if (!('geolocation' in navigator)) {
      setNearMeStatus('unsupported')
      return
    }
    if (userCoords) {
      setNearMe(true)
      setNearMeStatus('on')
      return
    }
    setNearMeStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMe(true)
        setNearMeStatus('on')
      },
      () => setNearMeStatus('denied'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    )
  }

  // Sort + filter by straight-line distance to the user's location.
  const nearMeOn = nearMe && nearMeStatus === 'on'
  const visibleJobs = useMemo(() => {
    if (loading || !nearMeOn || !userCoords) return jobs
    return jobs
      .map((job) => ({ ...job, distance_km: distanceToJob(job, userCoords) }))
      .filter((job) => job.distance_km != null && job.distance_km <= NEAR_KM)
      .sort((a, b) => a.distance_km - b.distance_km)
  }, [jobs, loading, nearMeOn, userCoords])

  const countLine = () => {
    if (loading) return '\u00A0'
    const list = nearMeOn ? visibleJobs : jobs
    if (list.length === 0) return '\u00A0'
    const plural = list.length === 1 ? '' : 's'
    if (nearMeOn) {
      return `${list.length} gig${plural} within ${NEAR_KM} km of you · sorted by distance`
    }
    return `${list.length} gig${plural} open right now · pay listed on every one`
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Typography variant="h2" component="h1">
        Browse gigs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        {countLine()}
      </Typography>

      <JobFilters
        filters={filters}
        setFilters={setFilters}
        sx={{ mt: 3 }}
        nearMe={nearMe}
        nearMeStatus={nearMeStatus}
        onToggleNearMe={toggleNearMe}
      />

      {nearMeStatus === 'denied' && (
        <Alert severity="warning" sx={{ mt: -1, mb: 3 }}>
          We couldn't get your location. Allow location access in your browser, then tap “Gigs near me” again.
        </Alert>
      )}
      {nearMeStatus === 'unsupported' && (
        <Alert severity="info" sx={{ mt: -1, mb: 3 }}>
          Your browser doesn't support location detection — browse all gigs below.
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(300px, 1fr))' },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </Box>
      ) : visibleJobs.length === 0 ? (
        <Reveal delay={40}>
          {nearMeOn ? (
            <EmptyState
              icon={<LocationCityIcon />}
              title={`No gigs within ${NEAR_KM} km of you`}
              message="New gigs are posted every day. Show everything on the board, or check back soon."
              actionLabel="Show all gigs"
              onAction={toggleNearMe}
            />
          ) : (
            <EmptyState
              icon={<SearchOffIcon />}
              title="No gigs match your filters"
              message="Try a different category, allow non-remote gigs, or clear the search to see everything on the board."
              actionLabel="Clear filters"
              onAction={() => setFilters({ search: '', category: '', remoteOnly: false })}
            />
          )}
        </Reveal>
      ) : (
        <Box
          component="ul"
          role="list"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(300px, 1fr))' },
            gap: 2.5,
          }}
        >
          {visibleJobs.map((job, i) => (
            <Reveal component="li" key={job.id} delay={(i % 6) * 70}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </Box>
      )}

      {nearMeOn && visibleJobs.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          Sorted by straight-line distance — check the gig's listed area before you travel.
        </Typography>
      )}
    </Container>
  )
}
