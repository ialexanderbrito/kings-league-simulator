import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  SEASON_ID,
} from "@/lib/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("seasonId") || SEASON_ID
    const stat = searchParams.get("stat") || "all"

    // Se stat for "all", busca um resumo dos líderes das principais categorias em paralelo
    if (stat === "all") {
      const [goalsRes, assistsRes, mvpsRes, turnMvpsRes, doubleGoalsRes, goalsConcededRes] = await Promise.allSettled([
        kingsLeagueApi.getPlayerStatRankings(seasonId, "GOL"),
        kingsLeagueApi.getPlayerStatRankings(seasonId, "PAS"),
        kingsLeagueApi.getPlayerStatRankings(seasonId, "MVP"),
        kingsLeagueApi.getTurnMvps(seasonId),
        kingsLeagueApi.getPlayerStatRankings(seasonId, "GOL-D"),
        kingsLeagueApi.getPlayerStatRankings(seasonId, "GOL-S"),
      ])

      const summary = {
        goals: goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value) ? goalsRes.value.slice(0, 20) : [],
        assists: assistsRes.status === "fulfilled" && Array.isArray(assistsRes.value) ? assistsRes.value.slice(0, 20) : [],
        mvps: mvpsRes.status === "fulfilled" && Array.isArray(mvpsRes.value) ? mvpsRes.value.slice(0, 20) : [],
        turnMvps: turnMvpsRes.status === "fulfilled" && Array.isArray(turnMvpsRes.value) ? turnMvpsRes.value : [],
        doubleGoals: doubleGoalsRes.status === "fulfilled" && Array.isArray(doubleGoalsRes.value) ? doubleGoalsRes.value.slice(0, 20) : [],
        goalsConceded: goalsConcededRes.status === "fulfilled" && Array.isArray(goalsConcededRes.value) ? goalsConcededRes.value.slice(0, 20) : [],
      }

      return createSuccessResponse(summary, { cache: "SHORT", req: request })
    }

    if (stat === "turn-mvps") {
      const turnMvps = await kingsLeagueApi.getTurnMvps(seasonId)
      return createSuccessResponse(turnMvps, { cache: "SHORT", req: request })
    }

    const validStatCodes = ["GOL", "PAS", "MVP", "GOL-S", "GOL-D", "FAL"]
    const statCode = validStatCodes.includes(stat.toUpperCase()) ? stat.toUpperCase() : "GOL"

    const rankings = await kingsLeagueApi.getPlayerStatRankings(seasonId, statCode)
    return createSuccessResponse(rankings, { cache: "SHORT", req: request })
  } catch (error) {
    return createErrorResponse("Falha ao carregar estatísticas e líderes da Kings League", error)
  }
}

export const OPTIONS = createOptionsHandler()
