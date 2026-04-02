import { getTokens } from './_store.js'

export default async function handler(req, res) {
  const tokens = await getTokens()
  res.json({ connected: !!(tokens?.access_token) })
}
