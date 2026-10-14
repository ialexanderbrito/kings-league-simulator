export interface LeagueQualification {
  playoffEnd: number
  playInStart?: number
  playInEnd?: number
  groupFormat?: "brazil" | "lastChance"
}

const PLAY_IN_LEAGUES = new Set(["spain", "italy", "mexico"])
const LAST_CHANCE_GROUP_LEAGUES = new Set(["spain", "italy", "germany"])

const PLAYOFF_ROUND_PATTERN = /play[\s-]?in|playoffs?|quartas|cuartos|quarter[\s-]?finals?|semifinais|semifinal(?:es)?|semi[\s-]?finals?|finais|finals?|repescagem|last\s*chance/i

export function isPlayoffRoundName(value: unknown): boolean {
  return PLAYOFF_ROUND_PATTERN.test(String(value ?? "").trim())
}

export function getLeagueQualification(leagueId: string): LeagueQualification {
  if (PLAY_IN_LEAGUES.has(leagueId)) {
    return {
      playoffEnd: 6,
      playInStart: 7,
      playInEnd: 10,
      groupFormat: LAST_CHANCE_GROUP_LEAGUES.has(leagueId) ? "lastChance" : "brazil",
    }
  }

  if (LAST_CHANCE_GROUP_LEAGUES.has(leagueId)) {
    return { playoffEnd: 7, groupFormat: "lastChance" }
  }

  return { playoffEnd: 7, groupFormat: leagueId === "brazil" || leagueId === "mexico" ? "brazil" : undefined }
}
