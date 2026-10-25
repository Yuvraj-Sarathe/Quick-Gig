import { Box, Container, Typography, Button, Chip, Divider } from '@mui/material'
import { Link } from 'react-router-dom'
import JobCard from '../components/jobs/JobCard'
import Reveal from '../components/common/Reveal'
import { CATEGORY_OPTIONS } from '../utils/constants'

const sampleJob = {
  id: 101,
  title: 'Event setup crew needed',
  description: 'Help set up tables, chairs and decor for a wedding near Lalghati. Two people needed, supervisor on site, lunch provided.',
  category: 'Events',
  location: 'Lalghati, Bhopal',
  is_remote: false,
  pay_amount: 1100,
  pay_type: 'fixed',
  duration_hours: 5,
  status: 'OPEN',
  created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
}

const steps = [
  {
    n: '1',
    title: 'Post or browse',
    desc: 'Organizations post a gig in under two minutes — title, pay, and when they need it on the table. Everyone else scrolls what’s nearby.',
  },
  {
    n: '2',
    title: 'Apply in one tap',
    desc: 'See a gig that fits your week? Send a short note. Amount and hours are listed up front in rupees, so there’s nothing to dig for.',
  },
  {
    n: '3',
    title: 'Work, then get paid',
    desc: 'Show up, do the job, mark it complete. Every finished gig builds the rating that gets you picked again.',
  },
]

export default function LandingPage() {
  return (
    <Box>
      {/* Hero — committed brand surface */}
      <Box sx={{ bgcolor: 'primary.main', color: 'paper.main' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
              minHeight: { md: 560 },
            }}
          >
            <Box className="qg-rise">
              <Typography
                variant="h1"
                sx={{ color: 'paper.main', fontSize: { xs: '2.375rem', md: 'clamp(2.6rem, 4.5vw, 3.75rem)' } }}
              >
                Gigs worth showing&nbsp;up&nbsp;for.
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  mt: 2.5,
                  maxWidth: 540,
                  lineHeight: 1.55,
                  fontWeight: 500,
                  color: '#E9F3EA',
                }}
              >
                QuickGig connects people across Bhopal with short-term jobs posted by real
                local organizations — a courier run in MP Nagar, wedding setup in Lalghati,
                a weekend deep-clean in Arera Colony. Post yours or pick one up in minutes.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/jobs"
                  size="large"
                  sx={{ bgcolor: 'paper.main', color: 'primary.dark', '&:hover': { bgcolor: '#E9F3EA' } }}
                >
                  Browse gigs
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  size="large"
                  variant="outlined"
                  sx={{ color: 'paper.main', borderColor: 'rgba(250, 251, 249, 0.5)', '&:hover': { borderColor: 'paper.main', bgcolor: 'rgba(250, 251, 249, 0.08)' } }}
                >
                  Get started free
                </Button>
              </Box>

              <Typography variant="body2" sx={{ mt: 3, color: '#E9F3EA', fontWeight: 500 }}>
                Free to join · Pay listed in rupees · Work close to home
              </Typography>
            </Box>

            {/* Real product artifact as the hero specimen */}
            <Box className="qg-rise qg-rise-1" sx={{ maxWidth: 400, mx: { xs: 'auto', md: 0 }, width: '100%' }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'inline-block',
                  mb: 1.5,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 999,
                  color: 'primary.dark',
                  bgcolor: '#E9F3EA',
                  fontWeight: 600,
                }}
              >
                Sample listing · Bhopal
              </Typography>
              <Box sx={{ boxShadow: '0 24px 48px -24px rgba(12, 40, 22, 0.55)', borderRadius: '14px' }}>
                <JobCard job={sampleJob} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* How it works — a real sequence, so numbers earn their place */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
        <Typography variant="h2" component="h2" sx={{ maxWidth: 520 }}>
          How a gig actually works
        </Typography>

        <Box sx={{ mt: { xs: 5, md: 7 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, columnGap: 5, rowGap: 4 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} once={false} sx={{ borderTop: '2px solid', borderColor: 'ink.main', pt: 3 }}>
              <Typography
                sx={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: '2.5rem', color: 'green.bright', lineHeight: 1 }}
              >
                {s.n}
              </Typography>
              <Typography variant="h3" sx={{ mt: 1.5 }}>{s.title}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 340 }}>
                {s.desc}
              </Typography>
            </Reveal>
          ))}
        </Box>
      </Container>

      <Divider />

      {/* Categories — real affordances into the browse flow */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Reveal once={false}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 2, justifyContent: 'space-between' }}>
            <Typography variant="h2" component="h2">Out there right now</Typography>
            <Button component={Link} to="/jobs" sx={{ fontWeight: 600, color: 'primary.dark' }}>
              Browse all gigs
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
            Every listing shows pay, hours and location up front — and one tap takes you to the application.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {CATEGORY_OPTIONS.map((cat) => (
              <Chip
                key={cat}
                component={Link}
                to="/jobs"
                clickable
                label={cat}
                sx={{
                  px: 1.5, py: 2, height: 40, fontSize: '0.95rem',
                  bgcolor: 'green.faint', color: 'green.dark', border: '1px solid', borderColor: 'divider',
                  '&:hover': { bgcolor: 'green.tint' },
                }}
              />
            ))}
          </Box>
        </Reveal>
      </Container>

      {/* Closing band */}
      <Box sx={{ bgcolor: 'primary.main' }}>
        <Container maxWidth="lg">
          <Reveal once={false} sx={{ py: { xs: 7, md: 9 }, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ maxWidth: 560 }}>
              <Typography variant="h2" component="h2" sx={{ color: 'paper.main' }}>
                Ready when you are.
              </Typography>
              <Typography variant="h6" component="p" sx={{ mt: 1.5, color: '#E9F3EA', fontWeight: 500 }}>
                Ninety seconds to an account. Either side of the fence.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/register"
                size="large"
                sx={{ bgcolor: 'paper.main', color: 'primary.dark', '&:hover': { bgcolor: '#E9F3EA' } }}
              >
                Create an account
              </Button>
              <Button component={Link} to="/jobs" size="large" variant="outlined" sx={{ color: 'paper.main', borderColor: 'rgba(250, 251, 249, 0.5)', '&:hover': { borderColor: 'paper.main' } }}>
                Browse gigs first
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Box>
    </Box>
  )
}
