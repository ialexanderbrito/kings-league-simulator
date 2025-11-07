import { NextResponse } from "next/server"
import type { LeagueData, Team, TeamStanding, Round } from "@/types/kings-league"

const SEASON_ID = process.env.KINGS_LEAGUE_SEASON_ID

export async function GET() {
  try {

    const seasonResponse = await fetch(`https://kingsleague.pro/api/v1/competition/seasons/${SEASON_ID}?lang=pt`, {
      headers: {
        "accept": "*/*",
        "accept-language": "pt-BR,pt-PT;q=0.9,pt;q=0.8",
        "referer": "https://kingsleague.pro/pt/brazil/classificacao",
        "sec-ch-ua": "\"Chromium\";v=\"142\", \"Microsoft Edge\";v=\"142\", \"Not_A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
      },
      next: { revalidate: 300 },
    })

    if (!seasonResponse.ok) {
      throw new Error(`Falha ao buscar dados da temporada: ${seasonResponse.status} ${seasonResponse.statusText}`)
    }

    const seasonData = await seasonResponse.json()

    const matchesResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/seasons/${SEASON_ID}/match-center-data?lang=pt`,
      {
        headers: {
          referer: "https://kingsleague.pro/en/brazil/matches",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 300 },
      },
    )

    if (!matchesResponse.ok) {
      throw new Error(`Falha ao buscar dados de partidas: ${matchesResponse.status} ${matchesResponse.statusText}`)
    }

    const matchesData = await matchesResponse.json()

    let rounds: Round[] = []

    if (Array.isArray(matchesData) && matchesData.length > 0) {
      rounds = matchesData.map((round: any) => ({
        id: round.id,
        name: round.turnName.replace('Jornada', 'Rodada'),
        ended: !!round.ended,
        startDate: round.startDate,
        finishDate: round.finishDate,
        matches: Array.isArray(round.matches)
          ? round.matches.map((match: any) => ({
              id: match.id,
              date: match.date,
              status: match.status,
              participants: {
                homeTeamId: String(match.participants.homeTeamId),
                awayTeamId: String(match.participants.awayTeamId),
              },
              scores: {
                homeScore: match.scores.homeScore,
                awayScore: match.scores.awayScore,
                homeScore1T: match.scores.homeScore1T,
                awayScore1T: match.scores.awayScore1T,
                homeScore2T: match.scores.homeScore2T,
                awayScore2T: match.scores.awayScore2T,
                homeScore3T: match.scores.homeScore3T,
                awayScore3T: match.scores.awayScore3T,
                homeScoreP: match.scores.homeScoreP,
                awayScoreP: match.scores.awayScoreP,
              },
              metaInformation: match.metaInformation,
              // Preserve o nome do grupo (ex: 'A', 'B', 'Challenger') se fornecido pela API
              groupName: match.groupName ?? match.group?.name ?? null,
            }))
          : [],
      }))
    } else {
      throw new Error("Formato de dados de partidas inválido")
    }


    if (!seasonData || !seasonData.phases || !seasonData.phases.length) {
      throw new Error("Estrutura de dados da API da Kings League inválida")
    }

    // Encontrar a fase "Group stage" para pegar times e standings
    const groupStagePhase = seasonData.phases.find((p: any) => p.name === "Group stage")
    
    // Encontrar a fase "Playoffs" para pegar os turnos dos playoffs
    const playoffsPhase = seasonData.phases.find((p: any) => p.name === "Playoffs")

    if (!groupStagePhase || !groupStagePhase.groups || !groupStagePhase.groups.length) {
      throw new Error("Fase de grupos não encontrada nos dados da API da Kings League")
    }

    const phase = groupStagePhase

    // Agrega times e standings de todos os grupos da fase (A, B, Challenger, ...)
    const teamsMap: Record<string, Team> = {}
    const aggregatedStandings: TeamStanding[] = []

    phase.groups.forEach((grp: any) => {
      const groupName = grp.name

      // teams podem conter times repetidos entre grupos (ex: Challenger includes same teams), por isso usamos um mapa
      grp.teams.forEach((team: any) => {
        const id = String(team.id)
        if (!teamsMap[id]) {
          teamsMap[id] = {
            id,
            name: team.name,
            shortName: team.shortName,
            completeName: team.completeName,
            countryId: team.countryId,
            firstColorHEX: team.firstColorHEX || "#cccccc",
            secondColorHEX: team.secondColorHEX || "#333333",
            logo: team.logo,
            gender: team.gender,
          }
        }
      })

      // standings podem estar ausentes (ex: Challenger), então verificamos
      if (Array.isArray(grp.standings)) {
        grp.standings.forEach((standing: any) => {
          aggregatedStandings.push({
            id: String(standing.team.id),
            name: standing.team.name,
            shortName: standing.team.shortName,
            logo: standing.team.logo,
            points: standing.points,
            played: standing.gameTotal,
            won: standing.gameWon,
            drawn: standing.gameDraw,
            lost: standing.gameLost,
            goalsFor: standing.goalPro,
            goalsAgainst: standing.goalAgainst,
            goalDifference: standing.goalPro - standing.goalAgainst,
            positionLegend: typeof standing.positionLegend === "string" ? { color: "", placement: standing.positionLegend } : standing.positionLegend ?? null,
            rank: standing.rank,
            groupName,
          })
        })
      }
    })

    const teams: Team[] = Object.values(teamsMap)
    // Consolidar aggregatedStandings por team id para evitar duplicatas entre grupos
    const standingsMap: Record<string, TeamStanding> = {}
    aggregatedStandings.forEach((st) => {
      // Se já existir, preferimos manter a entrada que tiver pontos maior (ou a primeira)
      const existing = standingsMap[st.id]
      if (!existing) {
        standingsMap[st.id] = st
      } else {
        // Se houver conflito, mantenha a que tiver mais pontos
        if ((st.points ?? 0) > (existing.points ?? 0)) {
          standingsMap[st.id] = st
        }
      }
    })
    const standings: TeamStanding[] = Object.values(standingsMap)

    const leagueData: LeagueData = {
      id: seasonData.id,
      name: seasonData.name,
      displayName: seasonData.displayName,
      teams,
      standings,
      rounds,
    }

    // Extrair turnos dos playoffs se disponível
    let playoffsTurns: any[] = []
    if (playoffsPhase && playoffsPhase.groups && playoffsPhase.groups.length > 0) {
      const playoffsGroup = playoffsPhase.groups[0]
      if (playoffsGroup.turns && Array.isArray(playoffsGroup.turns)) {
        playoffsTurns = playoffsGroup.turns
      }
    }

    // --- Merge server-side com dados oficiais (opcional, só para partidas sem placar ou em andamento)
    try {
      // coletar ids de partidas que precisam de atualização (placar ausente ou status ao vivo)
      const matchIdsToFetch: number[] = []
      rounds.forEach((round) => {
        round.matches.forEach((match) => {
          const home = match.scores?.homeScore
          const away = match.scores?.awayScore
          const status = (match.status || "").toString().toLowerCase()
          if (home === null || away === null || status.includes("live") || status.includes("in_progress") || status.includes("ongoing")) {
            if (match.id) matchIdsToFetch.push(Number(match.id))
          }
        })
      })

      // Função utilitária para processar em batches e evitar muitas conexões simultâneas
      const chunk = <T,>(arr: T[], size: number) => {
        const res: T[][] = []
        for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
        return res
      }

      if (matchIdsToFetch.length > 0) {
        const officialById = new Map<number, any>()
        const batches = chunk(matchIdsToFetch, 10) // 10 requests por batch
        for (const batch of batches) {
          // buscar o batch em paralelo, mas batches são sequenciais
          const promises = batch.map((id) => {
            const url = `https://kingsleague.pro/api/v1/competition/matches/${id}?live=true&competitionId=17`
            return fetch(url, {
              headers: {
                referer: "https://kingsleague.pro/pt/brazil/jogos/",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
              cache: "no-store",
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((json) => {
                if (json && json.id) {
                  // extrair scores similar ao client
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
                  if (json.score) {
                    scores.homeScore = json.score.home
                    scores.awayScore = json.score.away
                  } else if (json.scores) {
                    scores = { ...scores, ...json.scores }
                  }
                  if (json.periods && Array.isArray(json.periods)) {
                    json.periods.forEach((p: any, idx: number) => {
                      if (idx === 0) {
                        scores.homeScore1T = p.home
                        scores.awayScore1T = p.away
                      } else if (idx === 1) {
                        scores.homeScore2T = p.home
                        scores.awayScore2T = p.away
                      } else if (idx === 2) {
                        scores.homeScore3T = p.home
                        scores.awayScore3T = p.away
                      }
                    })
                  }
                  if (json.penalties) {
                    scores.homeScoreP = json.penalties.home
                    scores.awayScoreP = json.penalties.away
                  }

                  officialById.set(Number(json.id), {
                    id: json.id,
                    status: json.status || json.matchStatus || null,
                    scores,
                    metaInformation: json.metaInformation || null,
                  })
                }
                return null
              })
              .catch(() => null)
          })

          await Promise.all(promises)
          // pequena pausa entre batches para diminuir pressão no upstream (opcional)
          await new Promise((res) => setTimeout(res, 120))
        }

        // Merge nos rounds
        if (officialById.size > 0) {
          rounds = rounds.map((round) => ({
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
      }
    } catch (err) {
      // falha ao buscar dados oficiais não deve quebrar o endpoint principal
      console.warn("Não foi possível buscar/mesclar dados oficiais no servidor:", err)
    }

    return new NextResponse(JSON.stringify({ ...leagueData, rounds, playoffs: playoffsTurns }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Falha ao carregar dados da Kings League Brasil",
        message: error.message,
        stack: error.stack,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
