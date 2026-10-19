import type { LeagueData, Team, TeamStanding, Round, Match } from "@/types/kings-league"
import {
  kingsLeagueApi,
  fetchFromKingsLeague,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  COMPETITION_ID,
  SEASON_ID,
  KINGS_LEAGUE_SIMPLE_HEADERS,
  type KingsLeagueSeasonResponse,
  type KingsLeagueMatchCenterResponse,
  type KingsLeagueRound,
  type KingsLeagueTurn,
  type KingsLeagueMatch,
  type KingsLeaguePhase,
  type KingsLeagueGroup,
  type KingsLeagueGroupTeam,
} from "@/lib/api"
import { AVAILABLE_LEAGUES } from "@/app/api/competitions/route"
import { isPlayoffRoundName } from "@/lib/league-format"
import { calculateStandings } from "@/lib/calculate-standings"
// Tipos auxiliares para dados internos
interface ApiStanding {
  team: {
    id: number
    name: string
    shortName: string
    logo: { url: string }
  }
  points: number
  gameTotal: number
  gameWon: number
  gameDraw: number
  gameLost: number
  goalPro: number
  goalAgainst: number
  positionLegend?: string | { color: string; placement: string } | null
  rank: number
}

interface OfficialMatchData {
  id: number
  status: string | null
  scores: Match["scores"]
  metaInformation: Match["metaInformation"]
}

/**
 * Divide um array em chunks de tamanho especificado
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * Transforma dados de partida da API externa para o formato interno
 */
function transformMatch(match: KingsLeagueMatch): Match {
  return {
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
    groupName: match.groupName ?? match.group?.name ?? undefined,
  }
}

/**
 * Transforma dados de rodada da API externa para o formato interno
 */
function transformRound(round: KingsLeagueRound | KingsLeagueTurn): Round {
  const source = round as KingsLeagueRound & KingsLeagueTurn
  return {
    id: source.id,
    name: (source.turnName || source.name || `Rodada ${source.shortName || source.id}`).replace(/(Jornada|Matchday)/gi, "Rodada"),
    ended: !!source.ended,
    startDate: source.startDate || source.start || "",
    finishDate: source.finishDate || source.finish || "",
    matches: Array.isArray(source.matches) ? source.matches.map(transformMatch) : [],
  }
}

function isRegularRoundName(value: unknown): boolean {
  const name = String(value || "").trim().toLowerCase()
  if (!name) return true
  if (/^(r|rodada|jornada|matchday|round)\s*[a-z]?$/i.test(name)) return false
  return !isPlayoffRoundName(name)
}

function isPlayInRoundName(value: unknown): boolean {
  return /(play-?in|repescagem)/i.test(String(value || "").trim())
}

function mergeRounds(existing: Round, incoming: Round): Round {
  const matchesById = new Map(existing.matches.map((match) => [match.id, match]))
  incoming.matches.forEach((match) => {
    const previous = matchesById.get(match.id)
    matchesById.set(match.id, previous ? { ...previous, ...match, scores: { ...previous.scores, ...match.scores } } : match)
  })
  return {
    ...existing,
    ...incoming,
    matches: Array.from(matchesById.values()),
  }
}

/**
 * Extrai times de um grupo
 */
function extractTeamsFromGroup(
  group: KingsLeagueGroup,
  teamsMap: Record<string, Team>
): void {
  group.teams.forEach((team: KingsLeagueGroupTeam) => {
    const id = String(team.id)
    if (!teamsMap[id]) {
      teamsMap[id] = {
        id,
        name: team.name,
        shortName: team.shortName,
        countryId: 0,
        firstColorHEX: team.firstColorHEX || "#cccccc",
        secondColorHEX: team.secondColorHEX || "#333333",
        logo: team.logo,
        gender: "male",
      }
    }
  })
}

/**
 * Extrai standings de um grupo
 */
function extractStandingsFromGroup(
  group: KingsLeagueGroup & { standings?: ApiStanding[] },
  groupName: string
): TeamStanding[] {
  if (!Array.isArray(group.standings)) {
    return []
  }

  return group.standings.map((standing) => ({
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
    positionLegend:
      typeof standing.positionLegend === "string"
        ? { color: "", placement: standing.positionLegend }
        : standing.positionLegend ?? null,
    rank: standing.rank,
    groupName,
  }))
}

