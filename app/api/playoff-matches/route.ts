import { PlayoffBracket, PlayoffMatch } from "@/types/kings-league"
import {
  kingsLeagueApi,
  createSuccessResponse,
  createErrorResponse,
  createOptionsHandler,
  type KingsLeagueRound,
  type KingsLeagueMatch,
} from "@/lib/api"

// ============================================================================
// Constantes e Tipos
// ============================================================================

type PlayoffStage = "quarterfinal" | "semifinal" | "final"

interface MatchIdInfo {
  id: string
  stage: PlayoffStage
  matchNumber: number
  order: number
  nextMatchId: string | null
  youtubeUrl?: string
}

/**
 * Mapeamento de IDs de partidas da API para o formato de playoffs
 */
const MATCH_ID_MAP: Record<string, MatchIdInfo> = {
  // Quartas de final
  "1833": {
    id: "qf1",
    stage: "quarterfinal",
    matchNumber: 1,
    order: 1,
    nextMatchId: "sf1",
    youtubeUrl: "https://www.youtube.com/watch?v=kQ0Tmk6Uf-I",
  },
  "1835": {
    id: "qf2",
    stage: "quarterfinal",
    matchNumber: 2,
    order: 2,
    nextMatchId: "sf2",
    youtubeUrl: "https://www.youtube.com/watch?v=hQUFkzpKq80",
  },
  "1834": {
    id: "qf3",
    stage: "quarterfinal",
    matchNumber: 3,
    order: 3,
    nextMatchId: "sf2",
    youtubeUrl: "https://www.youtube.com/watch?v=ZK9NiUa5MPk",
  },
  // Semifinais
  "1836": {
    id: "sf1",
    stage: "semifinal",
    matchNumber: 1,
    order: 1,
    nextMatchId: "final",
    youtubeUrl: "https://www.youtube.com/watch?v=qCzUSR_PbTM",
  },
  "1837": {
    id: "sf2",
    stage: "semifinal",
    matchNumber: 2,
    order: 2,
    nextMatchId: "final",
    youtubeUrl: "https://www.youtube.com/watch?v=Jav3G3PmXE8",
  },
  // Final
  "1840": {
    id: "final",
    stage: "final",
    matchNumber: 1,
    order: 1,
    nextMatchId: null,
    youtubeUrl: "https://www.youtube.com/watch?v=J8MzzS8_9QM",
  },
}

// ID do time classificado diretamente para semifinal (primeiro colocado)
const FIRST_PLACE_TEAM_ID = "50" // Saiyans FC

// ============================================================================
// Funções auxiliares para criar estruturas de partidas
// ============================================================================

function createEmptyPlayoffMatch(
  id: string,
  stage: PlayoffStage,
  matchNumber: number,
  order: number,
  nextMatchId: string | null
): PlayoffMatch {
  return {
    id,
    stage,
    matchNumber,
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    homeScoreP: null,
    awayScoreP: null,
    winnerId: null,
    nextMatchId,
    order,
    youtubeUrl: undefined,
  }
}

function createEmptyPlayoffBracket(): PlayoffBracket {
  return {
    quarterfinals: [
      createEmptyPlayoffMatch("qf1", "quarterfinal", 1, 1, "sf1"),
      createEmptyPlayoffMatch("qf2", "quarterfinal", 2, 2, "sf2"),
      createEmptyPlayoffMatch("qf3", "quarterfinal", 3, 3, "sf2"),
    ],
    semifinals: [
      { ...createEmptyPlayoffMatch("sf1", "semifinal", 1, 1, "final"), homeTeamId: FIRST_PLACE_TEAM_ID },
      createEmptyPlayoffMatch("sf2", "semifinal", 2, 2, "final"),
    ],
    final: createEmptyPlayoffMatch("final", "final", 1, 1, null),
  }
}

// ============================================================================
// Funções de transformação de dados
// ============================================================================

/**
 * Determina o vencedor de uma partida com base nos placares
 */
function determineWinner(match: KingsLeagueMatch): string | null {
  if (!match.scores) return null

  const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores

  if (homeScore === null || awayScore === null) return null

  if (homeScore > awayScore) {
    return match.participants.homeTeamId?.toString() || null
  }
  if (awayScore > homeScore) {
    return match.participants.awayTeamId?.toString() || null
  }

  // Em caso de empate, verificar Shootout
  if (homeScoreP !== null && awayScoreP !== null) {
    if (homeScoreP > awayScoreP) {
      return match.participants.homeTeamId?.toString() || null
    }
    if (awayScoreP > homeScoreP) {
      return match.participants.awayTeamId?.toString() || null
    }
  }

  return null
}

