export interface LeagueQualification {
  playoffEnd: number
  playInStart?: number
  playInEnd?: number
  groupFormat?: "brazil" | "lastChance"
}

const PLAY_IN_LEAGUES = new Set(["spain"])
const LAST_CHANCE_GROUP_LEAGUES = new Set(["italy"])

const PLAYOFF_ROUND_PATTERN = /play[\s-]?in|playoffs?|quartas|cuartos|quarter[\s-]?finals?|semifinais|semifinal(?:es)?|semi[\s-]?finals?|finais|finals?|repescagem|last\s*chance/i

export function isPlayoffRoundName(value: unknown): boolean {
  return PLAYOFF_ROUND_PATTERN.test(String(value ?? "").trim())
}

/**
 * Identifica se uma partida é do formato Challenger (inter-grupos na Kings Cup).
 * Partidas Challenger NÃO pontuam na tabela dos times nem alteram V-D ou saldo de gols;
 * servem apenas para definir a vantagem do grupo para vaga direta na semifinal.
 */
export function isChallengerMatch(
  match: {
    groupName?: string
    participants?: { homeTeamId: string; awayTeamId: string }
  },
  round?: { name?: string },
  teamGroupMap?: Record<string, string>,
  hasTwoGroups = true
): boolean {
  if (!hasTwoGroups || !match) return false

  const gName = (match.groupName || "").toLowerCase().trim()
  if (gName === "challenger" || gName.includes("challenger")) return true

  const rName = (round?.name || "").toLowerCase().trim()
  if (rName.includes("challenger") || rName.includes("supercopa")) return true

  if (teamGroupMap && match.participants) {
    const homeGroup = teamGroupMap[match.participants.homeTeamId]
    const awayGroup = teamGroupMap[match.participants.awayTeamId]
    if (
      homeGroup &&
      awayGroup &&
      homeGroup !== awayGroup &&
      (homeGroup === "A" || homeGroup === "B") &&
      (awayGroup === "A" || awayGroup === "B")
    ) {
      return true
    }
  }

  return false
}

export function getLeagueQualification(leagueId: string): LeagueQualification {
  if (leagueId === "italy" || LAST_CHANCE_GROUP_LEAGUES.has(leagueId)) {
    return { playoffEnd: 4, groupFormat: "lastChance" }
  }

  if (PLAY_IN_LEAGUES.has(leagueId)) {
    return {
      playoffEnd: 6,
      playInStart: 7,
      playInEnd: 10,
    }
  }

  return { playoffEnd: 7, groupFormat: leagueId === "brazil" || leagueId === "mexico" ? "brazil" : undefined }
}

/**
 * Formata e traduz o nome da rodada para o idioma ativo (ex: "Matchday 1" -> "Rodada 1" ou "Jornada 1")
 */
export function formatRoundName(
  name: string | undefined | null,
  roundPrefix: string,
  fallbackId?: number | string
): string {
  const cleanName = String(name || "").trim()
  if (!cleanName) {
    return fallbackId !== undefined && fallbackId !== null ? `${roundPrefix} ${fallbackId}` : ""
  }

  // Se for uma rodada de mata-mata/playoff específica sem número regular (ex: "Semifinais")
  if (isPlayoffRoundName(cleanName) && !/(?:matchday|jornada|rodada|round|r)\s*\d+/i.test(cleanName)) {
    return cleanName
  }

  // Se contiver número de rodada (ex: "Matchday 1", "Jornada 2", "Rodada 3", "Round 4", "R5", "1")
  const match = cleanName.match(/(?:matchday|jornada|rodada|round|r)?\s*(\d+)/i)
  if (match && match[1]) {
    return `${roundPrefix} ${match[1]}`
  }

  // Fallback com substituição de palavras-chave
  return cleanName.replace(/(?:matchday|jornada|rodada|round)\s*/gi, `${roundPrefix} `)
}
