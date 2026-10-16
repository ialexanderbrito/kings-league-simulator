import { Skeleton } from "@/components/ui/skeleton"

export function PlayerCardSkeleton() {
  return (
    <article className="group relative w-full h-full flex flex-col select-none">
      <div className="liquid-fifa-card rounded-2xl relative flex flex-col h-full overflow-hidden border border-zinc-800 bg-[#0d0d14]/90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
        {/* Ambient Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* HEADER EA FC: Overall (OVR) + Posição + Número + Tier Badge */}
        <div className="relative z-10 px-4 pt-4 pb-1 flex items-start justify-between">
          {/* Cluster Esquerdo: OVR & Role */}
          <div className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-9 w-12 bg-white/15 rounded-lg" />
            <Skeleton className="h-4 w-10 bg-white/10 rounded" />
          </div>

          {/* Cluster Direito: Badges & Jersey */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-8 bg-white/10 rounded-md" />
              <Skeleton className="h-5 w-16 bg-white/10 rounded-md" />
            </div>
          </div>
        </div>

        {/* Player Image Area (h-48 sm:h-52 matching PlayerCard) */}
        <div className="relative h-48 sm:h-52 flex items-end justify-center overflow-hidden my-0.5">
          <Skeleton className="h-40 w-32 rounded-2xl bg-white/10 relative z-10" />
        </div>

        {/* Player Name & Tag */}
        <div className="relative z-10 px-3.5 pb-2 text-center space-y-1">
          <Skeleton className="h-5 w-32 mx-auto bg-white/15 rounded" />
          <Skeleton className="h-3 w-24 mx-auto bg-white/5 rounded" />
        </div>

        {/* Stats Grid (6 Atributos em 2 Colunas) */}
        <div className="relative z-10 px-3 py-2 border-t border-zinc-800 bg-black/25">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="space-y-1">
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
              <Skeleton className="h-5 w-full bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Action Foot */}
        <div className="mt-auto border-t border-zinc-800 px-3.5 py-2.5 bg-black/40 flex items-center justify-between">
          <Skeleton className="h-3 w-20 bg-white/10 rounded" />
          <Skeleton className="h-5 w-5 bg-white/10 rounded-md" />
        </div>
      </div>
    </article>
  )
}