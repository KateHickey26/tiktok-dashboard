import { useState } from 'react'
import { Music, Heart, Eye, MessageCircle, Bookmark, Share2, Users, ChevronDown, ExternalLink, Settings2, X, Plus } from 'lucide-react'
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

const GENRE_COLORS = [
  'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'bg-red-500/15 text-red-300 border-red-500/20',
  'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  'bg-amber-500/15 text-amber-300 border-amber-500/20',
]

function genreColor(genre, allGenres) {
  const idx = allGenres.indexOf(genre)
  return GENRE_COLORS[idx % GENRE_COLORS.length] || 'bg-slate-500/15 text-slate-300 border-slate-500/20'
}

function GenreBadge({ genre, allGenres }) {
  if (!genre) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${genreColor(genre, allGenres)} whitespace-nowrap`}>
      {genre}
    </span>
  )
}

function StatPill({ icon: Icon, value, color }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon size={12} />{fmt(value)}
    </span>
  )
}

function SortButton({ label, field, current, onClick }) {
  const active = current === field
  return (
    <button onClick={() => onClick(field)}
      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
        active ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
               : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
      }`}>
      {label}{active ? <ChevronDown size={12} /> : null}
    </button>
  )
}

function TagManager({ allGenres, onGenresChange }) {
  const [open, setOpen] = useState(false)
  const [newTag, setNewTag] = useState('')

  async function deleteGenre(name) {
    const res = await fetch('/api/genres', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    onGenresChange(await res.json())
  }

  async function addGenre() {
    const name = newTag.trim()
    if (!name) return
    const res = await fetch('/api/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    onGenresChange(await res.json())
    setNewTag('')
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`p-1.5 rounded-lg transition-colors ${open ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
        title="Manage tags">
        <Settings2 size={14} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 w-56 p-3 space-y-2">
          <p className="text-xs text-slate-400 font-medium mb-2">Manage tags</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {allGenres.map(g => (
              <div key={g} className="flex items-center justify-between gap-2 group">
                <span className="text-xs text-slate-300 truncate">{g}</span>
                <button onClick={() => deleteGenre(g)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-all">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1 border-t border-white/5">
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGenre()}
              placeholder="New tag…"
              className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
            />
            <button onClick={addGenre}
              className="p-1.5 text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors">
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PostsTable({
  posts, allGenres, activeGenre, setActiveGenre,
  sortBy, setSortBy, highlightedPostId, setHighlightedPostId,
  onMetaSave, onGenresChange, allowEdit,
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
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto flex-1">
          {['All', ...allGenres].map(g => (
            <button key={g} onClick={() => setActiveGenre(g)}
              className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full transition-colors ${
                activeGenre === g
                  ? 'bg-violet-500 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10'
              }`}>
              {g}
            </button>
          ))}
        </div>
        {allowEdit && <TagManager allGenres={allGenres} onGenresChange={onGenresChange} />}
      </div>

      {/* Posts list */}
      <div className="divide-y divide-white/[0.04]">
        {posts.map((post) => {
          const { day, time } = fmtDateTime(post.postedAt)
          const isHighlighted = highlightedPostId === post.id
          const totalEng = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0)
          const engRate = post.views > 0 ? (totalEng / post.views * 100).toFixed(1) : '—'

          return (
            <div key={post.id}
              onMouseEnter={() => setHighlightedPostId(post.id)}
              onMouseLeave={() => setHighlightedPostId(null)}
              className={`px-5 py-4 flex flex-col sm:flex-row gap-4 transition-colors cursor-default ${
                isHighlighted ? 'bg-violet-500/5' : 'hover:bg-white/[0.02]'
              }`}>
              {/* Thumbnail */}
              <div className="w-12 h-16 sm:w-10 sm:h-[56px] flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/[0.07]">
                {post.thumbnail
                  ? <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-slate-600 text-[10px]">▶</span></div>
                }
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-start gap-2">
                  <p className="text-sm text-white font-medium leading-snug flex-1 min-w-0">{post.caption}</p>
                  <div className="flex items-center gap-1.5">
                    <GenreBadge genre={post.genre} allGenres={allGenres} />
                    {post.shareUrl && (
                      <a href={post.shareUrl} target="_blank" rel="noreferrer"
                        className="text-slate-600 hover:text-slate-400 transition-colors" title="Open on TikTok">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Music size={11} />
                  <span className="truncate max-w-[200px]">
                    {post.song || <span className="italic text-slate-600">no song tagged</span>}
                  </span>
                  {allowEdit && (
                    <EditPostMeta
                      post={post}
                      genres={allGenres}
                      onSave={onMetaSave}
                      onGenresChange={onGenresChange}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <StatPill icon={Eye}           value={post.views}    color="text-slate-400" />
                  <StatPill icon={Heart}         value={post.likes}    color="text-rose-400" />
                  <StatPill icon={MessageCircle} value={post.comments} color="text-sky-400" />
                  <StatPill icon={Share2}        value={post.shares}   color="text-teal-400" />
                  {post.saves != null && <StatPill icon={Bookmark} value={post.saves} color="text-amber-400" />}
                  <span className="text-xs text-slate-500">{engRate}% eng.</span>
                  {post.followersGained > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Users size={11} />+{fmt(post.followersGained)}
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
