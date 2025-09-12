import { useState } from 'react'
import type { LinkStat } from '../../types'
import { formatTimeAgo } from '../../shared/utils'

interface LinksPanelProps {
  linkMap: Record<string, LinkStat>
  onRemoveLink?: (url: string) => void
  onClearAllLinks?: () => void
}

export function LinksPanel({ linkMap, onRemoveLink, onClearAllLinks }: LinksPanelProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  
  const links = Object.values(linkMap)
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.count - a.count || new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
      }
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    })

  return (
    <div className="rounded-lg sm:rounded-2xl bg-theme-card p-3 sm:p-4 lg:p-6 shadow-theme-lg border border-theme-primary backdrop-blur-sm h-[320px] sm:h-[380px] lg:h-[440px] xl:h-[500px] flex flex-col">
      <div className="mb-2 sm:mb-3 lg:mb-4 flex flex-col gap-1.5 sm:gap-2 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-theme-primary">Paylaşılan Linkler</h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
            className="rounded-md sm:rounded-lg border border-theme-secondary bg-theme-tertiary px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-theme-primary focus:border-theme-accent focus:outline-none"
          >
            <option value="recent">En Yeni</option>
            <option value="popular">En Popüler</option>
          </select>
          {links.length > 0 && onClearAllLinks && (
            <button
              onClick={onClearAllLinks}
              className="rounded-md sm:rounded-lg border border-red-500 bg-red-500/10 hover:bg-red-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
              title="Tüm linkleri temizle"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Temizle</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-xs sm:text-sm text-theme-secondary">
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="hidden xs:inline sm:hidden lg:inline">{links.length}</span>
            <span className="xs:hidden sm:inline lg:hidden">{links.length}</span>
          </div>
        </div>
      </div>
      
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center flex-1">
          <div className="mb-2 sm:mb-3 lg:mb-4 rounded-full bg-theme-secondary p-2 sm:p-3">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm text-theme-muted">Henüz hiç link paylaşılmadı</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 lg:space-y-3 pr-1 sm:pr-2">
          {links.map((link) => (
            <div
              key={link.url}
              className="group rounded-lg sm:rounded-xl border border-theme-secondary bg-theme-secondary hover:bg-theme-tertiary p-2.5 sm:p-3 lg:p-4 transition-all hover:border-theme-accent"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded bg-theme-secondary flex-shrink-0">
                      <svg className="h-3 w-3 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-theme-accent bg-theme-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate">
                      {link.hostname}
                    </span>
                  </div>
                  
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block text-xs sm:text-sm font-medium text-theme-primary hover:text-theme-accent transition-colors truncate group-hover:underline"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                  
                  <div className="mt-2 flex items-center gap-3 text-xs text-theme-muted">
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
                  <div className="rounded-md sm:rounded-lg bg-theme-tertiary px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-theme-accent">
                    ×{link.count}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(link.url)
                      setCopiedUrl(link.url)
                      setTimeout(() => setCopiedUrl(null), 2000)
                    }}
                    className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg bg-theme-secondary text-theme-secondary transition-all hover:bg-theme-tertiary cursor-pointer relative"
                    title="Linki kopyala"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copiedUrl === link.url && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-theme-primary text-theme-card px-2 py-1 rounded text-xs whitespace-nowrap z-10 animate-fade-in">
                        Kopyalandı!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-theme-primary"></div>
                      </div>
                    )}
                  </button>
                  {onRemoveLink && (
                    <button
                      onClick={() => onRemoveLink(link.url)}
                      className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20 cursor-pointer"
                      title="Linki sil"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
