import { getPostMeta } from '../_store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const meta = await getPostMeta()
  res.json(meta)
}
