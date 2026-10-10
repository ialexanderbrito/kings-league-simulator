"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"
import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"
import { TableIcon, Swords, RotateCcw, Share2 } from "lucide-react"

export function LoadingState() {
  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header loading={true} />

      <div className="container mx-auto px-2.5 sm:px-4 py-2.5 sm:py-3.5 max-w-7xl flex-1 flex flex-col">
        {/* Header Compacto de Transmissão / Streamer (Exatamente idêntico ao carregado) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4 mb-2.5 sm:mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <KingsLeagueLogo width={18} height={22} className="drop-shadow-[0_0_8px_rgba(244,175,35,0.4)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-none truncate">
                  Simulador <span className="text-[var(--team-primary,#F4AF23)]">Kings League Brasil</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-900/60 border border-zinc-800 text-zinc-400 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  Oficial
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 hidden xs:block truncate">
                5 jogos por rodada • Classificação recalculada em tempo real
              </p>
            </div>
          </div>

          {/* SimulatorControls Skeleton */}
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
                    <span className="text-sm sm:text-base font-black text-white leading-tight">Classificação</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800">
                      Fase Regular
                    </span>
                  </div>
                </div>

                {/* Badge Ao Vivo */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">AO VIVO</span>
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