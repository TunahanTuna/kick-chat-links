import { LoadingSkeleton, WelcomeScreen } from './shared/components'
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-gray-900 flex flex-col">
      <header className="sticky top-0 z-50 glassmorphism border-b border-emerald-200/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text truncate">Kick Chat Analytics</h1>
                  <p className="text-xs sm:text-sm text-emerald-700/80 hidden sm:block">Gerçek zamanlı chat izleme ve link analizi</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
              <form
                className="flex items-center gap-2 rounded-xl border border-emerald-200/50 bg-white/90 px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  void fetchChannel()
                }}
              >
                <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 min-w-0"
                  placeholder="Kullanıcı adı..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!username.trim() || isLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-700 hover:to-cyan-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span className="hidden sm:inline">Bağlanıyor...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <span>Bağlan</span>
                  )}
                </button>
              </form>
              
              {/* Connection Toggle Switch */}
              {hasEverConnected && (
                <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white/90 px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg backdrop-blur-sm border border-emerald-200/50">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Bağlantı:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (channel) {
                        handleDisconnect()
                      } else {
                        void fetchChannel()
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      channel 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 hover:shadow-xl focus:ring-emerald-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 hover:shadow-xl focus:ring-gray-400'
                    }`}
                    title={channel ? "Bağlantıyı kes" : "Tekrar bağlan"}
                  >
                    <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      channel ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}>
                      {channel ? (
                        <svg className="h-2 w-2 sm:h-3 sm:w-3 text-emerald-600 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-2 w-2 sm:h-3 sm:w-3 text-gray-500 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                  <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    channel 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {channel ? 'Aktif' : 'Kapalı'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl safe-area-inset px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex-1">
        {/* Error Message */}
        {errorMessage && (
          <div className="animate-fade-in mb-4 sm:mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-3 sm:p-4 shadow-md">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-red-800">Bir hata oluştu</h3>
                <p className="text-xs sm:text-sm text-red-700 break-words">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="animate-fade-in mb-4 sm:mb-6">
            <LoadingSkeleton />
          </div>
        )}

        {/* Channel Information */}
        {channel && !errorMessage && (
          <div className="animate-slide-up space-y-4 sm:space-y-6">
            {/* Channel Stats */}
            <ChannelInfoPanel channel={channel} username={username} />

            {/* Links and Chat Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <LinksPanel linkMap={linkMap} />
              <ChatPanel messages={messages} />
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
      <footer className="border-t border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-bold gradient-text">Kick Chat Analytics</h3>
                <p className="text-xs sm:text-sm text-emerald-700/80 hidden sm:block">Gerçek zamanlı chat izleme aracı</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <span>© {new Date().getFullYear()} Created with ❤️ by</span>
                <a
                  href="https://x.com/JausWolf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition-all hover:text-emerald-800 hover:underline"
                >
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  JausWolf
                </a>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">Real-time chat monitoring</span>
                  <span className="sm:hidden">Real-time monitoring</span>
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Link analytics
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Smart grouping
                </span>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Made for the Kick.com streaming community
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
