import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Team, TeamDetails, Round } from "@/types/kings-league"
import { calculateAge } from "@/lib/utils"

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
    scores: { homeScore: number | null; awayScore: number | null }
  }>
}

export function TeamStats({ team, teamDetails, teamMatches }: TeamStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-[#252525] border-[#333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{
                teamMatches.filter(m =>
                  m.scores.homeScore !== null &&
                  m.scores.awayScore !== null
                ).length
              }</div>
              <div className="text-xs text-gray-400">Jogos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">{
                teamMatches.filter(m => {
                  if (m.scores.homeScore === null || m.scores.awayScore === null) return false
                  const isHome = m.participants.homeTeamId === team.id
                  return isHome
                    ? m.scores.homeScore > m.scores.awayScore
                    : m.scores.awayScore > m.scores.homeScore
                }).length
              }</div>
              <div className="text-xs text-gray-400">Vitórias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{
                teamMatches.filter(m => {
                  if (m.scores.homeScore === null || m.scores.awayScore === null) return false
                  const isHome = m.participants.homeTeamId === team.id
                  return isHome
                    ? m.scores.homeScore < m.scores.awayScore
                    : m.scores.awayScore < m.scores.homeScore
                }).length
              }</div>
              <div className="text-xs text-gray-400">Derrotas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252525] border-[#333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Gols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-[var(--team-primary)]">{
                teamMatches.reduce((total, match) => {
                  if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                  const isHome = match.participants.homeTeamId === team.id
                  return total + (isHome ? match.scores.homeScore : match.scores.awayScore)
                }, 0)
              }</div>
              <div className="text-xs text-gray-400">Marcados</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{
                teamMatches.reduce((total, match) => {
                  if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                  const isHome = match.participants.homeTeamId === team.id
                  return total + (isHome ? match.scores.awayScore : match.scores.homeScore)
                }, 0)
              }</div>
              <div className="text-xs text-gray-400">Sofridos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{
                teamMatches.reduce((total, match) => {
                  if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                  const isHome = match.participants.homeTeamId === team.id
                  const goalsFor = isHome ? match.scores.homeScore : match.scores.awayScore
                  const goalsAgainst = isHome ? match.scores.awayScore : match.scores.homeScore
                  return total + (goalsFor - goalsAgainst)
                }, 0)
              }</div>
              <div className="text-xs text-gray-400">Saldo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#252525] border-[#333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Elenco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{teamDetails?.players.length || 0}</div>
              <div className="text-xs text-gray-400">Jogadores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--team-primary)]">{
                teamDetails?.players.filter(p => p.category === "wildcard").length || 0
              }</div>
              <div className="text-xs text-gray-400">Wildcards</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{
                Math.round(teamDetails?.players.reduce((sum, player) => {
                  const age = player.birthDate ? calculateAge(player.birthDate) : 0
                  return sum + age
                }, 0) / (teamDetails?.players.length || 1)) || 0
              }</div>
              <div className="text-xs text-gray-400">Média Idade</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="bg-[#252525] border-[#333]">
          <CardHeader className="pb-2">
            <CardTitle>
              <Skeleton className="h-4 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
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