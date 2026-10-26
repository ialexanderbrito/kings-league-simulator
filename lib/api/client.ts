import https from "https"
import {
  KINGS_LEAGUE_BASE_URL,
  KINGS_LEAGUE_HEADERS,
  SEASON_ID,
  COMPETITION_ID,
  CACHE_DURATIONS,
  type CacheDuration,
} from "./constants"

interface FetchOptions {
  /** Duração do cache (SHORT, MEDIUM, LONG) */
  cache?: CacheDuration
  /** Tempo de revalidação em segundos (sobrescreve cache) */
  revalidate?: number
  /** Se true, desabilita cache completamente */
  noCache?: boolean
  /** Se true, usa headers completos ao invés de simplificados */
  fullHeaders?: boolean
}

// Agente HTTPS com TLSv1.3 sem ALPN e com Connection Pooling (Keep-Alive)
const httpsAgent = new https.Agent({
  minVersion: "TLSv1.3",
  maxVersion: "TLSv1.3",
  ALPNProtocols: [],
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 20,
  timeout: 10000,
})

interface MemoryCacheEntry<T> {
  data: T
  expiresAt: number
}

const MAX_CACHE_ENTRIES = 300
const memoryCache = new Map<string, MemoryCacheEntry<unknown>>()
const pendingRequests = new Map<string, Promise<unknown>>()

function setMemoryCache<T>(key: string, data: T, expiresAt: number) {
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    // Evita vazamento de memória removendo a chave mais antiga
    const firstKey = memoryCache.keys().next().value
    if (firstKey) {
      memoryCache.delete(firstKey)
    }
  }
  memoryCache.set(key, { data, expiresAt })
}

function httpsGet<T>(url: string, headers: Record<string, string>, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        agent: httpsAgent,
        headers,
        timeout: timeoutMs,
      },
      (res) => {
        let body = ""
        res.on("data", (chunk) => {
          body += chunk
        })
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body) as T)
            } catch (err) {
              reject(
                new Error(
                  `Falha ao converter resposta da Kings League para JSON: ${(err as Error).message}`
                )
              )
            }
          } else {
            reject(
              new Error(
                `Erro na API da Kings League: ${res.statusCode} ${res.statusMessage || ""}`
              )
            )
          }
        })
      }
    )

    req.on("timeout", () => {
      req.destroy(new Error(`Timeout de ${timeoutMs}ms atingido na requisição para ${url}`))
    })

    req.on("error", (err) => {
      reject(err)
    })
  })
}

async function curlGet<T>(url: string, timeoutMs = 15000): Promise<T> {
  if (typeof window !== "undefined") {
    throw new Error("curlGet is only available in server environment")
  }
  // Uso de eval require para evitar que o Turbopack/Webpack tente incluir child_process no bundle do cliente
  const nodeRequire = eval("require")
  const { execFile } = nodeRequire("child_process")
  return new Promise((resolve, reject) => {
    execFile(
      "curl",
      [
        "-s",
        "-L",
        "--max-time",
        String(Math.ceil(timeoutMs / 1000)),
        url,
        "-H",
        "Accept: application/json, text/plain, */*",
        "-H",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "-H",
        "Referer: https://kingsleague.pro/en/brazil/matches",
      ],
      { maxBuffer: 10 * 1024 * 1024 },
      (err: any, stdout: string) => {
        if (err) return reject(err)
        try {
          const json = JSON.parse(stdout) as T
          resolve(json)
        } catch (parseErr) {
          reject(
            new Error(
              `Falha ao converter resposta do curl para JSON: ${(parseErr as Error).message}`
            )
          )
        }
      }
    )
  })
}

/**
 * Cliente HTTP para a API da Kings League
 * Centraliza todas as requisições com tratamento de erros, cache e desduplicação de chamadas em voo
 */
