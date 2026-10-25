# Design System — QuickGig

Visual system for the MUI v5 frontend. Single source of truth: `buildTheme(mode)` in `frontend/src/theme.js` — App.jsx picks light/dark from `localStorage` (`quickgig_theme`) and passes the mode down.

## Color strategy

Committed-product: warm neutral surfaces + one saturated brand green used decisively (CTAs, brand moments, active states). No gradients as decoration, no glassmorphism.

| Token | Hex | Use |
|---|---|---|
| `green.main` | `#217A44` | Primary actions, links, active states. White text on it ≥ 4.5:1. |
| `green.dark` | `#175C34` | Hover for primary actions |
| `green.tint` | `#E7F2EA` | Chip/category backgrounds |
| `green.faint` | `#F3F8F4` | Selected panels, quiet tinting |
| `ink` | `#1C231F` | Headings, near-black text |
| `text.primary` | `#33413A` | Body text |
| `text.secondary` | `#5A6962` | Muted text (≥ 4.5:1 on `paper`/white) |
| `paper` | `#FAFBF9` | App background — off-white toward brand hue, not cream |
| `surface` | `#FFFFFF` | Cards, dialogs |
| `line` | `#E2E8E3` | Hairline borders |
| `amber` | `#B7791F` | Ratings/earned attention only, text-capable on white |
| `error` `#C0392B` / `warning` `#B7791F` / `info` `#2A6FDB` / `success` `green.main` | | Semantic |

