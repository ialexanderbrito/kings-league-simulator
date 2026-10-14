"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Crown } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

export function StandingsTableSkeleton() {
  const { t } = useLocale()
  const groups = [
    {
      name: "A",
      isAdvantage: true,
      subtext: t.standings.advantageSubtext,
      ranks: [
        { badge: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300", border: "border-l-2 border-emerald-400" },
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-rose-500/15 border-rose-500/30 text-rose-400", border: "border-l-2 border-rose-500/40" },
      ],
    },
    {
      name: "B",
      isAdvantage: false,
      subtext: t.standings.noAdvantageSubtext,
      ranks: [
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-amber-400/20 border-amber-400/40 text-amber-300", border: "border-l-2 border-amber-400" },
        { badge: "bg-rose-500/15 border-rose-500/30 text-rose-400", border: "border-l-2 border-rose-500/40" },
        { badge: "bg-rose-500/15 border-rose-500/30 text-rose-400", border: "border-l-2 border-rose-500/40" },
      ],
    },
  ]

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.name} className="space-y-1">
          {/* Group Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                {t.matches.group} {group.name}
              </span>
              {group.isAdvantage ? (
                <span className="text-[9px] font-black text-[#34d399] bg-[#34d399]/15 px-2 py-0.5 rounded-full border border-[#34d399] flex items-center gap-1 select-none shadow-sm shadow-[#34d399]/25">
                  <Crown className="w-2.5 h-2.5 text-[#34d399]" />
                  <span>{t.standings.scAdvantage}</span>
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-full select-none">
                  {t.standings.threePlayoffSpots}
                </span>
              )}
            </div>
            <span className="text-[9px] text-zinc-500 font-medium hidden sm:inline">
              {group.subtext}
            </span>
          </div>

          {/* Table Header */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-[28px_1fr_48px_34px_38px] sm:grid-cols-[32px_1fr_54px_38px_42px] gap-1 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-800/80">
              <div className="text-center">#</div>
              <div>{t.standings.club}</div>
              <div className="text-center">{t.standings.wl}</div>
              <div className="text-center">{t.standings.gdAbbr}</div>
              <div className="text-center font-bold text-zinc-400">{t.standings.pts}</div>
            </div>

            {/* 5 Team Rows */}
            <div className="divide-y divide-zinc-800/50">
              {group.ranks.map((rankStyle, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[28px_1fr_48px_34px_38px] sm:grid-cols-[32px_1fr_54px_38px_42px] gap-1 px-2.5 sm:px-2.5 py-1.5 sm:py-2 items-center ${rankStyle.border}`}
                >
                  {/* Position */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border ${rankStyle.badge}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 shrink-0" />
                    <Skeleton className="h-3.5 w-16 sm:w-24 bg-white/10 rounded" />
                  </div>

                  {/* V-D Pill */}
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-9 rounded-full bg-white/5" />
                  </div>

                  {/* SG */}
                  <div className="text-center">
                    <Skeleton className="h-3 w-5 mx-auto bg-white/5 rounded" />
                  </div>

                  {/* Points */}
                  <div className="text-center font-mono">
                    <Skeleton className="h-4 w-6 mx-auto bg-white/10 rounded font-black" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="px-3 py-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-3.5 text-[10px] sm:text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-zinc-300 font-semibold">{t.standings.directSemi}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          <span className="text-zinc-300 font-semibold">{t.standings.quarterfinals}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="text-zinc-400 font-medium">{t.standings.eliminated}</span>
        </div>
      </div>
    </div>
  )
}
