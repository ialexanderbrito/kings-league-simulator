"use client"

import { useState, useEffect, useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Users,
  Calendar,
  Instagram,
  Youtube,
  TwitchIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTeamDetails } from "@/lib/fetch-league-data"
import { useLeague } from "@/contexts/league-context"
import { MatchesList } from "@/components/team/matches-list"
import { TeamRoster } from "@/components/team/team-roster"
import type { Team, Round, TeamDetails, TeamStanding } from "@/types/kings-league"
import { getProxyImageUrl, cn } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"

interface TeamInfoProps {
  team: Team
  rounds: Round[]
  teams: Record<string, Team>
  standings?: TeamStanding[]
}

// Ícone TikTok minimalista em SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.885 2.896 2.896 0 0 1-2.895-2.885 2.896 2.896 0 0 1 2.895-2.886c.414 0 .807.086 1.163.242V9.52a6.34 6.34 0 0 0-1.163-.108C5.973 9.412 3 12.38 3 16.037 3 19.694 5.973 22.66 9.473 22.66c3.5 0 6.474-2.966 6.474-6.623V9.824a8.217 8.217 0 0 0 4.642 1.41v-3.48a4.808 4.808 0 0 1-1-.068z" />
    </svg>
  )
}

export default function TeamInfo({ team, rounds, teams, standings = [] }: TeamInfoProps) {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedSeasonId } = useLeague()
  const { t } = useLocale()

  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        setLoading(true)
        const details = await fetchTeamDetails(team.id, selectedSeasonId)
        setTeamDetails(details)
        setError(null)
      } catch (err) {
        setError(t.errors.message)
      } finally {
        setLoading(false)
      }
    }

    loadTeamDetails()
  }, [team.id, selectedSeasonId])

  // Encontrar todas as partidas deste time
  const teamMatches = useMemo(() => {
    return rounds.flatMap((round) =>
      round.matches
        .filter((match) => match.participants.homeTeamId === team.id || match.participants.awayTeamId === team.id)
        .map((match) => ({
          ...match,
          id: String(match.id),
          round: round.name ? round.name.replace(/(Jornada|Rodada|Round)\s*/i, `${t.matches.roundPrefix} `) : `${t.matches.roundPrefix} ${round.id}`,
          roundId: String(round.id),
          ended: round.ended,
        }))
    )
  }, [rounds, team.id])

  // Partidas já finalizadas com placar
  const finishedMatches = useMemo(() => {
    return teamMatches
      .filter((m) => m.scores.homeScore !== null && m.scores.awayScore !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [teamMatches])

  // Estatísticas calculadas
  const gamesPlayed = finishedMatches.length

  let wins = 0
  let losses = 0
  let penaltyWins = 0
  let penaltyLosses = 0

  finishedMatches.forEach((m) => {
    if (m.scores.homeScore === null || m.scores.awayScore === null) return

    const isHome = m.participants.homeTeamId === team.id
    const teamScore = isHome ? m.scores.homeScore : m.scores.awayScore
    const opponentScore = isHome ? m.scores.awayScore : m.scores.homeScore
    const teamPenaltyScore = isHome ? m.scores.homeScoreP : m.scores.awayScoreP
    const opponentPenaltyScore = isHome ? m.scores.awayScoreP : m.scores.homeScoreP

    if (teamScore > opponentScore) {
      wins += 1
    } else if (teamScore < opponentScore) {
      losses += 1
    } else {
      if (
        teamPenaltyScore !== null &&
        teamPenaltyScore !== undefined &&
        opponentPenaltyScore !== null &&
        opponentPenaltyScore !== undefined
      ) {
        if (teamPenaltyScore > opponentPenaltyScore) {
          penaltyWins += 1
        } else if (teamPenaltyScore < opponentPenaltyScore) {
          penaltyLosses += 1
        }
      }
    }
  })

  const goalsFor = finishedMatches.reduce((total, match) => {
    if (match.scores.homeScore === null || match.scores.awayScore === null) return total
    const isHome = match.participants.homeTeamId === team.id
    return total + (isHome ? match.scores.homeScore : match.scores.awayScore)
  }, 0)

  const goalsAgainst = finishedMatches.reduce((total, match) => {
    if (match.scores.homeScore === null || match.scores.awayScore === null) return total
    const isHome = match.participants.homeTeamId === team.id
    return total + (isHome ? match.scores.awayScore : match.scores.homeScore)
  }, 0)

  const goalDifference = goalsFor - goalsAgainst
  const playersCount = teamDetails?.players?.length || 0
  const totalWins = wins + penaltyWins
  const totalLosses = losses + penaltyLosses
  const winRate = gamesPlayed > 0 ? Math.round((totalWins / gamesPlayed) * 100) : 0

  // Guia de Forma (últimos 5 jogos finalizados) estilo Sofascore
  const formGuide = useMemo(() => {
    const lastMatches = [...finishedMatches].slice(-5)
    return lastMatches.map((m) => {
      const isHome = m.participants.homeTeamId === team.id
      const teamScore = isHome ? m.scores.homeScore! : m.scores.awayScore!
      const oppScore = isHome ? m.scores.awayScore! : m.scores.homeScore!
      const teamPen = isHome ? m.scores.homeScoreP : m.scores.awayScoreP
      const oppPen = isHome ? m.scores.awayScoreP : m.scores.homeScoreP
      const oppId = isHome ? m.participants.awayTeamId : m.participants.homeTeamId
      const oppTeam = teams[oppId]

      let result: "W" | "L" | "SOW" | "SOL" = "W"
      if (teamScore > oppScore) {
        result = "W"
      } else if (teamScore < oppScore) {
        result = "L"
      } else {
        if (teamPen !== null && teamPen !== undefined && oppPen !== null && oppPen !== undefined) {
          result = teamPen > oppPen ? "SOW" : "SOL"
        }
      }

      return {
        matchId: m.id,
        round: m.round,
        result,
        scoreText: `${teamScore} - ${oppScore}${teamPen !== null && teamPen !== undefined ? ` (SO ${teamPen}-${oppPen})` : ""}`,
        opponent: oppTeam,
        date: m.date,
      }
    })
  }, [finishedMatches, team.id, teams])

  // Informações de Classificação do Time
  const teamStanding = useMemo(() => {
    return standings.find((s) => String(s.id) === String(team.id))
  }, [standings, team.id])

  // Staff (Presidente & Técnico)
  const president = teamDetails?.staff?.find((member: any) => member.role === "president")
  const coach = teamDetails?.staff?.find((member: any) => member.role === "coach")

  // Links sociais
  const meta = teamDetails?.metaInformation || team.metaInformation
  const socialLinks = [
    { url: meta?.tiktok_url, icon: TikTokIcon, label: "TikTok" },
    { url: meta?.instagram_url, icon: Instagram, label: "Instagram" },
    { url: meta?.youtube_url, icon: Youtube, label: "YouTube" },
    { url: meta?.twitch_url, icon: TwitchIcon, label: "Twitch" },
  ].filter((link) => link.url)

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Header do Time Compacto & Minimalista em Liquid Glass */}
      <section className="relative overflow-hidden rounded-2xl liquid-glass-card border border-white/10 p-3 sm:p-4 shadow-xl transition-all duration-200">
        {/* Iluminação ambiente sutil sintonizada nas cores do clube */}
        <div
          className="pointer-events-none absolute inset-0 select-none opacity-20"
          style={{
            background: `radial-gradient(circle at 10% 30%, ${team.firstColorHEX} 0%, transparent 50%), radial-gradient(circle at 90% 70%, ${team.secondColorHEX} 0%, transparent 45%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          {/* Lado Esquerdo: Brasão + Título + Metadados Inline */}
          <div className="flex items-center gap-3 sm:gap-3.5 text-left w-full md:w-auto min-w-0">
            {/* Escudo do Time Compacto */}
            <div className="relative group shrink-0">
              <div
                className="absolute inset-0 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-200"
                style={{ backgroundColor: team.firstColorHEX }}
              />
              <div
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl liquid-stat-box p-1.5 flex items-center justify-center border border-white/15"
                style={{
                  boxShadow: `0 4px 16px -4px ${team.firstColorHEX}30`,
                }}
              >
                {loading ? (
                  <Skeleton className="w-full h-full rounded-xl bg-white/10" />
                ) : teamDetails?.logo?.url || team.logo?.url ? (
                  <img
                    src={getProxyImageUrl(teamDetails?.logo?.url || team.logo?.url)}
                    alt={`${t.playoffs.officialShield} ${team.name}`}
                    className="w-full h-full object-contain drop-shadow-md transition-transform duration-150 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-xl flex items-center justify-center text-base font-black text-white"
                    style={{ backgroundColor: team.firstColorHEX + "40" }}
                  >
                    {team.shortName || team.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Informações Principais do Time */}
            <div className="space-y-1 min-w-0 flex-1">
              {/* Nome do Time */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight truncate">
                {team.name}
              </h1>

              {/* Cores, Redes Sociais e Staff Inline */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-zinc-400">
                {/* Cores do Clube */}
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/8">
                  <div
                    className="w-2 h-2 rounded-full border border-white/30"
                    style={{ backgroundColor: team.firstColorHEX }}
                    title={`${t.teamPage.primaryColor}: ${team.firstColorHEX}`}
                  />
                  <div
                    className="w-2 h-2 rounded-full border border-white/30"
                    style={{ backgroundColor: team.secondColorHEX }}
                    title={`${t.teamPage.secondaryColor}: ${team.secondColorHEX}`}
                  />
                </div>

                {/* Redes Sociais */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-1">
                    {socialLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="liquid-pill-btn w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 hover:text-white btn-press"
                          aria-label={`${link.label} - ${team.name}`}
                          title={link.label}
                        >
                          <Icon className="w-2.5 h-2.5" />
                        </a>
                      )
                    })}
                  </div>
                )}

                {/* Staff Compacto */}
                {(president || coach) && (
                  <div className="flex items-center gap-2 text-[11px]">
                    {president && (
                      <span className="truncate max-w-[150px]" title={president.shortName}>
                        <span className="text-zinc-500 uppercase text-[9px] mr-1 font-semibold">{t.teamPage.presAbbr}:</span>
                        <span className="text-zinc-300 font-semibold">{president.shortName}</span>
                      </span>
                    )}
                    {president && coach && <span className="text-zinc-600">•</span>}
                    {coach && (
                      <span className="truncate max-w-[120px]" title={coach.shortName}>
                        <span className="text-zinc-500 uppercase text-[9px] mr-1 font-semibold">{t.teamPage.coachAbbr}:</span>
                        <span className="text-zinc-300 font-semibold">{coach.shortName}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Forma Recente Integrada ao Header (Economiza Espaço Vertical) */}
          {formGuide.length > 0 && (
            <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0 w-full md:w-auto">
              <div className="flex flex-col md:items-end">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{t.teamPage.recentForm}</span>
                <span className="text-[10px] text-zinc-500">{t.teamPage.lastMatches.replace("{count}", String(formGuide.length))}</span>
              </div>

              {/* Pílulas de Forma V / D / SO */}
              <div className="flex items-center gap-1">
                {formGuide.map((item, index) => (
                  <div
                    key={index}
                    className="group relative flex flex-col items-center"
                    title={`${item.round}: ${item.scoreText} vs ${item.opponent?.shortName || t.common.opponent}`}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md font-black text-[11px] flex items-center justify-center cursor-default transition-transform duration-150 group-hover:scale-110 border",
                        item.result === "W" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm",
                        item.result === "SOW" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                        item.result === "L" && "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm",
                        item.result === "SOL" && "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      )}
                    >
                      {item.result === "W" ? t.standings.wonAbbr : item.result === "SOW" ? "SO" : item.result === "L" ? t.standings.lostAbbr : "SO"}
                    </div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase mt-0.5">
                      {item.opponent?.shortName || `J${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Cards de Métricas Sofascore Compactos em Linha Única */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Aproveitamento */}
        <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3 border border-white/8 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.teamPage.winRate}</span>
            <span className="text-xs font-black text-white tabular-nums">{winRate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${winRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-zinc-400 font-medium">
            <span>{totalWins} {t.ui.wins.toLowerCase()}</span>
            <span>{totalLosses} {t.ui.losses.toLowerCase()}</span>
          </div>
        </div>

        {/* Card 2: Gols & Saldo */}
        <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3 border border-white/8 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.teamPage.goalsAndDiff}</span>
            <span
              className={cn(
                "text-[9px] font-black px-1.5 py-0.2 rounded border",
                goalDifference > 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : goalDifference < 0
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-zinc-500/10 text-zinc-300 border-zinc-500/30"
              )}
            >
              {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-rose-500/30 overflow-hidden flex">
            <div
              className="h-full bg-emerald-400 rounded-l-full transition-all duration-300"
              style={{
                width: `${goalsFor + goalsAgainst > 0 ? (goalsFor / (goalsFor + goalsAgainst)) * 100 : 50}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px]">
            <span className="text-emerald-400 font-semibold">{goalsFor} {t.teamPage.pro}</span>
            <span className="text-rose-400 font-semibold">{goalsAgainst} {t.teamPage.against}</span>
          </div>
        </div>

        {/* Card 3: Shootouts */}
        <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3 border border-white/8 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.teamPage.shootoutsSO}</span>
            <span className="text-xs font-black text-white tabular-nums">{penaltyWins + penaltyLosses}</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-zinc-400">{t.ui.wins}: <strong className="text-emerald-400">{penaltyWins}</strong></span>
            <span className="text-zinc-400">{t.ui.losses}: <strong className="text-rose-400">{penaltyLosses}</strong></span>
          </div>
          <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-white/5 pt-1">
            <span>{t.teamPage.soConversion}</span>
            <span className="text-zinc-300 font-bold">
              {penaltyWins + penaltyLosses > 0 ? `${Math.round((penaltyWins / (penaltyWins + penaltyLosses)) * 100)}%` : "-"}
            </span>
          </div>
        </div>

        {/* Card 4: Tabela & Plantel */}
        <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3 border border-white/8 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.teamPage.tableAndSquad}</span>
            <span className="text-[10px] font-bold text-[var(--team-primary)]">
              {teamStanding ? t.teamPage.rankPosition.replace("{rank}", String(teamStanding.rank)) : "Kings League"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-zinc-400">{t.teamPage.points}: <strong className="text-white">{teamStanding?.points || 0}</strong></span>
            <span className="text-zinc-400">{t.teamPage.wildCardsCount} <strong className="text-amber-400">{teamDetails?.players?.filter((p: any) => p.category === "wildcard").length || 0}</strong></span>
          </div>
          <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-white/5 pt-1">
            <span>{t.teamPage.totalSquad}</span>
            <span className="text-zinc-300 font-bold">{playersCount} {t.teamPage.athletes}</span>
          </div>
        </div>
      </section>

      {error && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30 text-white rounded-2xl">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">{t.teamPage.attention}</AlertTitle>
          <AlertDescription className="text-zinc-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Navegação por Abas: Partidas vs Elenco Padronizada e Perfeitamente Alinhada */}
      <Tabs defaultValue="matches" className="w-full">
        {/* Barra de Sub-Navegação Centralizada sem Linha Divisória */}
        <div className="flex justify-center items-center py-2 sm:py-3">
          <TabsList
            className="inline-flex h-auto p-1 rounded-full liquid-nav-track border border-white/10 bg-white/[0.03] shadow-md gap-1"
            aria-label={t.teamPage.teamMatchesNav}
          >
            <TabsTrigger
              value="matches"
              className={cn(
                "relative inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-[color,background-color,transform,box-shadow,border-color] duration-150 btn-press",
                "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
                "data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/15 data-[state=active]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_8px_-2px_rgba(0,0,0,0.5)]"
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--team-primary)]" />
              <span>{t.navigation.matches}</span>
              {teamMatches.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300">
                  {teamMatches.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="team"
              className={cn(
                "relative inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-[color,background-color,transform,box-shadow,border-color] duration-150 btn-press",
                "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
                "data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/15 data-[state=active]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_8px_-2px_rgba(0,0,0,0.5)]"
              )}
            >
              <Users className="w-3.5 h-3.5 text-[var(--team-primary)]" />
              <span>{t.navigation.squad}</span>
              {playersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300">
                  {playersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Conteúdo: Partidas */}
        <TabsContent value="matches" className="focus-visible:outline-none">
          <MatchesList teamId={team.id} teamMatches={teamMatches} teams={teams} loading={loading} />
        </TabsContent>

        {/* Conteúdo: Elenco */}
        <TabsContent value="team" className="focus-visible:outline-none">
          <div className="liquid-glass-panel rounded-2xl overflow-hidden p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: team.firstColorHEX + "20" }}
              >
                <Users className="w-4 h-4" style={{ color: team.firstColorHEX }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{t.teamPage.completeRoster}</h2>
                <p className="text-xs text-zinc-400">{t.teamPage.rosterSubtitle}</p>
              </div>
            </div>

            <TeamRoster players={teamDetails?.players || []} loading={loading} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
