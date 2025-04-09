"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, TableIcon, Info, AlertTriangle } from "lucide-react"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import TeamInfo from "@/components/team-info"
import { calculateStandings } from "@/lib/calculate-standings"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import KingsLeagueLogo from "@/components/kings-league-logo"

export default function KingsLeagueSimulator() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("standings")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)
        setUsingFallback(false)

        const data = await fetchLeagueData()

        // Verificar se estamos usando dados de fallback
        if (data.rounds.length === 1 && data.rounds[0].matches.length === 1) {
          setUsingFallback(true)
        }

        setLeagueData(data)

        // Extrair times
        const teamsDict: Record<string, Team> = {}
        data.teams.forEach((team) => {
          teamsDict[team.id] = team
        })
        setTeams(teamsDict)

        // Extrair rodadas
        const extractedRounds = data.rounds
        setRounds(extractedRounds)

        // Usar classificação da API
        setStandings(data.standings)

        setLoading(false)
      } catch (error) {
        setLoading(false)
        setError(error.message || "Erro ao carregar dados. Tente novamente.")

        // Adicionar informações de debug
        setDebugInfo("Informações técnicas: " + (error.stack ? error.stack.split("\n")[0] : "Erro desconhecido"))
      }
    }

    loadData()
  }, [])

  const handleScoreUpdate = (
    roundId: number,
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => {
    // Salvar standings atuais antes da atualização
    setPreviousStandings(standings)

    const updatedRounds = rounds.map((round) => {
      if (round.id === roundId) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            // Se a partida já estiver encerrada, não permitir alterações
            if (match.status === "ended") {
              return match
            }

            // Criar um novo objeto de scores para evitar mutações parciais
            const updatedScores = { ...match.scores }

            // Atualizar apenas os scores que foram fornecidos
            if (homeScore !== null) {
              updatedScores.homeScore = homeScore
            }

            if (awayScore !== null) {
              updatedScores.awayScore = awayScore
            }

            // Atualizar shootouts se fornecidos
            if (homeShootoutScore !== undefined) {
              updatedScores.homeScoreP = homeShootoutScore
            }

            if (awayShootoutScore !== undefined) {
              updatedScores.awayScoreP = awayShootoutScore
            }

            return {
              ...match,
              scores: updatedScores,
            }
          }
          return match
        })

        return {
          ...round,
          matches: updatedMatches,
        }
      }
      return round
    })

    setRounds(updatedRounds)

    // Recalcular classificação com os novos resultados
    const updatedStandings = calculateStandings(updatedRounds, teams, leagueData?.standings || [])
    setStandings(updatedStandings)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setActiveTab("team")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="text-center">
          <KingsLeagueLogo className="mx-auto mb-6" width={100} height={128} />
          <div className="animate-spin w-8 h-8 border-4 border-[#F4AF23] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando dados da Kings League Brasil...</p>
        </div>
      </div>
    )
  }

  // Adicionar exibição de erro
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#121212] min-h-screen">
        <div className="flex justify-center mb-8">
          <KingsLeagueLogo className="mx-auto" width={100} height={128} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 text-[#F4AF23]">Simulador Kings League Brasil</h1>

        <div className="bg-red-900 border border-red-700 text-white p-6 rounded-md max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Erro ao carregar dados
          </h2>
          <p>{error}</p>
          {debugInfo && <p className="mt-2 text-xs text-red-400">{debugInfo}</p>}
          <Button className="mt-4 bg-red-700 hover:bg-red-600" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-[#121212] min-h-screen text-white pb-12">
      <header className="bg-black py-4 border-b border-[#333] mb-8">
        <div className="container mx-auto px-4 flex items-center justify-center md:justify-start">
          <KingsLeagueLogo className="mr-4" width={50} height={64} />
          <h1 className="text-2xl md:text-3xl font-bold text-[#F4AF23]">Simulador Kings League Brasil</h1>
        </div>
      </header>

      <div className="container mx-auto px-4">
        {usingFallback && (
          <Alert className="mb-6 bg-[#332700] border-[#F4AF23] text-white">
            <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
            <AlertTitle className="text-[#F4AF23]">Usando dados de demonstração</AlertTitle>
            <AlertDescription>
              Não foi possível acessar todos os dados da API da Kings League. Estamos usando dados parciais para que
              você possa testar o simulador.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#1a1a1a]">
            <TabsTrigger
              value="matches"
              className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
            >
              <Calendar className="w-4 h-4" />
              <span>Partidas</span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
              disabled={!selectedTeam}
            >
              <Info className="w-4 h-4" />
              <span>Time</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
              <MatchesTable rounds={rounds} teams={teams} onScoreUpdate={handleScoreUpdate} />

              <div className="space-y-6">
                <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden lg:sticky lg:top-6">
                  <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                      <TableIcon className="w-4 h-4 text-[#F4AF23]" />
                      Classificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <StandingsTable
                      standings={standings}
                      onTeamSelect={handleTeamSelect}
                      previousStandings={previousStandings}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            {selectedTeam && <TeamInfo team={teams[selectedTeam]} rounds={rounds} teams={teams} />}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
