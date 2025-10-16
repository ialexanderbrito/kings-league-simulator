import type { Round, Team, TeamStanding } from "@/types/kings-league"

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
        positionLegend: null,
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
        home.points += 3
        away.lost += 1
      } else if (homeScore < awayScore) {
        away.won += 1
        away.points += 3
        home.lost += 1
      } else {
        // Empate -> checar pênaltis
        if (homeScoreP !== null && awayScoreP !== null) {
          if (homeScoreP > awayScoreP) {
            home.won += 1
            home.points += 2
            away.lost += 1
            away.points += 1
          } else if (awayScoreP > homeScoreP) {
            away.won += 1
            away.points += 2
            home.lost += 1
            home.points += 1
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
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          rank: 0,
          positionLegend: null,
          groupName: (base as any).groupName || (base as any).group || group,
        })
      }
    })

    const sorted = list.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.name.localeCompare(b.name)
    })

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
