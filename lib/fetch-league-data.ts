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

    // Busca resultados atualizados de cada partida individualmente
    let officialMatches: any[] = []
    try {
      // Coleta todos os ids de partidas das rodadas
      const matchIds: number[] = []
      if (data.rounds && Array.isArray(data.rounds)) {
        data.rounds.forEach((round: any) => {
          if (Array.isArray(round.matches)) {
            round.matches.forEach((match: any) => {
              if (match.id) matchIds.push(Number(match.id))
            })
          }
        })
      }
      // Busca oficial de cada partida em paralelo
      const results = await Promise.all(
        matchIds.map(async (id) => {
          try {
            const res = await fetch(`/api/official-matches?matchId=${id}`, { next: { revalidate: 300 } })
            if (res.ok) {
              const json = await res.json()
              // O endpoint retorna o objeto do jogo diretamente
              if (json && json.id) {
                // Extrai status e scores do objeto oficial
                // O status pode estar em json.status ou json.matchStatus
                // Os scores podem estar em json.score ou json.scores
                let scores = {
                  homeScore: null,
                  awayScore: null,
                  homeScore1T: null,
                  awayScore1T: null,
                  homeScore2T: null,
                  awayScore2T: null,
                  homeScore3T: null,
                  awayScore3T: null,
                  homeScoreP: null,
                  awayScoreP: null,
                }
                // O placar principal geralmente está em json.score ou json.scores
                if (json.score) {
                  scores.homeScore = json.score.home;
                  scores.awayScore = json.score.away;
                } else if (json.scores) {
                  scores = { ...scores, ...json.scores }
                }
                // Se houver períodos, tenta extrair os parciais
                if (json.periods && Array.isArray(json.periods)) {
                  json.periods.forEach((p: any, idx: number) => {
                    if (idx === 0) {
                      scores.homeScore1T = p.home;
                      scores.awayScore1T = p.away;
                    } else if (idx === 1) {
                      scores.homeScore2T = p.home;
                      scores.awayScore2T = p.away;
                    } else if (idx === 2) {
                      scores.homeScore3T = p.home;
                      scores.awayScore3T = p.away;
                    }
                  })
                }
                // Penaltis
                if (json.penalties) {
                  scores.homeScoreP = json.penalties.home;
                  scores.awayScoreP = json.penalties.away;
                }
                return {
                  id: json.id,
                  status: json.status || json.matchStatus || null,
                  scores,
                  metaInformation: json.metaInformation || null,
                }
              }
            }
          } catch {}
          return null
        })
      )
      officialMatches = results.filter(Boolean)
    } catch (err) {
      console.warn("Não foi possível buscar resultados oficiais Kings League:", err)
    }

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