export async function fetchFromKingsLeague<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { cache, revalidate, noCache = false } = options

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${KINGS_LEAGUE_BASE_URL}${endpoint}`

  const ttlSeconds = noCache
    ? 0
    : revalidate !== undefined
    ? revalidate
    : cache
    ? CACHE_DURATIONS[cache].revalidate
    : 0

  const now = Date.now()

  // 1. Verifica cache em memória válido
  if (ttlSeconds > 0) {
    const cached = memoryCache.get(url) as MemoryCacheEntry<T> | undefined
    if (cached && cached.expiresAt > now) {
      return cached.data
    }
  }

  // 2. Coalescência de requisições: se já há uma requisição em andamento para esta URL, reutiliza a Promise
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url) as Promise<T>
  }

  const fetchPromise = (async () => {
    try {
      let data: T
      try {
        data = await httpsGet<T>(url, KINGS_LEAGUE_HEADERS)
      } catch (httpErr) {
        // Fallback transparente usando curl se httpsGet falhar (e.g. bloqueio de TLS/Cloudflare Turnstile em alguns nós)
        try {
          data = await curlGet<T>(url)
        } catch {
          throw httpErr
        }
      }

      if (ttlSeconds > 0) {
        setMemoryCache(url, data, now + ttlSeconds * 1000)
      }

      return data
    } catch (err) {
      // Fallback: se a API falhar ou estiver instável, retorna dado anterior em cache (mesmo expirado)
      const stale = memoryCache.get(url) as MemoryCacheEntry<T> | undefined
      if (stale) {
        return stale.data
      }
      throw err
    } finally {
      pendingRequests.delete(url)
    }
  })()

  pendingRequests.set(url, fetchPromise)
  return fetchPromise
}

/**
 * Métodos específicos para cada endpoint da API da Kings League
 */
export const kingsLeagueApi = {
  /**
   * Busca dados completos da temporada
   */
  getSeasonData: (seasonId?: string, competitionId?: string) =>
    fetchFromKingsLeague<KingsLeagueSeasonResponse>(
      `/competition/seasons/${seasonId || SEASON_ID}?lang=pt${competitionId ? `&competitionId=${encodeURIComponent(competitionId)}` : ""}`,
      { cache: "SHORT", fullHeaders: true }
    ),

  /**
   * Busca dados do centro de partidas (todas as rodadas e jogos)
   */
  getMatchCenterData: (seasonId?: string, competitionId?: string) =>
    fetchFromKingsLeague<KingsLeagueMatchCenterResponse>(
      `/competition/seasons/${seasonId || SEASON_ID}/match-center-data?lang=pt${competitionId ? `&competitionId=${encodeURIComponent(competitionId)}` : ""}`,
      { cache: "SHORT" }
    ),

  /**
   * Busca detalhes de um time específico
   */
  getTeamDetails: (teamId: string, seasonId?: string) =>
    fetchFromKingsLeague<KingsLeagueTeamResponse>(
      `/competition/teams/${teamId}`,
      { cache: "LONG" }
    ),

  /**
   * Busca membros do staff de um time
   */
  getTeamStaff: (teamId: string, seasonId?: string) =>
    fetchFromKingsLeague<KingsLeagueStaffResponse>(
      `/competition/teams/${teamId}/season-data/${seasonId || SEASON_ID}/staffs`,
      { cache: "LONG" }
    ),

  /**
   * Busca jogadores de um time
   */
  getTeamPlayers: (teamId: string, seasonId?: string) =>
    fetchFromKingsLeague<KingsLeaguePlayer[]>(
      `/competition/teams/${teamId}/season-data/${seasonId || SEASON_ID}/players`,
      { cache: "LONG" }
    ),

  /**
   * Busca lista de times registrados na temporada
   */
  getSeasonTeams: (seasonId?: string, competitionId?: string) =>
    fetchFromKingsLeague<KingsLeagueTeamResponse[]>(
      `/competition/seasons/${seasonId || SEASON_ID}/teams?lang=pt${competitionId ? `&competitionId=${encodeURIComponent(competitionId)}` : ""}`,
      { cache: "LONG" }
    ),

  /**
   * Busca estatísticas de um jogador
   */
  getPlayerStats: (playerId: string, seasonId?: string) =>
    fetchFromKingsLeague<KingsLeaguePlayerStats>(
      `/competition/players/${playerId}/season-data/${seasonId || SEASON_ID}/stats`,
      { cache: "DAILY" }
    ),

  /**
   * Busca dados de uma partida específica (cache de 30s para jogos ao vivo)
   */
  getMatchDetails: (matchId: string, competitionId?: string) =>
    fetchFromKingsLeague<KingsLeagueMatchDetails>(
      `/competition/matches/${matchId}?live=true&competitionId=${competitionId || COMPETITION_ID}`,
      { cache: "LIVE" }
    ),

  /**
   * Busca lista de todas as competições/ligas oficiais
   */
  getCompetitions: () =>
    fetchFromKingsLeague<any[]>(
      `/competitions`,
      { cache: "LONG" }
    ),

  /**
   * Busca rankings estatísticos da temporada (GOL, PAS, MVP, GOL-S, GOL-D, FAL)
   */
  getPlayerStatRankings: (seasonId: string, statCode: string) =>
    fetchFromKingsLeague<any[]>(
      `/competition/seasons/${seasonId || SEASON_ID}/players/stats/${statCode}?orderBy=ranking&sortOrder=ASC`,
      { cache: "SHORT" }
    ),

  /**
   * Busca MVPs de cada rodada/jornada
   */
  getTurnMvps: (seasonId?: string) =>
    fetchFromKingsLeague<any[]>(
      `/competition/seasons/${seasonId || SEASON_ID}/players/stats/turn-mvps`,
      { cache: "SHORT" }
    ),
}

// ============================================================================
// Tipos para respostas da API externa da Kings League
// ============================================================================

export interface KingsLeagueSeasonResponse {
  id: number
  name: string
  displayName: string
  phases: KingsLeaguePhase[]
}

export interface KingsLeaguePhase {
  id: number
  name: string
  displayName: string
  groups: KingsLeagueGroup[]
  turns?: KingsLeagueTurn[]
}

export interface KingsLeagueGroup {
  id: number
  name: string
  displayName: string
  teams: KingsLeagueGroupTeam[]
  turns?: KingsLeagueTurn[]
}

export interface KingsLeagueGroupTeam {
  id: number
  name: string
  shortName: string
  firstColorHEX: string
  secondColorHEX: string
  logo: { url: string }
  stats: {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
  }
  rank: number
  positionLegend?: { color: string; placement: string } | null
}

export interface KingsLeagueTurn {
  id: number
  turnName?: string
  name?: string
  shortName?: string
  ended: boolean
  startDate?: string
  finishDate?: string
  start?: string
  finish?: string
  matches?: KingsLeagueMatch[]
}

export type KingsLeagueMatchCenterResponse = KingsLeagueRound[]

export interface KingsLeagueRound {
  id: number
  turnName: string
  ended: boolean
  startDate: string
  finishDate: string
  matches: KingsLeagueMatch[]
}

export interface KingsLeagueMatch {
  id: number
  date: string
  status: string
  participants: {
    homeTeamId: number
    awayTeamId: number
  }
  scores: KingsLeagueScores
  metaInformation?: {
    youtube_url?: string
  }
  groupName?: string
  group?: { name: string }
}

export interface KingsLeagueScores {
  homeScore: number | null
  awayScore: number | null
  homeScore1T: number | null
  awayScore1T: number | null
  homeScore2T: number | null
  awayScore2T: number | null
  homeScore3T: number | null
  awayScore3T: number | null
  homeScoreP: number | null
  awayScoreP: number | null
}

export interface KingsLeagueTeamResponse {
  id: number
  name: string
  shortName: string
  completeName?: string
  countryId: number
  firstColorHEX: string
  secondColorHEX: string
  logo: { url: string }
  gender: string
  metaInformation?: Record<string, string>
  currentSeasons?: KingsLeagueTeamSeason[]
}

export interface KingsLeagueTeamSeason {
  id: number
  competitionId: number
  name: string
  displayName: string
  start: string
  finish: string
  finished: boolean
  image: { url: string }
  isCurrent: boolean
  metaInformation?: Record<string, string>
  winnerTeamId?: number | null
}

export interface KingsLeagueStaffResponse {
  staffs: KingsLeagueStaffMember[]
}

export interface KingsLeagueStaffMember {
  id: number
  firstName: string
  lastName: string
  middleName?: string | null
  role: string
  countryId: number
  image?: { url: string }
  gender: string | null
  birthDate?: string | null
  metaInformation?: Record<string, string> | null
}

export interface KingsLeaguePlayer {
  id: number
  firstName: string
  lastName: string
  nickname?: string
  role?: string
  countryId: number
  height?: number
  image?: { url: string }
  metaInformation?: Record<string, string>
}

export interface KingsLeaguePlayerStats {
  rankings?: KingsLeaguePlayerRanking[]
  matchesPlayed?: number
  goalsScored?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  mvps?: number
}

export interface KingsLeaguePlayerRanking {
  parameter: {
    code: string
    name: string
    description: string
    shortName: string | null
    measureUnit: string | null
    negative?: boolean
  }
  statsId: string
  total: number
  totalAvg: number
  totalAVG: number
  kamaScore: number | null
}

export interface KingsLeagueMatchDetails {
  id: number
  date: string
  status: string
  currentMinute?: number
  participants: {
    homeTeamId: number
    awayTeamId: number
    homeTeam?: KingsLeagueTeamResponse
    awayTeam?: KingsLeagueTeamResponse
  }
  scores: KingsLeagueScores
  metaInformation?: Record<string, string>
}
