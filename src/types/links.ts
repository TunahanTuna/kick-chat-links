export type LinkStat = {
  url: string
  hostname: string
  count: number
  lastAt: string
  lastSender: string
}

export type GroupedLink = {
  hostname: string
  links: LinkStat[]
  totalCount: number
  lastActivity: number
}
