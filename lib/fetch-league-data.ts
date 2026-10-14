import type { LeagueData, TeamDetails, PlayerStats } from "@/types/kings-league"
import { AVAILABLE_LEAGUES } from "@/app/api/competitions/route"
import { isPlayoffRoundName } from "@/lib/league-format"

// In-memory cache e controle de chamadas em voo no cliente
let leagueDataCache: { data: LeagueData; timestamp: number } | null = null
let pendingLeagueDataPromise: Promise<LeagueData> | null = null
const LEAGUE_DATA_CACHE_TTL = 3 * 60 * 1000 // 3 minutos

const pendingTeamPromises = new Map<string, Promise<TeamDetails>>()
const pendingPlayerStatsPromises = new Map<string, Promise<PlayerStats>>()

// Cache para estatísticas de jogadores
const playerStatsCache: Record<string, { data: PlayerStats, timestamp: number }> = {}

// Cache para detalhes dos times
const teamDetailsCache: Record<string, { data: TeamDetails, timestamp: number }> = {}

// Tempo de expiração do cache em milissegundos (12 horas)
const CACHE_EXPIRY_TIME = 12 * 60 * 60 * 1000

function sanitizeTeamDetailsPlayers(teamId: string, teamDetails: TeamDetails): TeamDetails {
  if (!Array.isArray(teamDetails.players)) {
    return teamDetails
  }

  // Safety net no client: evita exibir presidente listado como jogador no Dibrados FC.
  if (teamId === "220") {
    teamDetails.players = teamDetails.players.filter((player: any) => {
      const isLucasTyltyById = Number(player?.id) === 86902
      const isLucasTyltyByName = String(player?.shortName || "").trim().toLowerCase() === "lucas tylty"
      return !(isLucasTyltyById && isLucasTyltyByName)
    })
  }

  return teamDetails
}

// Limpeza preventiva de caches legados gravados em sessionStorage
if (typeof window !== "undefined") {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("kl_")) {
        sessionStorage.removeItem(key)
      }
    })
  } catch {}
}

const leagueDataCacheMap = new Map<string, { data: LeagueData; timestamp: number }>()
const pendingLeagueDataPromises = new Map<string, Promise<LeagueData>>()

export async function fetchLeagueData(options: {
  forceRefresh?: boolean
  seasonId?: number | string
  competitionId?: number | string
} = {}): Promise<LeagueData> {
  const now = Date.now()

  let activeSeasonId = options.seasonId
  let activeCompetitionId = options.competitionId

  if (!activeSeasonId && typeof window !== "undefined") {
    try {
      const savedSeason = localStorage.getItem("@kl-simulador:selectedSeason")
      const savedLeagueId = localStorage.getItem("@kl-simulador:selectedLeague")
      if (savedSeason) activeSeasonId = savedSeason
      if (savedLeagueId) {
        const found = AVAILABLE_LEAGUES.find((l) => l.id === savedLeagueId)
        if (found) activeCompetitionId = found.competitionId
      }
    } catch {}
  }

  const seasonKey = `${String(activeCompetitionId || "default")}_${String(activeSeasonId || "default")}`

  const cached = leagueDataCacheMap.get(seasonKey)

  // 1. Retorna do cache em memória se válido e não forçado
  if (!options.forceRefresh && cached && (now - cached.timestamp) < LEAGUE_DATA_CACHE_TTL) {
    return cached.data
  }

  // 2. Se já existe uma requisição em andamento para esta temporada, reaproveita a Promise
  const pending = pendingLeagueDataPromises.get(seasonKey)
  if (pending) {
    return pending
  }

  const queryParams = new URLSearchParams()
  if (activeSeasonId) queryParams.set("seasonId", String(activeSeasonId))
  if (activeCompetitionId) queryParams.set("competitionId", String(activeCompetitionId))
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`/api/league-data${queryString}`)

      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(
            `Falha ao carregar dados (status: ${response.status}): ${errorData.mensagem || errorData.erro || "Erro desconhecido"}`
          )
        } catch {
          throw new Error(`Falha ao carregar dados (status: ${response.status})`)
        }
      }

      const data: LeagueData = await response.json()
      if ((data as any).erro) {
        throw new Error((data as any).erro)
      }

      if (!data.teams || !data.standings || !data.rounds) {
        throw new Error("Dados incompletos recebidos da API")
      }

      // Remove apenas rodadas claramente pertencentes ao mata-mata.
      // Rodadas regulares podem vir como "R1", "Rodada 1", "Jornada 1"
      // ou com texto adicional, por isso não devemos exigir um formato exato.
      if (Array.isArray(data.rounds)) {
        data.rounds = data.rounds.filter((round: any) => {
          const name = String(round.name || "").trim().toLowerCase()
          if (/^(r|rodada|jornada)\s*[a-z]?$/i.test(name)) {
            return false
          }
          if (Array.isArray(data.playInRounds)) {
            data.playInRounds = data.playInRounds.filter((round: any) =>
              /(play-?in|repescagem)/i.test(String(round.name || ""))
            )
          }
          return !isPlayoffRoundName(name)
        })
      }

      // Atualiza o cache local em memória
      const entry = {
        data,
        timestamp: Date.now(),
      }
      leagueDataCacheMap.set(seasonKey, entry)

      return data
    } catch (error: any) {
      // Se houver falha de rede e tivermos dado anterior em cache de memória, usa como fallback
      const stale = leagueDataCacheMap.get(seasonKey)
      if (stale) {
        return stale.data
      }
      throw new Error(`Falha ao carregar dados da Kings League: ${error.message}`)
    } finally {
      pendingLeagueDataPromises.delete(seasonKey)
    }
  })()

  pendingLeagueDataPromises.set(seasonKey, fetchPromise)
  return fetchPromise
}


