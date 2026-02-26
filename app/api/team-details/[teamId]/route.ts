import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  type KingsLeaguePlayer,
} from "@/lib/api"

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = await params

    if (!teamId) {
      return createErrorResponse(
        "ID do time é obrigatório",
        new Error("teamId não fornecido"),
        { status: 400 }
      )
    }

    // Busca dados em paralelo para melhor performance
    const [teamDetails, staffResponse, playersResponse] = await Promise.allSettled([
      kingsLeagueApi.getTeamDetails(teamId),
      kingsLeagueApi.getTeamStaff(teamId),
      kingsLeagueApi.getTeamPlayers(teamId),
    ])

    // Extrai dados do time (obrigatório)
    if (teamDetails.status === "rejected") {
      throw teamDetails.reason
    }

    // Extrai staff (opcional)
    let staffData: { staffs: unknown[] } = { staffs: [] }
    if (staffResponse.status === "fulfilled") {
      staffData = staffResponse.value
    }

    // Extrai jogadores (opcional) com normalização
    let playersData: KingsLeaguePlayer[] = []
    if (playersResponse.status === "fulfilled" && Array.isArray(playersResponse.value)) {
      playersData = playersResponse.value.map((player) => ({
        ...player,
        role: player.role || "midfielder",
        height: player.height || 175,
        stats: null,
        metaInformation: player.metaInformation || {},
      }))
    }

    const response = {
      ...teamDetails.value,
      staff: staffData.staffs || [],
      players: playersData,
    }

    return createSuccessResponse(response, { cache: "LONG" })
  } catch (error) {
    return createErrorResponse("Falha ao carregar detalhes do time", error)
  }
}

export const OPTIONS = createOptionsHandler()