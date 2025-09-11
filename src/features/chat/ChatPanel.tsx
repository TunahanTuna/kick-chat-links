import { useRef, useEffect } from 'react'
import type { ChatMessage } from '../../types'
import { formatTimeAgo } from '../../shared/utils'
import { parseMessageWithEmotes } from './utils/emoteParser'

interface ChatPanelProps {
  messages: ChatMessage[]
}

export function ChatPanel({ messages }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="rounded-lg sm:rounded-2xl bg-theme-card p-3 sm:p-4 lg:p-6 shadow-theme-lg border border-theme-primary backdrop-blur-sm h-[320px] sm:h-[380px] lg:h-[440px] xl:h-[500px] flex flex-col">
      <div className="mb-2 sm:mb-3 lg:mb-4 flex flex-col gap-1.5 sm:gap-2 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-theme-primary">Canlı Chat</h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-theme-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-accent"></span>
          </span>
          <span className="text-xs sm:text-sm text-theme-secondary">{messages.length} mesaj</span>
        </div>
      </div>
      
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center flex-1">
          <div className="mb-2 sm:mb-3 lg:mb-4 rounded-full bg-theme-secondary p-2 sm:p-3">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm text-theme-muted">Mesajlar yüklenmeyi bekliyor...</p>
        </div>
      ) : (
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1 pr-1 sm:pr-2 scroll-smooth"
        >
          {messages.map((message) => (
            <div key={message.id} className="message-bubble group px-2 sm:px-3 py-1 sm:py-1.5 lg:py-2 transition-colors">
              <div className="flex items-start gap-1.5 sm:gap-2 lg:gap-3">
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-xs font-semibold text-white flex-shrink-0">
                  {message.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-theme-accent truncate">{message.username}</span>
                    {message.createdAt && (
                      <span className="text-xs text-theme-muted flex-shrink-0">{formatTimeAgo(message.createdAt)}</span>
                    )}
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-theme-primary break-words">
                    {parseMessageWithEmotes(message.message, message.emotes)}
                  </div>
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
