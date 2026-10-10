import { calculateStandings } from "@/lib/calculate-standings"
import type {
  Match,
  Round,
  ScenarioMetrics,
  ScenarioPreset,
  Team,
  TeamStanding,
} from "@/types/kings-league"

interface UpcomingTeamMatch {
  roundId: number
  matchId: number
  match: Match
}

const EMPTY_SCORES = {
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

export function isUpcomingMatch(match: Match): boolean {
  return match.scores.homeScore === null || match.scores.awayScore === null
}

export function getUpcomingMatchesForTeam(rounds: Round[], teamId: string): UpcomingTeamMatch[] {
  const matches: UpcomingTeamMatch[] = []

  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      const isTeamMatch =
        match.participants.homeTeamId === teamId || match.participants.awayTeamId === teamId

      if (!isTeamMatch || !isUpcomingMatch(match)) {
        return
      }

      matches.push({
        roundId: round.id,
        matchId: match.id,
        match,
      })
    })
  })

  return matches
}

function buildMatchKey(roundId: number, matchId: number): string {
  return `${roundId}-${matchId}`
}

function buildBaselineLookup(rounds: Round[]): Record<string, Match> {
  const lookup: Record<string, Match> = {}

  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      lookup[buildMatchKey(round.id, match.id)] = match
    })
  })

  return lookup
}

function applyPresetScores(match: Match, teamId: string, preset: ScenarioPreset): Match["scores"] {
  const isTeamHome = match.participants.homeTeamId === teamId

  if (preset === "win-all") {
    return {
      ...match.scores,
      homeScore: isTeamHome ? 1 : 0,
      awayScore: isTeamHome ? 0 : 1,
      homeScoreP: null,
      awayScoreP: null,
    }
  }

  if (preset === "lose-all") {
    return {
      ...match.scores,
      homeScore: isTeamHome ? 0 : 1,
      awayScore: isTeamHome ? 1 : 0,
      homeScoreP: null,
      awayScoreP: null,
    }
  }

  if (preset === "draw-win-shootout") {
    return {
      ...match.scores,
      homeScore: 0,
      awayScore: 0,
      homeScoreP: isTeamHome ? 5 : 3,
      awayScoreP: isTeamHome ? 3 : 5,
    }
  }

  if (preset === "draw-lose-shootout") {
    return {
      ...match.scores,
      homeScore: 0,
      awayScore: 0,
      homeScoreP: isTeamHome ? 3 : 5,
      awayScoreP: isTeamHome ? 5 : 3,
    }
  }

  return match.scores
}

export function applyTeamPresetToRounds(
  rounds: Round[],
  baselineRounds: Round[],
  teamId: string,
  preset: ScenarioPreset,
): Round[] {
  const baselineLookup = buildBaselineLookup(baselineRounds)

  return rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) => {
      const isTeamMatch =
        match.participants.homeTeamId === teamId || match.participants.awayTeamId === teamId

      if (!isTeamMatch || !isUpcomingMatch(match)) {
        return match
      }

      if (preset === "clear-team-games") {
        const baselineMatch = baselineLookup[buildMatchKey(round.id, match.id)]

        return {
          ...match,
          scores: baselineMatch?.scores
            ? { ...baselineMatch.scores }
            : {
                ...EMPTY_SCORES,
              },
        }
      }

      return {
        ...match,
        scores: applyPresetScores(match, teamId, preset),
      }
    }),
  }))
}

function parseScore(value: string | number | null): number | null {
  if (value === null) return null
  if (typeof value === "number") return Number.isNaN(value) ? null : value

  const normalized = value.trim()
  if (normalized === "") return null

  const numeric = Number(normalized)
  return Number.isNaN(numeric) ? null : numeric
}

export function updateScenarioMatchScore(
  rounds: Round[],
  roundId: number,
  matchId: number,
  homeScore: string | number | null,
  awayScore: string | number | null,
  shootoutWinner: "home" | "away" | null,
): Round[] {
  const parsedHome = parseScore(homeScore)
  const parsedAway = parseScore(awayScore)

  const shouldApplyShootout = parsedHome !== null && parsedAway !== null && parsedHome === parsedAway && !!shootoutWinner

  return rounds.map((round) => {
    if (round.id !== roundId) {
      return round
    }

    return {
      ...round,
      matches: round.matches.map((match) => {
        if (match.id !== matchId) {
          return match
        }

        return {
          ...match,
          scores: {
            ...match.scores,
            homeScore: parsedHome,
            awayScore: parsedAway,
            homeScoreP: shouldApplyShootout ? (shootoutWinner === "home" ? 5 : 3) : null,
            awayScoreP: shouldApplyShootout ? (shootoutWinner === "away" ? 5 : 3) : null,
          },
        }
      }),
    }
  })
}

export function calculateScenarioStandings(
  rounds: Round[],
  teams: Record<string, Team>,
  initialStandings: TeamStanding[],
): TeamStanding[] {
  const grouped = calculateStandings(rounds, teams, initialStandings)

  const flattened = Object.entries(grouped).flatMap(([groupName, standings]) =>
    standings.map((team) => ({
      ...team,
      groupName: team.groupName || groupName,
    })),
  )

  const seenIds = new Set<string>()
  return flattened.filter((standing) => {
    if (seenIds.has(standing.id)) return false
    seenIds.add(standing.id)
    return true
  })
}

export function getScenarioMetricsForTeam(
  standings: TeamStanding[],
  teamId: string,
): ScenarioMetrics | null {
  const team = standings.find((standing) => standing.id === teamId)

  if (!team) {
    return null
  }

  return {
    rank: team.rank,
    points: team.points,
    won: team.won,
    lost: team.lost,
    goalDifference: team.goalDifference,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
  }
}
