"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"
import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"
import { TableIcon, Swords, RotateCcw, Share2 } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"
import { useLeague } from "@/contexts/league-context"
import { AppleFlag } from "@/components/ui/apple-flag"
import { GradientTitle } from "@/components/ui/gradient-title"

export function LoadingState() {
  const { t } = useLocale()
  const { selectedLeague } = useLeague()

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header loading={true} />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
                <AppleFlag country={selectedLeague.countryIso} emoji={selectedLeague.flag} size={14} />
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
                  {t.home.officialSeason} • {selectedLeague.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  <GradientTitle title={t.pages.simulatorTitle} />
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.04] border border-white/10 text-zinc-500 select-none">
                  {t.ui.loading}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {t.pages.simulatorDescription}
              </p>
            </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <div className="h-8 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-1.5 text-zinc-400">
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3 w-14 bg-white/10 rounded" />
            </div>
            <div className="h-8 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-1.5 text-zinc-400">
              <Swords className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
              <Skeleton className="h-3 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-8 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-1.5 text-zinc-400">
              <Share2 className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3 w-14 bg-white/10 rounded" />
            </div>
          </div>
          </div>
        </div>

        {/* MainContent Grid idêntico à página renderizada */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,390px] xl:grid-cols-[1fr,440px] gap-4 sm:gap-6 items-start">
          {/* Matches Section */}
          <div className="relative rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#09090d]/90 backdrop-blur-md shadow-2xl p-2.5 sm:p-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />
            <MatchesTableSkeleton />
          </div>

          {/* Standings Section */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="relative rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#09090d] shadow-2xl divide-y divide-zinc-800/60">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />

              {/* Header com estilo oficial de transmissão */}
              <div className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 bg-[#07070b] border-b border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 shadow-sm shadow-[var(--team-primary,#F4AF23)]/10">
                    <TableIcon className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">{t.nav.standings}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800">
                      {t.common.regularPhase}
                    </span>
                  </div>
                </div>

              </div>

              {/* Content */}
              <div className="p-0">
                <StandingsTableSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
