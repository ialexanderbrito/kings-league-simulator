import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function MatchesTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--team-primary]/10 border border-[var(--team-primary]/20">
            <Calendar className="w-5 h-5 text-[var(--team-primary,#F4AF23)]" />
          </div>
          <div>
            <span className="text-lg font-semibold text-white">Partidas</span>
            <p className="text-sm text-gray-500">Simule os resultados</p>
          </div>
        </div>

        {/* Playoffs button skeleton (desktop) */}
        <div className="hidden sm:flex">
          <Skeleton className="h-9 w-24 rounded-full bg-[var(--team-primary]/20" />
        </div>
      </div>

      {/* Round Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <ScrollArea className="w-full pb-1">
            <div className="flex space-x-1.5 px-1 min-w-max pb-1 items-center">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="flex-none">
                  <Skeleton
                    className={`h-8 w-16 rounded-full ${i === 0 ? "bg-[var(--team-primary]/30" : ""}`}
                  />
                </div>
              ))}
            </div>
            <ScrollBar
              orientation="horizontal"
              className="h-1.5 bg-transparent mt-1"
            />
          </ScrollArea>
        </div>

        {/* Playoffs button skeleton (mobile) */}
        <div className="sm:hidden">
          <Skeleton className="h-10 w-full rounded-full bg-[var(--team-primary]/20" />
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-6">
        {/* Date Group */}
        <div className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4 h-4 rounded bg-[var(--team-primary]/30" />
            <Skeleton className="h-3.5 w-36" />
          </div>

          {/* Match Cards */}
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-white/5 overflow-hidden bg-gradient-to-b from-[#151515] to-[#0a0a0a]"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>

                    {/* Score Center */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                        <span className="text-gray-600 font-medium">×</span>
                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Date Group */}
        <div className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4 h-4 rounded bg-[var(--team-primary]/30" />
            <Skeleton className="h-3.5 w-32" />
          </div>

          {/* Match Cards */}
          <div className="space-y-3">
            {Array(2).fill(0).map((_, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-white/5 overflow-hidden bg-gradient-to-b from-[#151515] to-[#0a0a0a]"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>

                    {/* Score Center */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                        <span className="text-gray-600 font-medium">×</span>
                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
