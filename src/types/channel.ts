export type KickChannel = {
  id: number
  slug: string
  followers_count: number
  chatroom?: {
    id: number
  }
  livestream?: {
    viewer_count: number
    session_title: string
    category?: {
      name: string
    }
  }
}
