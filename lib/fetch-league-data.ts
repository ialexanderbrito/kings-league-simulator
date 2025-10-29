import type { LeagueData, TeamDetails, PlayerStats } from "@/types/kings-league"

// Cache para estatísticas de jogadores
const playerStatsCache: Record<number, { data: PlayerStats, timestamp: number }> = {}

// Cache para detalhes dos times
const teamDetailsCache: Record<string, { data: TeamDetails, timestamp: number }> = {}

// Tempo de expiração do cache em milissegundos (12 horas)
const CACHE_EXPIRY_TIME = 12 * 60 * 60 * 1000

export async function fetchLeagueData(): Promise<LeagueData> {
  try {
    // Busca dados locais (estrutura base)
    const response = await fetch("/api/league-data", {
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      try {
        const errorData = await response.json()
        throw new Error(
          `Falha ao carregar dados (status: ${response.status}): ${errorData.message || "Erro desconhecido"}`,
        )
      } catch (parseError) {
        throw new Error(`Falha ao carregar dados (status: ${response.status})`)
      }
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }

    if (!data.teams || !data.standings || !data.rounds) {
      throw new Error("Dados incompletos recebidos da API")
    }

    // Observação: antigamente o cliente solicitava detalhes oficiais de cada partida individualmente
    // (muitos fetches paralelos). Para reduzir número de requisições do cliente, o endpoint
    // `/api/league-data` agora tenta mesclar dados oficiais server-side quando necessário.
    // Aqui no cliente, vamos confiar no servidor e não disparar N requests por partida.
    const officialMatches: any[] = []

    // Filtra rodadas para remover playoffs (Quartas, Semi, Final)
    if (data.rounds && Array.isArray(data.rounds)) {
      data.rounds = data.rounds.filter((round: any) => {
        const roundName = round.name?.toLowerCase() || '';
        return !roundName.includes('quarta') && 
               !roundName.includes('semi') && 
               !roundName.includes('final');
      });
    }

    // Mescla placares/status oficiais nas rodadas
    if (officialMatches.length > 0 && data.rounds) {
      const officialById = new Map<number, any>()
      officialMatches.forEach((m: any) => {
        officialById.set(Number(m.id), m)
      })
      data.rounds = data.rounds.map((round: any) => ({
        ...round,
        matches: Array.isArray(round.matches)
          ? round.matches.map((match: any) => {
              const official = officialById.get(Number(match.id))
              if (official) {
                return {
                  ...match,
                  status: official.status ?? match.status,
                  scores: {
                    homeScore: official.scores?.homeScore ?? match.scores?.homeScore ?? null,
                    awayScore: official.scores?.awayScore ?? match.scores?.awayScore ?? null,
                    homeScore1T: official.scores?.homeScore1T ?? match.scores?.homeScore1T ?? null,
                    awayScore1T: official.scores?.awayScore1T ?? match.scores?.awayScore1T ?? null,
                    homeScore2T: official.scores?.homeScore2T ?? match.scores?.homeScore2T ?? null,
                    awayScore2T: official.scores?.awayScore2T ?? match.scores?.awayScore2T ?? null,
                    homeScore3T: official.scores?.homeScore3T ?? match.scores?.homeScore3T ?? null,
                    awayScore3T: official.scores?.awayScore3T ?? match.scores?.awayScore3T ?? null,
                    homeScoreP: official.scores?.homeScoreP ?? match.scores?.homeScoreP ?? null,
                    awayScoreP: official.scores?.awayScoreP ?? match.scores?.awayScoreP ?? null,
                  },
                  metaInformation: official.metaInformation ?? match.metaInformation,
                }
              }
              return match
            })
          : []
      }))
    }

    return data
  } catch (error: any) {
    throw new Error(`Falha ao carregar dados da Kings League Brasil: ${error.message}`)
  }
}

export async function fetchTeamDetails(teamId: string): Promise<TeamDetails> {
  try {
    // Verificar se temos dados em cache e se ainda são válidos
    const cachedData = teamDetailsCache[teamId]
    const now = Date.now()
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
      return cachedData.data
    }
    
    const response = await fetch(`/api/team-details/${teamId}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes do time: ${response.status} ${response.statusText}`)
    }
    
    const teamDetails = await response.json()
    
    if (teamDetails.players && teamDetails.players.length > 0) {
      await Promise.all(
        teamDetails.players.map(async (player: any) => {
          try {
            const playerStats = await fetchPlayerStats(player.id)
            player.stats = playerStats
          } catch (error) {
            console.warn(`Erro ao buscar estatísticas para o jogador ${player.id}:`, error)
          }
        })
      )
    }
    
    // Armazenar no cache com timestamp atual
    teamDetailsCache[teamId] = {
      data: teamDetails,
      timestamp: now
    }
    
    return teamDetails
  } catch (error) {
    throw error
  }
}

export async function fetchPlayerStats(playerId: number): Promise<PlayerStats> {
  try {
    // Verificar se temos dados em cache e se ainda são válidos
    const cachedData = playerStatsCache[playerId]
    const now = Date.now()
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_TIME) {
      return cachedData.data
    }
    
    const response = await fetch(`/api/player-stats/${playerId}`)
    
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
    playerStatsCache[playerId] = {
      data: processedStats,
      timestamp: now
    }
    
    return processedStats
  } catch (error) {
    return {
      matchesPlayed: 0,
      goalsScored: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      mvps: 0
    }
  }
}
