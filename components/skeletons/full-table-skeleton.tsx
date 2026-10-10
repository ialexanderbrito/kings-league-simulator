"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Info } from "lucide-react"

export function FullTableSkeleton() {
  const ranks = [
    { rank: 1, badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", border: "border-l-2 border-emerald-400" },
    { rank: 2, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 3, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 4, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 5, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 6, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 7, badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "border-l-2 border-amber-400" },
    { rank: 8, badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", border: "border-l-2 border-rose-500/40" },
    { rank: 9, badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", border: "border-l-2 border-rose-500/40" },
    { rank: 10, badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", border: "border-l-2 border-rose-500/40" },
  ]

  return (
    <div className="space-y-6">
      {/* Tabela Liquid Glass Card */}
      <div className="liquid-glass-card relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] bg-[#0d0d12]/80 backdrop-blur-2xl">
        {/* Specular Rim Top */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] opacity-75"
          style={{
            background: "linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)",
          }}
        />

        {/* Header Bar da Tabela */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-white/[0.06] bg-white/[0.015] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-[var(--team-primary)] shadow-sm shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-tight">
                  Tabela Oficial
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] border border-white/[0.08] text-zinc-300">
                  10 clubes
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ao Vivo
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Classificação por Vitórias e Derrotas (V-D) • Kings League Brazil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-zinc-300">
              10 Times
            </span>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto scrollbar-minimal">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-zinc-400 bg-white/[0.01]">
                <th className="py-3 px-3 sm:px-4 text-center w-12 sm:w-14">POS</th>
                <th className="py-3 px-3 sm:px-4 min-w-[180px]">TIME</th>
                <th className="py-3 px-3 text-center font-bold text-white">V - D</th>
                <th className="py-3 px-2 sm:px-3 text-center">J</th>
                <th className="py-3 px-2 sm:px-3 text-center">V</th>
                <th className="py-3 px-2 sm:px-3 text-center">D</th>
                <th className="py-3 px-2 sm:px-3 text-center">GP</th>
                <th className="py-3 px-2 sm:px-3 text-center">GC</th>
                <th className="py-3 px-2 sm:px-3 text-center font-semibold text-white">SG</th>
                <th className="py-3 px-3 sm:px-4 text-center min-w-[140px]">FORMA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs sm:text-sm">
              {ranks.map((row) => (
                <tr key={row.rank} className={`hover:bg-white/[0.02] transition-colors ${row.border}`}>
                  {/* Pos */}
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${row.badge}`}>
                      {row.rank}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-xl bg-white/10 shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <Skeleton className="h-4 w-28 bg-white/10 rounded" />
                        <Skeleton className="h-3 w-12 bg-white/5 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* V-D */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white/[0.04] border border-white/[0.08]">
                      <Skeleton className="h-3.5 w-8 bg-white/10 rounded" />
                    </span>
                  </td>

                  {/* J */}
                  <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 font-mono">
                    <Skeleton className="h-3.5 w-4 mx-auto bg-white/5 rounded" />
                  </td>

                  {/* V */}
                  <td className="py-3 px-2 sm:px-3 text-center text-emerald-400 font-bold font-mono">
                    <Skeleton className="h-3.5 w-4 mx-auto bg-emerald-500/20 rounded" />
                  </td>

                  {/* D */}
                  <td className="py-3 px-2 sm:px-3 text-center text-rose-400 font-bold font-mono">
                    <Skeleton className="h-3.5 w-4 mx-auto bg-rose-500/20 rounded" />
                  </td>

                  {/* GP */}
                  <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 font-mono">
                    <Skeleton className="h-3.5 w-5 mx-auto bg-white/5 rounded" />
                  </td>

                  {/* GC */}
                  <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 font-mono">
                    <Skeleton className="h-3.5 w-5 mx-auto bg-white/5 rounded" />
                  </td>

                  {/* SG */}
                  <td className="py-3 px-2 sm:px-3 text-center font-mono">
                    <Skeleton className="h-3.5 w-6 mx-auto bg-white/10 rounded" />
                  </td>

                  {/* Forma */}
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="w-5 h-5 rounded-md bg-white/10" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-white/[0.06] bg-white/[0.01] flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-zinc-300 font-semibold">1º Semifinal Direta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              <span className="text-zinc-300 font-semibold">2º ao 7º Playoffs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              <span className="text-zinc-400 font-medium">Eliminados</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Atualizado em tempo real
          </span>
        </div>
      </div>

      {/* Rules Accordion Preview */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400" />
          <Skeleton className="h-4 w-48 bg-white/10 rounded" />
        </div>
        <Skeleton className="h-4 w-20 bg-white/5 rounded-full" />
      </div>
    </div>
  )
}
