import type { LeagueData, TeamDetails, PlayerStats } from "@/types/kings-league"

export async function fetchLeagueData(): Promise<LeagueData> {
  try {
    try {
      const directResponse = await fetch("/api/direct-matches")

      if (directResponse.ok) {
        const directData = await directResponse.json()
        console.log("Dados diretos recebidos:", {
          tipo: typeof directData,
          isArray: Array.isArray(directData),
          tamanho: Array.isArray(directData) ? directData.length : "N/A",
        })
      } else {
        console.log("Não foi possível buscar dados diretos:", directResponse.status)
      }
    } catch (directError) {
      console.error("Erro ao buscar dados diretos:", directError)
    }

    const response = await fetch("/api/league-data", {
      cache: "no-store",
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

    return data
  } catch (error) {
    throw new Error(`Falha ao carregar dados da Kings League Brasil: ${error.message}`)
  }
}

export async function fetchTeamDetails(teamId: string): Promise<TeamDetails> {
  try {
    const response = await fetch(`/api/team-details/${teamId}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes do time: ${response.status} ${response.statusText}`)
    }
    
    const teamDetails = await response.json()
    
    if (teamDetails.players && teamDetails.players.length > 0) {
      await Promise.all(
        teamDetails.players.map(async (player) => {
          try {
            const playerStats = await fetchPlayerStats(player.id)
            player.stats = playerStats
          } catch (error) {
            console.warn(`Erro ao buscar estatísticas para o jogador ${player.id}:`, error)
          }
        })
      )
    }
    
    return teamDetails
  } catch (error) {
    console.error(`Erro ao buscar detalhes do time ${teamId}:`, error)
    throw error
  }
}

export async function fetchPlayerStats(playerId: number): Promise<PlayerStats> {
  try {
    const response = await fetch(`/api/player-stats/${playerId}`)
    
    if (!response.ok) {
      console.warn(`Não foi possível obter estatísticas para o jogador ${playerId} (status: ${response.status})`)
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
      
      data.rankings.forEach(ranking => {
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
    
    return processedStats
  } catch (error) {
    console.error(`Erro ao processar estatísticas do jogador ${playerId}:`, error)
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
