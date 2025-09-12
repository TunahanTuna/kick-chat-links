export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 text-center px-4 animate-slide-in-bottom">
      <div className="mb-6 sm:mb-8 rounded-2xl bg-theme-gradient-card p-6 sm:p-8 shadow-theme-lg animate-bounce-in" style={{ animationDelay: '0.2s' }}>
        <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-theme-accent animate-pulse-gentle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-3xl font-bold gradient-text animate-slide-in-right" style={{ animationDelay: '0.4s' }}>Kick Chat Analytics'e Hoş Geldiniz</h2>
      <p className="mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg text-sm sm:text-base text-theme-secondary leading-relaxed animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
        Bir yayıncının kullanıcı adını girerek canlı chat mesajlarını izleyin ve paylaşılan linkleri analiz edin.
      </p>
      <div className="w-full max-w-md sm:max-w-lg rounded-xl bg-theme-card p-4 sm:p-6 border border-theme-primary shadow-theme-md animate-slide-in-bottom" style={{ animationDelay: '0.8s' }}>
        <h3 className="mb-3 text-sm sm:text-base font-semibold text-theme-primary">Özellikler:</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-theme-secondary">
          <li className="flex items-center gap-2">
            <svg className="h-3 w-3 sm:h-4 sm:w-4 text-theme-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Gerçek zamanlı chat izleme
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-3 w-3 sm:h-4 sm:w-4 text-theme-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Paylaşılan linkleri otomatik toplama
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-3 w-3 sm:h-4 sm:w-4 text-theme-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Kanal istatistikleri ve bilgileri
          </li>
        </ul>
      </div>
    </div>
  )
}
