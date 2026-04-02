import { getTokens } from './_store.js'

export default async function handler(req, res) {
  const tokens = await getTokens()
  if (!tokens) return res.json({ error: 'no token stored' })

  // Try the minimal possible user info request
  const raw = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const body = await raw.json()

  res.json({
    scope: tokens.scope,
    http_status: raw.status,
    tiktok_response: body,
  })
}
