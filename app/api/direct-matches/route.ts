import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
} from "@/lib/api"

export async function GET() {
  try {
    const data = await kingsLeagueApi.getMatchCenterData()

    return createSuccessResponse(data, { cache: "SHORT" })
  } catch (error) {
    return createErrorResponse(
      "Falha ao buscar dados diretamente da API da Kings League",
      error
    )
  }
}

export const OPTIONS = createOptionsHandler()
