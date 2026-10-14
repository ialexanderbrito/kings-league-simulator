import {
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
} from "@/lib/api"

export interface AvailableLeague {
  id: string
  name: string
  shortName: string
  countryIso: string
  flag: string
  competitionId: number
  activeSeasonId: number
  activeSeasonName: string
  seasons: {
    id: number
    name: string
    displayName: string
    isCurrent: boolean
  }[]
}

export const AVAILABLE_LEAGUES: AvailableLeague[] = [
  {
    id: "brazil",
    name: "Kings League Brazil",
    shortName: "Brasil",
    countryIso: "br",
    flag: "🇧🇷",
    competitionId: 17,
    activeSeasonId: 69,
    activeSeasonName: "Kings Cup (2026)",
    seasons: [
      { id: 69, name: "Kings Cup Brazil 2026/27", displayName: "Kings Cup (2026)", isCurrent: true },
    ],
  },
  {
    id: "spain",
    name: "Kings League Spain",
    shortName: "Espanha",
    countryIso: "es",
    flag: "🇪🇸",
    competitionId: 3,
    activeSeasonId: 54,
    activeSeasonName: "Split 6 (2025/26)",
    seasons: [
      { id: 54, name: "Kings League Spain 2025/26 Split 6", displayName: "Split 6 (Em Andamento)", isCurrent: true },
    ],
  },
  {
    id: "italy",
    name: "Kings League Italy",
    shortName: "Itália",
    countryIso: "it",
    flag: "🇮🇹",
    competitionId: 10,
    activeSeasonId: 58,
    activeSeasonName: "Split 2 (2025/26)",
    seasons: [
      { id: 58, name: "Kings League Italy 2025/26 Split 2", displayName: "Split 2 (Em Andamento)", isCurrent: true },
    ],
  },
  {
    id: "mexico",
    name: "Kings League México",
    shortName: "México",
    countryIso: "mx",
    flag: "🇲🇽",
    competitionId: 5,
    activeSeasonId: 66,
    activeSeasonName: "Kings Cup México (2026)",
    seasons: [
      { id: 66, name: "Kings Cup México 2026", displayName: "Kings Cup (Em Andamento)", isCurrent: true },
    ],
  },
  {
    id: "mena",
    name: "Kings League MENA",
    shortName: "MENA",
    countryIso: "sa",
    flag: "🇸🇦",
    competitionId: 26,
    activeSeasonId: 60,
    activeSeasonName: "Split 1 (2026/27)",
    seasons: [
      { id: 60, name: "Kings League MENA 2026/27 Split 1", displayName: "Split 1 (Encerrado)", isCurrent: true },
    ],
  },
  {
    id: "germany",
    name: "Kings League Germany",
    shortName: "Alemanha",
    countryIso: "de",
    flag: "🇩🇪",
    competitionId: 11,
    activeSeasonId: 59,
    activeSeasonName: "Split 1 (2025/26)",
    seasons: [
      { id: 59, name: "Kings League Germany 2025/26 Split 1", displayName: "Split 1 (Em Andamento)", isCurrent: true },
    ],
  },
  {
    id: "france",
    name: "Kings League France",
    shortName: "França",
    countryIso: "fr",
    flag: "🇫🇷",
    competitionId: 21,
    activeSeasonId: 63,
    activeSeasonName: "Split 1 (2025/26)",
    seasons: [
      { id: 63, name: "Kings League France 2025/26 Split 1", displayName: "Split 1 (Em Andamento)", isCurrent: true },
    ],
  },
]

export async function GET(request: Request) {
  try {
    return createSuccessResponse(AVAILABLE_LEAGUES, { cache: "DAILY", req: request })
  } catch (error) {
    return createErrorResponse("Falha ao carregar lista de competições", error)
  }
}

export const OPTIONS = createOptionsHandler()
