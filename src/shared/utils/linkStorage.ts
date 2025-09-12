import type { LinkStat } from '../../types'

const STORAGE_KEY_PREFIX = 'kick_chat_links_'
const MAX_LINKS = 10

export interface StoredLink {
  url: string
  hostname: string
  count: number
  lastAt: string
  lastSender: string
  firstSeenAt: string // To track when we first saw this link
}

/**
 * Get storage key for a specific streamer
 */
function getStorageKey(streamerSlug: string): string {
  return `${STORAGE_KEY_PREFIX}${streamerSlug}`
}

/**
 * Load stored links from localStorage for a specific streamer
 */
export function loadStoredLinks(streamerSlug: string | null): StoredLink[] {
  if (!streamerSlug) return []
  
  try {
    const stored = localStorage.getItem(getStorageKey(streamerSlug))
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    
    return parsed
      .filter((item: any) => 
        item && 
        typeof item.url === 'string' &&
        typeof item.hostname === 'string' &&
        typeof item.count === 'number' &&
        typeof item.lastAt === 'string' &&
        typeof item.lastSender === 'string' &&
        typeof item.firstSeenAt === 'string'
      )
      .slice(0, MAX_LINKS) // Ensure we never exceed the limit
  } catch (error) {
    console.error('Error loading stored links:', error)
    return []
  }
}

/**
 * Save links to localStorage for a specific streamer, maintaining only the last 10 unique links
 */
export function saveStoredLinks(streamerSlug: string | null, links: StoredLink[]): void {
  if (!streamerSlug) return
  
  try {
    // Sort by lastAt descending to keep the most recent links
    const sortedLinks = [...links].sort((a, b) => 
      new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    )
    
    // Keep only the last 10 unique links
    const uniqueLinks = sortedLinks.slice(0, MAX_LINKS)
    
    localStorage.setItem(getStorageKey(streamerSlug), JSON.stringify(uniqueLinks))
  } catch (error) {
    console.error('Error saving stored links:', error)
  }
}

/**
 * Add or update a link in storage for a specific streamer
 */
export function addOrUpdateStoredLink(streamerSlug: string | null, linkStat: LinkStat): StoredLink[] {
  if (!streamerSlug) return []
  
  const existingLinks = loadStoredLinks(streamerSlug)
  const now = new Date().toISOString()
  
  // Check if link already exists
  const existingIndex = existingLinks.findIndex(link => link.url === linkStat.url)
  
  if (existingIndex !== -1) {
    // Update existing link
    existingLinks[existingIndex] = {
      ...existingLinks[existingIndex],
      count: linkStat.count,
      lastAt: linkStat.lastAt,
      lastSender: linkStat.lastSender
    }
  } else {
    // Add new link
    const newLink: StoredLink = {
      ...linkStat,
      firstSeenAt: now
    }
    existingLinks.unshift(newLink) // Add to beginning
  }
  
  // Sort by lastAt descending and limit to MAX_LINKS
  const sortedLinks = existingLinks
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
    .slice(0, MAX_LINKS)
  
  saveStoredLinks(streamerSlug, sortedLinks)
  return sortedLinks
}

/**
 * Convert stored links to LinkStat format
 */
export function storedLinksToLinkStats(storedLinks: StoredLink[]): Record<string, LinkStat> {
  const linkMap: Record<string, LinkStat> = {}
  
  storedLinks.forEach(storedLink => {
    linkMap[storedLink.url] = {
      url: storedLink.url,
      hostname: storedLink.hostname,
      count: storedLink.count,
      lastAt: storedLink.lastAt,
      lastSender: storedLink.lastSender
    }
  })
  
  return linkMap
}

/**
 * Remove a specific link from storage for a streamer
 */
export function removeStoredLink(streamerSlug: string | null, urlToRemove: string): StoredLink[] {
  if (!streamerSlug) return []
  
  try {
    const existingLinks = loadStoredLinks(streamerSlug)
    const filteredLinks = existingLinks.filter(link => link.url !== urlToRemove)
    
    saveStoredLinks(streamerSlug, filteredLinks)
    return filteredLinks
  } catch (error) {
    console.error('Error removing stored link:', error)
    return loadStoredLinks(streamerSlug)
  }
}

/**
 * Clear all stored links for a specific streamer
 */
export function clearStoredLinks(streamerSlug: string | null): void {
  if (!streamerSlug) return
  
  try {
    localStorage.removeItem(getStorageKey(streamerSlug))
  } catch (error) {
    console.error('Error clearing stored links:', error)
  }
}

/**
 * Get the count of stored links for a specific streamer
 */
export function getStoredLinksCount(streamerSlug: string | null): number {
  if (!streamerSlug) return 0
  return loadStoredLinks(streamerSlug).length
}