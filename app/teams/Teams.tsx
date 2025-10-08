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
import { Users, Trophy, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
        // Buscar dados da liga (já cacheados pela API do Next.js)
        const leagueData = await fetchLeagueData()
        if (leagueData?.teams) {
          setTeams(leagueData.teams)
          setStandings(leagueData.standings || [])

          // Buscar detalhes de cada time para obter os presidentes
          await Promise.all(
            leagueData.teams.map(async (team) => {
              try {
                const response = await fetch(`/api/team-details/${team.id}`)
                if (response.ok) {
                  const teamDetail = await response.json()
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
    <main className="min-h-screen bg-card">
      {/* Header */}
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        teams={teamsRecord}
        standings={standings}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header da Página */}
        <div className="text-center mb-8 sm:mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-[var(--team-primary)]" aria-hidden="true" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Times da Kings League
            </h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Conheça os times, presidentes e comissões técnicas da competição
          </p>
        </div>

        {loading ? (
          <TeamsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
  const router = useRouter()

  // Separar presidente e técnico
  const president = teamDetails?.staff?.find(s => s.role === 'president')
  const coach = teamDetails?.staff?.find(s => s.role === 'coach')
  const playersCount = teamDetails?.players?.length || 0

  const handleClick = () => {
    router.push(`/team/${team.id}`)
  }

  return (
    <article
      onClick={handleClick}
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 bg-card border border-border rounded-xl hover:shadow-xl hover:shadow-[var(--team-primary)]/10 hover:-translate-y-1",
        isSelected && "ring-2 ring-[var(--team-primary)] shadow-lg shadow-[var(--team-primary)]/20"
      )}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes do time ${team.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Faixa de Cores do Time */}
      <div
        className="h-2.5"
        style={{
          background: `linear-gradient(90deg, ${team.firstColorHEX}, ${team.secondColorHEX})`
        }}
        aria-hidden="true"
      />

      {/* Header do Card com Logo e Nome */}
      <CardHeader className="p-5 pb-4 space-y-0">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0 bg-background rounded-full overflow-hidden ring-1 ring-border group-hover:ring-[var(--team-primary)] transition-all duration-300">
            <img
              src={team.logo?.url || "/placeholder-logo.svg"}
              alt=""
              width={56}
              height={56}
              className="object-contain w-full h-full p-1"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-[var(--team-primary)] transition-colors">
              {team.name}
            </h3>
            <p className="text-sm text-muted-foreground">{team.shortName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        {/* Estatísticas Rápidas */}
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{playersCount}</span>
            <span className="text-xs text-muted-foreground">jogadores</span>
          </div>
        </div>

        {/* Presidente */}
        {president ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Presidente
              </h4>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="relative w-full aspect-square max-w-[160px] mb-3 bg-muted rounded-lg overflow-hidden ring-1 ring-border"
                style={{
                  backgroundImage: "url('/bg-card-president.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {president.image?.url ? (
                  <img
                    src={president.image.url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-[var(--team-primary)] text-4xl font-bold">
                    {president.shortName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-base text-foreground">{president.shortName}</p>
                <Badge variant="secondary" className="mt-1.5 text-xs">
                  Presidente
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[220px] text-center">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Presidente não disponível</p>
          </div>
        )}

        {/* Técnico */}
        {coach && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0 bg-muted rounded-full overflow-hidden ring-1 ring-border">
                {coach.image?.url ? (
                  <img
                    src={coach.image.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted text-[var(--team-primary)] text-sm font-bold">
                    {coach.shortName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{coach.shortName}</p>
                <Badge variant="outline" className="text-xs mt-0.5">
                  Técnico
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </article>
  )
}

function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array(12).fill(0).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-card border-border rounded-xl">
          <div className="h-2.5 bg-muted animate-pulse" />

          <CardHeader className="p-5 pb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4">
            {/* Stats skeleton */}
            <div className="flex items-center justify-center gap-4 py-3 px-4 bg-muted/50 rounded-lg">
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Title skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* President image skeleton */}
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="w-full aspect-square max-w-[160px] rounded-lg" />
              <div className="text-center space-y-2">
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto rounded-full" />
              </div>
            </div>

            {/* Coach skeleton */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}