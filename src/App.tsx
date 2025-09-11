import { LoadingSkeleton, WelcomeScreen, ThemeToggle } from './shared/components'
import { useChannel, useChatAndLinks } from './shared/hooks'
import { ChannelInfoPanel } from './features/channel'
import { ChatPanel } from './features/chat'
import { LinksPanel, GroupedLinksPanel } from './features/links'

export default function App() {
  const {
    username,
    setUsername,
    channel,

    isLoading,
    errorMessage,
    hasEverConnected,
    fetchChannel,
    disconnect
  } = useChannel()

  const { messages, linkMap, clearData } = useChatAndLinks(channel)

  const handleDisconnect = () => {
    disconnect()
    clearData()
  }

  return (
    <div className="min-h-screen bg-theme-gradient text-theme-primary flex flex-col">
      <header className="sticky top-0 z-50 glassmorphism border-b border-theme-primary">
        <div className="mx-auto max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3 lg:py-4">
          <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold gradient-text truncate">Kick Chat Analytics</h1>
                  <p className="text-xs sm:text-sm text-theme-accent hidden sm:block lg:inline">Gerçek zamanlı chat izleme ve link analizi</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center lg:w-auto">
              <form
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-theme-primary bg-theme-card px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 shadow-theme-lg backdrop-blur-sm transition-all hover:shadow-theme-xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  void fetchChannel()
                }}
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-theme-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-theme-muted min-w-0 text-theme-primary"
                  placeholder="Kullanıcı adı..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!username.trim() || isLoading}
                  className="inline-flex items-center justify-center rounded-md sm:rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-semibold text-white shadow-theme-md transition-all hover:from-emerald-700 hover:to-cyan-700 hover:shadow-theme-lg disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span className="hidden xs:inline sm:hidden md:inline">Yükleniyor</span>
                      <span className="xs:hidden sm:inline md:hidden">Bağlanıyor...</span>
                    </>
                  ) : (
                    <span>Bağlan</span>
                  )}
                </button>
              </form>
              
              {/* Connection Toggle Switch */}
              {hasEverConnected && (
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg sm:rounded-xl bg-theme-card px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 shadow-theme-lg backdrop-blur-sm border border-theme-primary">
                  <span className="text-xs sm:text-sm font-medium text-theme-secondary hidden md:inline">Bağlantı:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (channel) {
                        handleDisconnect()
                      } else {
                        void fetchChannel()
                      }
                    }}
                    className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 lg:h-6 lg:w-11 items-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                      channel 
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 hover:shadow-theme-xl focus:ring-emerald-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 hover:shadow-theme-xl focus:ring-gray-400'
                    }`}
                    title={channel ? "Bağlantıyı kes" : "Tekrar bağlan"}
                  >
                    <span className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      channel ? 'translate-x-3.5 sm:translate-x-5 lg:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                    }`}>
                      {channel ? (
                        <svg className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-3 lg:w-3 text-emerald-600 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-3 lg:w-3 text-gray-500 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                  <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                    channel 
                      ? 'text-theme-accent bg-theme-secondary' 
                      : 'text-theme-muted bg-theme-secondary'
                  }`}>
                    {channel ? 'Aktif' : 'Kapalı'}
                  </span>
                </div>
              )}
              
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] safe-area-inset px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-4 lg:py-6 xl:py-8 flex-1">
        {/* Error Message */}
        {errorMessage && (
          <div className="animate-fade-in mb-2 sm:mb-4 lg:mb-6 rounded-lg sm:rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-2 sm:p-3 lg:p-4 shadow-theme-md">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-red-800">Bir hata oluştu</h3>
                <p className="text-xs sm:text-sm text-red-700 break-words">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="animate-fade-in mb-2 sm:mb-4 lg:mb-6">
            <LoadingSkeleton />
          </div>
        )}

        {/* Channel Information */}
        {channel && !errorMessage && (
          <div className="animate-slide-up space-y-2 sm:space-y-4 lg:space-y-6">
            {/* Channel Stats */}
            <ChannelInfoPanel channel={channel} username={username} />

            {/* Links and Chat Grid */}
            <div className="grid gap-2 sm:gap-4 lg:gap-6 2xl:grid-cols-2">
              <div className="order-2 2xl:order-1">
                <LinksPanel linkMap={linkMap} />
              </div>
              <div className="order-1 2xl:order-2">
                <ChatPanel messages={messages} />
              </div>
            </div>

            {/* Grouped Links Panel */}
            <GroupedLinksPanel linkMap={linkMap} />
          </div>
        )}

        {/* Welcome State */}
        {!channel && !isLoading && !errorMessage && (
          <WelcomeScreen />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-theme-primary bg-theme-secondary backdrop-blur-sm mt-auto">
        <div className="mx-auto max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold gradient-text">Kick Chat Analytics</h3>
                <p className="text-xs sm:text-sm text-theme-accent hidden sm:block">Gerçek zamanlı chat izleme aracı</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col xs:flex-row items-center gap-1 xs:gap-2 text-xs sm:text-sm text-theme-secondary">
                <span>© {new Date().getFullYear()} Created with ❤️ by</span>
                <a
                  href="https://x.com/JausWolf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-theme-accent transition-all hover:text-theme-accent-hover hover:underline"
                >
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  JausWolf
                </a>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 text-xs text-theme-muted">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden xs:inline sm:hidden md:inline">Real-time monitoring</span>
                  <span className="xs:hidden sm:inline md:hidden">Chat monitoring</span>
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Link analytics
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Smart grouping
                </span>
              </div>
              
              <div className="mt-1 text-xs text-theme-muted">
                Made for the Kick.com streaming community
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
