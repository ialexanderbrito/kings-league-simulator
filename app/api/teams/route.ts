import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  type KingsLeagueTeamResponse,
} from "@/lib/api"

/**
 * Rota: GET /api/teams
 * Retorna a lista de times normalizada para o formato interno do app
 */
export async function GET() {
  try {
    const seasonData = await kingsLeagueApi.getSeasonTeams();

    let teams = Array.isArray(seasonData)
      ? seasonData
      : (seasonData as any)?.teams ?? [];

    teams = teams.slice().sort((a: any, b: any) => {
      const nameA = (a?.name || "").toString()
      const nameB = (b?.name || "").toString()
      return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' })
    })

    return createSuccessResponse(teams, { cache: "LONG" });
  } catch (error) {
    return createErrorResponse("Falha ao carregar lista de times", error)
  }
}

export const OPTIONS = createOptionsHandler()
