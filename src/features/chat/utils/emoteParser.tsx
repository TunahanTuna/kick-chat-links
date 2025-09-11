import type { ReactNode } from 'react'
import type { ChatEmote } from '../../../types'

export function parseMessageWithEmotes(content: string, emotes: ChatEmote[] = []): ReactNode[] {
  if (!emotes || emotes.length === 0) {
    const emoteRegex = /\[emote:(\d+):([^\]]+)\]/g
    const parts: ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = emoteRegex.exec(content)) !== null) {
      const [fullMatch, emoteId, emoteName] = match
      const start = match.index
      if (start > lastIndex) {
        parts.push(content.slice(lastIndex, start))
      }
      const emoteUrl = `https://files.kick.com/emotes/${emoteId}/fullsize`
      parts.push(
        <img
          key={`emote-${emoteId}-${start}`}
          src={emoteUrl}
          alt={emoteName}
          title={emoteName}
          className="inline-block h-6 w-auto mx-0.5 align-middle"
          style={{ maxHeight: '24px' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const span = document.createElement('span')
            span.textContent = emoteName
            span.className = 'text-purple-600 font-medium text-xs'
            target.parentNode?.insertBefore(span, target.nextSibling)
          }}
        />
      )

      lastIndex = start + fullMatch.length
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [content]
  }

  const parts: ReactNode[] = []
  let lastIndex = 0

  const sortedEmotes = emotes
    .filter(emote => emote && typeof emote.start === 'number' && typeof emote.end === 'number')
    .sort((a, b) => a.start - b.start)

  sortedEmotes.forEach((emote, index) => {
    const { start, end, src, name, id } = emote

    if (start > lastIndex) {
      parts.push(content.slice(lastIndex, start))
    }

    let emoteUrl = src
    if (!emoteUrl && id) {
      emoteUrl = `https://files.kick.com/emotes/${id}/fullsize`
    }

    if (emoteUrl) {
      parts.push(
        <img
          key={`emote-${index}-${start}`}
          src={emoteUrl}
          alt={name || 'emote'}
          title={name || 'emote'}
          className="inline-block h-6 w-auto mx-0.5 align-middle"
          style={{ maxHeight: '24px' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const span = document.createElement('span')
            span.textContent = name || '[emote]'
            span.className = 'text-purple-600 font-medium text-xs'
            target.parentNode?.insertBefore(span, target.nextSibling)
          }}
        />
      )
    } else {
      parts.push(
        <span key={`emote-text-${index}-${start}`} className="text-purple-600 font-medium text-xs">
          {name || '[emote]'}
        </span>
      )
    }
    
    lastIndex = end + 1
  })

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}
