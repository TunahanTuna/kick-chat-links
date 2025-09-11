
import { useEffect, useMemo, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import type { Channel as PusherChannel } from 'pusher-js'

type KickChannel = Record<string, unknown>

export default function App() {
  const [username, setUsername] = useState<string>(() => {
    try {
      return localStorage.getItem('kick-chat-username') || ''
    } catch {
      return ''
    }
  })
  const [channel, setChannel] = useState<KickChannel | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string; username: string; message: string; createdAt?: string }>>([])
  const [hasEverConnected, setHasEverConnected] = useState<boolean>(false)

  type LinkStat = {
    url: string
    hostname: string
    count: number
    lastAt: string
    lastSender: string
  }
  const [linkMap, setLinkMap] = useState<Record<string, LinkStat>>({})

  const pusherRef = useRef<Pusher | null>(null)
  const subscriptionRef = useRef<PusherChannel | null>(null)

  const endpoint = useMemo(() => {
    if (!username.trim()) return null
    return `https://kick.com/api/v1/channels/${encodeURIComponent(username.trim())}`
  }, [username])

  async function fetchChannel(signal?: AbortSignal) {
    if (!endpoint) return
    setIsLoading(true)
    setErrorMessage(null)
    setChannel(null)
    setMessages([])
    setLinkMap({})
    try {
      const response = await fetch(endpoint, { signal })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = (await response.json()) as KickChannel
      setChannel(data)
      setHasEverConnected(true)
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setErrorMessage((error as Error).message || 'Bilinmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    if (username.trim()) {
      void fetchChannel(controller.signal)
    }
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (username.trim()) {
      try {
        localStorage.setItem('kick-chat-username', username.trim())
      } catch {
      }
    }
  }, [username])

  useEffect(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unbind_all()
        const existingName = (subscriptionRef.current as any)?.name as string | undefined
        if (existingName) pusherRef.current?.unsubscribe(existingName)
      } catch {}
    }
    subscriptionRef.current = null

    const chatroomId = Number((channel as any)?.chatroom?.id)
    if (!channel || !chatroomId) {
      return
    }

    try {
      if (!pusherRef.current) {
        pusherRef.current = new Pusher('32cbd69e4b950bf97679', {
          cluster: 'us2',
          forceTLS: true,
          enabledTransports: ['ws', 'wss'],
          disableStats: true,
        })
      }

      const channelName = `chatrooms.${chatroomId}.v2`
      const sub = pusherRef.current.subscribe(channelName)
      subscriptionRef.current = sub

      const handler = (raw: any) => {
        let payload: any = raw
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload) } catch {}
        }
        if (payload && typeof payload.data === 'string') {
          try { payload = JSON.parse(payload.data) } catch {}
        }
        const msg = payload?.message ?? payload

        const messageId = String(msg?.id ?? (typeof crypto !== 'undefined' && (crypto as any).randomUUID?.()) ?? `${Date.now()}`)
        const content = String(msg?.content ?? '')
        const userName = String(msg?.sender?.username ?? payload?.sender?.username ?? 'unknown')
        const createdAt = String(msg?.created_at ?? payload?.created_at ?? '')

        if (!content) return
        setMessages((prev) => [...prev, { id: messageId, username: userName, message: content, createdAt }])

        const urls = extractUrls(content)
        if (urls.length > 0) {
          setLinkMap((prev) => {
            const next = { ...prev }
            for (const rawUrl of urls) {
              const normalized = normalizeUrl(rawUrl)
              if (!normalized) continue
              const hostname = safeHostname(normalized)
              const exist = next[normalized]
              if (exist) {
                next[normalized] = {
                  ...exist,
                  count: exist.count + 1,
                  lastAt: createdAt || new Date().toISOString(),
                  lastSender: userName,
                }
              } else {
                next[normalized] = {
                  url: normalized,
                  hostname,
                  count: 1,
                  lastAt: createdAt || new Date().toISOString(),
                  lastSender: userName,
                }
              }
            }
            return next
          })
        }
      }
      sub.bind('App\\Events\\ChatMessageEvent', handler)

      return () => {
        sub.unbind('App\\Events\\ChatMessageEvent', handler)
        pusherRef.current?.unsubscribe(channelName)
      }
    } catch (err) {
      setErrorMessage((err as Error).message)
    }
  }, [channel])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-gray-900 flex flex-col">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-emerald-200/50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center">
            {/* Brand Section */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Kick Chat Analytics</h1>
                <p className="text-sm text-emerald-700/80">Gerçek zamanlı chat izleme ve link analizi</p>
              </div>
            </div>

            {/* Search Form and Controls */}
            <div className="flex w-full items-center gap-4 xl:w-auto">
              <form
                className="flex w-full max-w-md items-center gap-2 rounded-xl border border-emerald-200/50 bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl xl:w-auto"
                onSubmit={(e) => {
                  e.preventDefault()
                  void fetchChannel()
                }}
              >
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  placeholder="Yayıncı kullanıcı adını girin..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!username.trim() || isLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-700 hover:to-cyan-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Bağlanıyor...
                    </>
                  ) : (
                    'Bağlan'
                  )}
                </button>
              </form>
              
              {/* Connection Toggle Switch */}
              {hasEverConnected && (
                <div className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-sm border border-emerald-200/50">
                  <span className="text-sm font-medium text-gray-700">Bağlantı:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (channel) {
                        setChannel(null)
                        setMessages([])
                        setLinkMap({})
                        setErrorMessage(null)
                        
                        if (subscriptionRef.current) {
                          try {
                            subscriptionRef.current.unbind_all()
                            const existingName = (subscriptionRef.current as any)?.name as string | undefined
                            if (existingName) pusherRef.current?.unsubscribe(existingName)
                          } catch {}
                        }
                        subscriptionRef.current = null
                      } else {
                        void fetchChannel()
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      channel 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 hover:shadow-xl focus:ring-emerald-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 hover:shadow-xl focus:ring-gray-400'
                    }`}
                    title={channel ? "Bağlantıyı kes" : "Tekrar bağlan"}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      channel ? 'translate-x-6' : 'translate-x-1'
                    }`}>
                      {channel ? (
                        <svg className="h-3 w-3 text-emerald-600 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3 text-gray-500 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    channel 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {channel ? 'Aktif' : 'Bağlı Değil'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 flex-1">
        {/* Error Message */}
        {errorMessage && (
          <div className="animate-fade-in mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Bir hata oluştu</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="animate-fade-in mb-6">
            <LoadingSkeleton />
          </div>
        )}

        {/* Channel Information */}
        {channel && !errorMessage && (
          <div className="animate-slide-up space-y-6">
            {/* Channel Stats */}
            <ChannelInfoPanel channel={channel} username={username} />

            {/* Links and Chat Grid */}
            <div className="grid gap-6 xl:grid-cols-2">
              <LinksPanel linkMap={linkMap} />
              <ChatPanel messages={messages} />
            </div>

            {/* Grouped Links Panel */}
            <GroupedLinksPanel linkMap={linkMap} />
          </div>
        )}

        {/* Welcome State */}
        {!channel && !isLoading && !errorMessage && (
          <WelcomeScreen />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold gradient-text">Kick Chat Analytics</h3>
                <p className="text-sm text-emerald-700/80">Gerçek zamanlı chat izleme aracı</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>© {new Date().getFullYear()} Created with ❤️ by</span>
                <a
                  href="https://x.com/JausWolf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-all hover:text-emerald-800 hover:underline"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  JausWolf
                </a>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Real-time chat monitoring
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Link analytics
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Smart grouping
                </span>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Made for the Kick.com streaming community
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/90 p-6 shadow-lg">
        <div className="mb-4 h-6 w-32 animate-pulse bg-gray-200 rounded"></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div>
              <div className="h-5 w-full animate-pulse bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white/90 p-6 shadow-lg">
          <div className="mb-4 h-6 w-24 animate-pulse bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 animate-pulse bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-8 animate-pulse bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/90 p-6 shadow-lg">
          <div className="mb-4 h-6 w-24 animate-pulse bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse bg-gray-200 rounded"></div>
                  <div className="h-4 w-full animate-pulse bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChannelInfoPanel({ channel, username }: { channel: KickChannel; username: string }) {
  const isOnline = !!(channel as any)?.livestream
  const viewerCount = (channel as any)?.livestream?.viewer_count || 0
  const followersCount = (channel as any)?.followers_count || 0
  
  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg border border-white/20 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Kanal Bilgileri</h2>
        <div className="flex items-center gap-2">
          <span className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}></span>
          <span className={`text-sm font-medium ${isOnline ? 'text-emerald-700' : 'text-gray-500'}`}>
            {isOnline ? 'Canlı Yayında' : 'Çevrimdışı'}
          </span>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kullanıcı Adı"
          value={String((channel as any)?.slug ?? username)}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          label="Yayın Başlığı"
          value={String((channel as any)?.livestream?.session_title ?? 'Yayın Yok')}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Kategori"
          value={String((channel as any)?.livestream?.category?.name ?? 'Belirtilmemiş')}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        <StatCard
          label="İzleyici Sayısı"
          value={isOnline ? viewerCount.toLocaleString() : 'Çevrimdışı'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>
      
      {followersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{followersCount.toLocaleString()} takipçi</span>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 border border-emerald-100/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm text-emerald-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 truncate" title={value}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function ChatPanel({ messages }: { messages: Array<{ id: string; username: string; message: string; createdAt?: string }> }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg border border-white/20 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Canlı Chat</h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm text-gray-600">{messages.length} mesaj</span>
        </div>
      </div>
      
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-3">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Mesajlar yüklenmeyi bekliyor...</p>
        </div>
      ) : (
        <div 
          ref={messagesContainerRef}
          className="max-h-96 overflow-y-auto space-y-1 pr-2 scroll-smooth"
        >
          {messages.map((message) => (
            <div key={message.id} className="message-bubble group px-3 py-2 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-xs font-semibold text-white">
                  {message.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-700">{message.username}</span>
                    {message.createdAt && (
                      <span className="text-xs text-gray-400">{formatTimeAgo(message.createdAt)}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-900 break-words">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 p-8">
        <svg className="mx-auto h-16 w-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="mb-4 text-2xl font-bold gradient-text">Kick Chat Analytics'e Hoş Geldiniz</h2>
      <p className="mb-8 max-w-md text-gray-600">
        Bir yayıncının kullanıcı adını girerek canlı chat mesajlarını izleyin ve paylaşılan linkleri analiz edin.
      </p>
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 border border-emerald-200/50">
        <h3 className="mb-3 font-semibold text-gray-900">Özellikler:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Gerçek zamanlı chat izleme
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Paylaşılan linkleri otomatik toplama
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Kanal istatistikleri ve bilgileri
          </li>
        </ul>
      </div>
    </div>
  )
}

function extractUrls(text: string): string[] {
  if (!text) return []
  
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi
  const urlLike = text.match(urlRegex) || []
  
  return urlLike
    .filter((match) => {
      const beforeMatch = text.substring(0, text.indexOf(match))
      const afterMatch = text.substring(text.indexOf(match) + match.length)
      
      const beforeChar = beforeMatch.slice(-1)
      const afterChar = afterMatch.slice(0, 1)
      
      if (beforeChar && /[a-zA-Z]/.test(beforeChar) && !beforeChar.match(/\s/)) return false
      if (afterChar && /[a-zA-Z]/.test(afterChar) && !afterChar.match(/\s/)) return false
      
      const turkishWords = ['test', 'ediyorum', 'yapıyorum', 'biliyorum', 'geliyorum', 'gidiyorum']
      if (turkishWords.some(word => match.toLowerCase().includes(word) && match.split('.').length === 2)) {
        return false
      }
      
      return true
    })
    .map((u) => (u.startsWith('http') ? u : `https://${u}`))
    .filter((u) => {
      try { 
        const test = new URL(u)
        const hostname = test.hostname
        
        if (/^\d+\.[a-z]+$/i.test(hostname)) return false
        
        if (!hostname.includes('.')) return false
        
        const parts = hostname.split('.')
        if (parts.length < 2) return false
        
        if (parts.some(part => !part || /^[\d.]+$/.test(part))) return false
        
        const tld = parts[parts.length - 1]
        if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false
        
        const commonFalsePositives = ['test.com', 'example.com', 'localhost.com', 'test.test', 'deneme.com']
        if (commonFalsePositives.includes(hostname.toLowerCase())) return false
        
        if (parts.length === 2) {
          const domain = parts[0].toLowerCase()
          const commonWords = ['test', 'deneme', 'örnek', 'sample', 'demo']
          if (commonWords.includes(domain)) return false
        }
        
        return true
      } catch { 
        return false 
      }
    })
}

function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    u.hash = ''
    const params = new URLSearchParams(u.search)
    ;['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach((k) => params.delete(k))
    u.search = params.toString() ? `?${params.toString()}` : ''
    u.hostname = u.hostname.toLowerCase()
    if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
      u.port = ''
    }
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1)
    }
    return u.toString()
  } catch {
    return null
  }
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

function formatTimeAgo(iso?: string): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, Math.floor((now - then) / 1000))
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`
  return `${Math.floor(diff / 86400)}g`
}

function LinksPanel({ linkMap }: { linkMap: Record<string, { url: string; hostname: string; count: number; lastAt: string; lastSender: string }> }) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  
  const links = Object.values(linkMap)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.count - a.count || new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
      }
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    })

  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg border border-white/20 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Paylaşılan Linkler</h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="recent">En Yeni</option>
            <option value="popular">En Popüler</option>
          </select>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {links.length}
          </div>
        </div>
      </div>
      
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-3">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Henüz hiç link paylaşılmadı</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {links.map((link) => (
            <div
              key={link.url}
              className="group rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 transition-all hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      {link.hostname}
                    </span>
                  </div>
                  
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block text-sm font-medium text-gray-900 hover:text-emerald-700 transition-colors truncate group-hover:underline"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                  
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {link.lastSender}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTimeAgo(link.lastAt)} önce
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    ×{link.count}
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(link.url)}
                    className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200"
                    title="Linki kopyala"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GroupedLinksPanel({ linkMap }: { linkMap: Record<string, { url: string; hostname: string; count: number; lastAt: string; lastSender: string }> }) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  
  const links = Object.values(linkMap)

  const groupedLinks = useMemo(() => {
    const groups: Record<string, Array<{ url: string; hostname: string; count: number; lastAt: string; lastSender: string }>> = {}
    
    links.forEach(link => {
      if (!groups[link.hostname]) {
        groups[link.hostname] = []
      }
      groups[link.hostname].push(link)
    })
    
    return Object.entries(groups)
      .map(([hostname, hostLinks]) => ({
        hostname,
        links: hostLinks,
        totalCount: hostLinks.reduce((sum, link) => sum + link.count, 0),
        lastActivity: Math.max(...hostLinks.map(link => new Date(link.lastAt).getTime()))
      }))
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.totalCount - a.totalCount || b.lastActivity - a.lastActivity
        }
        return b.lastActivity - a.lastActivity
      })
  }, [links, sortBy])

  if (links.length === 0) {
    return null 
  }

  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg border border-white/20 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Site Bazında Gruplandırılmış Linkler</h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="recent">En Yeni</option>
            <option value="popular">En Popüler</option>
          </select>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {groupedLinks.length} site
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
        {groupedLinks.map((group) => (
          <div
            key={group.hostname}
            className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-hidden"
          >
            {/* Group Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{group.hostname}</h3>
                    <p className="text-xs text-white/80">{group.links.length} farklı link</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white">
                    Toplam: ×{group.totalCount}
                  </div>
                  <div className="text-xs text-white/80">
                    {formatTimeAgo(new Date(group.lastActivity).toISOString())} önce
                  </div>
                </div>
              </div>
            </div>

            {/* Group Links */}
            <div className="divide-y divide-gray-100">
              {group.links.map((link) => (
                <div key={link.url} className="group px-4 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block text-sm font-medium text-gray-900 hover:text-emerald-700 transition-colors truncate group-hover:underline mb-2"
                        title={link.url}
                      >
                        {link.url.replace(/^https?:\/\//, '').replace(group.hostname, '')}
                      </a>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {link.lastSender}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimeAgo(link.lastAt)} önce
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                        ×{link.count}
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(link.url)}
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200"
                        title="Linki kopyala"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