export async function fetchTeamDetails(teamId: string, seasonId?: number | string): Promise<TeamDetails> {
  const now = Date.now()
  const cacheKey = `${String(seasonId || "default")}_${teamId}`
  const cachedData = teamDetailsCache[cacheKey]
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
    return cachedData.data
  }


  // Deduplicação de requisição em andamento para o mesmo time
  if (pendingTeamPromises.has(cacheKey)) {
    return pendingTeamPromises.get(cacheKey)!
  }

  const teamPromise = (async () => {
    try {
      const response = await fetch(`/api/team-details/${teamId}?seasonId=${encodeURIComponent(String(seasonId || ""))}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes do time: ${response.status} ${response.statusText}`)
      }
      
      const teamDetails = await response.json()
      const sanitizedTeamDetails = sanitizeTeamDetailsPlayers(teamId, teamDetails)
      
      if (sanitizedTeamDetails.players && sanitizedTeamDetails.players.length > 0) {
        await Promise.all(
          sanitizedTeamDetails.players.map(async (player: any) => {
            try {
              const playerStats = await fetchPlayerStats(player.id, seasonId)
              player.stats = playerStats
            } catch (error) {
              console.warn(`Erro ao buscar estatísticas para o jogador ${player.id}:`, error)
            }
          })
        )
        
        // Balanceamento de Overalls e Wild Cards
        let wildcardCount = 0;
        sanitizedTeamDetails.players = sanitizedTeamDetails.players.filter((p: any) => {
          const isWc = p.category?.toLowerCase() === "wildcard" || 
                       p.metaInformation?.status?.toLowerCase().includes("jogador 11") ||
                       p.metaInformation?.status?.toLowerCase().includes("jogador 12") ||
                       p.metaInformation?.status?.toLowerCase().includes("jogador 13") ||
                       p.metaInformation?.status?.toLowerCase().includes("wildcard");
                       
          if (!p.metaInformation) p.metaInformation = {};
          
          if (isWc) {
             wildcardCount++;
             if (wildcardCount > 3) return false; // Limite de 3 Wild Cards por time
          } else {
             // Jogador comum (Draft/Base)
             const currentAvg = p.metaInformation.average;
             if (!currentAvg || currentAvg === "70" || currentAvg === "0" || currentAvg === "null") {
                 const stats = p.stats;
                 let base = 68; // Overall base
                 if (stats) {
                     base += Math.min(10, (stats.goalsScored || 0) * 1.5);
                     base += Math.min(8, (stats.assists || 0) * 1.0);
                     base += Math.min(5, (stats.mvps || 0) * 2.5);
                     base += Math.min(4, (stats.matchesPlayed || 0) * 0.4);
                 }
                 if (p.role === "goalkeeper" && stats) {
                     base += Math.min(10, (stats.matchesPlayed || 0) * 1.0); 
                 }
                 p.metaInformation.average = Math.min(84, Math.floor(base)).toString();
             }
          }
          return true;
        });
      }
      
      // Armazenar no cache em memória com timestamp atual
      const teamCacheEntry = {
        data: sanitizedTeamDetails,
        timestamp: Date.now()
      }
      teamDetailsCache[cacheKey] = teamCacheEntry
      
      return sanitizedTeamDetails
    } finally {
      pendingTeamPromises.delete(cacheKey)
    }
  })()

  pendingTeamPromises.set(cacheKey, teamPromise)
  return teamPromise
}

