// Constantes
export {
  SEASON_ID,
  COMPETITION_ID,
  KINGS_LEAGUE_BASE_URL,
  KINGS_LEAGUE_HEADERS,
  KINGS_LEAGUE_SIMPLE_HEADERS,
  CACHE_DURATIONS,
  type CacheDuration,
} from "./constants"

// CORS
export { CORS_HEADERS, CORS_HEADERS_GET_ONLY, createOptionsHandler } from "./cors"

// Respostas
export {
  createSuccessResponse,
  createErrorResponse,
  createJsonResponse,
} from "./response"

// Cliente API
export { fetchFromKingsLeague, kingsLeagueApi } from "./client"

// Tipos da API externa
export type {
  KingsLeagueSeasonResponse,
  KingsLeaguePhase,
  KingsLeagueGroup,
  KingsLeagueGroupTeam,
  KingsLeagueTurn,
  KingsLeagueMatchCenterResponse,
  KingsLeagueRound,
  KingsLeagueMatch,
  KingsLeagueScores,
  KingsLeagueTeamResponse,
  KingsLeagueTeamSeason,
  KingsLeagueStaffResponse,
  KingsLeagueStaffMember,
  KingsLeaguePlayer,
  KingsLeaguePlayerStats,
  KingsLeaguePlayerRanking,
  KingsLeagueMatchDetails,
} from "./client"
