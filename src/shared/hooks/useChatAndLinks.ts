import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage, LinkStat, KickChannel } from '../../types'
import { PusherService } from '../../services'
import { extractUrls, normalizeUrl, safeHostname } from '../utils'

export function useChatAndLinks(channel: KickChannel | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [linkMap, setLinkMap] = useState<Record<string, LinkStat>>({})
  const pusherServiceRef = useRef<PusherService | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const handleMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])

    const urls = extractUrls(message.message)
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
              lastAt: message.createdAt || new Date().toISOString(),
              lastSender: message.username,
            }
          } else {
            next[normalized] = {
              url: normalized,
              hostname,
              count: 1,
              lastAt: message.createdAt || new Date().toISOString(),
              lastSender: message.username,
            }
          }
        }
        return next
      })
    }
  }, [])

  useEffect(() => {
    // Cleanup previous connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    const chatroomId = Number((channel as any)?.chatroom?.id)
    if (!channel || !chatroomId) {
      setMessages([])
      setLinkMap({})
      return
    }

    try {
      if (!pusherServiceRef.current) {
        pusherServiceRef.current = new PusherService()
      }

      unsubscribeRef.current = pusherServiceRef.current.subscribeToChat(chatroomId, handleMessage)

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
      }
    } catch (err) {
      console.error('Chat connection error:', err)
    }
  }, [channel, handleMessage])

  const clearData = useCallback(() => {
    setMessages([])
    setLinkMap({})
  }, [])

  return {
    messages,
    linkMap,
    clearData
  }
}
