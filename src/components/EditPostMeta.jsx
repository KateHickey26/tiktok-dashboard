import { useState, useEffect, useRef } from 'react'
import { Pencil, Check, X, Plus } from 'lucide-react'

function GenreCombobox({ value, onChange, genres, onCreateGenre }) {
  const [input, setInput] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => { setInput(value || '') }, [value])

  useEffect(() => {
    function click(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  const filtered = genres.filter(g => g.toLowerCase().includes(input.toLowerCase()))
  const canCreate = input.trim() && !genres.find(g => g.toLowerCase() === input.trim().toLowerCase())

  function select(g) {
    setInput(g)
    onChange(g)
    setOpen(false)
  }

  async function create() {
    const name = input.trim()
    await onCreateGenre(name)
    onChange(name)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        value={input}
        onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Genre…"
        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 w-36"
      />
      {open && (filtered.length > 0 || canCreate) && (
        <div className="absolute top-full mt-1 left-0 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden">
          {filtered.map(g => (
            <button key={g} onClick={() => select(g)}
              className="w-full text-left text-xs px-3 py-2 text-slate-300 hover:bg-white/5 transition-colors">
              {g}
            </button>
          ))}
          {canCreate && (
            <button onClick={create}
              className="w-full text-left text-xs px-3 py-2 text-violet-400 hover:bg-violet-500/10 transition-colors flex items-center gap-1.5 border-t border-white/5">
              <Plus size={11} /> Create "{input.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function EditPostMeta({ post, genres, onSave, onGenresChange }) {
  const [open, setOpen] = useState(false)
  const [song, setSong] = useState(post.song || '')
  const [genre, setGenre] = useState(post.genre || '')
  const [saving, setSaving] = useState(false)

  async function handleCreateGenre(name) {
    const res = await fetch('/api/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const updated = await res.json()
    onGenresChange?.(updated)
  }

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
      <button onClick={() => setOpen(true)} title="Edit song / genre"
        className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors">
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
      <GenreCombobox
        value={genre}
        onChange={setGenre}
        genres={genres}
        onCreateGenre={handleCreateGenre}
      />
      <button onClick={handleSave} disabled={saving}
        className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors">
        <Check size={14} />
      </button>
      <button onClick={() => setOpen(false)}
        className="p-1 rounded-md text-slate-500 hover:bg-white/5 transition-colors">
        <X size={14} />
      </button>
    </div>
  )
}
