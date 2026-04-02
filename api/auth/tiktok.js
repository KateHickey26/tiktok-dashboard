import crypto from 'crypto'
import { saveState } from '../_store.js'
import { buildAuthUrl } from '../_tiktok.js'

export default async function handler(req, res) {
  const state = crypto.randomBytes(16).toString('hex')
  await saveState(state)
  const url = buildAuthUrl({
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    redirectUri: process.env.REDIRECT_URI,
    state,
  })
  res.redirect(url)
}
