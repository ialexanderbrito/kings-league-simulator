import { NextResponse } from "next/server"
import type { LeagueData, Team, TeamStanding, Round } from "@/types/kings-league"

export async function GET() {
  try {

    // Buscar dados da temporada
    const seasonResponse = await fetch("https://kingsleague.pro/api/v1/competition/seasons/33", {
      headers: {
        referer: "https://kingsleague.pro/pt/brazil/classificacao",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Revalidar a cada hora
    })

    if (!seasonResponse.ok) {
      throw new Error(`Falha ao buscar dados da temporada: ${seasonResponse.status} ${seasonResponse.statusText}`)
    }

    const seasonData = await seasonResponse.json()

    // Buscar dados das partidas
    const matchesResponse = await fetch(
      "https://kingsleague.pro/api/v1/competition/seasons/33/match-center-data?lang=pt",
      {
        headers: {
          referer: "https://kingsleague.pro/en/brazil/matches",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 3600 }, // Revalidar a cada hora
      },
    )

    if (!matchesResponse.ok) {
      throw new Error(`Falha ao buscar dados de partidas: ${matchesResponse.status} ${matchesResponse.statusText}`)
    }

    const matchesData = await matchesResponse.json()

    // Processar rodadas e partidas
    let rounds: Round[] = []

    if (Array.isArray(matchesData) && matchesData.length > 0) {
      // Se os dados já estão no formato esperado, usá-los diretamente
      rounds = matchesData.map((round: any) => ({
        id: round.id,
        name: round.turnName,
        ended: !!round.ended,
        startDate: round.startDate,
        finishDate: round.finishDate,
        matches: Array.isArray(round.matches)
          ? round.matches.map((match: any) => ({
              id: match.id,
              date: match.date,
              status: match.status,
              participants: {
                homeTeamId: String(match.participants.homeTeamId),
                awayTeamId: String(match.participants.awayTeamId),
              },
              scores: {
                homeScore: match.scores.homeScore,
                awayScore: match.scores.awayScore,
                homeScore1T: match.scores.homeScore1T,
                awayScore1T: match.scores.awayScore1T,
                homeScore2T: match.scores.homeScore2T,
                awayScore2T: match.scores.awayScore2T,
                homeScore3T: match.scores.homeScore3T,
                awayScore3T: match.scores.awayScore3T,
                homeScoreP: match.scores.homeScoreP,
                awayScoreP: match.scores.awayScoreP,
              },
              metaInformation: match.metaInformation,
            }))
          : [],
      }))
    } else {
      throw new Error("Formato de dados de partidas inválido")
    }


    // Verificar se temos dados da temporada
    if (!seasonData || !seasonData.phases || !seasonData.phases.length) {
      throw new Error("Estrutura de dados da API da Kings League inválida")
    }

    // Extrair times e classificação
    const phase = seasonData.phases[0]

    if (!phase.groups || !phase.groups.length) {
      throw new Error("Grupos não encontrados nos dados da API da Kings League")
    }

    const group = phase.groups[0]

    // Extrair times
    const teams: Team[] = group.teams.map((team: any) => {
      return {
        id: String(team.id),
        name: team.name,
        shortName: team.shortName,
        completeName: team.completeName,
        countryId: team.countryId,
        firstColorHEX: team.firstColorHEX || "#cccccc",
        secondColorHEX: team.secondColorHEX || "#333333",
        logo: team.logo,
        gender: team.gender,
      }
    })

    // Extrair classificação
    const standings: TeamStanding[] = group.standings.map((standing: any) => ({
      id: String(standing.team.id),
      name: standing.team.name,
      shortName: standing.team.shortName,
      logo: standing.team.logo,
      points: standing.points,
      played: standing.gameTotal,
      won: standing.gameWon,
      drawn: standing.gameDraw,
      lost: standing.gameLost,
      goalsFor: standing.goalPro,
      goalsAgainst: standing.goalAgainst,
      goalDifference: standing.goalPro - standing.goalAgainst,
      positionLegend: standing.positionLegend,
      rank: standing.rank,
    }))

    // Criar objeto de dados da liga
    const leagueData: LeagueData = {
      id: seasonData.id,
      name: seasonData.name,
      displayName: seasonData.displayName,
      teams,
      standings,
      rounds,
    }

    // Configurar cabeçalhos CORS para permitir acesso de qualquer origem
    return new NextResponse(JSON.stringify(leagueData), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao carregar dados da Kings League Brasil",
        message: error.message,
        stack: error.stack,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Adicionar suporte para preflight OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
