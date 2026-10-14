"use client"

import { FullTableSkeleton } from "@/components/skeletons/full-table-skeleton"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"

import { useLocale } from "@/contexts/locale-context"
import { useLeague } from "@/contexts/league-context"
import { AppleFlag } from "@/components/ui/apple-flag"
import { GradientTitle } from "@/components/ui/gradient-title"

export default function Loading() {
  const { t } = useLocale()
  const { selectedLeague } = useLeague()

  return (
    <main className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
      <Header loading={true} />

      {/* Iluminação Ambiente Suave */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[140px] opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
        {/* Header da Página - Padrão Oficial */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <AppleFlag country={selectedLeague.countryIso} emoji={selectedLeague.flag} size={14} />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              {t.home.officialSeason} • {selectedLeague.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            <GradientTitle title={t.pages.standingsTitle} />
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t.pages.standingsDescription}
          </p>
        </div>

        {/* Tabela de Classificação Liquid Glass */}
        <div className="pb-12 sm:pb-16">
          <FullTableSkeleton />
        </div>
      </div>

      <Footer />
    </main>
  )
}