/**
 * Busca dados atualizados de partidas específicas
 */
async function fetchOfficialMatchData(matchIds: number[], compId?: string): Promise<Map<number, OfficialMatchData>> {
  const officialById = new Map<number, OfficialMatchData>()
  const batches = chunk(matchIds, 10)

  for (const batch of batches) {
    const promises = batch.map(async (id) => {
      try {
        const url = `/competition/matches/${id}?live=true&competitionId=${compId || COMPETITION_ID}`
        const json = await fetchFromKingsLeague<any>(url, {
          noCache: true,
        })

        if (!json?.id) return null

        const scores: Match["scores"] = {
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
          Object.assign(scores, json.scores)
        }

        if (Array.isArray(json.periods)) {
          json.periods.forEach((p: { home: number; away: number }, idx: number) => {
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
      } catch {
        // Ignora erros de partidas individuais
      }
    })

    await Promise.all(promises)
    // Pausa entre batches para evitar sobrecarga na API externa
    await new Promise((resolve) => setTimeout(resolve, 120))
  }

  return officialById
}

/**
 * Mescla dados oficiais nas rodadas
 */
function mergeOfficialData(rounds: Round[], officialById: Map<number, OfficialMatchData>): Round[] {
  if (officialById.size === 0) return rounds

  return rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) => {
      const official = officialById.get(Number(match.id))
      if (!official) return match

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
    }),
  }))
}

/**
 * Identifica partidas que precisam de atualização de dados oficiais (apenas partidas em andamento/ao vivo)
 */
