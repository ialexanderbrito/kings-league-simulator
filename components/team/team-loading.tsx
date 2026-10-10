import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchesListSkeleton } from "@/components/team/matches-list"
import { Calendar, Users } from "lucide-react"

export function TeamLoading() {
  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Header Compacto Skeleton com Specular Rim */}
      <section className="relative overflow-hidden rounded-2xl liquid-glass-card border border-white/10 p-3 sm:p-4 shadow-xl">
        {/* Specular Rim */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] opacity-75"
          style={{
            background: "linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)",
          }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 text-left w-full md:w-auto min-w-0">
            {/* Logo Skeleton */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl liquid-stat-box p-1.5 flex items-center justify-center border border-white/10 shrink-0">
              <Skeleton className="w-full h-full rounded-xl bg-white/10" />
            </div>

            {/* Info Skeleton */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-6 w-48 sm:w-60 rounded-lg bg-white/10" />

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {/* 2 Color Dots */}
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/8">
                  <Skeleton className="w-2 h-2 rounded-full bg-white/20" />
                  <Skeleton className="w-2 h-2 rounded-full bg-white/20" />
                </div>
                {/* Staff */}
                <Skeleton className="h-3 w-28 rounded bg-white/5" />
                <Skeleton className="h-3 w-20 rounded bg-white/5" />
              </div>
            </div>
          </div>

          {/* Integrated Form Guide Skeleton */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0 w-full md:w-auto">
            <div className="flex flex-col md:items-end space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Forma Recente
              </span>
              <span className="text-[10px] text-zinc-600">Últimos 5 jogos</span>
            </div>
            <div className="flex gap-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="w-6 h-6 rounded-md bg-white/10" />
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Cards Compactos Skeleton em Linha Única */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {[
          { label: "Jogos", value: "—", sub: "Vitórias / Derrotas" },
          { label: "Aproveitamento", value: "—%", sub: "Desempenho Geral" },
          { label: "Saldo de Gols", value: "—", sub: "Gols Pró / Contra" },
          { label: "Elenco", value: "—", sub: "Plantel Inscrito" },
        ].map((item, i) => (
          <div key={i} className="liquid-glass-card rounded-2xl p-2.5 sm:p-3 border border-white/8 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-zinc-400">{item.label}</span>
              <Skeleton className="h-4 w-10 rounded bg-white/10" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full bg-white/10" />
            <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px] text-zinc-500">
              <span>{item.sub}</span>
              <Skeleton className="h-2.5 w-12 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </section>

      {/* Sub-Navegação de Abas Skeleton Centralizada */}
      <div className="space-y-4">
        <div className="flex justify-center items-center py-2 sm:py-3">
          <div className="p-1 rounded-full liquid-nav-track flex gap-1 border border-white/10 shadow-md">
            <div className="h-7 px-4 rounded-full bg-white/10 flex items-center gap-2 text-white">
              <Calendar className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
              <span className="text-xs font-bold">Partidas</span>
            </div>
            <div className="h-7 px-4 rounded-full flex items-center gap-2 text-zinc-400">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Elenco</span>
            </div>
          </div>
        </div>

        <MatchesListSkeleton />
      </div>
    </div>
  )
}