/**
 * Converte uma partida da API para o formato de playoffs
 */
function convertToPlayoffMatch(match: KingsLeagueMatch, info: MatchIdInfo): PlayoffMatch {
  return {
    id: info.id,
    stage: info.stage,
    matchNumber: info.matchNumber,
    homeTeamId: match.participants?.homeTeamId?.toString() || null,
    awayTeamId: match.participants?.awayTeamId?.toString() || null,
    homeScore: match.scores?.homeScore ?? null,
    awayScore: match.scores?.awayScore ?? null,
    homeScoreP: match.scores?.homeScoreP ?? null,
    awayScoreP: match.scores?.awayScoreP ?? null,
    winnerId: determineWinner(match),
    nextMatchId: info.nextMatchId,
    order: info.order,
    youtubeUrl: match.metaInformation?.youtube_url || info.youtubeUrl,
  }
}

/**
 * Atualiza as relações entre partidas do bracket (vencedores avançam)
 */
function updateBracketRelations(bracket: PlayoffBracket): void {
  // Quartas de final -> Semifinais
  for (const qf of bracket.quarterfinals) {
    if (!qf.winnerId || !qf.nextMatchId) continue

    const semifinal = bracket.semifinals.find((sf) => sf.id === qf.nextMatchId)
    if (!semifinal) continue

    if (qf.id === "qf1" && !semifinal.awayTeamId) {
      semifinal.awayTeamId = qf.winnerId
    } else if (qf.id === "qf2" && !semifinal.homeTeamId) {
      semifinal.homeTeamId = qf.winnerId
    } else if (qf.id === "qf3" && !semifinal.awayTeamId) {
      semifinal.awayTeamId = qf.winnerId
    }
  }

  // Semifinais -> Final
  for (const sf of bracket.semifinals) {
    if (!sf.winnerId || sf.nextMatchId !== "final") continue

    if (sf.id === "sf1" && !bracket.final.homeTeamId) {
      bracket.final.homeTeamId = sf.winnerId
    } else if (sf.id === "sf2" && !bracket.final.awayTeamId) {
      bracket.final.awayTeamId = sf.winnerId
    }
  }
}

/**
 * Converte dados da API de partidas para o formato de playoff bracket
 */
function convertMatchesToPlayoffBracket(matchesData: KingsLeagueRound[]): PlayoffBracket {
  const bracket = createEmptyPlayoffBracket()

  // Filtrar rodadas de playoffs
  const playoffRounds = matchesData.filter(
    (round) =>
      round.turnName === "Quartas-de-final" ||
      round.turnName === "Semifinais" ||
      round.turnName === "Final"
  )

  // Processar cada rodada
  for (const round of playoffRounds) {
    if (!Array.isArray(round.matches)) continue

    for (const match of round.matches) {
      const playoffInfo = MATCH_ID_MAP[match.id.toString()]
      if (!playoffInfo) continue

      const playoffMatch = convertToPlayoffMatch(match, playoffInfo)

      // Inserir no local correto do bracket
      if (playoffInfo.stage === "quarterfinal") {
        const index = playoffInfo.matchNumber - 1
        if (index >= 0 && index < bracket.quarterfinals.length) {
          bracket.quarterfinals[index] = playoffMatch
        }
      } else if (playoffInfo.stage === "semifinal") {
        const index = playoffInfo.matchNumber - 1
        if (index >= 0 && index < bracket.semifinals.length) {
          bracket.semifinals[index] = playoffMatch
        }
      } else if (playoffInfo.stage === "final") {
        bracket.final = playoffMatch
      }
    }
  }

  // Ordenar e atualizar relações
  bracket.quarterfinals.sort((a, b) => a.order - b.order)
  bracket.semifinals.sort((a, b) => a.order - b.order)
  updateBracketRelations(bracket)

  // Garantir que o primeiro colocado está na semifinal 1
  if (!bracket.semifinals[0].homeTeamId) {
    bracket.semifinals[0].homeTeamId = FIRST_PLACE_TEAM_ID
  }

  return bracket
}

