import { Music2, LogOut } from 'lucide-react'

export default function Header({ user, usingMock, reload }) {
  async function disconnect() {
    await fetch('/api/auth/logout', { method: 'POST' })
    reload()
  }

  return (
    <header className="border-b border-white/5 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2d55] to-[#ee1d52] flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">TikTok Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          {usingMock ? (
            <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Mock data
            </span>
          ) : user ? (
            <div className="flex items-center gap-2.5">
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              )}
              <span className="text-sm text-slate-300">{user.display_name}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Connected</span>
            </div>
          )}

          {!usingMock && (
            <button
              onClick={disconnect}
              title="Disconnect TikTok"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
