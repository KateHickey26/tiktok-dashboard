import { clearTokens } from '../_store.js'

export default async function handler(req, res) {
  await clearTokens()
  if (req.method === 'GET') return res.redirect('/')
  res.json({ ok: true })
}
