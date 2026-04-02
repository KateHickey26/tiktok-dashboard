import { consumeState, saveTokens } from '../_store.js'
import { exchangeCode } from '../_tiktok.js'
import { getUserInfo } from '../_tiktok.js'
import { appendFollowerSnapshot } from '../_store.js'

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query

  if (error) {
    return res.redirect(`/?auth_error=${encodeURIComponent(error_description || error)}`)
  }

  const valid = await consumeState(state)
  if (!valid) {
    return res.redirect('/?auth_error=invalid_state')
  }

  try {
    const tokens = await exchangeCode({
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      redirectUri: process.env.REDIRECT_URI,
    })
    await saveTokens(tokens)

    // Snapshot follower count right after login
    try {
      const user = await getUserInfo(tokens.access_token)
      if (user?.follower_count != null) await appendFollowerSnapshot(user.follower_count)
    } catch { /* non-fatal */ }

    res.redirect('/?auth_success=1')
  } catch (err) {
    res.redirect(`/?auth_error=${encodeURIComponent(err.message)}`)
  }
}
