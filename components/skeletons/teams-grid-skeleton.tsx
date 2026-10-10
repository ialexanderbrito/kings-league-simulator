import { Skeleton } from "@/components/ui/skeleton"
import { Users, Crown, ChevronRight, ArrowUpRight } from "lucide-react"

export function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-12 sm:pb-16">
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <article
            key={index}
            className="liquid-glass-card group relative overflow-hidden rounded-3xl p-5 sm:p-6 flex flex-col justify-between"
          >
            {/* Specular Top Rim */}
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] opacity-70"
              style={{
                background: "linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)",
              }}
            />

            <div>
              {/* Top: Escudo e Identidade do Clube */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Escudo do Clube */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5 bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] shrink-0 flex items-center justify-center">
                    <Skeleton className="w-full h-full rounded-xl bg-white/10" />
                  </div>

                  {/* Nome & Tag */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-5 w-3/4 max-w-[160px] bg-white/10 rounded" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12 rounded-full bg-white/[0.06]" />
                      <Skeleton className="h-4 w-10 rounded-full bg-white/[0.04]" />
                    </div>
                  </div>
                </div>

                {/* Botão de Ação / Ícone de Abertura */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center liquid-pill-btn text-zinc-400 shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Destaque Central: O Presidente */}
              <div className="my-5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    <Skeleton className="w-full h-full rounded-xl bg-white/10" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-1">
                      Presidente
                    </span>
                    <Skeleton className="h-4 w-28 bg-white/10 rounded" />
                    <span className="text-[11px] text-zinc-400 font-medium truncate block">
                      Liderança &amp; Transmissão
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Minimalista */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <Skeleton className="h-3.5 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[var(--team-primary,#F4AF23)] font-semibold text-xs">
                <span>Ver detalhes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
    </div>
  )
}
