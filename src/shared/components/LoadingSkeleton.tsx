export function LoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-theme-card p-4 sm:p-6 shadow-theme-lg">
        <div className="mb-3 sm:mb-4 h-5 sm:h-6 w-24 sm:w-32 animate-pulse bg-theme-secondary rounded"></div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 sm:h-4 w-16 sm:w-20 animate-pulse bg-theme-secondary rounded"></div>
              <div className="h-4 sm:h-5 w-full animate-pulse bg-theme-secondary rounded"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-theme-card p-4 sm:p-6 shadow-theme-lg">
          <div className="mb-3 sm:mb-4 h-5 sm:h-6 w-20 sm:w-24 animate-pulse bg-theme-secondary rounded"></div>
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="h-3 sm:h-4 w-3/4 animate-pulse bg-theme-secondary rounded"></div>
                  <div className="h-2 sm:h-3 w-1/2 animate-pulse bg-theme-secondary rounded"></div>
                </div>
                <div className="h-5 sm:h-6 w-6 sm:w-8 animate-pulse bg-theme-secondary rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-theme-card p-4 sm:p-6 shadow-theme-lg">
          <div className="mb-3 sm:mb-4 h-5 sm:h-6 w-20 sm:w-24 animate-pulse bg-theme-secondary rounded"></div>
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse bg-theme-secondary rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="h-2 sm:h-3 w-16 sm:w-20 animate-pulse bg-theme-secondary rounded"></div>
                  <div className="h-3 sm:h-4 w-full animate-pulse bg-theme-secondary rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
