import { getValidAccessToken } from './_auth.js'
import { getUserInfo } from './_tiktok.js'

export default async function handler(req, res) {
  try {
    const token = await getValidAccessToken()
    const user = await getUserInfo(token)
    res.json(user)
  } catch {
    res.json(null)
  }
}
