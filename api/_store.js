/**
 * Storage layer — uses Upstash Redis in production, falls back to local JSON files for local dev.
 * Files starting with _ are ignored by Vercel's function router.
 */

import { Redis } from '@upstash/redis'

const USE_REDIS = !!process.env.UPSTASH_REDIS_REST_URL

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// ── File helpers (local dev only) ─────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')

function fileStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  return {
    read(file, fallback) {
      const p = join(DATA_DIR, file)
      if (!existsSync(p)) return fallback
      try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return fallback }
    },
    write(file, data) {
      writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2))
    },
  }
}

// ── Tokens ────────────────────────────────────────────────────────────────────

export async function getTokens() {
  if (USE_REDIS) return getRedis().get('tiktok:tokens')
  return fileStore().read('tokens.json', null)
}

export async function saveTokens(tokens) {
  const data = { ...tokens, saved_at: Date.now() }
  if (USE_REDIS) return getRedis().set('tiktok:tokens', data)
  fileStore().write('tokens.json', data)
}

export async function clearTokens() {
  if (USE_REDIS) return getRedis().del('tiktok:tokens')
  fileStore().write('tokens.json', {})
}

// ── OAuth state (CSRF) ────────────────────────────────────────────────────────

export async function saveState(state) {
  if (USE_REDIS) return getRedis().set(`tiktok:state:${state}`, 1, { ex: 600 })
  localStates.add(state)
  setTimeout(() => localStates.delete(state), 600_000)
}

export async function consumeState(state) {
  if (USE_REDIS) {
    const redis = getRedis()
    const exists = await redis.get(`tiktok:state:${state}`)
    if (exists) await redis.del(`tiktok:state:${state}`)
    return !!exists
  }
  const ok = localStates.has(state)
  localStates.delete(state)
  return ok
}

const localStates = new Set()

// ── Follower history ──────────────────────────────────────────────────────────

export async function getFollowerHistory() {
  if (USE_REDIS) return (await getRedis().get('tiktok:follower-history')) || []
  return fileStore().read('follower-history.json', [])
}

export async function appendFollowerSnapshot(followers) {
  const history = await getFollowerHistory()
  const today = new Date().toISOString().split('T')[0]
  const idx = history.findIndex(h => h.date === today)
  const entry = { date: today, followers }
  if (idx >= 0) history[idx] = entry
  else history.push(entry)
  const trimmed = history.slice(-365)
  if (USE_REDIS) await getRedis().set('tiktok:follower-history', trimmed)
  else fileStore().write('follower-history.json', trimmed)
  return trimmed
}

// ── Post metadata overrides ───────────────────────────────────────────────────

export async function getPostMeta() {
  if (USE_REDIS) return (await getRedis().get('tiktok:post-meta')) || {}
  return fileStore().read('post-meta.json', {})
}

export async function savePostMeta(videoId, fields) {
  const meta = await getPostMeta()
  meta[videoId] = { ...(meta[videoId] || {}), ...fields }
  if (USE_REDIS) await getRedis().set('tiktok:post-meta', meta)
  else fileStore().write('post-meta.json', meta)
  return meta[videoId]
}
