"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import TeamCarousel from "@/components/team-carousel"
import DisclaimerNotice from "@/components/disclaimer-notice"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { calculateStandings } from "@/lib/calculate-standings"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MainContent } from "@/components/layout/main-content"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"

export default function KingsLeagueSimulator() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      setUsingFallback(false)

      const data = await fetchLeagueData()

      if (data.rounds.length === 1 && data.rounds[0].matches.length === 1) {
        setUsingFallback(true)
      }

      setLeagueData(data)

      const teamsDict: Record<string, Team> = {}
      data.teams.forEach((team) => {
        teamsDict[team.id] = team
      })
      setTeams(teamsDict)

      setRounds(data.rounds)

      setStandings(data.standings)

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Erro ao carregar dados. Tente novamente.")
      setDebugInfo("Informações técnicas: " + (err.stack ? err.stack.split("\n")[0] : "Erro desconhecido"))
    }
  }

  useEffect(() => {
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
    setPreviousStandings(standings)

    const updatedRounds = rounds.map((round) => {
      if (round.id === roundId) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            if (match.status === "ended") {
              return match
            }

            const updatedScores = { ...match.scores }

            if (homeScore !== null) {
              updatedScores.homeScore = homeScore
            }

            if (awayScore !== null) {
              updatedScores.awayScore = awayScore
            }

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

    const updatedStandings = calculateStandings(updatedRounds, teams, leagueData?.standings || [])
    setStandings(updatedStandings)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="bg-[#121212] min-h-screen text-white">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        teams={teams}
        standings={standings}
        onTeamSelect={handleTeamSelect}
      />

      <div className="container mx-auto px-4">
        <div className="pt-4 pb-2">
          <TeamCarousel
            teams={leagueData?.teams || []}
            onTeamSelect={handleTeamSelect}
            className="mb-6"
            loading={loading}
          />
        </div>

        <DisclaimerNotice forceShow={false} />

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

        <MainContent
          rounds={rounds}
          teams={teams}
          standings={standings}
          previousStandings={previousStandings}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          onScoreUpdate={handleScoreUpdate}
        />

      </div>
      <Footer />
    </main>
  )
}
