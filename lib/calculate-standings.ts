import type { Round, Team, TeamStanding } from "@/types/kings-league"
import { isChallengerMatch } from "./league-format"
import { determineChallengerAdvantage } from "./generate-playoff-bracket"

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
  // Verifica se a liga possui formato de dois grupos (Kings Cup) ou tabela única (Split Regular)
  const hasStandingGroups = Boolean(
    initialStandings?.some((s) => s.groupName === "A") &&
    initialStandings?.some((s) => s.groupName === "B")
  );
  const hasRoundGroups = Boolean(
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "A")) &&
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "B"))
  );
  const hasTwoGroups = hasStandingGroups || hasRoundGroups;

  // Mapeamento time -> grupo
  const teamGroupMap: Record<string, string> = {}
  initialStandings?.forEach((s) => {
    const g = s.groupName || (s as any).group
    if (g && (g === "A" || g === "B")) {
      teamGroupMap[s.id] = g
    }
  })
  rounds?.forEach((r) => {
    r.matches?.forEach((m) => {
      if (m.groupName === "A" || m.groupName === "B") {
        if (!teamGroupMap[m.participants.homeTeamId]) teamGroupMap[m.participants.homeTeamId] = m.groupName
        if (!teamGroupMap[m.participants.awayTeamId]) teamGroupMap[m.participants.awayTeamId] = m.groupName
      }
    })
  })

  // Agrupar partidas por grupo (se for tabela única, todas vão para o grupo Regular)
  const groupMatches: Record<string, Round[]> = {}
  rounds.forEach((round) => {
    round.matches?.forEach((match) => {
      const group = hasTwoGroups ? (match.groupName || "A") : "Regular"
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
      round.matches?.forEach((match) => {
        if (isChallengerMatch(match, round, teamGroupMap, hasTwoGroups)) return

        const homeId = match.participants.homeTeamId
        const awayId = match.participants.awayTeamId

        if (!ids.has(homeId) || !ids.has(awayId)) return

        const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores
        if (homeScore === null || awayScore === null) return
        const hScore = Number(homeScore)
        const aScore = Number(awayScore)
        if (isNaN(hScore) || isNaN(aScore)) return

        const home = h2hStats[homeId]
        const away = h2hStats[awayId]

        home.matches += 1
        away.matches += 1

        home.goalsFor += hScore
        home.goalsAgainst += aScore
        away.goalsFor += aScore
        away.goalsAgainst += hScore

        if (hScore > aScore) {
          home.points += 1
        } else if (aScore > hScore) {
          away.points += 1
        } else {
          // Empate -> checar Shootout
          if (homeScoreP !== null && awayScoreP !== null) {
            const hP = Number(homeScoreP)
            const aP = Number(awayScoreP)
            if (!isNaN(hP) && !isNaN(aP)) {
              if (hP > aP) {
                home.points += 1
              } else if (aP > hP) {
                away.points += 1
              } else {
                home.points += 1
                away.points += 1
              }
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
        groupName: teamGroupMap[id] || (base as any).groupName || (base as any).group || undefined,
      }
    }
  }

  // Iterar por todas as partidas e acumular nas estatísticas globais
  rounds.forEach((round) => {
    round.matches?.forEach((match) => {
      const { homeTeamId, awayTeamId } = match.participants

      ensureTeam(homeTeamId)
      ensureTeam(awayTeamId)

      // ATENÇÃO: Os jogos de Challenger NÃO pontuam e NÃO alteram as estatísticas individuais dos times.
      // Os times continuam com V-D 0-0, sem saldo de gols e sem pontos.
      // O jogo Challenger serve exclusivamente para definir qual grupo leva a vaga direta na semifinal.
      if (isChallengerMatch(match, round, teamGroupMap, hasTwoGroups)) {
        return
      }

      const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores
      if (homeScore === null || awayScore === null) return
      const hScore = Number(homeScore)
      const aScore = Number(awayScore)
      if (isNaN(hScore) || isNaN(aScore)) return

      const home = globalStats[homeTeamId]
      const away = globalStats[awayTeamId]

      home.played += 1
      away.played += 1
      home.goalsFor += hScore
      home.goalsAgainst += aScore
      away.goalsFor += aScore
      away.goalsAgainst += hScore

      if (hScore > aScore) {
        home.won += 1
        home.points += 1
        away.lost += 1
      } else if (aScore > hScore) {
        away.won += 1
        away.points += 1
        home.lost += 1
      } else {
        // Empate -> checar Shootout
        if (homeScoreP !== null && awayScoreP !== null) {
          const hP = Number(homeScoreP)
          const aP = Number(awayScoreP)
          if (!isNaN(hP) && !isNaN(aP)) {
            if (hP > aP) {
              home.won += 1
              home.points += 1
              away.lost += 1
            } else if (aP > hP) {
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

  const standingsGroups = hasTwoGroups
    ? ["A", "B"]
    : Array.from(new Set(initialStandings.map((s) => (s as any).groupName || (s as any).group).filter(Boolean)))
  const targetGroups = standingsGroups.length > 0
    ? standingsGroups.filter((g) => String(g).toLowerCase() !== "challenger")
    : ["Regular"]

  targetGroups.forEach((group) => {
    const teamIds = new Set<string>()

    // Times que o initialStandings declara pertencer ao grupo
    initialStandings.forEach((s) => {
      const g = hasTwoGroups ? ((s as any).groupName || (s as any).group || "") : "Regular"
      if (String(g) === group) teamIds.add(s.id)
    })

    // Times identificados pelas partidas do grupo
    rounds.forEach((r) => {
      r.matches.forEach((m) => {
        if (hasTwoGroups) {
          if (m.groupName === group) {
            teamIds.add(m.participants.homeTeamId)
            teamIds.add(m.participants.awayTeamId)
          }
        } else {
          teamIds.add(m.participants.homeTeamId)
          teamIds.add(m.participants.awayTeamId)
        }
      })
    })

    const list: TeamStanding[] = []
    teamIds.forEach((id) => {
      if (globalStats[id]) {
        // usar uma cópia para evitar mutações inesperadas
        list.push({ 
          ...globalStats[id],
          groupName: hasTwoGroups ? (globalStats[id].groupName || group) : "Regular"
        })
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
          groupName: hasTwoGroups ? ((base as any).groupName || (base as any).group || group) : "Regular",
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

    const challengerInfo = hasTwoGroups ? determineChallengerAdvantage(rounds, initialStandings, teams) : null
    const hasAdvantage = Boolean(challengerInfo && challengerInfo.advantageGroup)
    const advantageGroup = challengerInfo?.advantageGroup || "A"

    standingsByGroup[group] = unique.map((team, index) => {
      let positionLegend = null
      if (hasTwoGroups && hasAdvantage) {
        const isAdvantageGroup = group === advantageGroup
        if (isAdvantageGroup) {
          // Grupo com vantagem Challenger:
          // 1º lugar vai DIRETO para a Semifinal
          // 2º ao 4º vão para as Quartas de Final
          // 5º eliminado
          if (index === 0) {
            positionLegend = { color: "green", placement: "playoff:semifinal" }
          } else if (index >= 1 && index <= 3) {
            positionLegend = { color: "yellow", placement: "playoff:quarters" }
          } else {
            positionLegend = { color: "red", placement: "playoff:eliminated" }
          }
        } else {
          // Outro grupo:
          // 1º ao 3º vão para as Quartas de Final (1º NÃO vai direto para semi!)
          // 4º e 5º eliminados
          if (index >= 0 && index <= 2) {
            positionLegend = { color: "yellow", placement: "playoff:quarters" }
          } else {
            positionLegend = { color: "red", placement: "playoff:eliminated" }
          }
        }
      } else {
        if (index === 0) positionLegend = { color: "green", placement: "playoff:semifinal" }
        else if (index >= 1 && index <= 6) positionLegend = { color: "yellow", placement: "playoff:quarters" }
      }
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
