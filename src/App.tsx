
import { useEffect, useMemo, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import type { Channel as PusherChannel } from 'pusher-js'

type KickChannel = Record<string, unknown>

export default function App() {
  const [username, setUsername] = useState<string>('')
  const [channel, setChannel] = useState<KickChannel | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string; username: string; message: string; createdAt?: string }>>([])

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
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setErrorMessage((error as Error).message || 'Bilinmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    // İlk yüklemede varsayılan kullanıcıyı getir
    void fetchChannel(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kick chat'e bağlan: chatroom id üzerinden Pusher subscribe
  useEffect(() => {
    // mevcut aboneliği temizle
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
        // Bazı durumlarda Pusher veriyi { data: "...json..." } veya direkt string döndürebilir
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload) } catch {}
        }
        if (payload && typeof payload.data === 'string') {
          try { payload = JSON.parse(payload.data) } catch {}
        }
        // Kick bazı eventlerde mesajı payload.message altında da gönderebiliyor
        const msg = payload?.message ?? payload

        const messageId = String(msg?.id ?? (typeof crypto !== 'undefined' && (crypto as any).randomUUID?.()) ?? `${Date.now()}`)
        const content = String(msg?.content ?? '')
        const userName = String(msg?.sender?.username ?? payload?.sender?.username ?? 'unknown')
        const createdAt = String(msg?.created_at ?? payload?.created_at ?? '')

        if (!content) return
        setMessages((prev) => [...prev, { id: messageId, username: userName, message: content, createdAt }])

        // Link çıkarımı ve gruplama
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
    <div className="min-h-dvh bg-gradient-to-b from-emerald-50 to-white text-gray-900">
      <header className="sticky top-0 z-10 border-b border-emerald-100/60 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-semibold text-emerald-900">Kick Link Dashboard</h1>
              <p className="mt-0.5 text-xs text-emerald-700/80">Chatte paylaşılan linkleri benzersiz olarak topla ve sırala</p>
            </div>
            <form
              className="flex w-full max-w-md items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2 py-1.5 shadow-sm sm:w-auto"
              onSubmit={(e) => {
                e.preventDefault()
                void fetchChannel()
              }}
            >
              <input
                className="w-full rounded-md px-2 py-1.5 text-sm outline-none placeholder:text-gray-400"
                placeholder="yayıncı kullanıcı adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!username.trim() || isLoading}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Yükleniyor…' : 'Bağlan'}
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* eski inline form kaldırıldı; header'da arama çubuğu var */}

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            Hata: {errorMessage}
          </div>
        )}

        {channel && !errorMessage && (
          <div className="mt-6 grid gap-4">
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-medium">Özet</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow label="Username" value={String((channel as any)?.slug ?? username)} />
                <InfoRow label="Başlık" value={String((channel as any)?.livestream?.session_title ?? '-')} />
                <InfoRow label="Kategori" value={String((channel as any)?.livestream?.category?.name ?? '-')} />
                <InfoRow label="Online?" value={((channel as any)?.livestream ? 'Evet' : 'Hayır')} />
              </div>
            </div>

            <LinksPanel linkMap={linkMap} />

            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-medium">Canlı Chat</h2>
              {messages.length === 0 ? (
                <p className="text-sm text-gray-600">Mesaj bekleniyor…</p>
              ) : (
                <ul className="max-h-[50vh] space-y-2 overflow-auto">
                  {messages.map((m) => (
                    <li key={m.id} className="text-sm">
                      <span className="font-medium text-emerald-700">{m.username}</span>
                      <span className="text-gray-400">: </span>
                      <span className="text-gray-900 break-words">{m.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-medium">Ham JSON</h2>
              <pre className="max-h-[50vh] overflow-auto rounded bg-gray-900 p-3 text-xs text-emerald-100">
{JSON.stringify(channel, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!channel && !isLoading && !errorMessage && (
          <p className="mt-6 text-sm text-gray-600">Sonuçları görmek için bir kullanıcı adı girip "Getir"e basın.</p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-28 shrink-0 text-sm font-medium text-gray-600">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  )
}

// Helpers: URL çıkarımı ve normalizasyon
function extractUrls(text: string): string[] {
  if (!text) return []
  const urlLike = text.match(/((https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?)/gi) || []
  // Mentions/emails vs gerçek domain ayırımı için basit filtre
  return urlLike
    .map((u) => (u.startsWith('http') ? u : `https://${u}`))
    .filter((u) => {
      try { const test = new URL(u); return !!test.hostname && test.hostname.includes('.') } catch { return false }
    })
}

function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    u.hash = ''
    // normalize common trackers
    const params = new URLSearchParams(u.search)
    ;['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach((k) => params.delete(k))
    u.search = params.toString() ? `?${params.toString()}` : ''
    // lowercase hostname, remove default ports, trim trailing slash
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
  const links = Object.values(linkMap)
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <h2 className="mb-2 text-lg font-medium">Son Linkler</h2>
      {links.length === 0 ? (
        <p className="text-sm text-gray-600">Henüz link yakalanmadı.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {links.map((l) => (
            <li key={l.url} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  <a className="hover:underline" href={l.url} target="_blank" rel="noreferrer noopener">{l.url}</a>
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {l.hostname} · {l.lastSender} · {formatTimeAgo(l.lastAt)} önce
                </div>
              </div>
              <div className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">×{l.count}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
