export function extractUrls(text: string): string[] {
  if (!text) return []
  
  // Updated regex to only match URLs that start with https://, http://, or www.
  const urlRegex = /(?:https?:\/\/|www\.)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi
  const urlLike = text.match(urlRegex) || []
  
  return urlLike
    .filter((match) => {
      // Check if the match actually starts with https://, http://, or www.
      const trimmedMatch = match.trim()
      if (!trimmedMatch.startsWith('https://') && 
          !trimmedMatch.startsWith('http://') && 
          !trimmedMatch.startsWith('www.')) {
        return false
      }
      
      const beforeMatch = text.substring(0, text.indexOf(match))
      const afterMatch = text.substring(text.indexOf(match) + match.length)
      
      const beforeChar = beforeMatch.slice(-1)
      const afterChar = afterMatch.slice(0, 1)
      
      if (beforeChar && /[a-zA-Z]/.test(beforeChar) && !beforeChar.match(/\s/)) return false
      if (afterChar && /[a-zA-Z]/.test(afterChar) && !afterChar.match(/\s/)) return false
      
      const turkishWords = ['test', 'ediyorum', 'yapıyorum', 'biliyorum', 'geliyorum', 'gidiyorum']
      if (turkishWords.some(word => match.toLowerCase().includes(word) && match.split('.').length === 2)) {
        return false
      }
      
      return true
    })
    .map((u) => (u.startsWith('http') ? u : `https://${u}`))
    .filter((u) => {
      try { 
        const test = new URL(u)
        const hostname = test.hostname
        
        if (/^\d+\.[a-z]+$/i.test(hostname)) return false
        
        if (!hostname.includes('.')) return false
        
        const parts = hostname.split('.')
        if (parts.length < 2) return false
        
        if (parts.some(part => !part || /^[\d.]+$/.test(part))) return false
        
        const tld = parts[parts.length - 1]
        if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false
        
        const commonFalsePositives = ['test.com', 'example.com', 'localhost.com', 'test.test', 'deneme.com']
        if (commonFalsePositives.includes(hostname.toLowerCase())) return false
        
        if (parts.length === 2) {
          const domain = parts[0].toLowerCase()
          const commonWords = ['test', 'deneme', 'örnek', 'sample', 'demo']
          if (commonWords.includes(domain)) return false
        }
        
        return true
      } catch { 
        return false 
      }
    })
}

export function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    u.hash = ''
    const params = new URLSearchParams(u.search)
    ;['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach((k) => params.delete(k))
    u.search = params.toString() ? `?${params.toString()}` : ''
    u.hostname = u.hostname.toLowerCase()
    if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
      u.port = ''
    }
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1)
    }
    return u.toString()
  } catch {
    return null
  }
}

export function safeHostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}
