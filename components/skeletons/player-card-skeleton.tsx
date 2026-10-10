import { Skeleton } from "@/components/ui/skeleton"

export function PlayerCardSkeleton() {
  return (
    <article className="group relative w-full h-full flex flex-col select-none">
      <div className="liquid-fifa-card rounded-2xl relative flex flex-col h-full overflow-hidden border border-white/10 bg-[#0d0d14]/90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
        {/* Ambient Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* HEADER EA FC: Overall (OVR) + Posição + Número + Tier Badge */}
        <div className="relative z-10 px-3.5 pt-3.5 pb-1 flex items-start justify-between">
          {/* Cluster Esquerdo: OVR & Role */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-9 w-12 bg-white/15 rounded-lg" />
            <Skeleton className="h-4 w-10 bg-white/10 rounded" />
          </div>

          {/* Cluster Direito: Badges & Jersey */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-7 bg-white/10 rounded" />
              <Skeleton className="h-4 w-16 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Player Image Area */}
        <div className="relative h-36 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-transparent to-transparent z-10" />
          <Skeleton className="h-28 w-24 rounded-xl bg-white/10 relative z-20" />
        </div>

        {/* Player Name & Tag */}
        <div className="relative z-20 px-3.5 pt-1 pb-2 text-center space-y-1">
          <Skeleton className="h-4.5 w-28 mx-auto bg-white/10 rounded" />
          <Skeleton className="h-2.5 w-20 mx-auto bg-white/5 rounded" />
        </div>

        {/* Info Bar */}
        <div className="px-3 py-2 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-around text-[10px]">
            <div className="text-center space-y-0.5">
              <Skeleton className="h-2 w-6 mx-auto bg-white/5" />
              <Skeleton className="h-2.5 w-7 mx-auto bg-white/10" />
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center space-y-0.5">
              <Skeleton className="h-2 w-7 mx-auto bg-white/5" />
              <Skeleton className="h-2.5 w-8 mx-auto bg-white/10" />
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center space-y-0.5">
              <Skeleton className="h-2 w-8 mx-auto bg-white/5" />
              <Skeleton className="h-2.5 w-10 mx-auto bg-white/10" />
            </div>
          </div>
        </div>

        {/* Stats Grid (6 Atributos EA FC) */}
        <div className="px-3 py-2.5 border-t border-white/5">
          <div className="grid grid-cols-6 gap-1 text-center">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-5 mx-auto bg-white/10 rounded" />
                  <Skeleton className="h-2 w-4 mx-auto bg-white/5 rounded" />
                </div>
              ))}
          </div>
        </div>

        {/* Attributes Toggle Row */}
        <div className="border-t border-white/5 px-3 py-2 flex items-center justify-between">
          <Skeleton className="h-2.5 w-16 bg-white/5 rounded" />
          <Skeleton className="h-3 w-3 bg-white/5 rounded" />
        </div>
      </div>
    </article>
  )
}