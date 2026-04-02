import { getValidAccessToken } from './_auth.js'
import { getAllVideos } from './_tiktok.js'
import { getPostMeta } from './_store.js'

export default async function handler(req, res) {
  try {
    const token = await getValidAccessToken()
    const [videos, postMeta] = await Promise.all([getAllVideos(token), getPostMeta()])

    const enriched = videos.map(v => ({
      id: v.id,
      caption: v.video_description || v.title || '',
      thumbnail: v.cover_image_url || null,
      shareUrl: v.share_url || null,
      duration: v.duration,
      postedAt: new Date(v.create_time * 1000).toISOString(),
      views: v.view_count ?? 0,
      likes: v.like_count ?? 0,
      comments: v.comment_count ?? 0,
      shares: v.share_count ?? 0,
      // Not available from API — stored as manual overrides
      song: postMeta[v.id]?.song ?? null,
      genre: postMeta[v.id]?.genre ?? null,
      saves: postMeta[v.id]?.saves ?? null,
      followersGained: postMeta[v.id]?.followersGained ?? null,
    }))

    res.json(enriched)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}
