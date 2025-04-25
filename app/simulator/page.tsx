"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Trophy } from "lucide-react"
import TeamCarousel from "@/components/team-carousel"
import DisclaimerNotice from "@/components/disclaimer-notice"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { calculateStandings } from "@/lib/calculate-standings"
import { saveSimulatedStandings, saveSimulatedRounds, saveSimulatedTeams } from "@/lib/simulated-data-manager"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MainContent } from "@/components/layout/main-content"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SimulatorPage() {
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
  const [activeTab, setActiveTab] = useState<"matches" | "team">("matches")
  const router = useRouter()

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

            // Tratamento especial para valores zero (considerados vazios no input)
            // Isso garante a persistência dos valores ao navegar entre páginas
            if (homeScore !== null) {
              updatedScores.homeScore = homeScore
            }

            if (awayScore !== null) {
              updatedScores.awayScore = awayScore
            }

            // Atualiza o placar de pênaltis se for definido
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

    // Salvar dados simulados no localStorage para uso nos playoffs
    saveSimulatedStandings(updatedStandings)
    saveSimulatedRounds(updatedRounds)
    saveSimulatedTeams(teams)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    router.push(`/team/${teamId}`)
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
        setActiveTab={setActiveTab}
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

        {/* Botão de acesso rápido aos playoffs */}
        <div className="flex justify-center mb-6 px-2 sm:px-4 md:px-0">
          <Link href="/playoffs" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-[#1A1A1A] border border-[var(--team-primary)]/40 hover:bg-[var(--team-primary)]/10 text-white transition-all duration-200 group flex items-center justify-center gap-2 py-3 px-4 sm:px-6 rounded-lg shadow-sm"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[var(--team-primary)]" />
              <span className="font-medium text-sm sm:text-base">Playoffs 2025</span>
              <span className="sr-only">Simular Playoffs Kings League</span>
            </Button>
          </Link>
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      </div>
      <Footer />

      {/* Adicionando Schema Markup para melhorar dados estruturados */}
      <SchemaMarkup
        type="league"
        teams={teams}
        standings={standings}
        eventName="Kings League - Temporada Atual"
        startDate={new Date().toISOString()}
      />
    </main>
  )
}