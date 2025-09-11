import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-2.5 sm:p-3 lg:p-4 border border-emerald-100/50">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-md sm:rounded-lg bg-white shadow-sm text-emerald-600 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">{label}</p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate" title={value}>{value}</p>
        </div>
      </div>
    </div>
  )
}
