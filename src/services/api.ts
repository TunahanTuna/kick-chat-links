import type { KickChannel } from '../types'

export class KickAPIService {
  private static readonly BASE_URL = 'https://kick.com/api/v1'

  static async fetchChannel(username: string, signal?: AbortSignal): Promise<KickChannel> {
    const response = await fetch(
      `${this.BASE_URL}/channels/${encodeURIComponent(username.trim())}`,
      { signal }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return response.json()
  }
}
