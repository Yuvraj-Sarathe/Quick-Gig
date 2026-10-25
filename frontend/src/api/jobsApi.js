import { api } from './client'

// Filters shape mirrors the old mock: { search, category, remoteOnly }
export async function getJobs(filters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.remoteOnly) params.set('remoteOnly', '1')
  const qs = params.toString()
  return api(`/jobs${qs ? `?${qs}` : ''}`)
}

// Paged feed for the swipe surface: { items, page, per, has_more }
export async function getJobsFeed({ page = 1, per = 10, search, category, remoteOnly } = {}) {
  const params = new URLSearchParams({ page, per })
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (remoteOnly) params.set('remoteOnly', '1')
  return api(`/jobs/feed?${params}`)
}

export async function getJobById(id) {
  return api(`/jobs/${id}`)
}

// Post via JSON, or as multipart when an image file is attached.
export async function createJob(jobData, imageFile) {
  if (imageFile) {
    const formData = new FormData()
    Object.entries(jobData).forEach(([key, value]) => formData.append(key, String(value)))
    formData.append('image', imageFile)
    return api('/jobs', { method: 'POST', formData })
  }
  return api('/jobs', { method: 'POST', body: jobData })
}
