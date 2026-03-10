import { Skeleton } from "@/components/ui/skeleton"

export function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array(12).fill(0).map((_, index) => (
        <div key={index} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse" />

          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="rounded-2xl bg-white/5" style={{ width: '72px', height: '72px' }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
                <Skeleton className="h-3 w-20 bg-white/5" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded bg-white/5" />
                <Skeleton className="h-3 w-16 bg-white/5" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/5" />
                  <Skeleton className="h-3 w-16 bg-white/5" />
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-2.5 w-12 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
