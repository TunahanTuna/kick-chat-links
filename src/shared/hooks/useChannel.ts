import { useState, useEffect } from 'react'
import type { KickChannel } from '../../types'
import { KickAPIService } from '../../services'

export function useChannel() {
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
  const [hasEverConnected, setHasEverConnected] = useState<boolean>(false)

  async function fetchChannel(signal?: AbortSignal) {
    if (!username.trim()) return
    
    setIsLoading(true)
    setErrorMessage(null)
    setChannel(null)
    
    try {
      const data = await KickAPIService.fetchChannel(username.trim(), signal)
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
        // Ignore localStorage errors
      }
    }
  }, [username])

  const disconnect = () => {
    setChannel(null)
    setErrorMessage(null)
  }

  return {
    username,
    setUsername,
    channel,
    setChannel,
    isLoading,
    errorMessage,
    hasEverConnected,
    fetchChannel,
    disconnect
  }
}
