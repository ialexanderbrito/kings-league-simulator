import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  type KingsLeaguePlayer,
} from "@/lib/api"

function sanitizeTeamPlayers(teamId: string, players: KingsLeaguePlayer[]): KingsLeaguePlayer[] {
  // Regra de negócio temporária: na API da competição, o presidente do Dibrados FC
  // está vindo duplicado indevidamente como jogador.
  if (teamId !== "220") {
    return players
  }

  return players.filter((player) => {
    const isLucasTyltyById = Number(player.id) === 86902
    const isLucasTyltyByName = String((player as any).shortName || "").trim().toLowerCase() === "lucas tylty"
    return !(isLucasTyltyById && isLucasTyltyByName)
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('seasonId') || undefined

    if (!teamId) {
      return createErrorResponse(
        "ID do time é obrigatório",
        new Error("teamId não fornecido"),
        { status: 400 }
      )
    }

    // Busca dados em paralelo para melhor performance
    const [teamDetails, staffResponse, playersResponse] = await Promise.allSettled([
      kingsLeagueApi.getTeamDetails(teamId, seasonId),
      kingsLeagueApi.getTeamStaff(teamId, seasonId),
      kingsLeagueApi.getTeamPlayers(teamId, seasonId),
    ])

    // Extrai dados do time (obrigatório)
    if (teamDetails.status === "rejected") {
      throw teamDetails.reason
    }

    // Extrai staff (opcional)
    let staffData: { staffs: unknown[] } = { staffs: [] }
    if (staffResponse.status === "fulfilled") {
      const value: any = staffResponse.value
      staffData = Array.isArray(value) ? { staffs: value } : value
    }

    // Extrai jogadores (opcional) com normalização e fallback
    let playersData: KingsLeaguePlayer[] = []
    
    // Fallback: se falhou buscar jogadores de uma season específica (ex: time não existia no Split 1), busca da season atual
    if (playersResponse.status === "rejected" && seasonId) {
      console.warn(`Falha ao buscar jogadores do time ${teamId} na temporada ${seasonId}. Tentando temporada padrão...`);
      try {
        const fallbackPlayers = await kingsLeagueApi.getTeamPlayers(teamId);
        const value: any = fallbackPlayers
        playersData = Array.isArray(value) ? value : Array.isArray(value?.players) ? value.players : []
      } catch (e) {
        console.error(`Falha ao buscar fallback de jogadores para o time ${teamId}`, e);
      }
    } else if (playersResponse.status === "fulfilled") {
      const value: any = playersResponse.value
      playersData = Array.isArray(value) ? value : Array.isArray(value?.players) ? value.players : []
    }

    if (playersData.length > 0) {
      playersData = playersData.map((player) => ({
        ...player,
        role: player.role || "midfielder",
        height: player.height || 175,
        stats: null,
        metaInformation: player.metaInformation || {},
      }))

      playersData = sanitizeTeamPlayers(teamId, playersData)
    }

    const response = {
      ...teamDetails.value,
      staff: staffData.staffs || [],
      players: playersData,
    }

    return createSuccessResponse(response, { cache: "LONG", req: request })
  } catch (error) {
    return createErrorResponse("Falha ao carregar detalhes do time", error)
  }
}

export const OPTIONS = createOptionsHandler()