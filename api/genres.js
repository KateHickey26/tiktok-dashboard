import { getGenres, saveGenres } from './_store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(await getGenres())
  }

  if (req.method === 'POST') {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'name required' })
    const genres = await getGenres()
    const trimmed = name.trim()
    if (!genres.includes(trimmed)) await saveGenres([...genres, trimmed])
    return res.json(await getGenres())
  }

  if (req.method === 'DELETE') {
    const { name } = req.body
    const genres = await getGenres()
    await saveGenres(genres.filter(g => g !== name))
    return res.json(await getGenres())
  }

  res.status(405).end()
}
