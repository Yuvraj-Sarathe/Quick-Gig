import { Container, Typography, Chip, Box, Button, Divider, Alert, Card, CardContent, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getJobById } from '../api/jobsApi'
import { applyToJob } from '../api/applicationsApi'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import ApplicationForm from '../components/applications/ApplicationForm'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlaceIcon from '@mui/icons-material/Place'
import ClockIcon from '@mui/icons-material/Schedule'
import PaymentsIcon from '@mui/icons-material/Payments'
import EventIcon from '@mui/icons-material/Event'
import { payLabel } from '../utils/format'

function DetailSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Skeleton width={70} height={26} />
      <Box
        sx={{
          mt: { xs: 3, md: 4 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px' },
          gap: { xs: 4, md: 6 },
          alignItems: 'start',
        }}
      >
        <Box>
          <Skeleton width={110} height={30} sx={{ mb: 2 }} />
          <Skeleton width="88%" height={42} />
          <Skeleton width="52%" height={30} sx={{ mt: 1.5 }} />
          <Skeleton width="100%" height={1} sx={{ my: 4 }} />
          <Skeleton width="45%" height={28} sx={{ mb: 1.5 }} />
          <Skeleton width="100%" height={22} />
          <Skeleton width="96%" height={22} />
          <Skeleton width="70%" height={22} />
          <Box sx={{ mt: 5 }}>
            {['Location', 'Duration', 'Pay', 'Posted'].map((label) => (
              <Box key={label} sx={{ py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Skeleton width={70} height={16} />
                <Skeleton width={140} height={20} sx={{ mt: 0.75 }} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Skeleton width={120} height={38} />
              <Skeleton width="70%" height={18} sx={{ mt: 1 }} />
              <Skeleton width="100%" height={44} sx={{ mt: 2.5, borderRadius: 999 }} />
              <Skeleton width="90%" height={14} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}

function MetaItem({ icon, label, value }) {
  return (
    <Box sx={{ py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', '& svg': { fontSize: 17 } }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 0.5, color: 'ink.main', fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getJobById(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJob(null)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [id])

  const handleApply = async (coverLetter, files = []) => {
    setSubmitting(true)
    try {
      await applyToJob({
        job_id: job.id,
        applicant_id: user.id,
        cover_letter: coverLetter,
        // Demo build: file metadata only (name/size/type) — no uploads yet.
        application_files: files,
      })
      setMessage({ type: 'success', text: 'Application submitted — the organization will review it shortly.' })
      setModalOpen(false)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DetailSkeleton />
  if (!job) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <EmptyState
          icon={<PlaceIcon />}
          title="Job not found"
          message="This listing may have been taken down, or the link is off."
          actionLabel="Back to the board"
          onAction={() => navigate('/jobs')}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Button
        component={Link}
        to="/jobs"
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        sx={{ pl: 1.5, color: 'text.secondary', fontWeight: 500 }}
      >
        All gigs
      </Button>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2.5 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Box
        sx={{
          mt: { xs: 3, md: 4 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px' },
          gap: { xs: 4, md: 6 },
          alignItems: 'start',
        }}
      >
        {/* Main column */}
        <Box sx={{ minWidth: 0 }} className="qg-rise">
          <Chip label={job.category} sx={{ bgcolor: 'green.tint', color: 'green.dark', mb: 2 }} />
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {job.title}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography sx={{ color: 'ink.main', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
              {payLabel(job)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {job.duration_hours} hours · {job.is_remote ? 'Remote' : job.location}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h3" gutterBottom>About this gig</Typography>
          <Typography variant="body1" sx={{ maxWidth: '70ch', whiteSpace: 'pre-line' }}>
            {job.description}
          </Typography>

          <Box sx={{ mt: 5 }}>
            <MetaItem icon={<PlaceIcon />} label="Location" value={job.is_remote ? 'Remote' : job.location} />
            <MetaItem icon={<ClockIcon />} label="Duration" value={`${job.duration_hours} hours total`} />
            <MetaItem icon={<PaymentsIcon />} label="Pay" value={`${payLabel(job)} · ${job.pay_type === 'hourly' ? 'hourly rate' : 'flat rate for the job'}`} />
            <MetaItem icon={<EventIcon />} label="Posted" value={new Date(job.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} />
          </Box>
        </Box>

        {/* Sticky apply panel */}
        <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }} className="qg-rise qg-rise-1">
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: 'ink.main', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.01em' }}>
                {payLabel(job)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {job.duration_hours}-hour gig · {job.is_remote ? 'Remote' : job.location}
              </Typography>

              <Box sx={{ mt: 2.5 }}>
                {user ? (
                  user.id === job.posted_by ? (
                    <Alert severity="info" sx={{ bgcolor: 'green.faint', color: 'green.dark' }}>
                      This is your own posting.
                    </Alert>
                  ) : (
                    <Button variant="contained" size="large" fullWidth onClick={() => setModalOpen(true)}>
                      Apply now
                    </Button>
                  )
                ) : (
                  <Button variant="contained" size="large" fullWidth component={Link} to="/login">
                    Log in to apply
                  </Button>
                )}
              </Box>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                Applications are reviewed directly by the organization that posted this gig.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Apply to this job">
        <ApplicationForm onSubmit={handleApply} submitting={submitting} job={job} />
      </Modal>
    </Container>
  )
}
