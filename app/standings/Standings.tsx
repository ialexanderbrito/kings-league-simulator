"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { TeamStanding, Team, TeamDetails, Round, Match } from "@/types/kings-league"
import FullStandingsTable, { MatchFormItem, PositionChange } from "@/components/full-standings-table"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { FullTableSkeleton } from "@/components/skeletons/full-table-skeleton"
import { EmptyLeagueState } from "@/components/empty-league-state"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ButtonTop } from "@/components/ui/button-top"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { useLeague } from "@/contexts/league-context"
import { AppleFlag } from "@/components/ui/apple-flag"
import { getLeagueQualification, formatRoundName } from "@/lib/league-format"
import { useLocale } from "@/contexts/locale-context"
import { GradientTitle } from "@/components/ui/gradient-title"

export default function StandingsPage() {
  const router = useRouter()
  const { selectedLeague, selectedSeasonId } = useLeague()
  const { t } = useLocale()
  const [loading, setLoading] = useState(true)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [teamDetails, setTeamDetails] = useState<Record<string, TeamDetails>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [groupedStandings, setGroupedStandings] = useState<Array<{ groupName: string; standings: any[] }>>([])

  // Carregar dados da liga e detalhes dos clubes
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const leagueData = await fetchLeagueData({
          seasonId: selectedSeasonId,
          competitionId: selectedLeague.competitionId,
        })
        if (!isMounted || !leagueData) return

        const { rounds: loadedRounds, teams: loadedTeams, standings: loadedStandings } = leagueData

        // Converte o array de times para um objeto Record para lookup O(1)
        const teamsRecord: Record<string, Team> = (loadedTeams || []).reduce((acc, team) => {
          acc[String(team.id)] = team
          return acc
        }, {} as Record<string, Team>)

        setRounds(loadedRounds || [])
        setTeams(teamsRecord)
        setStandings(loadedStandings || [])

        const hasTwoGroups = Boolean(
          (loadedStandings || []).some((s: any) => s.groupName === "A") &&
          (loadedStandings || []).some((s: any) => s.groupName === "B")
        )

        let grouped: { groupName: string; standings: TeamStanding[] }[] = []

        if (!hasTwoGroups) {
          const arr = [...(loadedStandings || [])]
          arr.sort((a: any, b: any) => {
            const rankA = Number(a.rank ?? 0)
            const rankB = Number(b.rank ?? 0)
            if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB

            const wonA = Number(a.won ?? 0)
            const wonB = Number(b.won ?? 0)
            if (wonB !== wonA) return wonB - wonA

            const gdA = a.goalDifference ?? (a.goalsFor || 0) - (a.goalsAgainst || 0)
            const gdB = b.goalDifference ?? (b.goalsFor || 0) - (b.goalsAgainst || 0)
            if (gdB !== gdA) return gdB - gdA

            const gfA = Number(a.goalsFor ?? 0)
            const gfB = Number(b.goalsFor ?? 0)
            if (gfB !== gfA) return gfB - gfA

            return String(a.name ?? "").localeCompare(String(b.name ?? ""))
          })
          grouped = [{ groupName: "Regular", standings: arr }]
        } else {
          // Agrupamento dos standings por grupo com validação defensiva
          const groups: Record<string, TeamStanding[]> = {}
          ;(loadedStandings || []).forEach((team) => {
            if (!team || typeof team !== "object") return
            const group = (team as any).groupName || (team as any).group || "A"
            if (!groups[group]) groups[group] = []
            groups[group].push(team)
          })

          // Ordenar chaves dos grupos de forma estável
          const keys = Object.keys(groups)
          const middle = keys.filter((k) => k !== "A" && k !== "B").sort((a, b) => a.localeCompare(b))
          const orderedKeys: string[] = []
          if (keys.includes("A")) orderedKeys.push("A")
          orderedKeys.push(...middle)
          if (keys.includes("B")) orderedKeys.push("B")

          // Ordenar os clubes estritamente pelas regras da Kings League: Vitórias e Derrotas (V-D)
          grouped = orderedKeys.map((k) => {
            const arr = [...(groups[k] || [])]

            arr.sort((a: any, b: any) => {
              const rankA = Number(a.rank ?? 0)
              const rankB = Number(b.rank ?? 0)
              if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB

              const wonA = Number(a.won ?? 0)
              const wonB = Number(b.won ?? 0)
              if (wonB !== wonA) return wonB - wonA

              const gdA = a.goalDifference ?? (a.goalsFor || 0) - (a.goalsAgainst || 0)
              const gdB = b.goalDifference ?? (b.goalsFor || 0) - (b.goalsAgainst || 0)
              if (gdB !== gdA) return gdB - gdA

              const gfA = Number(a.goalsFor ?? 0)
              const gfB = Number(b.goalsFor ?? 0)
              if (gfB !== gfA) return gfB - gfA

              return String(a.name ?? "").localeCompare(String(b.name ?? ""))
            })

            return { groupName: k, standings: arr }
          })
        }

        setGroupedStandings(grouped)
      } catch (error) {
        console.error("Erro ao carregar classificação da Kings League:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [selectedSeasonId, selectedLeague.competitionId])

  // Calcular a Forma Recente (Últimos jogos: estritamente V ou D)
  const teamFormMap = useMemo(() => {
    const map = new Map<string, MatchFormItem[]>()
    if (!rounds || rounds.length === 0) return map

    // Ordenar todas as partidas disputadas cronologicamente
    const finishedMatches: Array<{
      match: Match
      roundName: string
      date: number
    }> = []

    rounds.forEach((round) => {
      if (!round || !Array.isArray(round.matches)) return
      round.matches.forEach((m) => {
        if (!m || !m.scores || !m.participants) return
        if (m.scores.homeScore !== null && m.scores.awayScore !== null) {
          finishedMatches.push({
            match: m,
            roundName: formatRoundName(round.name, t.matches.roundPrefix, round.id),
            date: m.date ? new Date(m.date).getTime() : (round.id || 1) * 1000,
          })
        }
      })
    })

    finishedMatches.sort((a, b) => a.date - b.date)

    finishedMatches.forEach(({ match, roundName }) => {
      const homeId = String(match.participants.homeTeamId)
      const awayId = String(match.participants.awayTeamId)
      const homeScore = match.scores.homeScore!
      const awayScore = match.scores.awayScore!
      const homeScoreP = match.scores.homeScoreP
      const awayScoreP = match.scores.awayScoreP

      const evalResult = (isHome: boolean): MatchFormItem => {
        const myScore = isHome ? homeScore : awayScore
        const oppScore = isHome ? awayScore : homeScore
        const myScoreP = isHome ? homeScoreP : awayScoreP
        const oppScoreP = isHome ? awayScoreP : homeScoreP
        const oppId = isHome ? awayId : homeId
        const oppTeam = teams[oppId]
        const oppName = oppTeam?.shortName || oppTeam?.name || t.common.opponent
        const oppLogo = typeof oppTeam?.logo === "string" ? oppTeam.logo : oppTeam?.logo?.url

        // Em caso de Shootout: quem fez mais gols no shootout venceu (V), o outro perdeu (D)
        if (homeScore === awayScore && homeScoreP !== null && awayScoreP !== null) {
          const wonShootout = myScoreP! > oppScoreP!
          return {
            type: wonShootout ? "V" : "D",
            label: wonShootout ? "V" : "D",
            score: `${homeScore} (${homeScoreP}) - (${awayScoreP}) ${awayScore}`,
            oppName,
            oppLogo,
            roundName,
            isHome,
            isShootout: true,
          }
        }

        // Vitória ou Derrota no tempo normal
        const wonRegular = myScore > oppScore
        return {
          type: wonRegular ? "V" : "D",
          label: wonRegular ? "V" : "D",
          score: `${homeScore} - ${awayScore}`,
          oppName,
          oppLogo,
          roundName,
          isHome,
          isShootout: false,
        }
      }

      if (!map.has(homeId)) map.set(homeId, [])
      map.get(homeId)!.push(evalResult(true))

      if (!map.has(awayId)) map.set(awayId, [])
      map.get(awayId)!.push(evalResult(false))
    })

    // Retém os últimos 5 jogos de cada time
    map.forEach((items, id) => {
      map.set(id, items.slice(-5))
    })

    return map
  }, [rounds, teams])

  // Calcular variação de posições com base nas vitórias da rodada anterior
  const positionChangesMap = useMemo(() => {
    const map = new Map<string, PositionChange>()
    if (!rounds || rounds.length === 0 || standings.length === 0) return map

    const playedRounds = rounds.filter((r) =>
      Array.isArray(r?.matches) && r.matches.some((m) => m?.scores?.homeScore !== null && m?.scores?.awayScore !== null)
    )

    if (playedRounds.length <= 1) return map

    const lastPlayedRound = playedRounds[playedRounds.length - 1]
    const lastRoundMatchIds = new Set((lastPlayedRound.matches || []).map((m) => m.id))

    // Partidas anteriores (excluindo a rodada mais recente)
    const prevMatches: Match[] = []
    rounds.forEach((r) => {
      if (!r || !Array.isArray(r.matches)) return
      r.matches.forEach((m) => {
        if (!m || !m.scores || !m.participants) return
        if (
          m.scores.homeScore !== null &&
          m.scores.awayScore !== null &&
          !lastRoundMatchIds.has(m.id)
        ) {
          prevMatches.push(m)
        }
      })
    })

    const prevStats: Record<string, { won: number; lost: number; gd: number; gf: number }> = {}
    Object.keys(teams).forEach((id) => {
      prevStats[id] = { won: 0, lost: 0, gd: 0, gf: 0 }
    })

    prevMatches.forEach((m) => {
      const hId = String(m.participants.homeTeamId)
      const aId = String(m.participants.awayTeamId)
      const hS = m.scores.homeScore!
      const aS = m.scores.awayScore!
      const hSP = m.scores.homeScoreP
      const aSP = m.scores.awayScoreP

      if (!prevStats[hId]) prevStats[hId] = { won: 0, lost: 0, gd: 0, gf: 0 }
      if (!prevStats[aId]) prevStats[aId] = { won: 0, lost: 0, gd: 0, gf: 0 }

      prevStats[hId].gf += hS
      prevStats[hId].gd += hS - aS
      prevStats[aId].gf += aS
      prevStats[aId].gd += aS - hS

      if (hS > aS) {
        prevStats[hId].won += 1
        prevStats[aId].lost += 1
      } else if (aS > hS) {
        prevStats[aId].won += 1
        prevStats[hId].lost += 1
      } else {
        if (hSP !== null && aSP !== null) {
          if (hSP > aSP) {
            prevStats[hId].won += 1
            prevStats[aId].lost += 1
          } else {
            prevStats[aId].won += 1
            prevStats[hId].lost += 1
          }
        }
      }
    })

    const prevRanks: Record<string, number> = {}
    groupedStandings.forEach((g) => {
      const groupTeamIds = g.standings.map((s: any) => String(s.id))
      const sorted = [...groupTeamIds].sort((a, b) => {
        const sA = prevStats[a] || { won: 0, lost: 0, gd: 0, gf: 0 }
        const sB = prevStats[b] || { won: 0, lost: 0, gd: 0, gf: 0 }
        if (sB.won !== sA.won) return sB.won - sA.won
        if (sB.gd !== sA.gd) return sB.gd - sA.gd
        return sB.gf - sA.gf
      })

      sorted.forEach((teamId, idx) => {
        prevRanks[teamId] = idx + 1
      })
    })

    groupedStandings.forEach((g) => {
      g.standings.forEach((team: any, currentIdx: number) => {
        const currentRank = currentIdx + 1
        const prevRank = prevRanks[String(team.id)]
        if (prevRank !== undefined) {
          const diff = prevRank - currentRank
          if (diff > 0) {
            map.set(String(team.id), { value: diff, direction: "up" })
          } else if (diff < 0) {
            map.set(String(team.id), { value: Math.abs(diff), direction: "down" })
          } else {
            map.set(String(team.id), { value: 0, direction: "same" })
          }
        }
      })
    })

    return map
  }, [rounds, teams, standings, groupedStandings])

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    router.push(`/team/${teamId}`)
  }

  // Estado de Carregamento
  if (loading) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
        <Header
          loading={true}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={() => {}}
        />

        {/* Iluminação Ambiente Suave */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[140px] opacity-15"
            style={{
              background:
                "radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
          {/* Header da Página - Padrão Oficial */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
              <AppleFlag country={selectedLeague.countryIso} emoji={selectedLeague.flag} size={14} />
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
                {t.home.officialSeason} • {selectedLeague.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              <GradientTitle title={t.pages.standingsTitle} />
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {t.pages.standingsDescription}
            </p>
          </div>

          <FullTableSkeleton />
        </div>

        <Footer />
      </main>
    )
  }

  // Estado Vazio / Falha de Dados
  const isEmptyLeagueData =
    standings.length === 0 || rounds.length === 0 || Object.keys(teams).length === 0

  if (isEmptyLeagueData) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
        <Header
          loading={false}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={() => {}}
        />
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <EmptyLeagueState />
        </div>
        <Footer />
      </main>
    )
  }

  // Renderização Oficial Padronizada
  return (
    <main className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => {}}
      />

      {/* Iluminação Ambiente Suave */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[140px] opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
        {/* Header da Página - Padrão Oficial */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <AppleFlag country={selectedLeague.countryIso} emoji={selectedLeague.flag} size={14} />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              {t.home.officialSeason} • {selectedLeague.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            <GradientTitle title={t.pages.standingsTitle} />
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t.pages.standingsDescription}
          </p>
        </div>

        {/* Tabela de Classificação Liquid Glass */}
        <div className="pb-12 sm:pb-16">
          <FullStandingsTable
            groupedStandings={groupedStandings}
            teams={teams}
            teamDetails={teamDetails}
            teamFormMap={teamFormMap}
            positionChangesMap={positionChangesMap}
            onTeamSelect={handleTeamSelect}
            rounds={rounds}
            qualification={getLeagueQualification(selectedLeague.id)}
            hasLiveMatches={rounds.some((round) => round.matches.some((match) => {
              const status = String(match.status || "").toLowerCase()
              return status.includes("inplay") || status.includes("live") || status.includes("in_progress")
            }))}
          />
        </div>
      </div>

      <ButtonTop />
      <Footer />
    </main>
  )
}
