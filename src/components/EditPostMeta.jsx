import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'

const GENRES = [
  'Food Review', 'Thrift Haul', 'Weekly Wrapup', 'Home & Lifestyle',
  'Cook With Me', 'GRWM', 'Travel', 'Fitness', 'Storytime', 'Other'
]

export default function EditPostMeta({ post, onSave }) {
  const [open, setOpen] = useState(false)
  const [song, setSong] = useState(post.song || '')
  const [genre, setGenre] = useState(post.genre || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/posts/${post.id}/meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: song || null, genre: genre || null }),
      })
      onSave(post.id, { song: song || null, genre: genre || null })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Edit song / genre"
        className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
      >
        <Pencil size={12} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-1">
      <input
        value={song}
        onChange={e => setSong(e.target.value)}
        placeholder="Song name"
        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 w-40"
      />
      <select
        value={genre}
        onChange={e => setGenre(e.target.value)}
        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-violet-500/50"
      >
        <option value="">Genre…</option>
        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => setOpen(false)}
        className="p-1 rounded-md text-slate-500 hover:bg-white/5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
