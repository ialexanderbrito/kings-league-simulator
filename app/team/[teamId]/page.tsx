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
      <main className="min-h-screen bg-[#060608] text-white">
        <Header
          loading={true}
          selectedTeam={null}
          onTeamSelect={() => { }}
          setActiveTab={() => { }}
        />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    <main className="min-h-screen bg-[#060608] text-white selection:bg-[var(--team-primary)] selection:text-black relative overflow-x-hidden">
      {/* Iluminação Ambiente Suave baseada nas cores oficiais do time */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[140px] opacity-15"
          style={{
            background: `radial-gradient(circle, ${team.firstColorHEX} 0%, ${team.secondColorHEX} 60%, transparent 80%)`,
          }}
        />
        <div
          className="absolute top-[400px] -right-32 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10"
          style={{
            background: team.firstColorHEX,
          }}
        />
      </div>

      <Header
        loading={false}
        selectedTeam={team.id}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-4 py-3 sm:py-5 max-w-7xl relative z-10">
        <TeamInfo
          team={team}
          rounds={rounds}
          teams={teams}
          standings={standings}
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