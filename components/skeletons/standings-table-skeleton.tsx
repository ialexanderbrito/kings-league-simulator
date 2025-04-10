import { Skeleton } from "@/components/ui/skeleton"

export function StandingsTableSkeleton() {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[30px_auto_repeat(3,1fr)] gap-1 text-xs font-medium text-gray-400 border-b border-[#333] pb-2">
        <div className="text-center">#</div>
        <div className="text-left">TIME</div>
        <div className="text-center">PTS</div>
        <div className="text-center hidden sm:block">J</div>
        <div className="text-center hidden sm:block">SG</div>
      </div>
      {Array(12).fill(0).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[30px_auto_repeat(3,1fr)] gap-1 py-2 text-sm border-b border-[#333]"
        >
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
              <Skeleton className="h-3 w-3" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="text-center flex justify-center items-center">
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="text-center hidden sm:flex justify-center items-center">
            <Skeleton className="h-3 w-3" />
          </div>
          <div className="text-center hidden sm:flex justify-center items-center">
            <Skeleton className="h-3 w-3" />
          </div>
        </div>
      ))}
    </div>
  )
}