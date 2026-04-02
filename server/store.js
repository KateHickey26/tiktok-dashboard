/**
 * Simple JSON file-based store for tokens, follower snapshots, and post metadata overrides.
 * All data lives in /data (gitignored).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

function readJSON(file, fallback) {
  const path = join(DATA_DIR, file)
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJSON(file, data) {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

// ── Tokens ──────────────────────────────────────────────────────────────────

export function getTokens() {
  return readJSON('tokens.json', null)
}

export function saveTokens(tokens) {
  writeJSON('tokens.json', { ...tokens, saved_at: Date.now() })
}

export function clearTokens() {
  const path = join(DATA_DIR, 'tokens.json')
  if (existsSync(path)) writeFileSync(path, '{}')
}

// ── Follower history ─────────────────────────────────────────────────────────

export function getFollowerHistory() {
  return readJSON('follower-history.json', [])
}

export function appendFollowerSnapshot(followers) {
  const history = getFollowerHistory()
  const today = new Date().toISOString().split('T')[0]
  // Replace today's entry if it already exists, otherwise append
  const idx = history.findIndex(h => h.date === today)
  const entry = { date: today, followers }
  if (idx >= 0) history[idx] = entry
  else history.push(entry)
  // Keep last 365 days
  const trimmed = history.slice(-365)
  writeJSON('follower-history.json', trimmed)
  return trimmed
}

// ── Post metadata overrides (song, genre, notes) ─────────────────────────────
// Keyed by TikTok video ID

export function getPostMeta() {
  return readJSON('post-meta.json', {})
}

export function savePostMeta(videoId, fields) {
  const meta = getPostMeta()
  meta[videoId] = { ...(meta[videoId] || {}), ...fields }
  writeJSON('post-meta.json', meta)
  return meta[videoId]
}
