import { Container, Typography, Box, Button, Divider, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobs } from '../api/jobsApi'
import { getMyApplications } from '../api/applicationsApi'
import JobCard from '../components/jobs/JobCard'
import ApplicationCard from '../components/applications/ApplicationCard'
import JobCardSkeleton from '../components/common/JobCardSkeleton'
import EmptyState from '../components/common/EmptyState'
import Reveal from '../components/common/Reveal'
import WorkIcon from '@mui/icons-material/Work'
import SendIcon from '@mui/icons-material/Send'

function Stat({ value, label, sub }) {
  return (
    <Box sx={{ px: { xs: 0, sm: 4 } }}>
      <Typography sx={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: '2.25rem', color: 'ink.main', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: 'ink.main' }}>{label}</Typography>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </Box>
  )
}

// Mirrors the loaded dashboard shape — headline, stat, then either card grid
// (organizations) or stacked application rows (individuals).
function DashboardSkeleton({ isOrg }) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Skeleton width={300} height={42} />
      <Skeleton width={250} height={22} sx={{ mt: 1.5 }} />
      <Box sx={{ mt: 4 }}>
        <Skeleton width={72} height={44} sx={{ borderRadius: 1 }} />
        <Skeleton width={120} height={18} sx={{ mt: 0.75 }} />
        <Skeleton width={150} height={16} sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton width="100%" height={1} sx={{ my: { xs: 4, md: 5 } }} />
      <Skeleton width={190} height={30} sx={{ mb: 2.5 }} />
      {isOrg ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(300px, 1fr))' },
            gap: 2.5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </Box>
      ) : (
        <Box sx={{ maxWidth: 720 }}>
          {[0, 1].map((i) => (
            <Box key={i} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Skeleton width="60%" height={24} />
                <Skeleton width={80} height={22} sx={{ borderRadius: 999 }} />
              </Box>
              <Skeleton width="85%" height={16} sx={{ mt: 1.5 }} />
              <Skeleton width="40%" height={16} sx={{ mt: 1 }} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myJobs, setMyJobs] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (user.user_type === 'organization') {
        const all = await getJobs()
        if (!cancelled) setMyJobs(all.filter((j) => j.posted_by === user.id))
      } else {
        const [apps, allJobs] = await Promise.all([getMyApplications(user.id), getJobs()])
        const jobTitles = Object.fromEntries(allJobs.map((j) => [j.id, j.title]))
        if (!cancelled) setMyApplications(apps.map((a) => ({ ...a, job_title: jobTitles[a.job_id] })))
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  if (loading) return <DashboardSkeleton isOrg={user.user_type === 'organization'} />

  const isOrg = user.user_type === 'organization'
  const items = isOrg ? myJobs : myApplications
  const pendingCount = myApplications.filter((a) => a.status === 'PENDING').length
  const openJobs = myJobs.filter((j) => j.status === 'OPEN').length

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Typography variant="h2" component="h1">
        Welcome back, {user.first_name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        {isOrg ? 'Here’s how your postings are doing.' : 'Here’s where your applications stand.'}
      </Typography>

      <Reveal once={false} sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap'}}>
        <Stat
          value={items.length}
          label={isOrg ? 'Jobs posted' : 'Applications sent'}
          sub={isOrg ? `${openJobs} still open` : `${pendingCount} awaiting review`}
        />
      </Reveal>

      <Divider sx={{ my: { xs: 4, md: 5 } }} />

      {isOrg ? (
        <Box>
          <Reveal once={false}>
            <Typography variant="h3" gutterBottom>Your posted jobs</Typography>
          </Reveal>
          {items.length === 0 ? (
            <Reveal delay={40}>
              <EmptyState
                icon={<WorkIcon />}
                title="You haven't posted any jobs yet"
                message="Describe the work, name the pay in rupees, and it goes live for gig-seekers near you."
                actionLabel="Post your first job"
                onAction={() => navigate('/post-job')}
              />
            </Reveal>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: 'none', p: 0, m: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(300px, 1fr))' },
                gap: 2.5,
              }}
            >
              {myJobs.map((job, i) => (
                <Reveal component="li" key={job.id} delay={(i % 6) * 70}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          <Reveal once={false}>
            <Typography variant="h3" gutterBottom>Your applications</Typography>
          </Reveal>
          {items.length === 0 ? (
            <Reveal delay={40}>
              <EmptyState
                icon={<SendIcon />}
                title="No applications yet"
                message="When you apply to a gig, its status and the organization's reply show up here."
                actionLabel="Browse open gigs"
                onAction={() => navigate('/jobs')}
              />
            </Reveal>
          ) : (
            <Box sx={{ maxWidth: 720 }}>
              {myApplications.map((app, i) => (
                <Reveal key={app.id} delay={(i % 6) * 70}>
                  <ApplicationCard application={app} jobTitle={app.job_title} />
                </Reveal>
              ))}
            </Box>
          )}
        </Box>
      )}

      {isOrg && items.length > 0 && (
        <Button component={Link} to="/post-job" variant="outlined" sx={{ mt: 4 }}>
          Post another job
        </Button>
      )}
    </Container>
  )
}
