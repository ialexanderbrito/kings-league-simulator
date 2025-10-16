import { NextResponse } from "next/server"
import type { LeagueData, Team, TeamStanding, Round } from "@/types/kings-league"

const SEASON_ID = process.env.KINGS_LEAGUE_SEASON_ID

export async function GET() {
  try {

    const seasonResponse = await fetch(`https://kingsleague.pro/api/v1/competition/seasons/${SEASON_ID}`, {
      headers: {
        referer: "https://kingsleague.pro/pt/brazil/classificacao",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 300 },
    })

    if (!seasonResponse.ok) {
      throw new Error(`Falha ao buscar dados da temporada: ${seasonResponse.status} ${seasonResponse.statusText}`)
    }

    const seasonData = await seasonResponse.json()

    const matchesResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/seasons/${SEASON_ID}/match-center-data?lang=pt`,
      {
        headers: {
          referer: "https://kingsleague.pro/en/brazil/matches",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 300 },
      },
    )

    if (!matchesResponse.ok) {
      throw new Error(`Falha ao buscar dados de partidas: ${matchesResponse.status} ${matchesResponse.statusText}`)
    }

    const matchesData = await matchesResponse.json()

    let rounds: Round[] = []

    if (Array.isArray(matchesData) && matchesData.length > 0) {
      rounds = matchesData.map((round: any) => ({
        id: round.id,
        name: round.turnName.replace('Jornada', 'Rodada'),
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
              // Preserve o nome do grupo (ex: 'A', 'B', 'Challenger') se fornecido pela API
              groupName: match.groupName ?? match.group?.name ?? null,
            }))
          : [],
      }))
    } else {
      throw new Error("Formato de dados de partidas inválido")
    }


    if (!seasonData || !seasonData.phases || !seasonData.phases.length) {
      throw new Error("Estrutura de dados da API da Kings League inválida")
    }

    const phase = seasonData.phases[0]

    if (!phase.groups || !phase.groups.length) {
      throw new Error("Grupos não encontrados nos dados da API da Kings League")
    }

    // Agrega times e standings de todos os grupos da fase (A, B, Challenger, ...)
    const teamsMap: Record<string, Team> = {}
    const aggregatedStandings: TeamStanding[] = []

    phase.groups.forEach((grp: any) => {
      const groupName = grp.name

      // teams podem conter times repetidos entre grupos (ex: Challenger includes same teams), por isso usamos um mapa
      grp.teams.forEach((team: any) => {
        const id = String(team.id)
        if (!teamsMap[id]) {
          teamsMap[id] = {
            id,
            name: team.name,
            shortName: team.shortName,
            completeName: team.completeName,
            countryId: team.countryId,
            firstColorHEX: team.firstColorHEX || "#cccccc",
            secondColorHEX: team.secondColorHEX || "#333333",
            logo: team.logo,
            gender: team.gender,
          }
        }
      })

      // standings podem estar ausentes (ex: Challenger), então verificamos
      if (Array.isArray(grp.standings)) {
        grp.standings.forEach((standing: any) => {
          aggregatedStandings.push({
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
            positionLegend: typeof standing.positionLegend === "string" ? { color: "", placement: standing.positionLegend } : standing.positionLegend ?? null,
            rank: standing.rank,
            groupName,
          })
        })
      }
    })

    const teams: Team[] = Object.values(teamsMap)
    // Consolidar aggregatedStandings por team id para evitar duplicatas entre grupos
    const standingsMap: Record<string, TeamStanding> = {}
    aggregatedStandings.forEach((st) => {
      // Se já existir, preferimos manter a entrada que tiver pontos maior (ou a primeira)
      const existing = standingsMap[st.id]
      if (!existing) {
        standingsMap[st.id] = st
      } else {
        // Se houver conflito, mantenha a que tiver mais pontos
        if ((st.points ?? 0) > (existing.points ?? 0)) {
          standingsMap[st.id] = st
        }
      }
    })
    const standings: TeamStanding[] = Object.values(standingsMap)

    const leagueData: LeagueData = {
      id: seasonData.id,
      name: seasonData.name,
      displayName: seasonData.displayName,
      teams,
      standings,
      rounds,
    }

    return new NextResponse(JSON.stringify(leagueData), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    })
  } catch (error: any) {
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

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
