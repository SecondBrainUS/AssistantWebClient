import baseApi from './baseApi'

let _cached = null

/**
 * Fetch (and cache for the page lifetime) the auth mode from the backend.
 * Returns { auth_mode: "google" | "cloudflare" }.
 */
export async function getAuthConfig() {
  if (_cached) return _cached
  const { data } = await baseApi.get('/auth/config')
  _cached = data
  return data
}

export function clearAuthConfigCache() {
  _cached = null
}
