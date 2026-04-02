import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Merge posts into the follower history as data points, interpolating follower
 * count for post dates that fall between snapshots.
 */
function buildChartData(history, posts) {
  if (!history.length) return []

  // Index existing snapshots by date
  const byDate = Object.fromEntries(history.map(h => [h.date, { ...h }]))

  // For each post, interpolate a follower count at its publish date
  for (const post of posts) {
    const date = post.postedAt.split('T')[0]
    if (byDate[date]) {
      // Exact match — just attach postId
      byDate[date].postId = post.id
      continue
    }
    // Find surrounding snapshots to interpolate
    const before = history.filter(h => h.date <= date).at(-1)
    const after  = history.find(h => h.date > date)
    if (!before && !after) continue
    let followers
    if (!before) followers = after.followers
    else if (!after) followers = before.followers
    else {
      const t = (new Date(date) - new Date(before.date)) /
                (new Date(after.date) - new Date(before.date))
      followers = Math.round(before.followers + t * (after.followers - before.followers))
    }
    byDate[date] = { date, followers, postId: post.id, interpolated: true }
  }

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

const CustomTooltip = ({ active, payload, posts }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const post = d.postId ? posts.find(p => p.id === d.postId) : null
  return (
    <div className="bg-[#18181b] border border-white/10 rounded-xl p-3 shadow-xl text-sm min-w-[180px]">
      <p className="text-slate-400 text-xs mb-1">{fmtDate(d.date)}</p>
      <p className="text-white font-semibold text-base">{d.followers.toLocaleString()} followers</p>
      {post && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-violet-400 text-xs font-medium">Post published</p>
          <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{post.caption}</p>
          {post.followersGained != null && (
            <p className="text-emerald-400 text-xs mt-1">+{post.followersGained} followers gained</p>
          )}
        </div>
      )}
    </div>
  )
}

const CustomDot = ({ cx, cy, payload, posts, highlightedPostId, onHoverPost }) => {
  if (!payload.postId) return null
  const isHighlighted = highlightedPostId === payload.postId
  const size = 5

  return (
    <g>
      <circle
        cx={cx} cy={cy} r={size + 5}
        fill={isHighlighted ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.08)'}
        className="cursor-pointer"
        onMouseEnter={() => onHoverPost(payload.postId)}
        onMouseLeave={() => onHoverPost(null)}
      />
      <circle
        cx={cx} cy={cy} r={size}
        fill={isHighlighted ? '#8b5cf6' : '#a78bfa'}
        stroke="#0a0a0b" strokeWidth={2}
        className="cursor-pointer"
        onMouseEnter={() => onHoverPost(payload.postId)}
        onMouseLeave={() => onHoverPost(null)}
      />
    </g>
  )
}

export default function FollowerChart({ data, posts, highlightedPostId, onHoverPost, onSnapshot }) {
  const [snapping, setSnapping] = useState(false)

  async function takeSnapshot() {
    setSnapping(true)
    try {
      await fetch('/api/cron/snapshot')
      await onSnapshot?.()
    } finally {
      setSnapping(false)
    }
  }

  const chartData = buildChartData(data, posts)

  const snapshotBtn = (
    <button onClick={takeSnapshot} disabled={snapping} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
      <RefreshCw size={12} className={snapping ? 'animate-spin' : ''} />
      {snapping ? 'Snapshotting…' : 'Snapshot now'}
    </button>
  )

  if (data.length < 2) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-base">Follower Growth</h2>
            <p className="text-slate-500 text-sm mt-0.5">Snapshot your follower count daily to build this graph</p>
          </div>
          {snapshotBtn}
        </div>
        <div className="h-40 flex items-center justify-center text-slate-600 text-sm">
          {data.length === 0 ? 'No data yet — take your first snapshot' : 'Need 2+ snapshots to draw a graph — come back tomorrow or snapshot again'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-base">Follower Growth</h2>
          <p className="text-slate-500 text-sm mt-0.5">Purple dots mark post publish dates — hover to see impact</p>
        </div>
        <div className="flex items-center gap-3">
          {snapshotBtn}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
            Post published
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip posts={posts} />} />
          <Area
            type="monotone"
            dataKey="followers"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#followerGrad)"
            dot={<CustomDot posts={posts} highlightedPostId={highlightedPostId} onHoverPost={onHoverPost} />}
            activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#0a0a0b', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
