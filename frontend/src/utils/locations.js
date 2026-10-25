// Bhopal area coordinates (approximate centroids) powering the "gigs near me"
// distance sort. Demo build: jobs store a text location; we match it to an area.

export const BHOPAL_AREAS = [
  { name: 'MP Nagar', lat: 23.2011, lng: 77.4412 },
  { name: 'Arera Colony', lat: 23.2178, lng: 77.4126 },
  { name: 'New Market', lat: 23.2296, lng: 77.4220 },
  { name: '10 No. Market', lat: 23.2130, lng: 77.4390 },
  { name: 'Kolar Road', lat: 23.1565, lng: 77.4181 },
  { name: 'Lalghati', lat: 23.2605, lng: 77.4375 },
  { name: 'Ayodhya Bypass', lat: 23.2702, lng: 77.4705 },
  { name: 'Habibganj', lat: 23.2249, lng: 77.4042 },
  { name: 'Shahpura', lat: 23.2313, lng: 77.4804 },
  { name: 'Bittan Market', lat: 23.2079, lng: 77.4553 },
]

export const AREA_NAMES = BHOPAL_AREAS.map((a) => a.name)

export function getAreaCoords(location) {
  if (!location) return null
  const q = String(location).toLowerCase()
  const hit = BHOPAL_AREAS.find((a) => q.includes(a.name.toLowerCase()))
  return hit ? { lat: hit.lat, lng: hit.lng } : null
}
