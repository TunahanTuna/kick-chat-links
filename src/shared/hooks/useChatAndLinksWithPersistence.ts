import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage, LinkStat, KickChannel } from '../../types'
import { PusherService } from '../../services'
import { extractUrls, normalizeUrl, safeHostname, loadStoredLinks, addOrUpdateStoredLink, storedLinksToLinkStats, removeStoredLink, clearStoredLinks } from '../utils'

export function useChatAndLinksWithPersistence(channel: KickChannel | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [linkMap, setLinkMap] = useState<Record<string, LinkStat>>({})
  const pusherServiceRef = useRef<PusherService | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load stored links when channel changes
  useEffect(() => {
    const streamerSlug = channel?.slug || null
    const storedLinks = loadStoredLinks(streamerSlug)
    const initialLinkMap = storedLinksToLinkStats(storedLinks)
    setLinkMap(initialLinkMap)
  }, [channel?.slug])

  const handleMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])

    const urls = extractUrls(message.message)
    if (urls.length > 0) {
      const streamerSlug = channel?.slug || null
      
      setLinkMap((prev) => {
        const next = { ...prev }
        
        for (const rawUrl of urls) {
          const normalized = normalizeUrl(rawUrl)
          if (!normalized) continue
          
          const hostname = safeHostname(normalized)
          const exist = next[normalized]
          
          let updatedLinkStat: LinkStat
          
          if (exist) {
            updatedLinkStat = {
              ...exist,
              count: exist.count + 1,
              lastAt: message.createdAt || new Date().toISOString(),
              lastSender: message.username,
            }
          } else {
            updatedLinkStat = {
              url: normalized,
              hostname,
              count: 1,
              lastAt: message.createdAt || new Date().toISOString(),
              lastSender: message.username,
            }
          }
          
          next[normalized] = updatedLinkStat
          
          // Update localStorage with the new/updated link for this specific streamer
          addOrUpdateStoredLink(streamerSlug, updatedLinkStat)
        }
        
        return next
      })
    }
  }, [channel?.slug])

  useEffect(() => {
    // Cleanup previous connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    const chatroomId = Number((channel as any)?.chatroom?.id)
    if (!channel || !chatroomId) {
      setMessages([])
      // Don't clear linkMap here - we want to keep stored links even when switching channels
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
    // Only clear current session linkMap, but keep stored links for current streamer
    const streamerSlug = channel?.slug || null
    const storedLinks = loadStoredLinks(streamerSlug)
    const persistedLinkMap = storedLinksToLinkStats(storedLinks)
    setLinkMap(persistedLinkMap)
  }, [channel?.slug])

  const removeLink = useCallback((urlToRemove: string) => {
    const streamerSlug = channel?.slug || null
    if (!streamerSlug) return

    // Remove from current state
    setLinkMap((prev) => {
      const next = { ...prev }
      delete next[urlToRemove]
      return next
    })

    // Remove from localStorage
    removeStoredLink(streamerSlug, urlToRemove)
  }, [channel?.slug])

  const clearAllLinks = useCallback(() => {
    const streamerSlug = channel?.slug || null
    
    // Only clear links, keep chat messages
    setLinkMap({})
    
    // Clear stored links for current streamer
    if (streamerSlug) {
      clearStoredLinks(streamerSlug)
    }
  }, [channel?.slug])

  return {
    messages,
    linkMap,
    clearData,
    clearAllLinks,
    removeLink
  }
}