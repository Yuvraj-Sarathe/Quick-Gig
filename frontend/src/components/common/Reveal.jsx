import { Box } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'

// Scroll-reveal wrapper (IntersectionObserver, progressive enhancement).
//
// `once` (default true): pop in the first time, never again — used for cards
// and list items so long grids don't re-animate while you re-read.
// `once={false}`: fade in when entering the viewport AND fade out when leaving
// — used for page sections so scroll feels alive both directions.
//
// The hiding class is added by JS *before first paint* — without JS, or under
// prefers-reduced-motion, content simply stays visible (no blank-page risk).
export default function Reveal({ children, delay = 0, once = true, component = 'div', sx, ...rest }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    // Already revealed (list reorder, not a fresh mount) — keep it visible.
    if (once && el.classList.contains('qg-reveal-in')) {
      el.style.transitionDelay = `${delay}ms`
      return undefined
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return undefined

    el.style.transitionDelay = `${delay}ms`
    el.classList.add('qg-reveal')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('qg-reveal-in')
            if (once) io.disconnect()
          } else if (!once) {
            el.classList.remove('qg-reveal-in')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay, once])

  return (
    <Box ref={ref} component={component} sx={sx} {...rest}>
      {children}
    </Box>
  )
}
