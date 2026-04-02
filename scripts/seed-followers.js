/**
 * One-time script to seed historical follower counts into Upstash.
 * Edit the `history` array below, then run:
 *
 *   node scripts/seed-followers.js
 *
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN in your .env file.
 */

import 'dotenv/config'
import { Redis } from '@upstash/redis'

// ── Edit this ─────────────────────────────────────────────────────────────────
const history = [
  { date: "2025-11-21", followers: 19 },
  { date: "2025-11-26", followers: 25 },
  { date: "2025-11-29", followers: 30 },
  { date: "2025-12-05", followers: 32 },
  { date: "2025-12-10", followers: 36 },
  { date: "2025-12-12", followers: 40 },
  { date: "2025-12-19", followers: 41 },
  { date: "2025-12-21", followers: 42 },
  { date: "2025-12-24", followers: 46 },
  { date: "2026-01-07", followers: 47 },
  { date: "2026-01-10", followers: 48 },
  { date: "2026-01-13", followers: 49 },
  { date: "2026-01-15", followers: 50 },
  { date: "2026-01-16", followers: 51 },
  { date: "2026-01-18", followers: 52 },
  { date: "2026-01-23", followers: 54 },
  { date: "2026-01-27", followers: 59 },
  { date: "2026-01-28", followers: 62 },
  { date: "2026-01-29", followers: 64 },
  { date: "2026-01-30", followers: 68 },
  { date: "2026-01-31", followers: 69 },
  { date: "2026-02-02", followers: 72 },
  { date: "2026-02-04", followers: 75 },
  { date: "2026-02-05", followers: 80 },
  { date: "2026-02-06", followers: 81 },
  { date: "2026-02-07", followers: 87 },
  { date: "2026-02-09", followers: 90 },
  { date: "2026-02-10", followers: 92 },
  { date: "2026-02-11", followers: 94 },
  { date: "2026-02-13", followers: 97 },
  { date: "2026-02-15", followers: 102 },
  { date: "2026-02-17", followers: 104 },
  { date: "2026-02-19", followers: 108 },
  { date: "2026-02-20", followers: 110 },
  { date: "2026-02-23", followers: 112 },
  { date: "2026-02-25", followers: 116 },
  { date: "2026-02-26", followers: 117 },
  { date: "2026-03-02", followers: 122 },
  { date: "2026-03-12", followers: 132 },
  { date: "2026-03-13", followers: 134 },
  { date: "2026-03-18", followers: 140 },
]
// ─────────────────────────────────────────────────────────────────────────────

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Merge with any existing snapshots so live data isn't lost
const existing = await redis.get('tiktok:follower-history') || []
const merged = [...history]

for (const entry of existing) {
  if (!merged.find(h => h.date === entry.date)) merged.push(entry)
}

merged.sort((a, b) => a.date.localeCompare(b.date))

await redis.set('tiktok:follower-history', merged)
console.log(`✓ Seeded ${merged.length} follower snapshots (${history.length} from seed + ${existing.length} existing)`)
process.exit(0)