Colors live in `buildColors(mode)` (plain hex so MUI's darken/lighten math works) as `palette` groups — `green.{main,dark,bright,tint,faint}`, `ink.main`, `line.{main,hover}`, `paper.main` — so sx paths like `color: 'green.dark'` resolve. Never introduce a new hue without adding it here (both modes).

## Dark mode

Two explicitly-tuned token sets — one pair of hands, not auto-derivation. Toggled from the Navbar (desktop icon + mobile menu item), persisted in `localStorage`, and applied pre-paint by a tiny inline script in `index.html` (`document.documentElement.dataset.mode`) so dark users never see a light flash.

| Token | Light | Dark | Notes |
|---|---|---|---|
| `bg` / body | `#FAFBF9` | `#0F1711` | Dark bg is green-tinted, not gray |
| `surface` (cards) | `#FFFFFF` | `#17211B` |
| `ink` (headings) | `#1C231F` | `#EDF3EE` |
| `text.primary` | `#33413A` | `#C7D2CA` |
| `text.secondary` | `#5A6962` | `#8FA096` |
| `line` | `#E2E8E3` | `#263129` | hairlines |
| `line.hover` | `#CBD8CF` | `#3A4A40` | card hover borders |
| `green.main` | `#217A44` | `#217A44` | unchanged — white text keeps its 5.34:1 in both |
| `green.dark` | `#175C34` | `#4CB473` | flips role: hover-dark in light, *readable-green text* on dark |
| `green.bright` | `#217A44` | `#66C98F` | hover for green text-on-card |
| `green.tint` | `#E7F2EA` | `#1A2E22` | chips |
| `green.faint` | `#F3F8F4` | `#14231A` | quiet panels |
| `amberDark` | `#8C5A10` | `#D9A843` | rating stars / pending colors |
| `red` / `blue` | `#C0392B` / `#2A6FDB` | `#E07B6F` / `#7FA9DF` | semantic, lightened for dark |
| card hover shadow | ink @ 25% | black @ 50% | via CSS var `-‑qg-card-shadow` |

Key pair math (dark, hand-computed): muted on surface ≈ 6.0:1, body ≈ 10.6:1, `green.bright` ≈ 6.4:1. Green solid bands (hero, closing, AuthShell panel) keep light-mode treatment in dark mode — `paper.main` text on green reads identically.

Status chips (ApplicationCard) are the one per-mode map outside `palette`: `buildStatusChips(mode)` in `theme.js` returns tinted-bg/light-text pairs per status (translucent-color bg in dark, pastel bg in light).

Rules of thumb:
- Text in green = `green.dark`; its hover = `green.bright`. Never pair `green.dark` text with a hardcoded light bg — the bg must be a flipping token (`green.faint`/`tint`) or a mode-neutral value.
- Hover shadows go through `var(--qg-card-shadow)` (index.css), not literal rgba.
- **Scrollbars are hidden app-wide** — `scrollbar-width: none` plus a zeroed `::-webkit-scrollbar` on every element, because the native Windows bar is the one surface that can't be matched to the palette in both modes. Wheel, trackpad, touch and keyboard scrolling are untouched; the reel feed carries a position rail instead. Native-widget/selection color-scheme still follows `html[data-mode]` in index.css.

## Typography

- **Work Sans** (400/500/600/700) — all UI text. Warm humanist sans; "workwear" energy.
- **Fraunces** (500/600/700) — display/brand serif for h1, h2, wordmark. Neighborly sign-painter warmth, set tight-tracking with weight 600.
- Loaded via Google Fonts `<link>` in `index.html`, `display=swap`.
- h1 display ≤ 56px on desktop via clamp; `text-wrap: balance` on headings; body line-length ≤ ~70ch (containers enforce).
- Letter-spacing floor −0.02em (serif display keep ≥ −0.015em).

## Shape & elevation

- Radius: buttons/chips **999** (pill), inputs/selects **10**, cards **14**, dialogs **16**.
- Cards rest state: `1px solid line`, **no shadow**. Hover: border `line.hover` + shadow `var(--qg-card-shadow)` + translateY(-2px). Never 1px-border + big soft shadow simultaneously (ghost-card ban).
- AppBar: `position: sticky`, `elevation: 0`, bottom hairline.
- Elevation scale only from preset shadows (`elevation4` style tokens), no arbitrary `999`.

## Motion

- Curve: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint). Durations: hover/micro 140–180ms, entrances 260–420ms, scroll reveals 550ms.
- **Scroll reveals**: `<Reveal>` (IntersectionObserver, `components/common/Reveal.jsx`) wraps below-fold sections and list items. Hiding class is added by JS pre-paint — no-JS and reduced-motion users always ship visible.
- **Two reveal behaviors**: default `once` = pop in the first time and never again (cards, list items — long grids must not re-animate while re-read). `once={false}` = fade in when entering the viewport **and fade out when leaving** — for page sections (landing steps/categories/closing, dashboard Stat + section headings) so scrolling feels alive both directions.
- **List pops**: grid items get `Reveal` with staggered `delay` ≤ 70ms per item (`(i % 6) * 70`) so long lists don't drag.
- Above-the-fold first-screen elements use one-shot CSS `qg-rise` keyframes with `.qg-rise-1…3` delays.
- Hover feedback animates card surface (border/shadow/transform), never images.
- Every animation has a `prefers-reduced-motion: reduce` fallback (index.css global kill-switch + Reveal's built-in no-op).

## Feed — reels-style gig feed (`/feed`)

Instagram Reels / YouTube Shorts grammar, adapted to gigs.

- **One gig per screen, media as the canvas.** The posted photo fills the card (`object-fit: cover`); gigs without a photo get the **fallback tile** — a dark green radial ground with the oversized Fraunces category letter at ~42% opacity. A single top-to-bottom scrim (`rgba(8,13,10)`: .62 → 0 at 42% → .94 at the bottom) keeps overlay text ≥ 4.5:1 over any photo.
- **Overlay, not a panel.** Top-left translucent category chip; top-right org avatar disc + name + rating. Bottom-left caption: serif title (2-line clamp), pay as the loudest element, then one meta line (place · duration · applicants). Right padding reserves the action rail's width, so text never runs under it.
- **Action rail (TikTok/Reels).** Two 52px discs stacked bottom-right with labels beneath: **Apply** (brand green, bolt) and **Details** (translucent hairline, info). States are real: applied → green check, own posting → "Applicants", closed → disabled. Guests are routed to `/login`.
- **Frame.** Full-bleed on phones; on md+ a centered 520px portrait stage with 18px radius, hairline border and the card shadow on the app ground. Paging buttons sit beside the stage (48px column, with a matching spacer so the stage stays optically centred), not pinned to the viewport edge.
- **Position.** The scrollbar is hidden app-wide, so the feed shows a **dot rail** (right edge, ~42% height, active dot is a 16px pill) plus a `3 / 7` counter in the header. Both read from the real catalog `total` returned by the API.
- **Mechanics.** `scroll-snap-type: y mandatory`, `overscroll-behavior: contain`, ArrowUp/Down paging (ignored inside inputs and while the apply modal is open). The feed hides the footer and locks page scroll while mounted; height is `100dvh - var(--qg-nav-h)`, where `--qg-nav-h` is measured from the live AppBar.
- **Loops forever, bounded.** Pages come from `/api/jobs/feed` (`{items, page, per, total, has_more}`); after the last page it wraps to page 1 with fresh key suffixes. Prefetch starts one screen early (`rootMargin` 120%) and only ~21 cards stay mounted — older ones drop off the head with `scrollTop` compensated, so looping never grows the DOM.
- Reduced-motion handled by the global kill-switch (snap scrolling still works).

## Localization & geo

- **Currency**: INR everywhere, `money()` in `utils/format.js` → `₹` with `en-IN` grouping (`₹1,400`). Never hard-code `$` in UI copy.
- **Places**: Bhopal, Madhya Pradesh. Job locations map to `BHOPAL_AREAS` in `utils/locations.js` (MP Nagar, Arera Colony, Kolar Road, Shahpura, …) — `JobForm` posts one of these names.
- **Gigs near me**: `utils/geo.js` — `getCurrentPosition` is only called on the user's explicit "Gigs near me" tap (never on page load). Distance = haversine to the job's area; visible jobs filtered to `NEAR_KM` (25 km) and sorted by distance; unmatched locations (incl. remote) are dropped from near results. Permission-denied/unsupported browsers get quiet fallback alerts. JobCard shows a `NearMeIcon + "2.4 km"` meta item only when `distance_km` was computed.

## Loading — skeletons, everywhere data loads

Every async page swaps `<Spinner />` for a shape-matching skeleton (`Skeleton` grid that mirrors the real layout — never blank, never a flash of final content):

- **JobList** — card-grid skeletons (`JobCardSkeleton` in the grid the cards will occupy).
- **JobDetail** — `DetailSkeleton`: back-link line, category chip + title + meta shapes, prose lines, four meta rows, and the sticky apply-panel card (desktop only, like the panel itself).
- **Dashboard** — `DashboardSkeleton(isOrg)`: headline, stat block, then card-grid skeletons (org) or application-row skeletons (individual).
- **Feed** — one reel-shaped stage skeleton (media canvas + caption/CTA bars) in the same portrait frame.

Keep them quiet: `Skeleton` default pulse only, no shimmer overlays, no spinner-then-skeleton mixing. Real Flask latency is ~5ms locally, so skeletons are only visible over slow networks — no artificial delays anywhere.

## Components

- **PageHeader**: eyebrow-free; h1 (Fraunces) + one quiet-hue line + count.
- **JobCard**: pay is the loudest data (ink, 700); category chip tinted; hairline card, hover lift; whole card is a link. Shows a rounded photo band under the header when the gig has an image (`image_url` from the upload API).
- **ApplicationForm**: cover note (500 chars, helper counts) + **attach-files zone** — dashed hairline box, `AttachFile` disc, "Browse" pill, up to **3 files** at **2 MB** each (`.pdf .jpg .jpeg .png .doc .docx`), inline error text, per-file rows with size (`formatBytes`) and remove buttons. Submits `(coverLetter, files[])` where files are `{name, size, type}` metadata only — the demo has no upload endpoint, and the form says so ("only file names travel with the application").
- **ApplicationCard**: status chip from `buildStatusChips(mode)`, cover-note excerpt, and an `AttachFile` line listing attached file names + sizes when present.
- **StatCard** (dashboard): honest counts, labeled plainly.
- **EmptyState**: drawn icon disc, title, one line, action when applicable.
- **Buttons**: `contained` = green pill, weight 600, no uppercase; `outlined` = 1px line; text buttons get green.
- **GoogleButton**: neutral outlined pill (divider border, ink text, paper ground) with the four-colour Google mark, full width, 48px tall. Auth pages put it above an "or use your email" rule. Without Supabase keys it is disabled and the page's setup alert carries the explanation — the message is never printed twice.
- **Selection color** `green.tint`, `::selection` text ink.
- Brand mark: rounded-square green disc with a white bolt/clock glyph (Markdown-safe inline SVG).

## Don't

- No purple `#6C5CE7` or `#00B894` leftovers; no gradients on text or as blobs; no side-stripe borders; no shadowed-ghost cards; no identical 3-card feature grids; no eyebrow-on-every-section; no hero-metric template; no emoji-as-icon in UI chrome.
