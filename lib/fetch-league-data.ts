import type { LeagueData } from "@/types/kings-league"

export async function fetchLeagueData(): Promise<LeagueData> {
  try {
    // Tentar buscar dados diretamente primeiro para diagnóstico
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

    // Buscar dados da nossa API
    const response = await fetch("/api/league-data", {
      cache: "no-store", // Garantir dados atualizados
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
    // Verificar se a resposta contém um erro
    if (data.error) {
      throw new Error(data.error)
    }

    // Verificar se os dados têm a estrutura esperada
    if (!data.teams || !data.standings || !data.rounds) {
      throw new Error("Dados incompletos recebidos da API")
    }

    return data
  } catch (error) {
    throw new Error(`Falha ao carregar dados da Kings League Brasil: ${error.message}`)
  }
}
