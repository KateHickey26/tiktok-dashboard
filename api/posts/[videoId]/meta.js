import { savePostMeta } from '../../_store.js'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()
  const { videoId } = req.query
  const allowed = ['song', 'genre', 'saves', 'followersGained']
  const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
  const meta = await savePostMeta(videoId, fields)
  res.json(meta)
}
