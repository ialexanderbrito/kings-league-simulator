"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Skeleton } from "@/components/ui/skeleton"
import { Dices, Shield, Swords } from "lucide-react"

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header loading={true} />

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-amber-500/[0.04] via-amber-500/[0.01] to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
        {/* Header da Página */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              Modo Oficial • Desafio 12a0
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Desafio{" "}
            <span className="bg-gradient-to-r from-[var(--team-primary)] via-amber-300 to-[var(--team-primary)] bg-clip-text text-transparent">
              12a0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sorteie times da Kings League, escolha um craque por rodada para o seu 7 ideal e dispute a campanha pelo título invicto.
          </p>
        </div>

        {/* Layout do Minigame (Grid 4 colunas vs 8 colunas) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
          {/* Painel Esquerdo: Roleta & Configurações */}
          <div className="xl:col-span-4">
            <div className="liquid-glass-panel rounded-3xl p-5 sm:p-6 border border-white/[0.08] relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Sorteador de Times
                  </span>
                </div>
                <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
              </div>

              <div className="text-center py-6 space-y-3">
                <Skeleton className="w-20 h-20 rounded-2xl bg-white/10 mx-auto" />
                <Skeleton className="h-5 w-36 bg-white/10 mx-auto rounded" />
                <Skeleton className="h-3 w-48 bg-white/5 mx-auto rounded" />
              </div>

              <div className="h-11 w-full rounded-2xl bg-[var(--team-primary,#F4AF23)]/20 border border-[var(--team-primary,#F4AF23)]/30 flex items-center justify-center">
                <Skeleton className="h-4 w-32 bg-[var(--team-primary,#F4AF23)]/40 rounded" />
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-400">Esquema Tático</span>
                  <Skeleton className="h-4 w-16 bg-white/5 rounded" />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-400">Estilo de Jogo</span>
                  <Skeleton className="h-4 w-20 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Painel Direito: Campo de Futebol 7v7 */}
          <div className="xl:col-span-8">
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c1810]/60 p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden min-h-[480px] sm:min-h-[580px] flex flex-col justify-between">
              {/* Marcações do campo */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-white/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/10" />

              {/* Slots de Ataque */}
              <div className="flex justify-around items-center pt-4 relative z-10">
                <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
                <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
              </div>

              {/* Slots de Meio Campo */}
              <div className="flex justify-around items-center py-6 relative z-10">
                <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
                <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
              </div>

              {/* Slots de Defesa & Goleiro */}
              <div className="flex flex-col items-center gap-4 pb-4 relative z-10">
                <div className="flex justify-around items-center w-full max-w-sm">
                  <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
                  <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/10" />
                </div>
                <Skeleton className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
