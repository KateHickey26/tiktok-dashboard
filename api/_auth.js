/**
 * Shared token-refresh helper used by all protected routes.
 */
import { getTokens, saveTokens } from './_store.js'
import { refreshAccessToken } from './_tiktok.js'

export async function getValidAccessToken() {
  const tokens = await getTokens()
  if (!tokens?.access_token) throw new Error('Not authenticated')

  const expiresAt = (tokens.saved_at || 0) + (tokens.expires_in || 0) * 1000
  if (Date.now() < expiresAt - 60_000) return tokens.access_token

  const fresh = await refreshAccessToken({
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    refreshToken: tokens.refresh_token,
  })
  await saveTokens(fresh)
  return fresh.access_token
}
