import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import StatCards from './components/StatCards'
import FollowerChart from './components/FollowerChart'
import PostsTable from './components/PostsTable'
import ConnectScreen from './components/ConnectScreen'
import { posts as mockPosts, followerHistory as mockHistory } from './mockData'
import './index.css'

function useServerData() {
  const [status, setStatus] = useState('loading') // 'loading' | 'connected' | 'disconnected'
  const [posts, setPosts] = useState([])
  const [followerHistory, setFollowerHistory] = useState([])
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const statusRes = await fetch('/api/status')
      // If fetch fails (server not running), fall back gracefully
      if (!statusRes.ok) throw new Error('Server unavailable')
      const { connected } = await statusRes.json()

      if (!connected) {
        setStatus('disconnected')
        return
      }

      const [postsRes, historyRes, userRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/follower-history'),
        fetch('/api/user'),
      ])

      if (!postsRes.ok || !historyRes.ok) throw new Error('Failed to load data')

      const [postsData, historyData, userData] = await Promise.all([
        postsRes.json(),
        historyRes.json(),
        userRes.ok ? userRes.json() : Promise.resolve(null),
      ])

      setPosts(postsData)
      setFollowerHistory(historyData)
      setUser(userData)
      setStatus('connected')
    } catch {
      // Server not running — silently use mock data
      setStatus('mock')
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { status, posts, followerHistory, user, error, reload: load }
}

export default function App() {
  const { status, posts: livePosts, followerHistory: liveHistory, user, reload } = useServerData()
  const [activeGenre, setActiveGenre] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [highlightedPostId, setHighlightedPostId] = useState(null)

  // Check for auth redirect params
  const params = new URLSearchParams(window.location.search)
  const authError = params.get('auth_error')
  const authSuccess = params.get('auth_success')

  useEffect(() => {
    if (authSuccess) {
      window.history.replaceState({}, '', '/')
      reload()
    }
  }, [authSuccess, reload])

  const usingMock = status === 'mock'
  const posts = usingMock ? mockPosts : livePosts
  const followerHistory = usingMock ? mockHistory : liveHistory

  const genres = ['All', ...Array.from(new Set(posts.map(p => p.genre).filter(Boolean)))]

  const filtered = posts
    .filter(p => activeGenre === 'All' || p.genre === activeGenre)
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views
      if (sortBy === 'likes') return b.likes - a.likes
      if (sortBy === 'followers') return (b.followersGained ?? 0) - (a.followersGained ?? 0)
      return new Date(b.postedAt) - new Date(a.postedAt)
    })

  function handleMetaSave(videoId, fields) {
    // Optimistically update local post list
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'disconnected') {
    return <ConnectScreen authError={authError} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200">
      <Header user={user} usingMock={usingMock} reload={reload} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
        {usingMock && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300 flex items-center justify-between">
            <span>Showing mock data — backend server not running. Start it with <code className="font-mono bg-white/5 px-1 rounded">npm run dev:server</code></span>
          </div>
        )}
        <StatCards posts={posts} followerHistory={followerHistory} />
        <FollowerChart
          data={followerHistory}
          posts={posts}
          highlightedPostId={highlightedPostId}
          onHoverPost={setHighlightedPostId}
          onSnapshot={reload}
        />
        <PostsTable
          posts={filtered}
          genres={genres}
          activeGenre={activeGenre}
          setActiveGenre={setActiveGenre}
          sortBy={sortBy}
          setSortBy={setSortBy}
          highlightedPostId={highlightedPostId}
          setHighlightedPostId={setHighlightedPostId}
          onMetaSave={handleMetaSave}
          allowEdit={!usingMock}
        />
      </main>
    </div>
  )
}
