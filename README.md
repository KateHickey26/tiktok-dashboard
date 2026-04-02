# TikTok Dashboard

A personal TikTok analytics dashboard. See your posts, engagement stats, and follower growth over time, all in one place.

## Features

- **Posts overview** — views, likes, comments, shares, engagement rate per post
- **Genre tags** — tag posts with custom categories, create/delete tags from the UI
- **Song tagging** — manually tag the sound used on each post
- **Follower growth chart** — tracks follower count over time with post publish dates overlaid so you can see which content drove growth
- **Daily snapshots** — Vercel cron automatically snapshots your follower count at 9am each day; or hit "Snapshot now" in the UI any time
- **Auth** — connects to your TikTok account via OAuth (TikTok Display API)

## Live app

**https://tiktok-dashboard-two.vercel.app**

## Tech stack

- React + Vite + Tailwind CSS
- Recharts (follower growth graph)
- Vercel (hosting + serverless API routes + cron)
- Upstash Redis (token storage, follower history, post metadata)
- TikTok Display API v2

## Local development

```bash
# Install dependencies
npm install

# Run the frontend only (shows mock data — no backend needed)
npm run dev

# Run with full backend via Vercel CLI (requires `vercel` CLI installed and linked)
npm run dev:vercel
```

Open http://localhost:5173 (or http://localhost:3000 with `vercel dev`).

## Deployment

Push to `main` — Vercel auto-deploys.

```bash
git add -A && git commit -m "your message" && git push
```

## Environment variables

Set these in Vercel → Settings → Environment Variables:

| Variable | Description |
|---|---|
| `TIKTOK_CLIENT_KEY` | From TikTok developer portal |
| `TIKTOK_CLIENT_SECRET` | From TikTok developer portal |
| `REDIRECT_URI` | `https://tiktok-dashboard-two.vercel.app/api/auth/callback` |
| `KV_REST_API_URL` | Auto-added by Vercel's Upstash integration |
| `KV_REST_API_TOKEN` | Auto-added by Vercel's Upstash integration |

For local development, copy `.env.example` to `.env` and fill in the values.

## Seeding historical follower data

Edit `scripts/seed-followers.js` with your historical follower counts, then run:

```bash
node scripts/seed-followers.js
```

Requires `KV_REST_API_URL` and `KV_REST_API_TOKEN` in your local `.env`.

## Useful URLs

| URL | Description |
|---|---|
| `/api/status` | Check if TikTok is connected |
| `/api/auth/tiktok` | Start OAuth flow |
| `/api/auth/logout` | Disconnect TikTok (also works in browser) |
| `/api/cron/snapshot` | Manually trigger a follower count snapshot |

## Known limitations

- **Song/sound data** — not available via TikTok API; tag manually per post
- **Save/bookmark count** — not exposed by TikTok Display API
- **Follower history** — no historical API; built from daily snapshots going forward (seed past data manually)
- **Sandbox mode** — `user.info.stats` (follower count) may not work until the TikTok app is approved for production

## For Claude code
Just open a new terminal in this directory and run:

cd ~/tiktok-dashboard
npm run dev

For the backend (if testing locally with file storage):
npm run dev:vercel

Though since this is deployed on Vercel, pushing changes will make them go live —  no local server needed for most things.