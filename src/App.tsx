
import { useEffect, useMemo, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import type { Channel as PusherChannel } from 'pusher-js'

type KickChannel = Record<string, unknown>

export default function App() {
  const [username, setUsername] = useState<string>('xqc')
  const [channel, setChannel] = useState<KickChannel | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string; username: string; message: string; createdAt?: string }>>([])

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
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Kick Channel Arama</h1>
        <p className="mt-1 text-sm text-gray-600">https://kick.com/api/v1/channels/{'{username}'} üzerinden yayıncı bilgisi çekme</p>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            void fetchChannel()
          }}
        >
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base outline-none ring-2 ring-transparent transition focus:border-gray-400 focus:ring-emerald-200"
            placeholder="kullanıcı adı örn: xqc"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Yükleniyor…' : 'Getir'}
          </button>
        </form>

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
                <InfoRow label="Başlık" value={String((channel as any)?.livestream?.session_title ?? '-')}
                />
                <InfoRow label="Kategori" value={String((channel as any)?.livestream?.category?.name ?? '-')}
                />
                <InfoRow label="Online?" value={((channel as any)?.livestream ? 'Evet' : 'Hayır')} />
              </div>
            </div>

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
