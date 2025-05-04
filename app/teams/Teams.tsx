"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonTop } from "@/components/ui/button-top"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import type { Team, TeamDetails } from "@/types/kings-league"
import { cn } from "@/lib/utils"

export default function Teams() {
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamDetails, setTeamDetails] = useState<Record<string, TeamDetails>>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [standings, setStandings] = useState<any[]>([])

  // Carrega os dados iniciais da liga (times e classificação)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Verifica se existe cache no localStorage e se ainda é válido (24 horas)
        const cachedData = localStorage.getItem('teams-page-cache')
        const cachedTimestamp = localStorage.getItem('teams-page-cache-timestamp')
        const now = Date.now()
        const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

        // Se o cache existir e ainda não tiver expirado
        if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_EXPIRY_TIME) {
          try {
            const parsedData = JSON.parse(cachedData)
            setTeams(parsedData.teams)
            setStandings(parsedData.standings)
            setTeamDetails(parsedData.teamDetails)
            setLoading(false)
            return
          } catch (parseError) {
            console.warn('Erro ao analisar dados em cache:', parseError)
          }
        }

        // Se não tiver cache ou o cache estiver expirado, busca dados novos
        const leagueData = await fetchLeagueData()
        if (leagueData?.teams) {
          setTeams(leagueData.teams)
          setStandings(leagueData.standings || [])

          const teamDetailsMap: Record<string, TeamDetails> = {}

          // Buscar detalhes de cada time para obter os presidentes
          await Promise.all(
            leagueData.teams.map(async (team) => {
              try {
                const response = await fetch(`/api/team-details/${team.id}`)
                if (response.ok) {
                  const teamDetail = await response.json()
                  teamDetailsMap[team.id] = teamDetail
                  setTeamDetails(prev => ({
                    ...prev,
                    [team.id]: teamDetail
                  }))
                }
              } catch (error) {
                console.error(`Erro ao buscar detalhes do time ${team.id}:`, error)
              }
            })
          )

          // Salvar no localStorage com timestamp atual
          const dataToCache = {
            teams: leagueData.teams,
            standings: leagueData.standings || [],
            teamDetails: teamDetailsMap
          }
          localStorage.setItem('teams-page-cache', JSON.stringify(dataToCache))
          localStorage.setItem('teams-page-cache-timestamp', now.toString())

          setLoading(false)
        }
      } catch (error) {
        console.error("Erro ao carregar dados da liga:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Alterna o time selecionado
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  // Função para converter o objeto de times em um Record para manter compatibilidade com componentes existentes
  const teamsRecord: Record<string, Team> = teams.reduce((acc, team) => {
    acc[team.id] = team
    return acc
  }, {} as Record<string, Team>)

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        teams={teamsRecord}
        standings={standings}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Times da Kings League</h1>
        <p className="text-gray-400 text-center mb-8">Conheça os times e seus presidentes</p>

        {loading ? (
          <TeamsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                teamDetails={teamDetails[team.id]}
                isSelected={selectedTeam === team.id}
              />
            ))}
          </div>
        )}
      </div>

      <ButtonTop />
      <Footer />
    </main>
  )
}

interface TeamCardProps {
  team: Team
  teamDetails?: TeamDetails
  isSelected: boolean
}

function TeamCard({ team, teamDetails, isSelected }: TeamCardProps) {
  const hasPresident = teamDetails?.staff && teamDetails.staff.length > 0
  const president = hasPresident ? teamDetails.staff[0] : null
  const router = useRouter()

  const handleClick = () => {
    router.push(`/team/${team.id}`)
  }

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "cursor-pointer overflow-hidden transition-all bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)] hover:shadow-md hover:scale-[1.02]",
        isSelected && "border-[var(--team-primary)]"
      )}
      style={{
        borderColor: isSelected ? team.firstColorHEX : undefined,
      }}
    >
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${team.firstColorHEX}, ${team.secondColorHEX})`
        }}
      />

      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="w-12 h-12 relative flex-shrink-0 bg-black/30 rounded-full overflow-hidden">
          <img
            src={team.logo?.url || "/placeholder-logo.svg"}
            alt={team.name}
            width={48}
            height={48}
            className="object-contain w-full h-full"
          />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{team.name}</h3>
          <p className="text-sm text-gray-400">{team.shortName}</p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Presidente */}
        <div className="p-4">
          <div className="mb-1 text-sm text-gray-400 text-center">Presidente</div>
          {president ? (
            <div className="flex flex-col items-center">
              <div
                className="relative w-32 h-32 mb-2 bg-[#252525] border border-[#333] overflow-hidden"
                style={{
                  backgroundImage: "url('/bg-card-president.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {president.image?.url ? (
                  <img
                    src={president.image.url}
                    alt={president.shortName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#252525]/70 text-[var(--team-primary)] text-3xl font-bold">
                    {president.shortName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-base font-semibold">{president.shortName}</div>
                <div className="text-xs text-gray-400">Presidente</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px]">
              <div className="text-sm text-gray-500">Informações não disponíveis</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(12).fill(0).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-[#1a1a1a] border-[#333]">
          <div className="h-2 bg-gray-700" />

          <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-grow">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="bg-[#121212] p-4">
              <Skeleton className="h-4 w-24 mx-auto mb-3" />
              <div className="flex flex-col items-center">
                <Skeleton className="w-32 h-32 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}