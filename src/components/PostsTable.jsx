import { Music, Heart, Eye, MessageCircle, Bookmark, Share2, Users, ChevronDown, ExternalLink } from 'lucide-react'
import EditPostMeta from './EditPostMeta'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function fmtDateTime(iso) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return { day, time }
}

const GENRE_COLORS = {
  'Food Review':      'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'Thrift Haul':      'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'Weekly Wrapup':    'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'Home & Lifestyle': 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'Cook With Me':     'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  'GRWM':             'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'Travel':           'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'Fitness':          'bg-red-500/15 text-red-300 border-red-500/20',
  'Storytime':        'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
}

function GenreBadge({ genre }) {
  if (!genre) return null
  const cls = GENRE_COLORS[genre] || 'bg-slate-500/15 text-slate-300 border-slate-500/20'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap`}>
      {genre}
    </span>
  )
}

function StatPill({ icon: Icon, value, color }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon size={12} />
      {fmt(value)}
    </span>
  )
}

function SortButton({ label, field, current, onClick }) {
  const active = current === field
  return (
    <button
      onClick={() => onClick(field)}
      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
      }`}
    >
      {label}
      {active ? <ChevronDown size={12} /> : null}
    </button>
  )
}

export default function PostsTable({
  posts, genres, activeGenre, setActiveGenre,
  sortBy, setSortBy, highlightedPostId, setHighlightedPostId,
  onMetaSave, allowEdit,
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-white font-semibold text-base flex-1">Posts</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Sort:</span>
          <SortButton label="Date"      field="date"      current={sortBy} onClick={setSortBy} />
          <SortButton label="Views"     field="views"     current={sortBy} onClick={setSortBy} />
          <SortButton label="Likes"     field="likes"     current={sortBy} onClick={setSortBy} />
          <SortButton label="Followers" field="followers" current={sortBy} onClick={setSortBy} />
        </div>
      </div>

      {/* Genre filter */}
      <div className="px-5 py-3 border-b border-white/[0.04] flex gap-2 overflow-x-auto">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full transition-colors ${
              activeGenre === g
                ? 'bg-violet-500 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="divide-y divide-white/[0.04]">
        {posts.map((post) => {
          const { day, time } = fmtDateTime(post.postedAt)
          const isHighlighted = highlightedPostId === post.id
          const totalEng = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0)
          const engRate = post.views > 0 ? (totalEng / post.views * 100).toFixed(1) : '—'

          return (
            <div
              key={post.id}
              onMouseEnter={() => setHighlightedPostId(post.id)}
              onMouseLeave={() => setHighlightedPostId(null)}
              className={`px-5 py-4 flex flex-col sm:flex-row gap-4 transition-colors cursor-default ${
                isHighlighted ? 'bg-violet-500/5' : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-16 sm:w-10 sm:h-[56px] flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/[0.07]">
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-slate-600 text-[10px]">▶</span>
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-start gap-2">
                  <p className="text-sm text-white font-medium leading-snug flex-1 min-w-0">{post.caption}</p>
                  <div className="flex items-center gap-1.5">
                    <GenreBadge genre={post.genre} />
                    {post.shareUrl && (
                      <a
                        href={post.shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                        title="Open on TikTok"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Music size={11} />
                  <span className="truncate max-w-[200px]">{post.song || <span className="italic text-slate-600">no song tagged</span>}</span>
                  {allowEdit && <EditPostMeta post={post} onSave={onMetaSave} />}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <StatPill icon={Eye}           value={post.views}    color="text-slate-400" />
                  <StatPill icon={Heart}         value={post.likes}    color="text-rose-400" />
                  <StatPill icon={MessageCircle} value={post.comments} color="text-sky-400" />
                  <StatPill icon={Share2}        value={post.shares}   color="text-teal-400" />
                  {post.saves != null && (
                    <StatPill icon={Bookmark} value={post.saves} color="text-amber-400" />
                  )}
                  <span className="text-xs text-slate-500">{engRate}% eng.</span>
                  {post.followersGained > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Users size={11} />
                      +{fmt(post.followersGained)}
                    </span>
                  )}
                </div>
              </div>

              {/* Date/time */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-slate-300">{day}</p>
                <p className="text-xs text-slate-500 mt-0.5">{time}</p>
              </div>
            </div>
          )
        })}
      </div>

      {posts.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">No posts match this filter.</div>
      )}
    </div>
  )
}
