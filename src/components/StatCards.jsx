import { Eye, Heart, Users, TrendingUp } from 'lucide-react'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function Card({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default function StatCards({ posts, followerHistory }) {
  const totalViews = posts.reduce((s, p) => s + p.views, 0)
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0)
  const totalFollowersGained = posts.reduce((s, p) => s + p.followersGained, 0)
  const currentFollowers = followerHistory[followerHistory.length - 1].followers
  const avgEngagement = posts.reduce((s, p) => {
    return s + (p.likes + p.comments + p.shares + p.saves) / p.views
  }, 0) / posts.length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={Users}
        label="Followers"
        value={fmt(currentFollowers)}
        sub={`+${fmt(totalFollowersGained)} this period`}
        color="bg-violet-500/80"
      />
      <Card
        icon={Eye}
        label="Total Views"
        value={fmt(totalViews)}
        sub={`${posts.length} posts`}
        color="bg-sky-500/80"
      />
      <Card
        icon={Heart}
        label="Total Likes"
        value={fmt(totalLikes)}
        sub={`${(totalLikes / totalViews * 100).toFixed(1)}% like rate`}
        color="bg-rose-500/80"
      />
      <Card
        icon={TrendingUp}
        label="Avg Engagement"
        value={(avgEngagement * 100).toFixed(1) + '%'}
        sub="likes + cmts + shares + saves"
        color="bg-amber-500/80"
      />
    </div>
  )
}
