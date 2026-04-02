import { clearTokens } from '../_store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await clearTokens()
  res.json({ ok: true })
}
