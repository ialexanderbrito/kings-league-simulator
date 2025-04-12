import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchTeamDetails } from "@/lib/fetch-league-data"
import { TeamHeader, TeamHeaderSkeleton } from "@/components/team/team-header"
import { TeamStats, StatisticsSkeleton } from "@/components/team/team-stats"
import { MatchesList } from "@/components/team/matches-list"
import { TeamRoster } from "@/components/team/team-roster"
import type { Team, Round } from "@/types/kings-league"

interface TeamInfoProps {
  team: Team
  rounds: Round[]
  teams: Record<string, Team>
}

export default function TeamInfo({ team, rounds, teams }: TeamInfoProps) {
  const [teamDetails, setTeamDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadTeamDetails = async () => {
      try {
        setLoading(true)
        const details = await fetchTeamDetails(team.id)
        setTeamDetails(details)
        setError(null)
      } catch (err) {
        console.error("Erro ao carregar detalhes do time:", err)
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
        round: round.name.replace('Jornada', 'Rodada'),
        roundId: round.id,
        ended: round.ended,
      })),
  )

  return (
    <div className="space-y-6">
      {/* Cabeçalho do time */}
      {loading ? (
        <TeamHeaderSkeleton />
      ) : (
        <TeamHeader team={team} teamDetails={teamDetails} />
      )}

      {/* Estatísticas */}
      {loading ? (
        <StatisticsSkeleton />
      ) : (
        <TeamStats team={team} teamDetails={teamDetails} teamMatches={teamMatches} />
      )}

      {error && (
        <Alert className="bg-[#332700] border-[#F4AF23] text-white">
          <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
          <AlertTitle className="text-[#F4AF23]">Atenção</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a]">
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black"
          >
            Partidas
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black"
          >
            Elenco
          </TabsTrigger>
        </TabsList>

        {/* Aba de Partidas */}
        <TabsContent value="matches" className="mt-0">
          <MatchesList
            teamId={team.id}
            teamMatches={teamMatches}
            teams={teams}
            loading={loading}
          />
        </TabsContent>

        {/* Aba de Elenco */}
        <TabsContent value="team" className="mt-0">
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader className="pb-2 border-b border-[#333]">
              <CardTitle className="text-xl text-[#F4AF23]">Elenco</CardTitle>
              <CardDescription className="text-gray-400">
                Jogadores da temporada atual
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <TeamRoster
                players={teamDetails?.players || []}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
