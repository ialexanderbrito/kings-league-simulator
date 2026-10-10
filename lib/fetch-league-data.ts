import type { LeagueData, TeamDetails, PlayerStats } from "@/types/kings-league"

// In-memory cache e controle de chamadas em voo no cliente
let leagueDataCache: { data: LeagueData; timestamp: number } | null = null
let pendingLeagueDataPromise: Promise<LeagueData> | null = null
const LEAGUE_DATA_CACHE_TTL = 3 * 60 * 1000 // 3 minutos

const pendingTeamPromises = new Map<string, Promise<TeamDetails>>()
const pendingPlayerStatsPromises = new Map<number, Promise<PlayerStats>>()

// Cache para estatísticas de jogadores
const playerStatsCache: Record<number, { data: PlayerStats, timestamp: number }> = {}

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

const SESSION_CACHE_KEY = "kl_league_data_cache_v2"

export async function fetchLeagueData(options: { forceRefresh?: boolean } = {}): Promise<LeagueData> {
  const now = Date.now()

  // 1. Retorna do cache se válido e não forçado
  if (!options.forceRefresh && leagueDataCache && (now - leagueDataCache.timestamp) < LEAGUE_DATA_CACHE_TTL) {
    return leagueDataCache.data
  }

  // 2. No navegador, recupera instantaneamente do sessionStorage (0ms de latência mesmo no 3G)
  if (!options.forceRefresh && typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(SESSION_CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.data && parsed?.timestamp && (now - parsed.timestamp) < LEAGUE_DATA_CACHE_TTL) {
          leagueDataCache = parsed
          return parsed.data
        }
      }
    } catch {}
  }

  // 3. Se já existe uma requisição em andamento, reaproveita a Promise
  if (pendingLeagueDataPromise) {
    return pendingLeagueDataPromise
  }

  pendingLeagueDataPromise = (async () => {
    try {
      const response = await fetch("/api/league-data")

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

      // Filtra rodadas para remover playoffs da fase regular (Quartas, Semi, Final)
      if (Array.isArray(data.rounds)) {
        data.rounds = data.rounds.filter((round: any) => {
          const roundName = (round.name || "").toLowerCase()
          return !roundName.includes("quarta") &&
                 !roundName.includes("semi") &&
                 !roundName.includes("final")
        })
      }

      // Atualiza o cache local e sessionStorage
      leagueDataCache = {
        data,
        timestamp: Date.now(),
      }

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(leagueDataCache))
        } catch {}
      }

      return data
    } catch (error: any) {
      // Se houver falha de rede e tivermos dado anterior em cache, usa como fallback
      if (leagueDataCache) {
        return leagueDataCache.data
      }
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem(SESSION_CACHE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.data) return parsed.data
          }
        } catch {}
      }
      throw new Error(`Falha ao carregar dados da Kings League Brasil: ${error.message}`)
    } finally {
      pendingLeagueDataPromise = null
    }
  })()

  return pendingLeagueDataPromise
}


export async function fetchTeamDetails(teamId: string): Promise<TeamDetails> {
  const now = Date.now()
  const cachedData = teamDetailsCache[teamId]
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
    return cachedData.data
  }

  // Recupera do sessionStorage para persistir entre recarregamentos e navegação
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`kl_team_details_v2_${teamId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.data && (now - parsed.timestamp) < CACHE_EXPIRY_TIME) {
          teamDetailsCache[teamId] = parsed
          return parsed.data
        }
      }
    } catch {}
  }

  // Deduplicação de requisição em andamento para o mesmo time
  if (pendingTeamPromises.has(teamId)) {
    return pendingTeamPromises.get(teamId)!
  }

  const teamPromise = (async () => {
    try {
      const response = await fetch(`/api/team-details/${teamId}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes do time: ${response.status} ${response.statusText}`)
      }
      
      const teamDetails = await response.json()
      const sanitizedTeamDetails = sanitizeTeamDetailsPlayers(teamId, teamDetails)
      
      if (sanitizedTeamDetails.players && sanitizedTeamDetails.players.length > 0) {
        await Promise.all(
          sanitizedTeamDetails.players.map(async (player: any) => {
            try {
              const playerStats = await fetchPlayerStats(player.id)
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
      
      // Armazenar no cache com timestamp atual
      const teamCacheEntry = {
        data: sanitizedTeamDetails,
        timestamp: Date.now()
      }
      teamDetailsCache[teamId] = teamCacheEntry

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`kl_team_details_v2_${teamId}`, JSON.stringify(teamCacheEntry))
        } catch {}
      }
      
      return sanitizedTeamDetails
    } finally {
      pendingTeamPromises.delete(teamId)
    }
  })()

  pendingTeamPromises.set(teamId, teamPromise)
  return teamPromise
}

export async function fetchPlayerStats(playerId: number): Promise<PlayerStats> {
  const now = Date.now()
  const cachedData = playerStatsCache[playerId]
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
    return cachedData.data
  }

  // Recupera do sessionStorage para persistir entre recarregamentos e navegação
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`kl_player_stats_v2_${playerId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.data && (now - parsed.timestamp) < CACHE_EXPIRY_TIME) {
          playerStatsCache[playerId] = parsed
          return parsed.data
        }
      }
    } catch {}
  }

  // Deduplicação de requisições em voo para o mesmo jogador
  if (pendingPlayerStatsPromises.has(playerId)) {
    return pendingPlayerStatsPromises.get(playerId)!
  }

  const statsPromise = (async () => {
    try {
      // Request compact payload (server supports ?compact=true and ?fields=...)
      const fields = encodeURIComponent('PG,GOL,ASS-V,CRT-G,CRT-R,MVP')
      const response = await fetch(`/api/player-stats/${playerId}?compact=true&fields=${fields}`)
      
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
    
    // Armazenar no cache com timestamp atual
    const playerCacheEntry = {
      data: processedStats,
      timestamp: Date.now()
    }
    playerStatsCache[playerId] = playerCacheEntry

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`kl_player_stats_v2_${playerId}`, JSON.stringify(playerCacheEntry))
      } catch {}
    }
    
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
    pendingPlayerStatsPromises.delete(playerId)
  }
})()

  pendingPlayerStatsPromises.set(playerId, statsPromise)
  return statsPromise
}

export function clearLeagueDataCache() {
  leagueDataCache = null
}


