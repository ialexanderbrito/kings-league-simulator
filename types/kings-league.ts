export interface Team {
  id: string
  name: string
  shortName: string
  completeName?: string
  countryId?: number
  firstColorHEX: string
  secondColorHEX: string
  logo: {
    url: string
  } | null
  gender?: string
}

export interface Match {
  id: number
  date: string
  status: string | null
  participants: {
    homeTeamId: string
    awayTeamId: string
  }
  scores: {
    homeScore: number | null
    awayScore: number | null
    homeScore1T: number | null
    awayScore1T: number | null
    homeScore2T: number | null
    awayScore2T: number | null
    homeScore3T: number | null
    awayScore3T: null
    homeScoreP: number | null
    awayScoreP: number | null
  }
  metaInformation?: {
    youtube_url?: string
    [key: string]: any
  }
}

export interface Round {
  id: number
  name: string
  ended: boolean
  startDate?: string
  finishDate?: string
  matches: Match[]
}

export interface TeamStanding {
  id: string
  name: string
  shortName: string
  logo: {
    url: string
  } | null
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  positionLegend: {
    color: string
    placement: string
  } | null
  rank?: number
}

export interface LeagueData {
  id: number
  name: string
  displayName: string
  teams: Team[]
  standings: TeamStanding[]
  rounds: Round[]
}
