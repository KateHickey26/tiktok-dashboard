import { getTokens } from './_store.js'

export default async function handler(req, res) {
  const tokens = await getTokens()
  if (!tokens) return res.json({ error: 'no token stored' })
  // Only expose non-sensitive fields
  res.json({
    scope: tokens.scope,
    token_type: tokens.token_type,
    expires_in: tokens.expires_in,
    saved_at: tokens.saved_at,
    has_access_token: !!tokens.access_token,
    has_refresh_token: !!tokens.refresh_token,
  })
}
