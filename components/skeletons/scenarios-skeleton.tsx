"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Trophy, GitCompare, Bookmark } from "lucide-react"

export function ScenariosSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] text-white">
      <Header loading={true} />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Cenários</h1>
          <p className="text-gray-400 max-w-3xl text-sm">
            Escolha um time, defina o que acontece nos próximos jogos e compare cenários sem complicação.
          </p>
        </section>

        {/* 2 Main Columns */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
          {/* Card Esquerdo: Criar Cenário */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">Criar cenário</h2>
                <p className="text-xs text-gray-400">Fluxo em 3 passos: selecione o time, aplique uma regra e salve o cenário.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Novo
              </span>
            </div>

            {/* Selected Team Banner */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">
                    Time selecionado
                  </span>
                  <Skeleton className="h-5 w-32 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-40 bg-white/5 rounded" />
                </div>
              </div>

              <div className="sm:ml-auto flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  Passo 1
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  Passo 2
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  Passo 3
                </span>
              </div>
            </div>

            {/* Step 1: Time Search + Grid */}
            <div className="space-y-2.5">
              <span className="text-sm font-semibold text-gray-300">1) Time</span>
              <div className="w-full h-10 rounded-xl bg-[#09090d] border border-white/10 px-3 flex items-center">
                <Skeleton className="h-3 w-28 bg-white/5 rounded" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                {Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border p-2.5 flex flex-col items-center gap-2 ${
                        i === 0
                          ? "border-[var(--team-primary,#F4AF23)]/50 bg-[var(--team-primary,#F4AF23)]/10"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <Skeleton className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
                      <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 2: Presets */}
            <div className="space-y-2.5 pt-2">
              <span className="text-sm font-semibold text-gray-300">2) Regra para os próximos jogos</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 space-y-1">
                      <Skeleton className="h-3.5 w-28 bg-white/10 rounded" />
                      <Skeleton className="h-2.5 w-36 bg-white/5 rounded" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Card Direito: Salvar Cenário */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">Salvar cenário</h2>
                <p className="text-xs text-gray-400">Guarde para comparar com outras projeções mais tarde.</p>
              </div>
              <Bookmark className="w-4 h-4 text-gray-500" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400">Nome do cenário</span>
                <div className="w-full h-10 rounded-xl bg-[#09090d] border border-white/10 px-3 flex items-center">
                  <Skeleton className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400">Observações (opcional)</span>
                <div className="w-full h-20 rounded-xl bg-[#09090d] border border-white/10 p-3">
                  <Skeleton className="h-3 w-44 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-full h-10 rounded-xl bg-[var(--team-primary,#F4AF23)]/20 border border-[var(--team-primary,#F4AF23)]/30 flex items-center justify-center">
                <Skeleton className="h-4 w-28 bg-[var(--team-primary,#F4AF23)]/40 rounded" />
              </div>
            </div>

            {/* Lista de Cenários Salvos */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cenários Salvos</span>
              <div className="space-y-2">
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 bg-white/10 rounded" />
                        <Skeleton className="h-2.5 w-20 bg-white/5 rounded" />
                      </div>
                      <Skeleton className="h-6 w-16 bg-white/5 rounded-lg" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Inferior: Comparar Cenários */}
        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white">Comparar cenários</h2>
              <p className="text-xs text-gray-400">Veja o impacto na tabela entre duas simulações diferentes.</p>
            </div>
            <GitCompare className="w-4 h-4 text-gray-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Posição" },
              { label: "Pontos" },
              { label: "Saldo de gols" },
              { label: "Vitórias" },
            ].map((metric, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                <span className="text-xs text-gray-400 font-semibold">{metric.label}</span>
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-6 w-12 bg-white/10 rounded" />
                  <span className="text-xs text-gray-600">vs</span>
                  <Skeleton className="h-6 w-12 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
