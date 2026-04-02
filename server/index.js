import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import {
  getTokens, saveTokens, clearTokens,
  getFollowerHistory, appendFollowerSnapshot,
  getPostMeta, savePostMeta,
} from './store.js'
import {
  buildAuthUrl, exchangeCode, refreshAccessToken,
  getUserInfo, getAllVideos,
} from './tiktok.js'

const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

const {
  TIKTOK_CLIENT_KEY: CLIENT_KEY,
  TIKTOK_CLIENT_SECRET: CLIENT_SECRET,
  REDIRECT_URI = 'http://localhost:3001/auth/callback',
  PORT = 3001,
} = process.env

if (!CLIENT_KEY || !CLIENT_SECRET) {
  console.warn('⚠️  TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET not set in .env — OAuth will not work.')
}

// ── In-memory CSRF state store (good enough for single-user local app) ────────
const pendingStates = new Set()

// ── Token refresh helper ──────────────────────────────────────────────────────
async function getValidAccessToken() {
  const tokens = getTokens()
  if (!tokens?.access_token) throw new Error('Not authenticated')

  const expiresAt = (tokens.saved_at || 0) + (tokens.expires_in || 0) * 1000
  if (Date.now() < expiresAt - 60_000) return tokens.access_token

  // Refresh
  const fresh = await refreshAccessToken({
    clientKey: CLIENT_KEY,
    clientSecret: CLIENT_SECRET,
    refreshToken: tokens.refresh_token,
  })
  saveTokens(fresh)
  return fresh.access_token
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.get('/auth/tiktok', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex')
  pendingStates.add(state)
  setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000) // expire after 10 min
  res.redirect(buildAuthUrl({ clientKey: CLIENT_KEY, redirectUri: REDIRECT_URI, state }))
})

app.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query

  if (error) {
    return res.redirect(`http://localhost:5173/?auth_error=${encodeURIComponent(error_description || error)}`)
  }
  if (!pendingStates.has(state)) {
    return res.redirect('http://localhost:5173/?auth_error=invalid_state')
  }
  pendingStates.delete(state)

  try {
    const tokens = await exchangeCode({ clientKey: CLIENT_KEY, clientSecret: CLIENT_SECRET, code, redirectUri: REDIRECT_URI })
    saveTokens(tokens)
    // Snapshot follower count immediately after login
    const user = await getUserInfo(tokens.access_token)
    if (user?.follower_count != null) appendFollowerSnapshot(user.follower_count)
    res.redirect('http://localhost:5173/?auth_success=1')
  } catch (err) {
    res.redirect(`http://localhost:5173/?auth_error=${encodeURIComponent(err.message)}`)
  }
})

app.post('/auth/logout', (req, res) => {
  clearTokens()
  res.json({ ok: true })
})

// ── Status ────────────────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  const tokens = getTokens()
  res.json({ connected: !!(tokens?.access_token) })
})

// ── User info ─────────────────────────────────────────────────────────────────

app.get('/api/user', async (req, res) => {
  try {
    const token = await getValidAccessToken()
    const user = await getUserInfo(token)
    res.json(user)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

// ── Videos ────────────────────────────────────────────────────────────────────

app.get('/api/videos', async (req, res) => {
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
      // Fields not available from API — stored as manual overrides
      song: postMeta[v.id]?.song ?? null,
      genre: postMeta[v.id]?.genre ?? null,
      saves: postMeta[v.id]?.saves ?? null,
      followersGained: postMeta[v.id]?.followersGained ?? null,
    }))

    res.json(enriched)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

// ── Follower history ──────────────────────────────────────────────────────────

app.get('/api/follower-history', (req, res) => {
  res.json(getFollowerHistory())
})

// Manually trigger a snapshot (call this from a cron job or just the UI)
app.post('/api/follower-history/snapshot', async (req, res) => {
  try {
    const token = await getValidAccessToken()
    const user = await getUserInfo(token)
    if (user?.follower_count == null) return res.status(400).json({ error: 'No follower count in response' })
    const history = appendFollowerSnapshot(user.follower_count)
    res.json({ followers: user.follower_count, history })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Post metadata overrides ───────────────────────────────────────────────────

app.patch('/api/posts/:videoId/meta', (req, res) => {
  const { videoId } = req.params
  const allowed = ['song', 'genre', 'saves', 'followersGained']
  const fields = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
  const meta = savePostMeta(videoId, fields)
  res.json(meta)
})

app.get('/api/posts/meta', (req, res) => {
  res.json(getPostMeta())
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✓ TikTok Dashboard server running at http://localhost:${PORT}`)
  console.log(`  → Connect TikTok: http://localhost:${PORT}/auth/tiktok`)
  console.log(`  → Status:         http://localhost:${PORT}/api/status\n`)
})
