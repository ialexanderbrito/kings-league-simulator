"use client"

import { useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Youtube, Calendar, Timer } from "lucide-react"
import { Team } from "@/types/kings-league"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"

interface MatchesListProps {
  teamId: string
  teamMatches: Array<{
    id: string
    round: string
    roundId: string
    ended: boolean
    date: string
    participants: { homeTeamId: string; awayTeamId: string }
    scores: {
      homeScore: number | null
      awayScore: number | null
      homeScoreP?: number | null
      awayScoreP?: number | null
    }
    metaInformation?: {
      youtube_url?: string
    }
    status?: string
  }>
  teams: Record<string, Team>
  loading: boolean
}

function formatDate(dateString: string, locale: string = "pt-BR"): string {
  try {
    const date = new Date(dateString)
    const intlLocale = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR"
    return new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    return dateString
  }
}

export function MatchesList({ teamId, teamMatches, teams, loading }: MatchesListProps) {
  const { t, locale } = useLocale()
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all")

  const pastMatches = useMemo(() => {
    return teamMatches
      .filter((m) => m.scores.homeScore !== null && m.scores.awayScore !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [teamMatches])

  const futureMatches = useMemo(() => {
    return teamMatches
      .filter((m) => m.scores.homeScore === null || m.scores.awayScore === null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [teamMatches])

  // Calcular estatísticas das partidas já realizadas
  const matchResults = useMemo(() => {
    return pastMatches.map((match) => {
      const isHome = match.participants.homeTeamId === teamId
      const homeScore = match.scores.homeScore!
      const awayScore = match.scores.awayScore!
      const homeScoreP = match.scores.homeScoreP
      const awayScoreP = match.scores.awayScoreP
      const hasPenalties =
        homeScoreP !== undefined &&
        homeScoreP !== null &&
        awayScoreP !== undefined &&
        awayScoreP !== null

      const homePenaltyWin = hasPenalties && homeScoreP > awayScoreP
      const awayPenaltyWin = hasPenalties && awayScoreP > homeScoreP

      let isWin = false
      let isShootout = false

      if (homeScore === awayScore) {
        if (hasPenalties) {
          isShootout = true
          isWin = (isHome && homePenaltyWin) || (!isHome && awayPenaltyWin)
        }
      } else {
        isWin = (isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)
      }

      return {
        ...match,
        isHome,
        isWin,
        isShootout,
        hasPenalties,
        homeScore,
        awayScore,
        homeScoreP,
        awayScoreP,
        homeTeam: teams[match.participants.homeTeamId],
        awayTeam: teams[match.participants.awayTeamId],
      }
    })
  }, [pastMatches, teamId, teams])

  const totalWins = matchResults.filter((m) => m.isWin).length
  const totalLosses = matchResults.length - totalWins

  // Partidas filtradas
  const filteredPastMatches = useMemo(() => {
    if (filter === "wins") return matchResults.filter((m) => m.isWin)
    if (filter === "losses") return matchResults.filter((m) => !m.isWin)
    return matchResults
  }, [matchResults, filter])

  if (loading) {
    return <MatchesListSkeleton />
  }

  if (teamMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 rounded-2xl liquid-glass-panel border border-zinc-800 text-center p-6">
        <div className="w-12 h-12 rounded-2xl liquid-stat-box flex items-center justify-center mb-2.5 text-zinc-500">
          <Calendar className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white mb-1">{t.ui.noMatches}</p>
        <p className="text-xs text-zinc-400 max-w-sm">
          {t.teamPage.noMatchesAnnounced}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Barra de Filtros em Pílulas com Liquid Filter Track */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-filter-track w-fit">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "liquid-filter-pill px-3 py-1 rounded-lg text-xs font-semibold",
            filter === "all"
              ? "bg-white/15 text-white shadow-sm border border-white/20"
              : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          {t.ui.total} ({pastMatches.length})
        </button>

        <button
          onClick={() => setFilter("wins")}
          className={cn(
            "liquid-filter-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold",
            filter === "wins"
              ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-zinc-400 hover:text-emerald-400 hover:bg-white/5 border border-transparent"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {t.ui.wins} ({totalWins})
        </button>

        <button
          onClick={() => setFilter("losses")}
          className={cn(
            "liquid-filter-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold",
            filter === "losses"
              ? "bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm"
              : "text-zinc-400 hover:text-rose-400 hover:bg-white/5 border border-transparent"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          {t.ui.losses} ({totalLosses})
        </button>
      </div>

      {/* Próximas Partidas Agendadas (Se houver) */}
      {futureMatches.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 px-1 pt-1 pb-0.5">
            <Timer className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {t.teamPage.upcomingMatches} ({futureMatches.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {futureMatches.map((match) => {
              const homeTeam = teams[match.participants.homeTeamId]
              const awayTeam = teams[match.participants.awayTeamId]
              const isCurrentTeamHome = match.participants.homeTeamId === teamId
              const isLive =
                match.status === "inPlay1H" ||
                match.status === "inPlay2H" ||
                match.status === "inPlayET" ||
                match.status === "inPlayP"

              return (
                <div
                  key={match.id}
                  className={cn(
                    "relative flex flex-col justify-between p-3.5 rounded-2xl overflow-hidden group",
                    isLive
                      ? "liquid-match-card-loss border-rose-500/40 shadow-rose-950/20"
                      : "liquid-match-card-scheduled"
                  )}
                >
                  {/* Top Bar: Rodada + Data/Horário */}
                  <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-zinc-300 border border-white/10 uppercase tracking-wider">
                      {match.round.replace(/(Rodada|Jornada|Round|Matchday)\s*/i, "R")}
                    </span>

                    <span className="text-[11px] text-zinc-400 font-medium">
                      {formatDate(match.date, locale)}
                    </span>
                  </div>

                  {/* Duelo Central */}
                  <div className="relative z-10 flex items-center justify-between gap-2 py-3">
                    {/* Mandante */}
                    <div className="flex-1 flex flex-col items-center text-center min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl liquid-stat-box p-1.5 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105",
                          isCurrentTeamHome && "ring-1.5 ring-[var(--team-primary)]/60 bg-[var(--team-primary)]/10"
                        )}
                      >
                        <img
                          src={getProxyImageUrl(homeTeam?.logo?.url)}
                          alt={homeTeam?.name || ""}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold truncate max-w-full leading-tight",
                          isCurrentTeamHome ? "text-white font-bold" : "text-zinc-400"
                        )}
                        title={homeTeam?.name}
                      >
                        {homeTeam?.shortName || homeTeam?.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                        {t.matches.homeTeam}
                      </span>
                    </div>

                    {/* Badge Central VS / Ao Vivo */}
                    <div className="flex flex-col items-center shrink-0 px-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-xl bg-black/60 border border-white/10 shadow-inner">
                        {isLive ? (
                          <span className="text-[10px] font-black text-rose-400 animate-pulse tracking-wider">
                            {t.matches.live}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-zinc-400 tracking-wider">
                            VS
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-1">
                        {t.teamPage.scheduled}
                      </span>
                    </div>

                    {/* Visitante */}
                    <div className="flex-1 flex flex-col items-center text-center min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl liquid-stat-box p-1.5 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105",
                          !isCurrentTeamHome && "ring-1.5 ring-[var(--team-primary)]/60 bg-[var(--team-primary)]/10"
                        )}
                      >
                        <img
                          src={getProxyImageUrl(awayTeam?.logo?.url)}
                          alt={awayTeam?.name || ""}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold truncate max-w-full leading-tight",
                          !isCurrentTeamHome ? "text-white font-bold" : "text-zinc-400"
                        )}
                        title={awayTeam?.name}
                      >
                        {awayTeam?.shortName || awayTeam?.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                        {t.matches.awayTeam}
                      </span>
                    </div>
                  </div>

                  {/* Footer da Partida */}
                  <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">
                      {isCurrentTeamHome ? t.teamPage.homeAdvantage : t.teamPage.awayAdvantage}
                    </span>
                    <span className="text-sky-400/80 font-semibold uppercase tracking-wider">
                      {t.teamPage.soon}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid 3x3 de Partidas Finalizadas com cor estática de vitória/derrota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {filteredPastMatches.map((match) => {
          const { isHome, isWin, isShootout, homeScore, awayScore, homeScoreP, awayScoreP, homeTeam, awayTeam } = match

          const resultLabel = isShootout
            ? (isWin ? `${t.standings.wonAbbr} (SO)` : `${t.standings.lostAbbr} (SO)`)
            : isWin ? t.standings.wonAbbr : t.standings.lostAbbr

          return (
            <div
              key={match.id}
              className={cn(
                "relative flex flex-col justify-between p-3.5 rounded-2xl group",
                isWin ? "liquid-match-card-win" : "liquid-match-card-loss"
              )}
            >
              {/* Header do Card: Rodada + Resultado + Data */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-zinc-300 border border-white/10 uppercase tracking-wider">
                    {match.round.replace(/(Rodada|Jornada|Round|Matchday)\s*/i, "R")}
                  </span>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md font-black text-[10px] tracking-wide border flex items-center gap-1.5 shadow-sm",
                      isWin
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/40"
                    )}
                    title={isWin ? t.teamPage.matchWin : t.teamPage.matchDefeat}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isWin ? "bg-emerald-400" : "bg-rose-400")} />
                    {resultLabel}
                  </span>
                </div>

                <span className="text-[11px] text-zinc-400 font-medium">
                  {formatDate(match.date, locale)}
                </span>
              </div>

              {/* Duelo Central: Mandante x Placar x Visitante */}
              <div className="relative z-10 flex items-center justify-between gap-2 py-3">
                {/* Mandante */}
                <div className="flex-1 flex flex-col items-center text-center min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl liquid-stat-box p-1.5 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105",
                      isHome && "ring-1.5 ring-[var(--team-primary)]/60 bg-[var(--team-primary)]/10"
                    )}
                  >
                    <img
                      src={getProxyImageUrl(homeTeam?.logo?.url)}
                      alt={homeTeam?.name || ""}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold truncate max-w-full leading-tight",
                      isHome ? "text-white font-bold" : "text-zinc-400"
                    )}
                    title={homeTeam?.name}
                  >
                    {homeTeam?.shortName || homeTeam?.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                    {t.matches.homeTeam}
                  </span>
                </div>

                {/* Placar Central Sofascore */}
                <div className="flex flex-col items-center shrink-0 px-1">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/70 border shadow-inner",
                      isWin ? "border-emerald-500/30" : "border-rose-500/30"
                    )}
                  >
                    <span
                      className={cn(
                        "text-base sm:text-lg font-black tabular-nums leading-none",
                        homeScore > awayScore ? "text-white font-black" : "text-zinc-400"
                      )}
                    >
                      {homeScore}
                    </span>
                    <span className="text-zinc-600 text-xs font-bold leading-none">-</span>
                    <span
                      className={cn(
                        "text-base sm:text-lg font-black tabular-nums leading-none",
                        awayScore > homeScore ? "text-white font-black" : "text-zinc-400"
                      )}
                    >
                      {awayScore}
                    </span>
                  </div>

                  {isShootout ? (
                    <span className="text-[9px] font-bold text-amber-400 mt-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                      SO {homeScoreP}-{awayScoreP}
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-1">
                      {t.teamPage.finished}
                    </span>
                  )}
                </div>

                {/* Visitante */}
                <div className="flex-1 flex flex-col items-center text-center min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl liquid-stat-box p-1.5 flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105",
                      !isHome && "ring-1.5 ring-[var(--team-primary)]/60 bg-[var(--team-primary)]/10"
                    )}
                  >
                    <img
                      src={getProxyImageUrl(awayTeam?.logo?.url)}
                      alt={awayTeam?.name || ""}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold truncate max-w-full leading-tight",
                      !isHome ? "text-white font-bold" : "text-zinc-400"
                    )}
                    title={awayTeam?.name}
                  >
                    {awayTeam?.shortName || awayTeam?.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                    {t.matches.awayTeam}
                  </span>
                </div>
              </div>

              {/* Footer do Card: Localização + YouTube Highlights */}
              <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-medium">
                  {isHome ? t.teamPage.homeAdvantage : t.teamPage.awayAdvantage}
                </span>

                {match.metaInformation?.youtube_url ? (
                  <a
                    href={match.metaInformation.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-press inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 transition-[color,background-color,border-color] duration-150"
                    title={t.teamPage.watchHighlights}
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{t.teamPage.watchHighlights}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-medium">
                    {t.teamPage.noVideo}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MatchesListSkeleton() {
  return (
    <div className="space-y-3.5">
      {/* Mini Filter Toolbar Skeleton */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-filter-track w-fit">
        <Skeleton className="h-7 w-20 rounded-lg bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-lg bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-lg bg-white/10" />
      </div>

      {/* Grid 3x3 Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="rounded-2xl liquid-glass-panel border border-white/5 p-3.5 flex flex-col justify-between h-[154px] animate-pulse"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-10 rounded-md bg-white/10" />
                  <Skeleton className="h-4 w-12 rounded-md bg-white/10" />
                </div>
                <Skeleton className="h-3.5 w-24 rounded bg-white/10" />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex-1 flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/10 mb-1.5" />
                  <Skeleton className="h-3 w-16 bg-white/10" />
                </div>

                <div className="px-2">
                  <Skeleton className="h-7 w-16 rounded-xl bg-white/10" />
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/10 mb-1.5" />
                  <Skeleton className="h-3 w-16 bg-white/10" />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <Skeleton className="h-5 w-24 rounded-lg bg-white/10" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}