import type { Round, Team, TeamStanding } from "@/types/kings-league"

type HeadToHeadStats = {
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  matches: number
}

export function calculateStandings(
  rounds: Round[],
  teams: Record<string, Team>,
  initialStandings: TeamStanding[],
): Record<string, TeamStanding[]> {
  // Primeiro: agrupar partidas por grupo (mantemos para saber os grupos existentes)
  const groupMatches: Record<string, Round[]> = {}
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const group = match.groupName || "Sem Grupo"
      if (!groupMatches[group]) groupMatches[group] = []
      let lastRound = groupMatches[group][groupMatches[group].length - 1]
      if (!lastRound || lastRound.id !== round.id) {
        lastRound = { ...round, matches: [] }
        groupMatches[group].push(lastRound)
      }
      lastRound.matches.push(match)
    })
  })

  // Construir estatísticas globais por time (acumular todas as partidas)
  const globalStats: Record<string, TeamStanding> = {}

  const buildHeadToHeadStats = (teamIds: string[]): Record<string, HeadToHeadStats> => {
    const ids = new Set(teamIds)
    const h2hStats: Record<string, HeadToHeadStats> = {}

    teamIds.forEach((id) => {
      h2hStats[id] = {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        matches: 0,
      }
    })

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const homeId = match.participants.homeTeamId
        const awayId = match.participants.awayTeamId

        if (!ids.has(homeId) || !ids.has(awayId)) return

        const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores
        if (homeScore === null || awayScore === null) return

        const home = h2hStats[homeId]
        const away = h2hStats[awayId]

        home.matches += 1
        away.matches += 1

        home.goalsFor += homeScore
        home.goalsAgainst += awayScore
        away.goalsFor += awayScore
        away.goalsAgainst += homeScore

        if (homeScore > awayScore) {
          home.points += 1
        } else if (homeScore < awayScore) {
          away.points += 1
        } else {
          // Empate -> checar Shootout
          if (homeScoreP !== null && awayScoreP !== null) {
            if (homeScoreP > awayScoreP) {
              home.points += 1
            } else if (awayScoreP > homeScoreP) {
              away.points += 1
            } else {
              home.points += 1
              away.points += 1
            }
          } else {
            home.points += 1
            away.points += 1
          }
        }
      })
    })

    Object.keys(h2hStats).forEach((id) => {
      h2hStats[id].goalDifference = h2hStats[id].goalsFor - h2hStats[id].goalsAgainst
    })

    return h2hStats
  }

  const ensureTeam = (id: string) => {
    if (!globalStats[id]) {
      const standing = initialStandings.find(s => s.id === id)
      const team = teams[id]
      const base = standing || ({} as TeamStanding)
      globalStats[id] = {
        id,
        name: base.name || team?.name || `Time ${id}`,
        shortName: base.shortName || team?.shortName || `T${id}`,
        logo: base.logo || team?.logo,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        rank: 0,
        positionLegend: (base as any).positionLegend ?? null,
        groupName: (base as any).groupName || (base as any).group || undefined,
      }
    }
  }

  // Iterar por todas as partidas e acumular nas estatísticas globais
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const { homeTeamId, awayTeamId } = match.participants
      const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores
      if (homeScore === null || awayScore === null) return

      ensureTeam(homeTeamId)
      ensureTeam(awayTeamId)

      const home = globalStats[homeTeamId]
      const away = globalStats[awayTeamId]

      home.played += 1
      away.played += 1
      home.goalsFor += homeScore
      home.goalsAgainst += awayScore
      away.goalsFor += awayScore
      away.goalsAgainst += homeScore

      if (homeScore > awayScore) {
        home.won += 1
        home.points += 1
        away.lost += 1
      } else if (homeScore < awayScore) {
        away.won += 1
        away.points += 1
        home.lost += 1
      } else {
        // Empate -> checar Shootout
        if (homeScoreP !== null && awayScoreP !== null) {
          if (homeScoreP > awayScoreP) {
            home.won += 1
            home.points += 1
            away.lost += 1
          } else if (awayScoreP > homeScoreP) {
            away.won += 1
            away.points += 1
            home.lost += 1
          } else {
            home.drawn += 1
            home.points += 1
            away.drawn += 1
            away.points += 1
          }
        } else {
          home.drawn += 1
          home.points += 1
          away.drawn += 1
          away.points += 1
        }
      }
    })
  })

  // Recomputa saldo de gols
  Object.values(globalStats).forEach((t) => {
    t.goalDifference = t.goalsFor - t.goalsAgainst
  })

  // Montar standings por grupo tomando os totais globais para cada time que pertence ao grupo
  const standingsByGroup: Record<string, TeamStanding[]> = {}

  Object.entries(groupMatches).forEach(([group, groupRounds]) => {
    const teamIds = new Set<string>()
    groupRounds.forEach((r) => r.matches.forEach((m) => {
      teamIds.add(m.participants.homeTeamId)
      teamIds.add(m.participants.awayTeamId)
    }))
    // também adicionar times que o initialStandings declara pertencer ao grupo
    initialStandings.forEach((s) => {
      const g = (s as any).groupName || (s as any).group || ''
      if (String(g) === group) teamIds.add(s.id)
    })

    const list: TeamStanding[] = []
    teamIds.forEach((id) => {
      if (globalStats[id]) {
        // usar uma cópia para evitar mutações inesperadas
        list.push({ ...globalStats[id] })
      } else {
        // garantir que o time exista mesmo que não tenha jogado
        const standing = initialStandings.find(s => s.id === id)
        const team = teams[id]
        const base = standing || ({} as TeamStanding)
        list.push({
          id,
          name: base.name || team?.name || `Time ${id}`,
          shortName: base.shortName || team?.shortName || `T${id}`,
          logo: base.logo || team?.logo,
          // Use only metadata from initialStandings when the team has no computed stats
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          rank: 0,
          positionLegend: (base as any).positionLegend ?? null,
          groupName: (base as any).groupName || (base as any).group || group,
        })
      }
    })

    const compareFallback = (a: TeamStanding, b: TeamStanding) => {
      // Critérios globais após confronto direto: vitórias, saldo, gols pró, nome
      const aWon = Number(a.won || 0)
      const bWon = Number(b.won || 0)
      if (bWon !== aWon) return bWon - aWon

      const aGD = Number(a.goalDifference || 0)
      const bGD = Number(b.goalDifference || 0)
      if (bGD !== aGD) return bGD - aGD

      const aGF = Number(a.goalsFor || 0)
      const bGF = Number(b.goalsFor || 0)
      if (bGF !== aGF) return bGF - aGF

      return (a.name || "").localeCompare(b.name || "")
    }

    // 1) Ordena por pontos para formar blocos empatados
    const byPoints = [...list].sort((a, b) => {
      const aPoints = Number(a.points || 0)
      const bPoints = Number(b.points || 0)
      if (bPoints !== aPoints) return bPoints - aPoints
      return compareFallback(a, b)
    })

    // 2) Em cada bloco de empate em pontos, aplica confronto direto
    const sorted: TeamStanding[] = []
    let i = 0

    while (i < byPoints.length) {
      const currentPoints = Number(byPoints[i].points || 0)
      let j = i + 1

      while (j < byPoints.length && Number(byPoints[j].points || 0) === currentPoints) {
        j += 1
      }

      const tieBlock = byPoints.slice(i, j)
      if (tieBlock.length <= 1) {
        sorted.push(...tieBlock)
        i = j
        continue
      }

      const h2hStats = buildHeadToHeadStats(tieBlock.map((t) => t.id))
      const hasHeadToHeadData = tieBlock.some((t) => Number(h2hStats[t.id]?.matches || 0) > 0)

      const tieSorted = [...tieBlock].sort((a, b) => {
        if (hasHeadToHeadData) {
          const aH2H = h2hStats[a.id]
          const bH2H = h2hStats[b.id]

          const aH2HPoints = Number(aH2H?.points || 0)
          const bH2HPoints = Number(bH2H?.points || 0)
          if (bH2HPoints !== aH2HPoints) return bH2HPoints - aH2HPoints

          const aH2HGD = Number(aH2H?.goalDifference || 0)
          const bH2HGD = Number(bH2H?.goalDifference || 0)
          if (bH2HGD !== aH2HGD) return bH2HGD - aH2HGD

          const aH2HGF = Number(aH2H?.goalsFor || 0)
          const bH2HGF = Number(bH2H?.goalsFor || 0)
          if (bH2HGF !== aH2HGF) return bH2HGF - aH2HGF
        }

        return compareFallback(a, b)
      })

      sorted.push(...tieSorted)
      i = j
    }

    // remover duplicatas por id
    const seen = new Set<string>()
    const unique: TeamStanding[] = []
    for (const t of sorted) {
      if (!seen.has(t.id)) {
        seen.add(t.id)
        unique.push(t)
      }
    }

    standingsByGroup[group] = unique.map((team, index) => {
      let positionLegend = null
      if (index === 0) positionLegend = { color: "green", placement: "playoff:semifinal" }
      else if (index >= 1 && index <= 6) positionLegend = { color: "yellow", placement: "playoff:quarters" }
      return {
        ...team,
        positionLegend,
      }
    })
  })

  // Adiciona rank
  Object.keys(standingsByGroup).forEach((group) => {
    standingsByGroup[group] = standingsByGroup[group].map((team, idx) => ({ ...team, rank: idx + 1 }))
  })

  return standingsByGroup
}
