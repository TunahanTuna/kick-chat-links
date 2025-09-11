import Pusher from 'pusher-js'
import type { Channel as PusherChannel } from 'pusher-js'
import type { ChatMessage } from '../types'

export type MessageHandler = (message: ChatMessage) => void

export class PusherService {
  private pusher: Pusher | null = null
  private subscription: PusherChannel | null = null

  constructor() {
    this.pusher = new Pusher('32cbd69e4b950bf97679', {
      cluster: 'us2',
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    })
  }

  subscribeToChat(chatroomId: number, onMessage: MessageHandler): () => void {
    this.unsubscribe()

    const channelName = `chatrooms.${chatroomId}.v2`
    this.subscription = this.pusher!.subscribe(channelName)

    const handler = (raw: any) => {
      const message = this.parseMessage(raw)
      if (message) {
        onMessage(message)
      }
    }

    this.subscription.bind('App\\Events\\ChatMessageEvent', handler)

    return () => {
      if (this.subscription) {
        this.subscription.unbind('App\\Events\\ChatMessageEvent', handler)
        this.pusher?.unsubscribe(channelName)
        this.subscription = null
      }
    }
  }

  private parseMessage(raw: any): ChatMessage | null {
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
    const emotes = msg?.emotes || []

    if (content && (emotes.length > 0 || content.includes('[emote:'))) {
      console.log('Message payload:', msg)
      console.log('Emotes found:', emotes)
      console.log('Message content:', content)
    }

    if (!content) return null

    return {
      id: messageId,
      username: userName,
      message: content,
      createdAt,
      emotes
    }
  }

  unsubscribe(): void {
    if (this.subscription) {
      try {
        this.subscription.unbind_all()
        const existingName = (this.subscription as any)?.name as string | undefined
        if (existingName) this.pusher?.unsubscribe(existingName)
      } catch {}
    }
    this.subscription = null
  }

  disconnect(): void {
    this.unsubscribe()
    if (this.pusher) {
      this.pusher.disconnect()
      this.pusher = null
    }
  }
}
