export type ChatMessage = {
  id: string
  username: string
  message: string
  createdAt?: string
  emotes?: ChatEmote[]
}

export type ChatEmote = {
  id?: string
  name: string
  src?: string
  start: number
  end: number
}