export async function fetchPlayerStats(playerId: number, seasonId?: number | string): Promise<PlayerStats> {
  const now = Date.now()
  const statsKey = `${String(seasonId || "default")}_${playerId}`
  const cachedData = playerStatsCache[statsKey]
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
    return cachedData.data
  }



  // Deduplicação de requisições em voo para o mesmo jogador
  if (pendingPlayerStatsPromises.has(statsKey)) {
    return pendingPlayerStatsPromises.get(statsKey)!
  }

  const statsPromise = (async () => {
    try {
      // Request compact payload (server supports ?compact=true and ?fields=...)
      const fields = encodeURIComponent('PG,GOL,ASS-V,CRT-G,CRT-R,MVP')
      const response = await fetch(`/api/player-stats/${playerId}?seasonId=${encodeURIComponent(String(seasonId || ""))}&compact=true&fields=${fields}`)
      
      if (!response.ok) {
        return {
          matchesPlayed: 0,
          goalsScored: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          mvps: 0
        }
      }
      
      const data = await response.json()
      
      const processedStats: PlayerStats = {
        matchesPlayed: 0,
        goalsScored: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        mvps: 0
      }
    
    if (Array.isArray(data.rankings)) {
      processedStats.rankings = data.rankings
      
      data.rankings.forEach((ranking: any) => {
        const { parameter, total } = ranking
        
        switch(parameter.code) {
          case 'PG':  // Games Played
            processedStats.matchesPlayed = total
            break
          case 'GOL':  // Goals
            processedStats.goalsScored = total
            break
          case 'ASS-V':  // Assists
            processedStats.assists = total
            break
          case 'CRT-G':  // Yellow Cards
            processedStats.yellowCards = total
            break
          case 'CRT-R':  // Red Cards
            processedStats.redCards = total
            break
          case 'MVP':  // MVP
            processedStats.mvps = total
            break
        }
      })
    }
    
    // Armazenar no cache em memória com timestamp atual
    const playerCacheEntry = {
      data: processedStats,
      timestamp: Date.now()
    }
    playerStatsCache[statsKey] = playerCacheEntry
    
    return processedStats
  } catch {
    return {
      matchesPlayed: 0,
      goalsScored: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      mvps: 0
    }
  } finally {
    pendingPlayerStatsPromises.delete(statsKey)
  }
})()

  pendingPlayerStatsPromises.set(statsKey, statsPromise)
  return statsPromise
}

export function clearLeagueDataCache() {
  leagueDataCacheMap.clear()
  statsCacheMap.clear()
  Object.keys(playerStatsCache).forEach((k) => delete playerStatsCache[k])
  Object.keys(teamDetailsCache).forEach((k) => delete teamDetailsCache[k])
  if (typeof window !== "undefined") {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("kl_")) {
          sessionStorage.removeItem(key)
        }
      })
    } catch {}
  }
}

const statsCacheMap = new Map<string, { data: any; timestamp: number }>()

export async function fetchLeagueStats(options: {
  seasonId?: number | string
  stat?: string
  forceRefresh?: boolean
} = {}): Promise<any> {
  const seasonKey = String(options.seasonId || "default")
  const statKey = options.stat || "all"
  const cacheKey = `kl_stats_${seasonKey}_${statKey}`
  const now = Date.now()

  if (!options.forceRefresh) {
    const cached = statsCacheMap.get(cacheKey)
    if (cached && (now - cached.timestamp) < LEAGUE_DATA_CACHE_TTL) {
      return cached.data
    }
  }

  const query = new URLSearchParams()
  if (options.seasonId) query.set("seasonId", String(options.seasonId))
  if (options.stat) query.set("stat", options.stat)

  const res = await fetch(`/api/league-stats?${query.toString()}`)
  if (!res.ok) {
    throw new Error(`Falha ao buscar estatísticas da liga (status ${res.status})`)
  }

  const data = await res.json()
  const entry = { data, timestamp: Date.now() }
  statsCacheMap.set(cacheKey, entry)

  return data
}
