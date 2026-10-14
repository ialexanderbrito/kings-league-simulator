"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Plus, SlidersHorizontal, RotateCcw, Download, Share2 } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"
import { useLeague } from "@/contexts/league-context"
import { GradientTitle } from "@/components/ui/gradient-title"

export function TierListSkeleton() {
  const { t } = useLocale()
  const { selectedLeague } = useLeague()

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header loading={true} />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col">
        {/* Header da Página - Estilo idêntico ao da Home */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              {t.tier.officialMaker}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            <GradientTitle title={t.pages.tierTitle} />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t.tier.pageDescription}
          </p>
        </div>

        {/* Barra de Controles Minimalista Skeleton */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] p-2.5 sm:p-3 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-zinc-400">
              <Plus className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3.5 w-20 bg-white/10 rounded" />
            </div>
            <div className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-zinc-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3.5 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-zinc-400">
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3.5 w-14 bg-white/10 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-zinc-400">
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <Skeleton className="h-3.5 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-8 px-3 rounded-xl bg-[var(--team-primary,#F4AF23)]/20 border border-[var(--team-primary,#F4AF23)]/30 flex items-center gap-1.5 text-zinc-400">
              <Share2 className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
              <Skeleton className="h-3.5 w-24 bg-[var(--team-primary,#F4AF23)]/40 rounded" />
            </div>
          </div>
        </div>

        {/* Banco de Times Disponíveis (Dock Compacto) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] mb-4 sm:mb-6 p-3">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <Skeleton className="h-4 w-36 bg-white/10 rounded" />
            <Skeleton className="h-4 w-24 bg-white/5 rounded" />
          </div>
          <div className="min-h-[84px] p-2 rounded-xl border border-dashed border-white/[0.08] bg-[#060608] flex flex-wrap gap-2">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-xl bg-white/5 border border-white/5 shrink-0"
                />
              ))}
          </div>
        </div>

        {/* Tabela Oficial TierMaker */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#09090d] shadow-2xl mb-8 divide-y divide-white/[0.06]">
          {/* Cabeçalho oficial com design de transmissão esportiva */}
          <div className="relative overflow-hidden px-5 py-4 sm:px-6 sm:py-4.5 bg-[#07070b] border-b border-white/[0.08] flex items-center justify-between gap-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />

            {/* Identidade Kings League */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="relative shrink-0 flex items-center justify-center">
                <KingsLeagueLogo width={32} height={38} className="drop-shadow-[0_0_12px_rgba(244,175,35,0.45)]" />
              </div>
              <div className="flex flex-col justify-center select-none">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black uppercase text-white tracking-wider whitespace-nowrap leading-tight">
                    {selectedLeague.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--team-primary,#F4AF23)] text-black whitespace-nowrap shadow-sm leading-none">
                    {t.nav.tierList}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider whitespace-nowrap mt-1 leading-tight">
                  {t.tier.communityRanking}
                </span>
              </div>
            </div>

            {/* Badge Oficial do Simulador */}
            <div className="flex items-center gap-2 shrink-0 select-none">
              <div className="flex flex-col items-end justify-center px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 leading-none whitespace-nowrap">
                    {t.common.officialSimulator.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--team-primary,#F4AF23)] leading-none tracking-tight whitespace-nowrap">
                  klsimulator.vercel.app
                </span>
              </div>
            </div>
          </div>

          {/* Linhas de Tier (S, A, B, C, D) */}
          {[
            { label: "S", color: "bg-[#ff7f7f] text-black", count: 0 },
            { label: "A", color: "bg-[#ffbf7f] text-black", count: 0 },
            { label: "B", color: "bg-[#ffff7f] text-black", count: 0 },
            { label: "C", color: "bg-[#7fff7f] text-black", count: 0 },
            { label: "D", color: "bg-[#7fbfff] text-black", count: 0 },
          ].map((row, i) => (
            <div key={i} className="flex items-stretch min-h-[72px] sm:min-h-[84px]">
              <div className={`w-20 sm:w-28 md:w-32 ${row.color} font-black text-xl flex items-center justify-center p-2 shrink-0 select-none`}>
                {row.label}
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-2 p-2.5 bg-[#0c0c11]">
                <div className="h-full flex items-center text-xs text-zinc-600 italic px-2">
                  {t.ui.dragTeams}
                </div>
              </div>
              <div className="w-8 bg-[#08080b] border-l border-white/[0.06] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
