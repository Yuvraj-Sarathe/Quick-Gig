// Thin fetch wrapper over the Flask API (backend/app.py).
// Same-origin by default — Vite proxies /api to the backend in dev.
//
// The bearer token is the Supabase access token; the API verifies it against
// the project JWKS. Supabase refreshes sessions for us, and a 401 gets one
// refresh-and-retry before it becomes a real error.
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function getAccessToken() {
  if (!supabase) return ''
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || ''
}

async function refreshedToken() {
  if (!supabase) return ''
  const { data, error } = await supabase.auth.refreshSession()
  if (error) return ''
  return data.session?.access_token || ''
}

export async function api(path, { method = 'GET', body, formData, retry = true } = {}) {
  const headers = {}
  const token = await getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (formData) {
    payload = formData // browser sets the multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload })
  } catch {
    throw new Error("Can't reach the QuickGig server — is it running on port 5001?")
  }

  if (res.status === 401 && retry && token) {
    const fresh = await refreshedToken()
    if (fresh && fresh !== token) {
      return api(path, { method, body, formData, retry: false })
    }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body (e.g. bare proxy error) */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}
