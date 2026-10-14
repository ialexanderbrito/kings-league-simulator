import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Team, TeamDetails, Round } from "@/types/kings-league"
import { calculateAge } from "@/lib/utils"
import { TrendingUp, Target, Shield, Users } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

interface TeamStatsProps {
  team: Team
  teamDetails: TeamDetails | null
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
  }>
}

export function TeamStats({ team, teamDetails, teamMatches }: TeamStatsProps) {
  const { t } = useLocale()
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
      // Vitória no tempo normal
      wins += 1
    } else if (teamScore < opponentScore) {
      // Derrota no tempo normal
      losses += 1
    } else {
      // Empate no tempo normal - decidir no Shootout
      if (teamPenaltyScore !== null && teamPenaltyScore !== undefined &&
        opponentPenaltyScore !== null && opponentPenaltyScore !== undefined) {
        if (teamPenaltyScore > opponentPenaltyScore) {
          // Vitória no Shootout
          penaltyWins += 1
        } else if (teamPenaltyScore < opponentPenaltyScore) {
          // Derrota no Shootout
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
  const wildcardsCount = teamDetails?.players?.filter(p =>
    p.category === "wildcard" || p?.metaInformation?.status === "Wildcard"
  ).length || 0

  const averageAge = teamDetails?.players && teamDetails.players.length > 0
    ? Math.round(teamDetails.players.reduce((sum, player) => {
      const age = player.birthDate ? calculateAge(player.birthDate) : 0
      return sum + age
    }, 0) / teamDetails.players.length)
    : 0

  const totalPenalties = penaltyWins + penaltyLosses

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card de Partidas */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <TrendingUp className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
            </div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t.ui.matches}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground" aria-label={`${gamesPlayed} ${t.ui.matches.toLowerCase()}`}>
                {gamesPlayed}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.matches}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-green-500" aria-label={`${wins} ${t.ui.wins.toLowerCase()}`}>
                {wins}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.wins}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-red-500" aria-label={`${losses} ${t.ui.losses.toLowerCase()}`}>
                {losses}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.losses}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Shootout */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
            </div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Shootout
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground" aria-label={`${totalPenalties} Shootout`}>
                {totalPenalties}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.total}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-green-500" aria-label={`${penaltyWins} ${t.ui.wins.toLowerCase()} Shootout`}>
                {penaltyWins}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.wins}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-red-500" aria-label={`${penaltyLosses} ${t.ui.losses.toLowerCase()} Shootout`}>
                {penaltyLosses}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.losses}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Gols */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <Target className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
            </div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t.teamPage.goalsForAgainst}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-[var(--team-primary)]" aria-label={`${goalsFor} ${t.ui.scored.toLowerCase()}`}>
                {goalsFor}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.scored}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground" aria-label={`${goalsAgainst} ${t.ui.conceded.toLowerCase()}`}>
                {goalsAgainst}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.conceded}</div>
            </div>
            <div className="space-y-0.5">
              <div
                className={`text-2xl font-bold ${goalDifference > 0 ? 'text-green-500' : goalDifference < 0 ? 'text-red-500' : 'text-foreground'}`}
                aria-label={`${t.ui.difference}: ${goalDifference > 0 ? '+' : ''}${goalDifference}`}
              >
                {goalDifference > 0 ? '+' : ''}{goalDifference}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.difference}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Elenco */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <Users className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
            </div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t.teamPage.registeredSquad}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground" aria-label={`${playersCount} ${t.ui.players.toLowerCase()}`}>
                {playersCount}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.players}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-[var(--team-primary)]" aria-label={`${wildcardsCount} ${t.ui.wildcards.toLowerCase()}`}>
                {wildcardsCount}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.wildcards}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold text-foreground" aria-label={`${t.ui.ageAverage}: ${averageAge}`}>
                {averageAge}
              </div>
              <div className="text-xs text-muted-foreground">{t.ui.ageAverage}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((index) => (
        <Card key={index} className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-0.5">
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}