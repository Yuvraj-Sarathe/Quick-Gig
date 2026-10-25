// Distance math for the "gigs near me" feature (demo build, Bhopal).

import { getAreaCoords } from './locations'

const RADIUS_KM = 6_371

// Haversine, straight-line distance between two { lat, lng } points.
export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIUS_KM * Math.asin(Math.sqrt(h))
}

// Distance from the user to a job's mapped Bhopal area. null when unknown.
export function distanceToJob(job, coords) {
  const area = getAreaCoords(job.location)
  if (!area || !coords) return null
  return haversineKm(coords, area)
}

// "450 m" under a kilometre, "3.2 km" above.
export function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return null
  if (km < 0.85) return `${Math.max(100, Math.round((km * 1000) / 25) * 25)} m`
  return `${km.toFixed(1)} km`
}

// Default radius the near-me view covers. Bhopal is a compact city.
export const NEAR_KM = 25
