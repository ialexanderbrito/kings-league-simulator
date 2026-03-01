import { Skeleton } from "@/components/ui/skeleton"

export function StandingsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Simulates 2 groups */}
      {Array(2).fill(0).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          {/* Group Header */}
          <div className="flex items-center gap-2 px-3 py-2">
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-[32px_1fr_40px_32px_32px] sm:grid-cols-[40px_1fr_48px_40px_40px] gap-1 px-3 py-2 border-b border-white/5">
              <div className="text-center">
                <Skeleton className="h-3 w-3 mx-auto" />
              </div>
              <Skeleton className="h-3 w-8" />
              <div className="text-center">
                <Skeleton className="h-3 w-6 mx-auto" />
              </div>
              <div className="text-center hidden xs:block">
                <Skeleton className="h-3 w-4 mx-auto" />
              </div>
              <div className="text-center hidden xs:block">
                <Skeleton className="h-3 w-4 mx-auto" />
              </div>
            </div>

            {/* Team Rows */}
            <div className="divide-y divide-white/5">
              {Array(6).fill(0).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[32px_1fr_40px_32px_32px] sm:grid-cols-[40px_1fr_48px_40px_40px] gap-1 px-3 py-2.5 items-center"
                >
                  {/* Position */}
                  <div className="flex items-center justify-center">
                    {index === 0 ? (
                      <Skeleton className="w-6 h-6 rounded-full bg-emerald-500/20" />
                    ) : index < 7 ? (
                      <Skeleton className="w-6 h-6 rounded-full bg-[#F4AF23]/20" />
                    ) : (
                      <Skeleton className="w-4 h-4" />
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />
                    <Skeleton className="h-3.5 w-20 sm:w-28" />
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <Skeleton className="h-4 w-5 mx-auto bg-[#F4AF23]/20" />
                  </div>

                  {/* Games Played */}
                  <div className="text-center hidden xs:block">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </div>

                  {/* Goal Difference */}
                  <div className="text-center hidden xs:block">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-3 rounded-full bg-emerald-500/30" />
            <Skeleton className="h-2 w-8" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-3 rounded-full bg-[#F4AF23]/30" />
            <Skeleton className="h-2 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}