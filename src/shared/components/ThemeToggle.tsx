import { useTheme } from '../contexts'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg sm:rounded-xl bg-theme-card px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 shadow-theme-lg backdrop-blur-sm border border-theme-secondary">
      <span className="text-xs sm:text-sm font-medium text-theme-secondary hidden md:inline">Tema:</span>
      
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 lg:h-6 lg:w-11 items-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl focus:ring-indigo-500' 
            : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 hover:shadow-xl focus:ring-amber-400'
        }`}
        title={theme === 'dark' ? "Açık temaya geç" : "Koyu temaya geç"}
      >
        <span className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-3.5 sm:translate-x-5 lg:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
        }`}>
          {theme === 'dark' ? (
            <svg className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-3 lg:w-3 text-indigo-600 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-3 lg:w-3 text-amber-600 absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </span>
      </button>
      
      <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap transition-colors duration-300 ${
        theme === 'dark'
          ? 'text-indigo-200 bg-indigo-900/50' 
          : 'text-amber-700 bg-amber-100'
      }`}>
        {theme === 'dark' ? 'Koyu' : 'Açık'}
      </span>
    </div>
  )
}