// ============================================================================
// Funções para converter bracket em formato de turnos (compatível com API)
// ============================================================================

interface TurnMatch {
  id: number
  date: string
  seasonId: number
  phaseId: number
  groupId: number
  turnId: number
  status: string
  stadiumId: number
  currentMinute: number
  participants: {
    homeTeamId: number | null
    awayTeamId: number | null
  }
  scores: {
    homeScore: number | null
    awayScore: number | null
    homeScore1T: null
    awayScore1T: null
    homeScore2T: null
    awayScore2T: null
    homeScore3T: null
    awayScore3T: null
    homeScoreP: number | null
    awayScoreP: number | null
  }
  metaInformation: { youtube_url?: string }
  groupName: string
}

interface Turn {
  id: number
  turnName: string
  matches: TurnMatch[]
  startDate: string
  finishDate: string
  ended: boolean
}

function playoffMatchToTurnMatch(match: PlayoffMatch, turnId: number): TurnMatch {
  const apiMatchId = Object.entries(MATCH_ID_MAP).find(([, info]) => info.id === match.id)?.[0]

  return {
    id: parseInt(apiMatchId || "0"),
    date: new Date().toISOString(),
    seasonId: 35,
    phaseId: 76,
    groupId: 79,
    turnId,
    status: match.winnerId ? "ended" : "scheduled",
    stadiumId: 345,
    currentMinute: match.winnerId ? 44 : 0,
    participants: {
      homeTeamId: match.homeTeamId ? parseInt(match.homeTeamId) : null,
      awayTeamId: match.awayTeamId ? parseInt(match.awayTeamId) : null,
    },
    scores: {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homeScore1T: null,
      awayScore1T: null,
      homeScore2T: null,
      awayScore2T: null,
      homeScore3T: null,
      awayScore3T: null,
      homeScoreP: match.homeScoreP,
      awayScoreP: match.awayScoreP,
    },
    metaInformation: { youtube_url: match.youtubeUrl },
    groupName: "Playoffs",
  }
}

function convertBracketToTurns(bracket: PlayoffBracket): Turn[] {
  const result: Turn[] = []
  const now = new Date().toISOString()

  // Quartas de final
  if (bracket.quarterfinals.length > 0) {
    result.push({
      id: 361,
      turnName: "Quartas-de-final",
      matches: bracket.quarterfinals.map((m) => playoffMatchToTurnMatch(m, 361)),
      startDate: now,
      finishDate: now,
      ended: true,
    })
  }

  // Semifinais
  if (bracket.semifinals.length > 0) {
    result.push({
      id: 362,
      turnName: "Semifinais",
      matches: bracket.semifinals.map((m) => playoffMatchToTurnMatch(m, 362)),
      startDate: now,
      finishDate: now,
      ended: true,
    })
  }

  // Final
  if (bracket.final) {
    result.push({
      id: 363,
      turnName: "Final",
      matches: [playoffMatchToTurnMatch(bracket.final, 363)],
      startDate: now,
      finishDate: now,
      ended: true,
    })
  }

  return result
}

// ============================================================================
// Handlers HTTP
// ============================================================================

export async function GET() {
  try {
    const matchesData = await kingsLeagueApi.getMatchCenterData()

    if (!Array.isArray(matchesData) || matchesData.length === 0) {
      // Retorna bracket vazio se não houver dados
      const emptyBracket = createEmptyPlayoffBracket()
      return createSuccessResponse(convertBracketToTurns(emptyBracket), {
        cache: "SHORT",
        allowPost: true,
      })
    }

    const playoffBracket = convertMatchesToPlayoffBracket(matchesData)
    const turnsFormat = convertBracketToTurns(playoffBracket)

    return createSuccessResponse(turnsFormat, { cache: "SHORT", allowPost: true })
  } catch (error) {
    // Em caso de erro, retorna bracket vazio para não quebrar a UI
    try {
      const emptyBracket = createEmptyPlayoffBracket()
      return createSuccessResponse(convertBracketToTurns(emptyBracket), {
        cache: "SHORT",
        allowPost: true,
      })
    } catch {
      return createErrorResponse("Falha ao buscar jogos dos playoffs", error, {
        allowPost: true,
      })
    }
  }
}

export const OPTIONS = createOptionsHandler(true)