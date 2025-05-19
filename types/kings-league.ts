// Tipos para a API da Kings League

export interface LeagueData {
  id: number
  name: string
  displayName: string
  teams: Team[]
  standings: TeamStanding[]
  rounds: Round[]
}

export interface Team {
  id: string
  name: string
  shortName: string
  completeName?: string
  countryId: number
  firstColorHEX: string
  secondColorHEX: string
  logo: {
    url: string
  }
  gender: string
  metaInformation?: {
    tiktok_url?: string
    twitch_url?: string
    youtube_url?: string
    flag_team_url?: string
    instagram_url?: string
    wildcard_kwcc?: string
    loop_video_poster?: string
  }
}

export interface TeamStanding {
  id: string
  name: string
  shortName: string
  logo: {
    url: string
  }
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  positionLegend: string
  rank: number
}

export interface Round {
  id: number
  name: string
  ended: boolean
  startDate: string
  finishDate: string
  matches: Match[]
}

export interface Match {
  id: number
  date: string
  status: string
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
    awayScore3T: number | null
    homeScoreP: number | null
    awayScoreP: number | null
  }
  metaInformation?: {
    youtube_url?: string
  }
}

export interface TeamDetails extends Team {
  staff: StaffMember[]
  players: Player[]
  currentSeasons?: {
    id: number
    competitionId: number
    name: string
    displayName: string
    start: string
    finish: string
    finished: boolean
    image: {
      url: string
    }
    isCurrent: boolean
    metaInformation?: Record<string, string>
    winnerTeamId?: number | null
  }[]
}

export interface StaffMember {
  id: number
  shortName: string
  firstName: string
  lastName: string
  middleName?: string | null
  role: string
  countryId: number
  image?: {
    url: string
  }
  gender: string | null
  birthDate?: string | null
  metaInformation?: Record<string, string> | null
}

export interface PlayerStats {
  rankings?: PlayerRanking[]
  matchesPlayed?: number
  goalsScored?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  mvps?: number
}

export interface PlayerRanking {
  parameter: {
    code: string
    name: string
    description: string
    shortName: string | null
    measureUnit: string | null
    negative?: boolean
  }
  statsId: string
  total: number
  totalAvg: number
  totalAVG: number
  kamaScore: number | null
  minutesPlayed: number
  matchesPlayed: number
  reliability: number | null
  ranking: number
  rankingAVG: number
  bestValue: number
  worstValue: number
}

export interface Player {
  id: number
  shortName: string
  role: "goalkeeper" | "defender" | "midfielder" | "forward"
  gender: string
  countryId: number
  jersey: string
  birthDate: string
  height: number
  image?: {
    url: string
  }
  metaInformation?: {
    duels?: string
    skills?: string
    average?: string
    defence?: string
    passing?: string
    physical?: string
    shooting?: string
    matchLink?: string
    videoLink?: string
    diving?: string
    handling?: string
    reflexes?: string
    anticipation?: string
    goalkeeperPassing?: string
    status?: string
    jerseyNumber?: string
  } | null
  category?: "wildcard" | "draft" | null
  stats?: PlayerStats
}

// Tipos para os playoffs
export interface PlayoffMatch {
  id: string;
  stage: 'quarterfinal' | 'semifinal' | 'final';
  matchNumber: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeScoreP: number | null;
  awayScoreP: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
  order: number;
  youtubeUrl?: string; // URL para assistir a partida no YouTube
}

export interface PlayoffBracket {
  quarterfinals: PlayoffMatch[];
  semifinals: PlayoffMatch[];
  final: PlayoffMatch | undefined;
}