function getMatchIdsNeedingUpdate(rounds: Round[]): number[] {
  const matchIds: number[] = []

  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const status = (match.status || "").toString().toLowerCase()
      const isLive =
        status.includes("live") ||
        status.includes("inplay") ||
        status.includes("in_progress") ||
        status.includes("ongoing")

      if (isLive && match.id) {
        matchIds.push(Number(match.id))
      }
    })
  })

  return matchIds
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("seasonId") || undefined
    const competitionId = searchParams.get("competitionId") || undefined
    const effectiveCompetitionId = competitionId || String(COMPETITION_ID)
    const configuredLeague = AVAILABLE_LEAGUES.find(
      (league) => String(league.competitionId) === String(effectiveCompetitionId)
    )
    const effectiveSeasonId = seasonId || String(configuredLeague?.activeSeasonId || SEASON_ID)
    const configuredSeason = configuredLeague?.seasons.find(
      (season) => String(season.id) === String(effectiveSeasonId)
    )

    // Busca dados da temporada, partidas e lista oficial de times em paralelo
    const [seasonData, matchesData, initialSeasonTeams] = await Promise.all([
      kingsLeagueApi.getSeasonData(effectiveSeasonId, effectiveCompetitionId),
      kingsLeagueApi.getMatchCenterData(effectiveSeasonId, effectiveCompetitionId),
      kingsLeagueApi.getSeasonTeams(effectiveSeasonId, effectiveCompetitionId).catch(() => []),
    ])
    const seasonTeams = initialSeasonTeams

    // Transforma rodadas (aceita matchesData vazio/undefined)
    let rounds: Round[] = Array.isArray(matchesData) ? matchesData.map(transformRound) : []

    // Algumas respostas da API entregam as rodadas completas apenas dentro
    // de phases[].groups[].turns. Mescla essa fonte sem duplicar partidas.
    const phaseTurns = (seasonData?.phases || [])
      .flatMap((phase) => phase.groups || [])
      .flatMap((group) => group.turns || [])
      .filter((turn) => Array.isArray(turn.matches))

    const regularTurns = (seasonData?.phases || [])
      .filter((phase) => !isPlayoffRoundName(`${phase.name || ""} ${phase.displayName || ""}`) && !/(knockout|mata-?mata|postseason)/i.test(`${phase.name || ""} ${phase.displayName || ""}`))
      .flatMap((phase) => phase.groups || [])
      .flatMap((group) => group.turns || [])
      .filter((turn) => Array.isArray(turn.matches))
      .filter((turn) => isRegularRoundName(turn.turnName || turn.name))
      .map((turn) => transformRound(turn))

    const playInRoundsByKey = new Map<string, Round>()
    const allCandidateRounds = [
      ...(Array.isArray(matchesData) ? matchesData : []),
      ...phaseTurns,
    ].map(transformRound)
    allCandidateRounds
      .filter((round) => isPlayInRoundName(round.name))
      .forEach((round) => {
        const key = `playin-${round.id}-${round.name.toLowerCase()}`
        const existing = playInRoundsByKey.get(key)
        playInRoundsByKey.set(key, existing ? mergeRounds(existing, round) : round)
      })

    const roundsByKey = new Map<string, Round>()
    for (const round of [...rounds, ...regularTurns]) {
      if (!isRegularRoundName(round.name)) continue
      const normalizedName = round.name
        .toLowerCase()
        .replace(/(jornada|matchday|round)/gi, "rodada")
        .replace(/\s+/g, " ")
        .trim()
      const roundNumber = normalizedName.match(/\d+/)?.[0]
      const key = roundNumber ? `round-${roundNumber}` : `name-${normalizedName}`
      const existing = roundsByKey.get(key)
      roundsByKey.set(key, existing ? mergeRounds(existing, round) : round)
    }
    rounds = Array.from(roundsByKey.values()).sort((a, b) => {
      const roundA = Number(a.name.match(/\d+/)?.[0] || a.id)
      const roundB = Number(b.name.match(/\d+/)?.[0] || b.id)
      return roundA - roundB
    })

    // Encontra fases (aceita nomes em inglês ou traduzidos)
    const isGroupPhase = (p: KingsLeaguePhase) => {
      const name = String(p.name || "").toLowerCase()
      const display = String((p as any).displayName || "").toLowerCase()
      return name.includes("group") || name.includes("grupo") || display.includes("group") || display.includes("grupo")
    }

    const isPlayoffsPhase = (p: KingsLeaguePhase) => {
      const name = String(p.name || "").toLowerCase()
      const display = String((p as any).displayName || "").toLowerCase()
      return isPlayoffRoundName(`${name} ${display}`) || /(knockout|mata-?mata|postseason)/i.test(`${name} ${display}`)
    }

    let groupStagePhase = seasonData?.phases?.find(isGroupPhase)
    const playoffsPhase = seasonData?.phases?.find(isPlayoffsPhase)

    // Se não encontrou a fase de grupos pelos nomes, tenta usar qualquer fase que tenha grupos definidos
    if (!groupStagePhase?.groups?.length && seasonData?.phases?.length) {
      const anyPhaseWithGroups = seasonData.phases.find(
        (p: KingsLeaguePhase) => Array.isArray(p.groups) && p.groups.length > 0
      )
      if (anyPhaseWithGroups) groupStagePhase = anyPhaseWithGroups
    }

    // Agrega times e standings de todos os grupos
    const teamsMap: Record<string, Team> = {}
    const aggregatedStandings: TeamStanding[] = []

    // 1. Popula times a partir da lista oficial completa da temporada (inclui staffs/presidentes e redes sociais)
    const officialTeamsList = Array.isArray(seasonTeams)
      ? seasonTeams
      : (seasonTeams as any)?.teams ?? []

    if (Array.isArray(officialTeamsList)) {
      officialTeamsList.forEach((st: any) => {
        const id = String(st.id)
        teamsMap[id] = {
          id,
          name: st.name,
          shortName: st.shortName,
          completeName: st.completeName,
          countryId: st.countryId || 0,
          firstColorHEX: st.firstColorHEX || "#cccccc",
          secondColorHEX: st.secondColorHEX || "#333333",
          logo: st.logo || { url: "" },
          gender: st.gender || "male",
          metaInformation: st.metaInformation,
          staffs: st.staffs,
        } as any
      })
    }

    if (groupStagePhase?.groups?.length) {
      groupStagePhase.groups.forEach((group: KingsLeagueGroup & { standings?: ApiStanding[] }) => {
        extractTeamsFromGroup(group, teamsMap)
        const standings = extractStandingsFromGroup(group, group.name)
        aggregatedStandings.push(...standings)
      })
    } else {
      // Fallback: extrai times a partir das partidas caso a fase de grupos não esteja presente
      rounds.forEach((r) => {
        r.matches.forEach((m) => {
          const homeId = String(m.participants.homeTeamId)
          const awayId = String(m.participants.awayTeamId)

          if (!teamsMap[homeId]) {
            teamsMap[homeId] = {
              id: homeId,
              name: `Time ${homeId}`,
              shortName: `#${homeId}`,
              countryId: 0,
              firstColorHEX: "#cccccc",
              secondColorHEX: "#333333",
              logo: { url: "" },
              gender: "male",
            }
          }

          if (!teamsMap[awayId]) {
            teamsMap[awayId] = {
              id: awayId,
              name: `Time ${awayId}`,
              shortName: `#${awayId}`,
              countryId: 0,
              firstColorHEX: "#cccccc",
              secondColorHEX: "#333333",
              logo: { url: "" },
              gender: "male",
            }
          }
        })
      })
    }

    // Consolida standings para evitar duplicatas
    const standingsMap: Record<string, TeamStanding> = {}
    aggregatedStandings.forEach((st) => {
      const existing = standingsMap[st.id]
      if (!existing || (st.points ?? 0) > (existing.points ?? 0)) {
        standingsMap[st.id] = st
      }
    })

    let finalStandings = Object.values(standingsMap)
    if (rounds.length > 0) {
      try {
        const computedStandingsObj = calculateStandings(rounds, teamsMap, finalStandings)
        const computedList = Object.values(computedStandingsObj).flat()
        if (computedList.length > 0) {
          finalStandings = computedList
        }
      } catch {
        // Fallback para os standings originais caso o cálculo falhe
      }
    }

    const leagueData: LeagueData = {
      id: seasonData?.id ?? 0,
      name: configuredSeason?.name ?? seasonData?.name ?? "",
      displayName: configuredSeason?.displayName ?? seasonData?.displayName ?? "",
      teams: Object.values(teamsMap),
      standings: finalStandings,
      rounds,
      playInRounds: Array.from(playInRoundsByKey.values()),
    }

    // Extrai turnos dos playoffs
    const playoffTurnSources = (seasonData?.phases || [])
      .flatMap((phase) => [
        ...(Array.isArray((phase as any).turns) ? (phase as any).turns : []),
        ...(phase.groups || []).flatMap((group) => group.turns || []),
      ])
      .filter((turn) => Array.isArray(turn.matches))
      .filter((turn) => isPlayoffRoundName(turn.turnName || turn.name || turn.displayName))

    // Algumas competições expõem os turnos diretamente na fase; outras os
    // colocam em groups[]. A união evita perder placares oficiais do México.
    const fallbackPlayoffTurns = playoffsPhase
      ? [
        ...(Array.isArray((playoffsPhase as any).turns) ? (playoffsPhase as any).turns : []),
        ...(playoffsPhase.groups || []).flatMap((group) => group.turns || []),
      ]
      : []
    const playoffsTurns = playoffTurnSources.length > 0 ? playoffTurnSources : fallbackPlayoffTurns

    // Busca e mescla dados oficiais APENAS para partidas ativamente em andamento (ao vivo)
    try {
      const matchIdsToFetch = getMatchIdsNeedingUpdate(rounds)
      if (matchIdsToFetch.length > 0) {
        const officialById = await fetchOfficialMatchData(matchIdsToFetch, effectiveCompetitionId)
        rounds = mergeOfficialData(rounds, officialById)
      }
    } catch {
      // Falha ao buscar dados oficiais de jogos ao vivo não quebra o endpoint principal
    }

    return createSuccessResponse(
      { ...leagueData, rounds, playoffs: playoffsTurns },
      { cache: "SHORT", req: request }
    )
  } catch (error) {
    return createErrorResponse("Falha ao carregar dados da Kings League Brasil", error)
  }
}

export const OPTIONS = createOptionsHandler()
