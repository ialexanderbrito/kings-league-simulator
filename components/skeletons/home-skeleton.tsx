"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Crown, Table, GitMerge, Layers, Users, ChevronRight, ArrowRight } from "lucide-react"

export function HomeSkeleton() {
  const essentialTools = [
    { title: "Classificação & Tabela", subtitle: "Pontos, vitórias e saldo em tempo real", icon: Table, badge: "Ao Vivo", accent: "text-amber-400" },
    { title: "Chaveamento Playoffs", subtitle: "Simule cruzamentos até a final", icon: GitMerge, badge: "Mata-Mata", accent: "text-yellow-400" },
    { title: "Regras & Modo 12a0", subtitle: "Gol duplo, pênalti presidente e cartas", icon: Layers, badge: "Armas", accent: "text-orange-400" },
    { title: "Times & Elencos", subtitle: "Plantéis, ratings e artilheiros", icon: Users, badge: "10 Times", accent: "text-amber-300" },
  ]

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col overflow-x-hidden selection:bg-[var(--team-primary)] selection:text-black">
      <Header loading={true} />

      <div className="relative pt-24 pb-8 sm:pt-28 sm:pb-12 flex-1 flex flex-col items-center justify-start overflow-hidden">
        {/* Iluminação Ambiente Líquida Suave de Fundo */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10 flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full liquid-glass-pill mb-3">
            <KingsLeagueLogo width={16} height={20} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[11px] font-black tracking-wider uppercase text-white">
              Kings League Brasil
            </span>
            <div className="h-2.5 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                Temporada Oficial
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center tracking-tight leading-tight mb-2">
            <span className="text-white">Simulador </span>
            <span className="bg-gradient-to-r from-[var(--team-primary,#F4AF23)] via-amber-300 to-[var(--team-primary,#F4AF23)] bg-clip-text text-transparent">
              Kings League
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 text-center max-w-md mb-6 font-normal">
            Simule partidas instantaneamente, preveja os playoffs e acesse as ferramentas oficiais.
          </p>

          {/* Micro-Simulator Skeleton */}
          <div className="w-full max-w-md mb-8">
            <div className="liquid-glass-gold p-4 sm:p-5 rounded-2xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  Simulação Rápida
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">1 Clique</span>
              </div>

              {/* Matchup */}
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                  <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-xl font-black text-white">
                    <Skeleton className="w-6 h-7 rounded bg-white/10" />
                    <span className="text-zinc-500 text-sm">×</span>
                    <Skeleton className="w-6 h-7 rounded bg-white/10" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">VS</span>
                </div>

                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                  <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                </div>
              </div>

              <div className="h-10 w-full rounded-xl bg-[var(--team-primary,#F4AF23)]/20 border border-[var(--team-primary,#F4AF23)]/30 flex items-center justify-center">
                <Skeleton className="h-4 w-32 bg-[var(--team-primary,#F4AF23)]/40 rounded" />
              </div>
            </div>
          </div>

          {/* 4 Essential Tools Skeleton */}
          <div className="w-full max-w-4xl mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Ferramentas Rápidas
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Acesso direto sem enrolação</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {essentialTools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <div
                    key={tool.title}
                    className="liquid-glass-card rounded-2xl p-3.5 flex flex-col justify-between h-[132px] overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${tool.accent} shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400">
                          {tool.badge}
                        </span>
                      </div>

                      <h2 className="text-xs sm:text-sm font-bold text-white mb-1">
                        {tool.title}
                      </h2>
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                        {tool.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center text-[10px] font-bold text-[var(--team-primary,#F4AF23)] gap-1">
                      <span>Abrir</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 10 Clubs Dock Skeleton */}
          <div className="w-full max-w-2xl mb-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Os 10 Times
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--team-primary,#F4AF23)] inline-flex items-center gap-1">
                <span>Ver elencos</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2 rounded-2xl liquid-glass border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0"
                  >
                    <Skeleton className="w-7 h-7 rounded-lg bg-white/10" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
