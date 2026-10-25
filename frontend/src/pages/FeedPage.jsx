import { Alert, Avatar, Box, Button, Container, IconButton, Skeleton, Snackbar, Tooltip, Typography } from '@mui/material'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobsFeed } from '../api/jobsApi'
import { applyToJob } from '../api/applicationsApi'
import { payLabel } from '../utils/format'
import Modal from '../components/common/Modal'
import ApplicationForm from '../components/applications/ApplicationForm'
import EmptyState from '../components/common/EmptyState'
import GridViewIcon from '@mui/icons-material/GridView'
import PlaceIcon from '@mui/icons-material/Place'
import ClockIcon from '@mui/icons-material/Schedule'
import BoltIcon from '@mui/icons-material/Bolt'
import CheckIcon from '@mui/icons-material/Check'
import PeopleIcon from '@mui/icons-material/PeopleAlt'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import ArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif"

// Rendered cards stay bounded: the catalog loops forever, but the DOM doesn't.
const MAX_RENDERED = 21

function FeedHeader({ position, total }) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 2, md: 3 },
        py: { xs: 1, sm: 1.25 },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6">Gig feed</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          One gig per screen — scroll, swipe or use ↑ ↓. Apply without leaving.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        {total > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            aria-live="polite"
          >
            {position} / {total}
          </Typography>
        )}
        <Button
          component={Link}
          to="/jobs"
          variant="outlined"
          size="small"
          startIcon={<GridViewIcon sx={{ fontSize: 17 }} />}
        >
          Grid view
        </Button>
      </Box>
    </Box>
  )
}

// Round action in the right rail, TikTok/Reels style.
function RailAction({ label, icon, onClick, component, to, emphasis, disabled, tint }) {
  const button = (
    <IconButton
      component={component}
      to={to}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      sx={{
        width: 52,
        height: 52,
        color: '#fff',
        bgcolor: emphasis ? 'primary.main' : tint || 'rgba(255, 255, 255, 0.14)',
        border: emphasis ? 'none' : '1px solid rgba(255, 255, 255, 0.28)',
        backdropFilter: 'blur(10px)',
        transition: 'background-color .16s var(--ease-out), transform .16s var(--ease-out)',
        '&:hover': {
          bgcolor: emphasis ? 'primary.main' : 'rgba(255, 255, 255, 0.24)',
          filter: emphasis ? 'brightness(0.92)' : 'none',
          transform: 'translateY(-1px)',
        },
        '&.Mui-disabled': { color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.1)' },
      }}
    >
      {icon}
    </IconButton>
  )
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      {disabled ? button : <Tooltip title={label} placement="left">{button}</Tooltip>}
      <Typography
        sx={{
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 600,
          lineHeight: 1.2,
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function FeedCard({ job, index, onApply }) {
  const applied = Boolean(job.applied)
  const isOwn = Boolean(job.is_own)
  const closed = job.status !== 'OPEN'

  return (
    <Box
      component="article"
      aria-label={`${job.title} — ${payLabel(job)}`}
      sx={{
        position: 'relative',
        height: '100%',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        overflow: 'hidden',
        bgcolor: '#0C1410',
      }}
    >
      {/* Media canvas: the posted photo, or the editorial fallback tile */}
      {job.image_url ? (
        <Box
          component="img"
          src={job.image_url}
          alt=""
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 32%, #1B3A2A 0%, #101C15 58%, #0A120D 100%)',
          }}
        >
          <Typography
            aria-hidden="true"
            sx={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 'clamp(10rem, 38vh, 20rem)',
              lineHeight: 0.8,
              color: '#2E8B57',
              opacity: 0.42,
              userSelect: 'none',
            }}
          >
            {(job.category || '?').charAt(0)}
          </Typography>
        </Box>
      )}

      {/* Scrims: keeps the category chip and the caption legible over any photo */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(8,13,10,0.62) 0%, rgba(8,13,10,0.12) 20%, rgba(8,13,10,0) 42%, rgba(8,13,10,0.55) 70%, rgba(8,13,10,0.94) 100%)',
        }}
      />

      {/* Top bar: category + who posted it */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          p: { xs: 1.75, sm: 2 },
        }}
      >
        <Box
          sx={{
            px: 1.25,
            height: 26,
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: 'rgba(255, 255, 255, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            backdropFilter: 'blur(10px)',
            whiteSpace: 'nowrap',
          }}
        >
          {job.category}
        </Box>

        {job.org_name && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Avatar
              src={job.org_avatar_url || undefined}
              sx={{
                width: 26,
                height: 26,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#fff',
              }}
            >
              {job.org_name.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: '#fff', fontWeight: 600, textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}
            >
              {job.org_name}
              {typeof job.org_rating === 'number' && job.org_rating > 0
                ? ` · ★ ${job.org_rating.toFixed(1)}`
                : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Caption: title, pay, the three facts people scan for */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          pt: 7,
          pr: { xs: 9, sm: 9.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(2px, 0.6vh, 6px)',
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: SERIF,
            fontWeight: 600,
            color: '#fff',
            fontSize: 'clamp(1.3rem, 4.6vh, 2.05rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {job.title}
        </Typography>

        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 3.2vh, 1.45rem)',
            letterSpacing: '-0.01em',
          }}
        >
          {payLabel(job)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: 1.5,
            rowGap: 0.25,
            color: 'rgba(255, 255, 255, 0.84)',
            mt: 0.25,
          }}
        >
          <Box className="qg-meta-item">
            <PlaceIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {job.is_remote ? 'Remote' : job.location}
            </Typography>
          </Box>
          <Box className="qg-meta-item">
            <ClockIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {job.duration_hours} hr
            </Typography>
          </Box>
          <Box className="qg-meta-item">
            <PeopleIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {job.application_count ?? 0} applied
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action rail */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 8, sm: 12 },
          bottom: { xs: 16, sm: 22 },
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1.25, sm: 1.5 },
        }}
      >
        {isOwn ? (
          <RailAction label="Applicants" icon={<PeopleIcon />} component={Link} to="/dashboard" />
        ) : applied ? (
          <RailAction
            label="Applied"
            icon={<CheckIcon />}
            disabled
            tint="rgba(33, 122, 68, 0.85)"
          />
        ) : (
          <RailAction
            label={closed ? 'Closed' : 'Apply'}
            icon={<BoltIcon />}
            onClick={onApply}
            emphasis
            disabled={closed}
          />
        )}
        <RailAction label="Details" icon={<InfoIcon />} component={Link} to={`/jobs/${job.id}`} />
      </Box>
    </Box>
  )
}

function FeedSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--qg-nav-h, 64px))', overflow: 'hidden' }}>
      <FeedHeader position={0} total={0} />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', px: { xs: 0, sm: 2, md: 3 }, py: { xs: 0, sm: 2 } }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { xs: '100%', md: 520 },
            borderRadius: { xs: 0, sm: '18px' },
            overflow: 'hidden',
            bgcolor: '#0C1410',
          }}
        >
          <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, height: '100%', bgcolor: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
            <Skeleton width="72%" height={34} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
            <Skeleton width="30%" height={26} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.12)' }} />
            <Skeleton width="55%" height={18} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function FeedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const scrollerRef = useRef(null)
  const sentinelRef = useRef(null)
  const rafRef = useRef(0)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [windowStart, setWindowStart] = useState(0)
  const [activeDomIndex, setActiveDomIndex] = useState(0)

  const itemsRef = useRef([])
  const windowStartRef = useRef(0)
  const trimRef = useRef(0)
  const nextPageRef = useRef(1)
  const cycleRef = useRef(0) // unique key suffix each time the feed wraps
  const fetchingRef = useRef(false)
  const stoppedRef = useRef(false)

  const [applyingJob, setApplyingJob] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // The feed is the only scroller on the page while it's mounted.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || stoppedRef.current) return
    fetchingRef.current = true
    try {
      const page = nextPageRef.current
      const res = await getJobsFeed({ page })
      setTotal(res.total ?? 0)

      if (res.items.length > 0) {
        const suffix = cycleRef.current ? `-${cycleRef.current}` : ''
        const incoming = res.items.map((j) => ({ ...j, keySuffix: suffix }))

        // Keep the rendered list bounded: drop cards off the top once the
        // cycle has grown past MAX_RENDERED, then compensate scrollTop so the
        // card under the reader doesn't move.
        const renderedAfter = itemsRef.current.length + incoming.length - windowStartRef.current
        const excess = Math.max(0, renderedAfter - MAX_RENDERED)
        if (excess > 0) {
          trimRef.current = excess
          windowStartRef.current += excess
          setWindowStart(windowStartRef.current)
        }

        setItems((prev) => [...prev, ...incoming])
        nextPageRef.current = page + 1
        if (res.has_more) {
          cycleRef.current = 0 // back in fresh territory
        } else {
          // End of the catalog — the feed continues from page 1, forever.
          cycleRef.current += 1
          nextPageRef.current = 1
        }
      } else {
        stoppedRef.current = true // empty catalog; no loop possible
      }
    } catch (err) {
      setError(err.message)
      stoppedRef.current = true
    } finally {
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadMore().finally(() => setLoading(false))
  }, [loadMore])

  // Sentinel = a 1px row at the bottom of the scroller. The 120% bottom
  // rootMargin starts the next page roughly one screen early, so the reel
  // keeps wrapping even though the sentinel itself never enters the viewport.
  useEffect(() => {
    if (loading || !sentinelRef.current || !scrollerRef.current) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore()
      },
      { root: scrollerRef.current, threshold: 0, rootMargin: '0px 0px 120% 0px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loading, items.length, loadMore])

  // After a trim, restore the reading position (cards are uniform height).
  useLayoutEffect(() => {
    const el = scrollerRef.current
    const trimmed = trimRef.current
    if (!el || !trimmed) return
    trimRef.current = 0
    el.scrollTop = Math.max(0, el.scrollTop - trimmed * el.clientHeight)
  }, [windowStart])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const handleScroll = () => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const el = scrollerRef.current
      if (!el) return
      const index = Math.round(el.scrollTop / Math.max(1, el.clientHeight))
      setActiveDomIndex((prev) => (prev === index ? prev : index))
    })
  }

  const pageBy = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ top: direction * el.clientHeight, behavior: 'smooth' })
  }

  // Arrow keys page the reel — unless the reader is typing in the apply form.
  useEffect(() => {
    const onKey = (event) => {
      if (applyingJob) return
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const target = event.target
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
        return
      }
      event.preventDefault()
      pageBy(event.key === 'ArrowDown' ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyingJob])

  const markApplied = (jobId) => {
    setItems((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)))
  }

  const handleApply = async (coverLetter, files = []) => {
    setSubmitting(true)
    try {
      await applyToJob({
        job_id: applyingJob.id,
        applicant_id: user.id,
        cover_letter: coverLetter,
        application_files: files,
      })
      markApplied(applyingJob.id)
      setApplyingJob(null)
      setToast({ type: 'success', text: `Applied to "${applyingJob.title}" — keep scrolling.` })
    } catch (err) {
      setToast({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const visible = items.slice(windowStart)
  const absoluteIndex = windowStart + activeDomIndex
  const position = total > 0 ? (absoluteIndex % total) + 1 : Math.min(absoluteIndex + 1, items.length)
  const dotCount = Math.min(total, 8)
  const dotActive = dotCount > 0 ? Math.floor(((position - 1) / total) * dotCount) : 0

  if (loading) return <FeedSkeleton />

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - var(--qg-nav-h, 64px))',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <FeedHeader position={position} total={total} />

      {error ? (
        <Container maxWidth="sm" sx={{ my: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      ) : items.length === 0 ? (
        <Box sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', px: 2 }}>
          <Container maxWidth="sm">
            <EmptyState
              icon={<ClockIcon />}
              title="No gigs in the feed yet"
              message="Organizations post gigs here. When they do, you can scroll and apply in one place."
              actionLabel="Browse the list view"
              onAction={() => navigate('/jobs')}
            />
          </Container>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: { xs: 0, sm: 2, md: 3 },
              py: { xs: 0, sm: 2 },
            }}
          >
            {/* Paging buttons live beside the stage, not at the viewport edge */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 1,
                width: 48,
                flexShrink: 0,
                alignItems: 'center',
              }}
            >
              <Tooltip title="Previous gig" placement="left">
                <IconButton
                  aria-label="Previous gig"
                  onClick={() => pageBy(-1)}
                  sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <ArrowUpIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Next gig" placement="left">
                <IconButton
                  aria-label="Next gig"
                  onClick={() => pageBy(1)}
                  sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <ArrowDownIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: '100%', md: 520 },
                height: '100%',
                minHeight: 0,
              }}
            >
              <Box
                ref={scrollerRef}
                onScroll={handleScroll}
                tabIndex={-1}
                sx={{
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollSnapType: 'y mandatory',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  borderRadius: { xs: 0, sm: '18px' },
                  border: { xs: 'none', sm: '1px solid' },
                  borderColor: 'divider',
                  boxShadow: { xs: 'none', sm: 'var(--qg-card-shadow)' },
                  bgcolor: '#0C1410',
                }}
              >
                {visible.map((job, i) => (
                  <FeedCard
                    key={`${job.id}${job.keySuffix}`}
                    job={job}
                    index={i}
                    onApply={() => (user ? setApplyingJob(job) : navigate('/login'))}
                  />
                ))}
                {/* 1px, not 1 — in MUI's sx a bare number for height is a percentage */}
                <Box ref={sentinelRef} sx={{ height: '1px' }} aria-hidden="true" />
              </Box>

              {/* Position rail — the affordance that replaces a scrollbar */}
              {dotCount > 1 && (
                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '42%',
                    transform: 'translateY(-50%)',
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.75,
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: dotCount }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5,
                        height: i === dotActive ? 16 : 5,
                        borderRadius: 999,
                        bgcolor: i === dotActive ? '#fff' : 'rgba(255,255,255,0.42)',
                        transition: 'all .2s var(--ease-out)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Balances the paging column so the stage stays optically centred */}
            <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, width: 48, flexShrink: 0 }} />
          </Box>

          <Modal open={Boolean(applyingJob)} onClose={() => setApplyingJob(null)} title="Apply to this job">
            <ApplicationForm onSubmit={handleApply} submitting={submitting} job={applyingJob} />
          </Modal>

          <Snackbar
            open={Boolean(toast)}
            autoHideDuration={toast?.type === 'success' ? 3500 : 5000}
            onClose={() => setToast(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={toast?.type || 'info'} sx={{ width: '100%', bgcolor: 'background.paper' }} onClose={() => setToast(null)}>
              {toast?.text}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  )
}
