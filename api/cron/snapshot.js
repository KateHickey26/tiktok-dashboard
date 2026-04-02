import { getValidAccessToken } from '../_auth.js'
import { getUserInfo } from '../_tiktok.js'
import { appendFollowerSnapshot } from '../_store.js'

export default async function handler(req, res) {
  // Allow Vercel cron and manual GET
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const token = await getValidAccessToken()
    const user = await getUserInfo(token)
    if (!user?.follower_count) return res.json({ skipped: true, reason: 'no follower_count in response' })
    const history = await appendFollowerSnapshot(user.follower_count)
    res.json({ ok: true, followers: user.follower_count, total_snapshots: history.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
