import { useState, useMemo, useEffect } from 'react'
import type { LinkStat, GroupedLink } from '../../types'
import { formatTimeAgo } from '../../shared/utils'

interface GroupedLinksPanelProps {
  linkMap: Record<string, LinkStat>
}

export function GroupedLinksPanel({ linkMap }: GroupedLinksPanelProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  
  const links = Object.values(linkMap)

  const toggleGroup = (hostname: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [hostname]: !prev[hostname]
    }))
  }

  const groupedLinks = useMemo(() => {
    const groups: Record<string, LinkStat[]> = {}
    
    links.forEach(link => {
      if (!groups[link.hostname]) {
        groups[link.hostname] = []
      }
      groups[link.hostname].push(link)
    })
    
    return Object.entries(groups)
      .map(([hostname, hostLinks]): GroupedLink => ({
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

  useEffect(() => {
    if (groupedLinks.length > 0 && Object.keys(expandedGroups).length === 0) {
      setExpandedGroups({ [groupedLinks[0].hostname]: true })
    }
  }, [groupedLinks, expandedGroups])

  if (links.length === 0) {
    return null 
  }

  return (
    <div className="hidden md:block rounded-xl sm:rounded-2xl bg-white/90 p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 backdrop-blur-sm">
      <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Site Bazında Gruplandırılmış Linkler</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const allExpanded = groupedLinks.every(group => expandedGroups[group.hostname])
              const newState: Record<string, boolean> = {}
              groupedLinks.forEach(group => {
                newState[group.hostname] = !allExpanded
              })
              setExpandedGroups(newState)
            }}
            className="rounded-lg border border-gray-200 bg-white px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
            title={groupedLinks.every(group => expandedGroups[group.hostname]) ? "Tümünü Daralt" : "Tümünü Genişlet"}
          >
            {groupedLinks.every(group => expandedGroups[group.hostname]) ? (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span className="hidden sm:inline">Daralt</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="hidden sm:inline">Genişlet</span>
              </div>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
            className="rounded-lg border border-gray-200 bg-white px-2 sm:px-3 py-1 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="recent">En Yeni</option>
            <option value="popular">En Popüler</option>
          </select>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {groupedLinks.length} site
          </div>
        </div>
      </div>
      
      <div className="max-h-60 sm:max-h-72 md:max-h-80 lg:max-h-96 xl:max-h-[32rem] overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2">
        {groupedLinks.map((group) => (
          <div
            key={group.hostname}
            className="rounded-lg sm:rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-hidden"
          >
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.hostname)}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 px-3 sm:px-4 py-2.5 sm:py-3 transition-all hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 sm:focus:ring-offset-2"
            >
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-white/20 flex-shrink-0">
                    <svg 
                      className={`h-3 w-3 sm:h-4 sm:w-4 text-white transition-transform duration-200 ${
                        expandedGroups[group.hostname] ? 'rotate-90' : ''
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">{group.hostname}</h3>
                    <p className="text-xs text-white/80">{group.links.length} farklı link</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="rounded-md sm:rounded-lg bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-white">
                    <span className="hidden xs:inline">Toplam: </span>×{group.totalCount}
                  </div>
                  <div className="text-xs text-white/80 hidden sm:block">
                    {formatTimeAgo(new Date(group.lastActivity).toISOString())} önce
                  </div>
                </div>
              </div>
            </button>

            {/* Group Links */}
            {expandedGroups[group.hostname] && (
              <div className="divide-y divide-gray-100 animate-fade-in">
                {group.links.map((link) => (
                <div key={link.url} className="group px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block text-xs sm:text-sm font-medium text-gray-900 hover:text-emerald-700 transition-colors truncate group-hover:underline mb-1.5 sm:mb-2"
                        title={link.url}
                      >
                        {link.url.replace(/^https?:\/\//, '').replace(group.hostname, '')}
                      </a>
                      
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 min-w-0">
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{link.lastSender}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="whitespace-nowrap">{formatTimeAgo(link.lastAt)} önce</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <div className="rounded-md sm:rounded-lg bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-gray-700">
                        ×{link.count}
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(link.url)}
                        className="opacity-0 group-hover:opacity-100 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200"
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
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
