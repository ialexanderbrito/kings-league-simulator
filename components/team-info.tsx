"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Trophy, Target, Shield, Users, TrendingUp, Calendar, Flame, User, Swords, Instagram, Youtube, TwitchIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTeamDetails } from "@/lib/fetch-league-data"
import { MatchesList } from "@/components/team/matches-list"
import { TeamRoster } from "@/components/team/team-roster"
import type { Team, Round, TeamDetails } from "@/types/kings-league"
import { getProxyImageUrl } from "@/lib/utils"

interface TeamInfoProps {
  team: Team
  rounds: Round[]
  teams: Record<string, Team>
}

export default function TeamInfo({ team, rounds, teams }: TeamInfoProps) {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        setLoading(true)
        const details = await fetchTeamDetails(team.id)
        setTeamDetails(details)
        setError(null)
      } catch (err) {
        setError("Não foi possível carregar todos os detalhes do time.")
      } finally {
        setLoading(false)
      }
    }

    loadTeamDetails()
  }, [team.id])

  // Encontrar todas as partidas deste time
  const teamMatches = rounds.flatMap((round) =>
    round.matches
      .filter((match) => match.participants.homeTeamId === team.id || match.participants.awayTeamId === team.id)
      .map((match) => ({
        ...match,
        id: String(match.id),
        round: round.name.replace('Jornada', 'Rodada'),
        roundId: String(round.id),
        ended: round.ended,
      })),
  )

  // Calcular estatísticas
  const gamesPlayed = teamMatches.filter(m =>
    m.scores.homeScore !== null && m.scores.awayScore !== null
  ).length

  let wins = 0
  let losses = 0
  let penaltyWins = 0
  let penaltyLosses = 0

  teamMatches.forEach(m => {
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
      if (teamPenaltyScore !== null && teamPenaltyScore !== undefined &&
        opponentPenaltyScore !== null && opponentPenaltyScore !== undefined) {
        if (teamPenaltyScore > opponentPenaltyScore) {
          penaltyWins += 1
        } else if (teamPenaltyScore < opponentPenaltyScore) {
          penaltyLosses += 1
        }
      }
    }
  })

  const goalsFor = teamMatches.reduce((total, match) => {
    if (match.scores.homeScore === null || match.scores.awayScore === null) return total
    const isHome = match.participants.homeTeamId === team.id
    return total + (isHome ? match.scores.homeScore : match.scores.awayScore)
  }, 0)

  const goalsAgainst = teamMatches.reduce((total, match) => {
    if (match.scores.homeScore === null || match.scores.awayScore === null) return total
    const isHome = match.participants.homeTeamId === team.id
    return total + (isHome ? match.scores.awayScore : match.scores.homeScore)
  }, 0)

  const goalDifference = goalsFor - goalsAgainst
  const playersCount = teamDetails?.players?.length || 0
  const totalWins = wins + penaltyWins
  const winRate = gamesPlayed > 0 ? Math.round((totalWins / gamesPlayed) * 100) : 0

  const president = teamDetails?.staff?.find((member: any) => member.role === "president")
  const coach = teamDetails?.staff?.find((member: any) => member.role === "coach")

  const socialLinks = [
    { url: teamDetails?.metaInformation?.instagram_url, icon: Instagram, label: "Instagram" },
    { url: teamDetails?.metaInformation?.youtube_url, icon: Youtube, label: "YouTube" },
    { url: teamDetails?.metaInformation?.twitch_url, icon: TwitchIcon, label: "Twitch" },
  ].filter((link) => link.url)

  return (
    <div className="space-y-8">
      {/* Hero Section do Time */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5">
        {/* Background com gradiente do time */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${team.firstColorHEX}30 0%, ${team.secondColorHEX}20 50%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-[#0a0a0a]/60" />

        {/* Decorative elements */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: team.firstColorHEX }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20"
          style={{ backgroundColor: team.secondColorHEX }}
        />

        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Logo do Time */}
            <div className="relative group">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"
                style={{ backgroundColor: team.firstColorHEX }}
              />
              <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-2xl" />
                ) : teamDetails?.logo?.url ? (
                  <img
                    src={getProxyImageUrl(teamDetails.logo.url)}
                    alt={`Logo do ${team.name}`}
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-2xl flex items-center justify-center text-4xl font-black"
                    style={{ backgroundColor: team.firstColorHEX + '30' }}
                  >
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Informações Principais */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
                <Badge
                  className="px-3 py-1 text-xs font-bold border-0"
                  style={{ backgroundColor: team.firstColorHEX + '30', color: team.firstColorHEX }}
                >
                  <Flame className="w-3 h-3 mr-1" />
                  Kings League 2026
                </Badge>
                {gamesPlayed > 0 && winRate >= 50 && (
                  <Badge className="px-3 py-1 text-xs font-bold bg-green-500/20 text-green-400 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {winRate}% Vitórias
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                {team.name}
              </h1>

              {/* Cores e Redes Sociais */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Cores:</span>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg"
                    style={{ backgroundColor: team.firstColorHEX }}
                    title="Cor principal"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg"
                    style={{ backgroundColor: team.secondColorHEX }}
                    title="Cor secundária"
                  />
                </div>

                {socialLinks.length > 0 && (
                  <>
                    <div className="w-px h-5 bg-gray-700" />
                    <nav className="flex items-center gap-2">
                      {socialLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            aria-label={`${link.label} do ${team.name}`}
                          >
                            <Icon className="w-4 h-4" />
                          </a>
                        )
                      })}
                    </nav>
                  </>
                )}
              </div>

              {/* Staff do Time */}
              {(president || coach) && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  {president && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-800">
                        {president.image?.url ? (
                          <img src={president.image.url} alt={`${president.shortName}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Presidente</p>
                        <p className="text-sm font-semibold text-white">{president.shortName}</p>
                      </div>
                    </div>
                  )}
                  {coach && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-800">
                        {coach.image?.url ? (
                          <img src={coach.image.url} alt={`${coach.firstName} ${coach.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Técnico</p>
                        <p className="text-sm font-semibold text-white">{coach.firstName} {coach.lastName}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <QuickStatCard icon={Trophy} value={totalWins} label="Vitórias" color={team.firstColorHEX} loading={loading} />
              <QuickStatCard icon={Target} value={goalsFor} label="Gols" color={team.firstColorHEX} loading={loading} />
              <QuickStatCard icon={Swords} value={gamesPlayed} label="Jogos" color={team.firstColorHEX} loading={loading} />
              <QuickStatCard icon={Users} value={playersCount} label="Jogadores" color={team.firstColorHEX} loading={loading} />
            </div>
          </div>
        </div>
      </section>

      {/* Cards de Estatísticas Detalhadas */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <DetailStatCard
          title="Desempenho"
          icon={TrendingUp}
          color={team.firstColorHEX}
          loading={loading}
          stats={[
            { label: "Jogos", value: gamesPlayed },
            { label: "Vitórias", value: wins, highlight: "green" },
            { label: "Derrotas", value: losses, highlight: "red" },
            { label: "Aproveitamento", value: `${winRate}%` },
          ]}
        />
        <DetailStatCard
          title="Shootout"
          icon={Shield}
          color={team.firstColorHEX}
          loading={loading}
          stats={[
            { label: "Total", value: penaltyWins + penaltyLosses },
            { label: "Vitórias", value: penaltyWins, highlight: "green" },
            { label: "Derrotas", value: penaltyLosses, highlight: "red" },
          ]}
        />
        <DetailStatCard
          title="Gols"
          icon={Target}
          color={team.firstColorHEX}
          loading={loading}
          stats={[
            { label: "Marcados", value: goalsFor, highlight: "primary" },
            { label: "Sofridos", value: goalsAgainst },
            { label: "Saldo", value: goalDifference > 0 ? `+${goalDifference}` : goalDifference, highlight: goalDifference > 0 ? "green" : goalDifference < 0 ? "red" : undefined },
          ]}
        />
        <DetailStatCard
          title="Elenco"
          icon={Users}
          color={team.firstColorHEX}
          loading={loading}
          stats={[
            { label: "Total", value: playersCount },
            { label: "Wild Cards", value: teamDetails?.players?.filter((p: any) => p.category === "wildcard").length || 0 },
          ]}
        />
      </section>

      {error && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30 text-white rounded-2xl">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Atenção</AlertTitle>
          <AlertDescription className="text-gray-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="w-full h-auto p-1.5 bg-[#0a0a0a] border border-white/5 rounded-2xl grid grid-cols-2 gap-2">
          <TabsTrigger
            value="matches"
            className="h-12 rounded-xl font-semibold text-sm data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Partidas
            {teamMatches.length > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] bg-white/20 text-current border-0">
                {teamMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="h-12 rounded-xl font-semibold text-sm data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Elenco
            {playersCount > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] bg-white/20 text-current border-0">
                {playersCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Aba de Partidas */}
        <TabsContent value="matches" className="mt-6">
          <MatchesList teamId={team.id} teamMatches={teamMatches} teams={teams} loading={loading} />
        </TabsContent>

        {/* Aba de Elenco */}
        <TabsContent value="team" className="mt-6">
          <Card className="bg-[#0a0a0a] border-white/5 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: team.firstColorHEX + '20' }}>
                  <Users className="w-5 h-5" style={{ color: team.firstColorHEX }} />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Elenco Completo</CardTitle>
                  <CardDescription className="text-gray-400">Jogadores da temporada 2026</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <TeamRoster players={teamDetails?.players || []} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente de Card de Estatística Rápida
function QuickStatCard({ icon: Icon, value, label, color, loading }: { icon: any; value: number; label: string; color: string; loading: boolean }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" style={{ backgroundColor: color + '20' }} />
      <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {loading ? <Skeleton className="h-7 w-10 mb-1" /> : <p className="text-2xl font-black text-white">{value}</p>}
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

// Componente de Card de Estatística Detalhada
function DetailStatCard({ title, icon: Icon, color, loading, stats }: { title: string; icon: any; color: string; loading: boolean; stats: Array<{ label: string; value: string | number; highlight?: "green" | "red" | "primary" }> }) {
  const getHighlightColor = (highlight?: string) => {
    switch (highlight) {
      case "green": return "text-green-400"
      case "red": return "text-red-400"
      case "primary": return "text-[var(--team-primary)]"
      default: return "text-white"
    }
  }

  return (
    <Card className="bg-[#0a0a0a] border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{stat.label}</span>
              {loading ? <Skeleton className="h-4 w-8" /> : <span className={`text-sm font-bold ${getHighlightColor(stat.highlight)}`}>{stat.value}</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
