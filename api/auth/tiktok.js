import crypto from 'crypto'
import { saveState } from '../_store.js'
import { buildAuthUrl } from '../_tiktok.js'

export default async function handler(req, res) {
  const state = crypto.randomBytes(16).toString('hex')
  await saveState(state)
  const redirectUri = process.env.REDIRECT_URI ||
    `https://${req.headers.host}/api/auth/callback`
  const url = buildAuthUrl({
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    redirectUri,
    state,
  })
  res.redirect(url)
}
