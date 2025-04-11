import { Skeleton } from "@/components/ui/skeleton"

export function PlayerCardSkeleton() {
  return (
    <div className="h-full w-full" style={{ minHeight: '360px' }}>
      <div className="relative h-full rounded-lg border border-[#333] bg-[#1a1a1a] overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 z-10 pt-2 pl-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-8 h-6 -mt-1" />
        </div>

        <div className="absolute top-0 right-0 z-10 pt-2 pr-2">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>

        <div className="h-[200px] relative">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="p-2 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="mt-2 space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Skeleton className="h-2 w-6" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}