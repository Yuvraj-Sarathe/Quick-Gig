// Formatting helpers shared across listing surfaces (see docs/data-flow.md §3)
// Currency: INR with Indian digit grouping.

export function timeAgo(iso) {
  const then = new Date(iso).getTime()
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`
  if (days >= 7) return `${Math.floor(days / 7)}w ago`
  if (days >= 1) return `${days}d ago`
  const hours = Math.floor((Date.now() - then) / 3_600_000)
  return hours >= 1 ? `${hours}h ago` : 'just now'
}

export const money = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

export const payLabel = (job) =>
  `${money(job.pay_amount)}${job.pay_type === 'hourly' ? '/hr' : ''}`

// "214 KB", "1.2 MB" — for attached-file labels.
export function formatBytes(bytes) {
  if (!(bytes > 0)) return '0 KB'
  if (bytes < 1024) return '1 KB' // files smaller than 1 KB still read as 1 KB
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
