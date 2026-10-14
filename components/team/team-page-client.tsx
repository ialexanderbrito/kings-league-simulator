"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import TeamInfo from "@/components/team-info"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { TeamLoading } from "@/components/team/team-loading"
import { useLeague } from "@/contexts/league-context"
import { useLocale } from "@/contexts/locale-context"
import type { Team, Round, TeamStanding } from "@/types/kings-league"

interface TeamPageClientProps {
  teamId: string
}

export default function TeamPageClient({ teamId }: TeamPageClientProps) {
  const router = useRouter()
  const { t } = useLocale()
  const { selectedLeague, selectedSeasonId } = useLeague()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [, setActiveTab] = useState<"matches" | "team">("matches")

  // Carrega os dados da liga e do time específico (aproveitando o cache em memória)
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados da liga para a temporada e competição ativas
        const leagueData = await fetchLeagueData({
          seasonId: selectedSeasonId,
          competitionId: selectedLeague.competitionId,
        })

        if (!isMounted) return

        // Converter lista de times para um Record (dicionário)
        const teamsDict: Record<string, Team> = {}
        leagueData.teams.forEach((t: Team) => {
          teamsDict[t.id] = t
        })
        setTeams(teamsDict)

        // Encontrar o time específico pela URL
        const currentTeam = leagueData.teams.find((t: Team) => t.id === teamId)
        if (!currentTeam) {
          throw new Error(t.errors.notFound)
        }
        setTeam(currentTeam)
        setRounds(leagueData.rounds)
        setStandings(leagueData.standings)
        setLoading(false)
      } catch (err: any) {
        if (!isMounted) return
        setLoading(false)
        setError(err.message || t.errors.load)
        setDebugInfo(`${t.common.technicalDetails}: ${err.stack ? err.stack.split("\n")[0] : t.simulator.unknownError}`)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [teamId, selectedSeasonId, selectedLeague.competitionId, t])

  const handleTeamSelect = (id: string) => {
    if (id !== teamId) {
      // Navegação suave do Next.js sem recarregar scripts e layout do zero
      router.push(`/team/${id}`)
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
    return <ErrorState error={error || t.errors.notFound} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
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

      {/* Schema Markup para dados estruturados */}
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
