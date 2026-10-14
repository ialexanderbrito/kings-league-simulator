import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

export function MatchesTableSkeleton() {
  const { t } = useLocale()

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Header da Seção de Jogos */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 shadow-sm flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="h-4 sm:h-5 w-24 bg-white/10 rounded-md" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800 flex-shrink-0">
              {t.matches.fiveMatches}
            </span>
          </div>
        </div>
      </div>

      {/* Seletor de Rodadas Skeleton */}
      <div className="pt-0">
        <div className="flex items-center gap-1.5 sm:gap-2 pb-2 px-0.5 overflow-x-hidden">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`min-w-[40px] sm:min-w-[46px] h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl flex items-center justify-center shrink-0 border ${
                  i === 0
                    ? "bg-[var(--team-primary,#F4AF23)]/20 border-[var(--team-primary,#F4AF23)]/40"
                    : "bg-zinc-900/60 border-zinc-800/80"
                }`}
              >
                <Skeleton className={`h-3.5 w-6 rounded ${i === 0 ? "bg-[var(--team-primary,#F4AF23)]/40" : "bg-white/10"}`} />
              </div>
            ))}
        </div>
      </div>

      {/* Partidas da Rodada */}
      <div className="space-y-1.5">
        {/* Date Header Skeleton */}
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]/70" />
            <Skeleton className="h-3 w-36 bg-white/10 rounded" />
          </div>
          <Skeleton className="h-3 w-12 bg-white/5 rounded" />
        </div>

        {/* 5 Match Cards */}
        <div className="space-y-1.5">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-zinc-800/80 bg-[#08080c]/80 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2"
              >
                {/* Match Card Top Row: Group Badge + Time */}
                <div className="flex items-center justify-between gap-1.5 pb-1 mb-1 border-b border-zinc-800/60 text-[9px]">
                  <Skeleton className="h-3.5 w-16 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-10 bg-white/5 rounded" />
                </div>

                {/* Match Card Main Row: Home Team - Score Center - Away Team */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-1">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 justify-end min-w-0">
                    <Skeleton className="h-3.5 w-20 sm:w-28 bg-white/10 rounded hidden xs:block" />
                    <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 shrink-0" />
                  </div>

                  {/* Score Inputs / Center */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                    <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0" />
                    <span className="text-zinc-600 font-bold text-xs">×</span>
                    <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0" />
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2 justify-start min-w-0">
                    <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 shrink-0" />
                    <Skeleton className="h-3.5 w-20 sm:w-28 bg-white/10 rounded hidden xs:block" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
