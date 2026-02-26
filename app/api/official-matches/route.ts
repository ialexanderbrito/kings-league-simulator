import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
} from "@/lib/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")

    if (!matchId) {
      return createErrorResponse(
        "Parâmetro 'matchId' é obrigatório",
        new Error("matchId não fornecido"),
        { status: 400 }
      )
    }

    const data = await kingsLeagueApi.getMatchDetails(matchId)

    // Retorna sem cache pois são dados em tempo real
    return createSuccessResponse(data)
  } catch (error) {
    return createErrorResponse("Erro ao buscar dados oficiais da partida", error)
  }
}

export const OPTIONS = createOptionsHandler()
