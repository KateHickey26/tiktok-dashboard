import { getFollowerHistory, appendFollowerSnapshot } from './_store.js'
import { getValidAccessToken } from './_auth.js'
import { getUserInfo } from './_tiktok.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const history = await getFollowerHistory()
    return res.json(history)
  }

  if (req.method === 'POST') {
    try {
      const token = await getValidAccessToken()
      const user = await getUserInfo(token)
      if (user?.follower_count == null) return res.status(400).json({ error: 'No follower count in response' })
      const history = await appendFollowerSnapshot(user.follower_count)
      return res.json({ followers: user.follower_count, history })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).end()
}
