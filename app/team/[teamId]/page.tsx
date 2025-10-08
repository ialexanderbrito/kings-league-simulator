"use client"

import { useState, useEffect, use } from "react"
import { fetchLeagueData, fetchTeamDetails } from "@/lib/fetch-league-data"
import TeamInfo from "@/components/team-info"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { TeamLoading } from "@/components/team/team-loading"
import type { Team, Round, TeamStanding, TeamDetails } from "@/types/kings-league"

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const unwrappedParams = use(params)
  const teamId = unwrappedParams.teamId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null)
  const [activeTab, setActiveTab] = useState<"matches" | "team">("matches")

  // Carrega os dados da liga e do time específico
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados da liga (já cacheados pela API do Next.js)
        const leagueData = await fetchLeagueData()

        // Converter lista de times para um Record (dicionário)
        const teamsDict: Record<string, Team> = {}
        leagueData.teams.forEach((team: Team) => {
          teamsDict[team.id] = team
        })
        setTeams(teamsDict)

        // Encontrar o time específico pela URL
        const currentTeam = leagueData.teams.find((t: Team) => t.id === teamId)
        if (!currentTeam) {
          throw new Error("Time não encontrado")
        }
        setTeam(currentTeam)

        setRounds(leagueData.rounds)
        setStandings(leagueData.standings)

        // Buscar detalhes do time (já cacheados pela API do Next.js)
        const details = await fetchTeamDetails(teamId)
        setTeamDetails(details)

        setLoading(false)
      } catch (err: any) {
        setLoading(false)
        setError(err.message || "Erro ao carregar dados do time. Tente novamente.")
        setDebugInfo("Informações técnicas: " + (err.stack ? err.stack.split("\n")[0] : "Erro desconhecido"))
      }
    }

    loadData()
  }, [teamId])

  const handleTeamSelect = (id: string) => {
    if (id !== teamId) {
      // Redirecionamento para a página do novo time selecionado
      window.location.href = `/team/${id}`
    }
  }

  // Renderizando o estado de carregamento com o componente específico para time
  if (loading) {
    return (
      <main className="bg-card min-h-screen text-white">
        <Header
          loading={true}
          selectedTeam={null}
          teams={{}}
          standings={[]}
          onTeamSelect={() => { }}
          setActiveTab={() => { }}
        />
        <div className="container mx-auto px-4 py-6">
          <TeamLoading />
        </div>
        <Footer />
      </main>
    )
  }

  // Renderizando o estado de erro
  if (error || !team) {
    return <ErrorState error={error || "Time não encontrado"} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="bg-card min-h-screen text-white">
      <Header
        loading={false}
        selectedTeam={team.id}
        teams={teams}
        standings={standings}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-4 py-6">
        <TeamInfo
          team={team}
          rounds={rounds}
          teams={teams}
        />
      </div>

      <Footer />

      {/* Adicionando Schema Markup para melhorar dados estruturados */}
      <SchemaMarkup
        type="team"
        teams={teams}
        teamId={team.id}
        eventName={`${team.name} - Kings League`}
        startDate={new Date().toISOString()}
      />
    </main>
  )
}