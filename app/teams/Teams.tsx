"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonTop } from "@/components/ui/button-top"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import type { Team, TeamDetails } from "@/types/kings-league"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Users, Crown, ChevronRight, Sparkles, Shield, User } from "lucide-react"

export default function Teams() {
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamDetails, setTeamDetails] = useState<Record<string, TeamDetails>>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [standings, setStandings] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const leagueData = await fetchLeagueData()
        if (leagueData?.teams) {
          setTeams(leagueData.teams)
          setStandings(leagueData.standings || [])

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

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const teamsRecord: Record<string, Team> = teams.reduce((acc, team) => {
    acc[team.id] = team
    return acc
  }, {} as Record<string, Team>)

  // Calcular estatísticas
  const totalPlayers = Object.values(teamDetails).reduce((acc, td) => acc + (td?.players?.length || 0), 0)
  const totalPresidents = Object.values(teamDetails).filter(td => td?.staff?.some(s => s.role === 'president')).length

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Hero Header */}
        <div className="relative mb-8 sm:mb-12">
          {/* Background Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-3xl" />
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Kings League Brasil 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Todos os <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Times</span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Explore os times, seus presidentes e comissões técnicas da competição
            </p>

            {/* Stats Pills */}
            {!loading && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white font-medium">{teams.length}</span>
                  <span className="text-sm text-gray-500">times</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white font-medium">{totalPlayers}</span>
                  <span className="text-sm text-gray-500">jogadores</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white font-medium">{totalPresidents}</span>
                  <span className="text-sm text-gray-500">presidentes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <TeamsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
        "group relative cursor-pointer overflow-hidden transition-all duration-300",
        "bg-[#111111] border border-white/5 rounded-2xl",
        "hover:border-white/10 hover:bg-[#151515] hover:-translate-y-1",
        "hover:shadow-2xl hover:shadow-orange-500/5",
        isSelected && "ring-2 ring-orange-500/50 border-orange-500/30"
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
      {/* Gradient Border Top */}
      <div
        className="h-1 transition-all duration-300 group-hover:h-1.5"
        style={{
          background: `linear-gradient(90deg, ${team.firstColorHEX}, ${team.secondColorHEX})`
        }}
        aria-hidden="true"
      />

      {/* Background Glow on Hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${team.firstColorHEX}10, transparent 70%)`
        }}
      />

      <div className="relative p-5">
        {/* Header - Logo e Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "relative w-18 h-18 flex-shrink-0 rounded-2xl overflow-hidden",
            "bg-white/5 border border-white/10",
            "group-hover:border-white/20 transition-all duration-300"
          )}
            style={{ width: '72px', height: '72px' }}
          >
            <img
              src={getProxyImageUrl(team.logo?.url)}
              alt=""
              className="w-full h-full object-contain p-2.5"
              loading="lazy"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate group-hover:text-orange-400 transition-colors">
              {team.name}
            </h3>
            <p className="text-sm text-gray-500">{team.shortName}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Users className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs text-gray-500">{playersCount} jogadores</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Presidente Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Presidente</span>
          </div>

          {president ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10">
                {president.image?.url ? (
                  <img
                    src={president.image.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-amber-400 text-sm font-bold">
                    {president.shortName?.substring(0, 1)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {president.shortName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-500/80">Presidente</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-500">Não disponível</span>
            </div>
          )}
        </div>

        {/* Técnico Section */}
        {coach && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                {coach.image?.url ? (
                  <img
                    src={coach.image.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-blue-400 text-xs font-bold">
                    {coach.firstName?.substring(0, 1)}{coach.lastName?.substring(0, 1)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">
                  {coach.firstName} {coach.lastName}
                </p>
                <span className="text-[10px] text-gray-500">Técnico</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array(12).fill(0).map((_, index) => (
        <div key={index} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          {/* Gradient bar */}
          <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse" />

          <div className="p-5">
            {/* Header skeleton */}
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="rounded-2xl bg-white/5" style={{ width: '72px', height: '72px' }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
                <Skeleton className="h-3 w-20 bg-white/5" />
              </div>
            </div>

            {/* President section skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded bg-white/5" />
                <Skeleton className="h-3 w-16 bg-white/5" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/5" />
                  <Skeleton className="h-3 w-16 bg-white/5" />
                </div>
              </div>
            </div>

            {/* Coach skeleton */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-2.5 w-12 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}