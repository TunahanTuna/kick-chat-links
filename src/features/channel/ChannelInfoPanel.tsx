import type { KickChannel } from '../../types'
import { StatCard } from '../../shared/components'

interface ChannelInfoPanelProps {
  channel: KickChannel
  username: string
}

export function ChannelInfoPanel({ channel, username }: ChannelInfoPanelProps) {
  const isOnline = !!(channel as any)?.livestream
  const viewerCount = (channel as any)?.livestream?.viewer_count || 0
  const followersCount = (channel as any)?.followers_count || 0
  
  return (
    <div className="w-full min-w-[350px] md:min-w-[600px] xl:min-w-[1050px] rounded-lg sm:rounded-2xl bg-theme-card p-3 sm:p-4 lg:p-6 shadow-theme-lg border border-theme-primary backdrop-blur-sm">
      <div className="mb-2 sm:mb-3 lg:mb-4 xl:mb-6 flex flex-col gap-1.5 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-theme-primary">Kanal Bilgileri</h2>
        <div className="flex items-center gap-2">
          <span className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}></span>
          <span className={`text-xs sm:text-sm font-medium ${isOnline ? 'text-theme-accent' : 'text-theme-muted'}`}>
            {isOnline ? 'Canlı Yayında' : 'Çevrimdışı'}
          </span>
        </div>
      </div>
      
      <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kullanıcı Adı"
          value={String((channel as any)?.slug ?? username)}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          label="Yayın Başlığı"
          value={String((channel as any)?.livestream?.session_title ?? 'Yayın Yok')}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Kategori"
          value={String((channel as any)?.livestream?.category?.name ?? 'Belirtilmemiş')}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        <StatCard
          label="İzleyici Sayısı"
          value={isOnline ? viewerCount.toLocaleString() : 'Çevrimdışı'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>
      
      {followersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <div className="flex items-center gap-2 text-sm text-theme-secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{followersCount.toLocaleString()} takipçi</span>
          </div>
        </div>
      )}
    </div>
  )
}
