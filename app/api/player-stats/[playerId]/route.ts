import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
} from "@/lib/api"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params
    const seasonId = new URL(request.url).searchParams.get("seasonId") || undefined

    if (!playerId) {
      return createErrorResponse(
        "ID do jogador é obrigatório",
        new Error("playerId não fornecido"),
        { status: 400 }
      )
    }

    const playerStats = await kingsLeagueApi.getPlayerStats(playerId, seasonId)

    // Suporte para payload compacto via ?compact=true
    const url = new URL(request.url)
    const compact = url.searchParams.get("compact") === "true"
    // fields can be a comma-separated list like ?fields=GOL,ASS-V,TIR
    const fieldsParam = url.searchParams.get("fields")

    if (compact) {
      // Default important metrics
      const defaultCodes = ["GOL", "ASS-V", "TIR", "TIR-S", "DRB", "PAS-R", "PG"]
      const requestedCodes = fieldsParam ? fieldsParam.split(",").map(s => s.trim().toUpperCase()).filter(Boolean) : defaultCodes
      const importantCodes = new Set(requestedCodes)

      const compactRankings = (playerStats as any).rankings
        ? (playerStats as any).rankings
            .filter((r: any) => importantCodes.has((r.parameter?.code || "").toString().toUpperCase()))
            .map((r: any) => ({
              // keep original shape expected by client: { parameter: { code, name }, total }
              parameter: { code: r.parameter?.code, name: r.parameter?.name },
              total: r.total,
            }))
        : undefined

      const compacted = {
        // basic player info if present
        id: (playerStats as any).id,
        shortName: (playerStats as any).shortName,
        role: (playerStats as any).role,
        countryId: (playerStats as any).countryId,
        birthDate: (playerStats as any).birthDate,
        height: (playerStats as any).height,
        image: (playerStats as any).image?.url ? { url: (playerStats as any).image.url } : undefined,
        // aggregated fields
        matchesPlayed: (playerStats as any).matchesPlayed,
        goalsScored: (playerStats as any).goalsScored,
        assists: (playerStats as any).assists,
        yellowCards: (playerStats as any).yellowCards,
        redCards: (playerStats as any).redCards,
        mvps: (playerStats as any).mvps,
        // reduced rankings
        rankings: compactRankings,
        // atributos oficiais do card (average, skills, etc.)
        metaInformation: (playerStats as any).metaInformation,
        // echo requested fields for client visibility
        _requestedFields: Array.from(importantCodes),
      }

      return createSuccessResponse(compacted, { cache: "DAILY", req: request })
    }

    return createSuccessResponse(playerStats, { cache: "DAILY", req: request })
  } catch (error) {
    return createErrorResponse("Falha ao carregar estatísticas do jogador", error)
  }
}

export const OPTIONS = createOptionsHandler()