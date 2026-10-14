import type { Round, Match } from "@/types/kings-league"
import { isPlayoffRoundName } from "@/lib/league-format"

export function isMatchComplete(match: Match): boolean {
  if (!match) return false
  const status = String(match.status || "").toLowerCase()
  if (status.includes("inplay") || status.includes("live") || status.includes("in_progress")) {
    return false
  }
  const hasScores = match.scores.homeScore !== null && match.scores.awayScore !== null
  const isEnded = /^(ended|finished|complete|completed|final|after[_ -]?penalties)$/.test(status)
  return hasScores || isEnded
}

export function isRoundComplete(round: Round): boolean {
  if (!round || !Array.isArray(round.matches) || round.matches.length === 0) {
    return false
  }
  return round.matches.every(isMatchComplete)
}

export function areAllRoundsComplete(rounds: Round[]): boolean {
  if (!rounds || rounds.length === 0) return false
  const regularRounds = rounds.filter((round) => {
    const name = String(round.name || "").toLowerCase()
    return /\d/.test(name) && !isPlayoffRoundName(name)
  })
  if (regularRounds.length === 0) return false
  return regularRounds.every(isRoundComplete)
}

export function getActiveRound(rounds: Round[]): Round | null {
  if (!rounds || rounds.length === 0) return null
  const regularRounds = rounds.filter((round) => {
    const name = String(round.name || "").toLowerCase()
    return /\d/.test(name) && !isPlayoffRoundName(name)
  })
  if (regularRounds.length === 0) return null
  const active = regularRounds.find((r) => !isRoundComplete(r))
  return active || null
}
