import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg sm:rounded-xl bg-theme-gradient-card p-2.5 sm:p-3 lg:p-4 border border-theme-primary shadow-theme-sm">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-md sm:rounded-lg bg-theme-tertiary shadow-theme-sm text-theme-accent flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-theme-secondary uppercase tracking-wide truncate">{label}</p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base font-semibold text-theme-primary truncate" title={value}>{value}</p>
        </div>
      </div>
    </div>
  )
}
