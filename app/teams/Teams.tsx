"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TeamsGridSkeleton } from "@/components/skeletons/teams-grid-skeleton"
import { ButtonTop } from "@/components/ui/button-top"
import { fetchLeagueData, fetchTeamDetails } from "@/lib/fetch-league-data"
import type { Team, TeamDetails, TeamStanding } from "@/types/kings-league"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Users, Crown, ChevronRight, ArrowUpRight, Trophy } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"

export default function Teams() {
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamDetails, setTeamDetails] = useState<Record<string, TeamDetails>>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [standings, setStandings] = useState<TeamStanding[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const leagueData = await fetchLeagueData()
        if (leagueData?.teams) {
          setTeams(leagueData.teams)
          setStandings(leagueData.standings || [])
          setLoading(false)

          // Atualiza detalhes em segundo plano aproveitando o cache
          Promise.all(
            leagueData.teams.map(async (team) => {
              try {
                const teamDetail = await fetchTeamDetails(team.id)
                setTeamDetails(prev => ({
                  ...prev,
                  [team.id]: teamDetail
                }))
              } catch (error) {
                // Silencioso: falhas individuais não devem quebrar a página
              }
            })
          ).catch(() => {})
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

  // Map de standings por ID de time para lookup instantâneo O(1)
  const standingsMap = useMemo(() => {
    const map = new Map<string, TeamStanding>()
    standings.forEach(s => map.set(String(s.id), s))
    return map
  }, [standings])

  return (
    <main className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => { }}
      />

      {/* Iluminação Ambiente Suave */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[140px] opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
        {/* Header da Página - Padrão Oficial Kings League */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              Temporada Oficial • Kings League Brasil
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Times &amp; <span className="text-[var(--team-primary,#F4AF23)]">Presidentes</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            As 10 identidades oficiais e as lideranças que comandam os esquadrões da Kings League.
          </p>
        </div>

        {/* Grid de Times com Acabamento Liquid Glass */}
        {loading ? (
          <TeamsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-12 sm:pb-16">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                teamDetails={teamDetails[team.id]}
                standing={standingsMap.get(String(team.id))}
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
  standing?: TeamStanding
  isSelected: boolean
}

function TeamCard({ team, teamDetails, standing, isSelected }: TeamCardProps) {
  const router = useRouter()

  const president =
    teamDetails?.staff?.find((s) => s.role === "president") ||
    (team as any).staffs?.find((s: any) => s.role === "president")
  const playersCount = teamDetails?.players?.length || (team as any).players?.length || 13

  const handleClick = () => {
    router.push(`/team/${team.id}`)
  }

  return (
    <article
      onClick={handleClick}
      className={cn(
        "liquid-glass-card group relative cursor-pointer overflow-hidden rounded-3xl p-5 sm:p-6",
        "flex flex-col justify-between",
        isSelected && "ring-2 ring-[var(--team-primary)]/50"
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
      {/* Refração de Luz Ambiente Baseada na Cor do Time */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: team.firstColorHEX || 'var(--team-primary)' }}
      />

      {/* Filete de Brilho Especular Superior com a Cor do Time */}
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${team.firstColorHEX || 'var(--team-primary)'} 50%, transparent)`
        }}
      />

      <div>
        {/* Top: Escudo e Identidade do Clube */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* Escudo do Clube em redoma de vidro */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5 bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ease-out">
              <img
                src={getProxyImageUrl(team.logo?.url)}
                alt={`Escudo ${team.name}`}
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>

            {/* Nome & Tag */}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight truncate leading-snug">
                {team.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300">
                  {team.shortName}
                </span>
                {standing && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5 text-amber-400" />
                    <span>#{standing.rank}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Ação / Ícone de Abertura */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center liquid-pill-btn text-zinc-400 group-hover:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Destaque Central: O Presidente */}
        <div className="my-5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.025] group-hover:bg-white/[0.05] border border-white/[0.06] group-hover:border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[background-color,border-color] duration-150">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
              {president?.image?.url ? (
                <img
                  src={getProxyImageUrl(president.image.url)}
                  alt={president.shortName || "Presidente"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-amber-400 text-sm font-black bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  {president?.shortName?.substring(0, 2) || "PR"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
                <Crown className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-1">
                Presidente
              </span>
              <p className="text-sm font-bold text-white truncate leading-snug mt-0.5">
                {president ? (president.shortName || `${president.firstName} ${president.lastName}`) : "A Definir"}
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                Liderança &amp; Transmissão
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>{playersCount} atletas</span>
          </div>
          {/* Swatch de Cores do Time */}
          <div className="flex items-center -space-x-1" title="Cores do time">
            <div
              className="w-2.5 h-2.5 rounded-full border border-black/40"
              style={{ backgroundColor: team.firstColorHEX }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full border border-black/40"
              style={{ backgroundColor: team.secondColorHEX }}
            />
          </div>
        </div>

        <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors duration-150 flex items-center gap-1">
          Ver perfil
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
        </span>
      </div>
    </article>
  )
}


