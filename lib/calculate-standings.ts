import type { Round, Team, TeamStanding } from "@/types/kings-league"

export function calculateStandings(
  rounds: Round[],
  teams: Record<string, Team>,
  initialStandings: TeamStanding[],
): TeamStanding[] {
  // Inicializar classificação com todos os times
  const standings: Record<string, TeamStanding> = {}

  // Inicializar com dados da API
  initialStandings.forEach((standing) => {
    standings[standing.id] = {
      ...standing,
      // Resetar estatísticas que serão recalculadas
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }
  })

  // Processar todas as partidas para calcular a classificação
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const { homeTeamId, awayTeamId } = match.participants
      const { homeScore, awayScore } = match.scores

      // Pular partidas que não foram jogadas ou simuladas
      if (homeScore === null || awayScore === null) {
        return
      }

      // Garantir que os times existam na classificação
      if (!standings[homeTeamId]) {
        const team = teams[homeTeamId]
        standings[homeTeamId] = {
          id: homeTeamId,
          name: team?.name || `Time ${homeTeamId}`,
          shortName: team?.shortName || `T${homeTeamId}`,
          logo: team?.logo,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          positionLegend: null,
        }
      }

      if (!standings[awayTeamId]) {
        const team = teams[awayTeamId]
        standings[awayTeamId] = {
          id: awayTeamId,
          name: team?.name || `Time ${awayTeamId}`,
          shortName: team?.shortName || `T${awayTeamId}`,
          logo: team?.logo,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          positionLegend: null,
        }
      }

      // Atualizar estatísticas do time da casa
      standings[homeTeamId].played += 1
      standings[homeTeamId].goalsFor += homeScore
      standings[homeTeamId].goalsAgainst += awayScore

      // Atualizar estatísticas do time visitante
      standings[awayTeamId].played += 1
      standings[awayTeamId].goalsFor += awayScore
      standings[awayTeamId].goalsAgainst += homeScore

      // Determinar o resultado da partida e atualizar pontos
      if (homeScore > awayScore) {
        // Time da casa venceu
        standings[homeTeamId].won += 1
        standings[homeTeamId].points += 3
        standings[awayTeamId].lost += 1
      } else if (homeScore < awayScore) {
        // Time visitante venceu
        standings[awayTeamId].won += 1
        standings[awayTeamId].points += 3
        standings[homeTeamId].lost += 1
      } else {
        // Empate
        standings[homeTeamId].drawn += 1
        standings[homeTeamId].points += 1
        standings[awayTeamId].drawn += 1
        standings[awayTeamId].points += 1
      }
    })
  })

  // Calcular saldo de gols
  Object.values(standings).forEach((team) => {
    team.goalDifference = team.goalsFor - team.goalsAgainst
  })

  // Converter para array e ordenar por pontos, saldo de gols, gols pró
  const sortedStandings = Object.values(standings).sort((a, b) => {
    // Ordenar por pontos (decrescente)
    if (b.points !== a.points) {
      return b.points - a.points
    }

    // Se pontos forem iguais, ordenar por saldo de gols (decrescente)
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference
    }

    // Se saldo de gols for igual, ordenar por gols pró (decrescente)
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor
    }

    // Se tudo for igual, ordenar alfabeticamente pelo nome
    return a.name.localeCompare(b.name)
  })

  // Atualizar legendas de posição com base na classificação
  return sortedStandings.map((team, index) => {
    // Encontrar a classificação original para obter a legenda de posição
    const originalStanding = initialStandings.find((s) => s.id === team.id)

    // Determinar a legenda de posição com base na classificação atual
    let positionLegend = null
    if (index === 0) {
      // Primeiro colocado - semifinal
      positionLegend = { color: "green", placement: "playoff:semifinal" }
    } else if (index >= 1 && index <= 6) {
      // 2º ao 7º - quartas de final
      positionLegend = { color: "yellow", placement: "playoff:quarters" }
    }

    return {
      ...team,
      positionLegend,
    }
  })
}
