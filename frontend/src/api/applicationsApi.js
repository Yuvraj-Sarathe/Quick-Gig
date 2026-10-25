import { api } from './client'

// data: { job_id, cover_letter, application_files: [{ name, size, type }] }
export async function applyToJob(data) {
  return api('/applications', { method: 'POST', body: data })
}

// userId param kept for the existing call site; the server uses the token.
export async function getMyApplications(userId) {
  return api('/applications/mine')
}
