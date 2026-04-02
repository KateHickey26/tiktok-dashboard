/**
 * TikTok Display API v2 helpers.
 * Docs: https://developers.tiktok.com/doc/display-api-overview
 */

const BASE = 'https://open.tiktokapis.com/v2'
const AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize'
const TOKEN_URL = `${BASE}/oauth/token/`

const VIDEO_FIELDS = [
  'id', 'title', 'video_description', 'cover_image_url',
  'share_url', 'duration', 'create_time',
  'view_count', 'like_count', 'comment_count', 'share_count',
].join(',')

const USER_FIELDS = [
  'open_id', 'union_id', 'display_name', 'avatar_url',
  'bio_description', 'is_verified',
  'follower_count', 'following_count', 'likes_count', 'video_count',
].join(',')

// ── OAuth helpers ─────────────────────────────────────────────────────────────

export function buildAuthUrl({ clientKey, redirectUri, state }) {
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,user.info.stats,video.list',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })
  return `${AUTH_BASE}/?${params}`
}

export async function exchangeCode({ clientKey, clientSecret, code, redirectUri }) {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body,
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

export async function refreshAccessToken({ clientKey, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body,
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getUserInfo(accessToken) {
  const res = await fetch(`${BASE}/user/info/?fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (data.error?.code && data.error.code !== 'ok') {
    throw new Error(data.error.message || 'Failed to fetch user info')
  }
  return data.data?.user
}

/**
 * Fetches all videos for the authenticated user, paginating automatically.
 * TikTok caps max_count at 20 per page.
 */
export async function getAllVideos(accessToken) {
  const videos = []
  let cursor = null
  let hasMore = true

  while (hasMore) {
    const body = { max_count: 20 }
    if (cursor) body.cursor = cursor

    const res = await fetch(`${BASE}/video/list/?fields=${VIDEO_FIELDS}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (data.error?.code && data.error.code !== 'ok') {
      throw new Error(data.error.message || 'Failed to fetch videos')
    }

    videos.push(...(data.data?.videos || []))
    hasMore = data.data?.has_more ?? false
    cursor = data.data?.cursor ?? null
  }

  return videos
}
