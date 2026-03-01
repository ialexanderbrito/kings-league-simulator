import { Skeleton } from "@/components/ui/skeleton"

export function PlayerCardSkeleton() {
  return (
    <article className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 via-zinc-600/5 to-transparent opacity-50" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header com Rating e Info */}
          <div className="p-3 pb-0">
            <div className="flex items-start gap-3">
              {/* Rating */}
              <Skeleton className="w-12 h-12 rounded-xl" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-10 rounded-md" />
                  <Skeleton className="h-4 w-14 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Player Image Area */}
          <div className="relative h-36 flex items-end justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
            <Skeleton className="h-28 w-24 rounded-lg relative z-20" />
          </div>

          {/* Info Bar */}
          <div className="px-3 py-2 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-3">
                <div>
                  <Skeleton className="h-2 w-8 mb-1" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <Skeleton className="h-2 w-10 mb-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <Skeleton className="h-2 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-3 py-2 border-t border-white/5">
            <div className="grid grid-cols-4 gap-2">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto mb-1" />
                  <Skeleton className="h-2 w-10 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Attributes Toggle */}
          <div className="border-t border-white/5">
            <div className="px-3 py-2 flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}