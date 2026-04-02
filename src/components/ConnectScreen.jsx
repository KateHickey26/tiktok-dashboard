import { Music2, ArrowRight, Eye, Heart, Users, TrendingUp } from 'lucide-react'

export default function ConnectScreen({ authError }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ee1d52] flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Music2 size={28} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">TikTok Dashboard</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Connect your TikTok account to see your posts, engagement stats,
            and follower growth all in one place.
          </p>
        </div>

        {/* What you'll see */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: Eye,       label: 'Views & engagement',  color: 'text-sky-400'    },
            { icon: Heart,     label: 'Likes & comments',    color: 'text-rose-400'   },
            { icon: Users,     label: 'Follower growth',     color: 'text-violet-400' },
            { icon: TrendingUp, label: 'Per-post impact',   color: 'text-amber-400'  },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-rose-300">
            Auth error: {authError}
          </div>
        )}

        {/* CTA */}
        <a
          href="/api/auth/tiktok"
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#ff2d55] to-[#ee1d52] text-white font-semibold text-sm py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/20"
        >
          Connect TikTok Account
          <ArrowRight size={16} />
        </a>

        <p className="text-xs text-slate-600">
          Requires a TikTok Developer app with Display API enabled.{' '}
          <a
            href="https://developers.tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-slate-400 underline underline-offset-2"
          >
            developers.tiktok.com
          </a>
        </p>
      </div>
    </div>
  )
}
