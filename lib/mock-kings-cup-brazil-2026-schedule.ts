import type { Match, Round, Team, TeamStanding } from "@/types/kings-league"

/**
 * Agenda temporária da Kings Cup Brazil 2026, transcrita do calendário divulgado.
 * Remover este arquivo e a integração em app/api/league-data/route.ts quando
 * a API oficial passar a fornecer os jogos da temporada 69.
 */
const KINGS_CUP_BRAZIL_SEASON_ID = "69"

const TEAM_ALIASES: Record<string, string[]> = {
  CAP: ["cap", "capim", "capim fc"],
  DDL: ["ddl", "dendele", "dendele fc"],
  DEP: ["dep", "desimpain", "desimpain fc", "desimpedidos pain", "desimpedidos"],
  DIB: ["dib", "dibrados", "dibrados fc"],
  FLX: ["flx", "fluxo", "fluxo fc", "fluxo football club"],
  FUR: ["fur", "furia", "furia fc", "fúria", "fúria fc"],
  G3X: ["g3x", "g3x fc", "g3x fc brasil", "generation x brasil"],
  LSC: ["lsc", "loud", "loud sc", "loud sports club"],
  NYV: ["nyv", "nyvelados", "nyvelados fc", "nivelados", "nivelados fc"],
  FNK: ["fnk", "funkbol", "podpah", "podpah fc", "podpah funkbol", "podpah funkbol clube"],
}

export const KINGS_CUP_BRAZIL_GROUPS = {
  A: ["LSC", "DIB", "FLX", "FUR", "FNK"],
  B: ["DDL", "G3X", "CAP", "DEP", "NYV"],
} as const

// Dados de fallback para resolução caso a API externa ainda não tenha retornado a lista completa
const FALLBACK_TEAMS: Record<string, Partial<Team>> = {
  G3X: { id: "49", name: "G3X FC", shortName: "G3X", completeName: "G3X FC" },
  FUR: { id: "50", name: "Furia FC", shortName: "FUR", completeName: "Furia FC" },
  FLX: { id: "160", name: "Fluxo FC", shortName: "FLX", completeName: "Fluxo FC" },
  DDL: { id: "161", name: "Dendele FC", shortName: "DDL", completeName: "Dendele FC" },
  LSC: { id: "162", name: "LOUD SC", shortName: "LSC", completeName: "LOUD SC" },
  NYV: { id: "163", name: "Nyvelados FC", shortName: "NYV", completeName: "Nyvelados FC" },
  FNK: { id: "164", name: "Podpah Funkbol Clube", shortName: "FNK", completeName: "Podpah Funkbol Clube" },
  CAP: { id: "167", name: "Capim FC", shortName: "CAP", completeName: "Capim FC" },
  DEP: { id: "168", name: "DesimpaiN", shortName: "DEP", completeName: "DesimpaiN" },
  DIB: { id: "220", name: "Dibrados FC", shortName: "DIB", completeName: "Dibrados FC" },
}

// Cada linha segue a ordem dos horários publicados: 17h, 18h, 19h, 20h e 21h.
// [homeCode, awayCode, groupName]
const SCHEDULE = [
  // Jogos rodada 1 - 19/10
  // podpah x nivelados 17h - jogo Challenger
  // desinpain x capim 18h
  // fluxo x fúria 19h
  // dibrados x loud 20h
  // dendele x g3x 21h
  {
    date: "2026-10-19",
    fixtures: [
      ["FNK", "NYV", "Challenger"],
      ["DEP", "CAP", "B"],
      ["FLX", "FUR", "A"],
      ["DIB", "LSC", "A"],
      ["DDL", "G3X", "B"],
    ],
  },
  // rodada 2 26/10
  // dendele x capim 17h
  // nyvelados x g3x 18h
  // dibrados x podpah 19h
  // loud x fluxo 20h
  // fúria x desinpain 21h - jogo Challenger
  {
    date: "2026-10-26",
    fixtures: [
      ["DDL", "CAP", "B"],
      ["NYV", "G3X", "B"],
      ["DIB", "FNK", "A"],
      ["LSC", "FLX", "A"],
      ["FUR", "DEP", "Challenger"],
    ],
  },
  // rodada 3 02/11
  // fluxo x podpah 17h
  // loud x fúria 18h
  // desinpain x dendele 19h
  // capim x nyvelados 20h
  // g3x x dibrados 21h - jogo Challenger
  {
    date: "2026-11-02",
    fixtures: [
      ["FLX", "FNK", "A"],
      ["LSC", "FUR", "A"],
      ["DEP", "DDL", "B"],
      ["CAP", "NYV", "B"],
      ["G3X", "DIB", "Challenger"],
    ],
  },
  // rodada 4 09/11
  // nyvelados x dendele 17h
  // g3x x desinpain 18h
  // capim x fluxo 19h - jogo Challenger
  // podpah x loud 20h
  // fúria x dibrados 21h
  {
    date: "2026-11-09",
    fixtures: [
      ["NYV", "DDL", "B"],
      ["G3X", "DEP", "B"],
      ["CAP", "FLX", "Challenger"],
      ["FNK", "LSC", "A"],
      ["FUR", "DIB", "A"],
    ],
  },
  // rodada 5 16/11
  // dibrados x fluxo 17
  // desinpain x nyvelados 18h
  // fúria x podpah 19h
  // g3x x capim 20h
  // dendele x loud 21h - jogo Challenger
  {
    date: "2026-11-16",
    fixtures: [
      ["DIB", "FLX", "A"],
      ["DEP", "NYV", "B"],
      ["FUR", "FNK", "A"],
      ["G3X", "CAP", "B"],
      ["DDL", "LSC", "Challenger"],
    ],
  },
] as const

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function resolveTeams(teams: Team[]): Record<string, Team> | null {
  const resolved: Record<string, Team> = {}

  for (const [code, aliases] of Object.entries(TEAM_ALIASES)) {
    const normalizedAliases = aliases.map(normalize)
    const team = teams.find((candidate) => {
      const identifiers = [candidate.shortName, candidate.name, candidate.completeName]
        .filter(Boolean)
        .map((value) => normalize(value!))
      return identifiers.some((identifier) => normalizedAliases.includes(identifier))
    })

    if (team) {
      resolved[code] = team
    } else if (FALLBACK_TEAMS[code]) {
      resolved[code] = {
        id: String(FALLBACK_TEAMS[code].id),
        name: FALLBACK_TEAMS[code].name || code,
        shortName: FALLBACK_TEAMS[code].shortName || code,
        completeName: FALLBACK_TEAMS[code].completeName,
        countryId: 0,
        firstColorHEX: "#cccccc",
        secondColorHEX: "#333333",
        logo: { url: "" },
        gender: "male",
      }
    } else {
      return null
    }
  }

  return resolved
}

function createScheduledMatch(
  roundNumber: number,
  slot: number,
  date: string,
  homeTeam: Team,
  awayTeam: Team,
  groupName: string
): Match {
  const kickoffHour = String(17 + slot).padStart(2, "0")
  return {
    id: 690000 + roundNumber * 10 + slot,
    date: `${date}T${kickoffHour}:00:00-03:00`,
    status: "scheduled",
    participants: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
    },
    scores: {
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
    },
    groupName,
  }
}

export function getKingsCupBrazil2026MockRounds(
  seasonId: string,
  teams: Team[]
): Round[] | null {
  if (seasonId !== KINGS_CUP_BRAZIL_SEASON_ID) return null

  const teamsByCode = resolveTeams(teams)
  if (!teamsByCode) return null

  return SCHEDULE.map(({ date, fixtures }, index) => {
    const roundNumber = index + 1
    const matches = fixtures.map(([homeCode, awayCode, groupName], slot) =>
      createScheduledMatch(
        roundNumber,
        slot,
        date,
        teamsByCode[homeCode],
        teamsByCode[awayCode],
        groupName
      )
    )

    return {
      id: 69000 + roundNumber,
      name: `Rodada ${roundNumber}`,
      ended: false,
      startDate: matches[0].date,
      finishDate: matches[matches.length - 1].date,
      matches,
    }
  })
}

export function getKingsCupBrazil2026MockStandings(
  seasonId: string,
  teams: Team[]
): TeamStanding[] | null {
  if (seasonId !== KINGS_CUP_BRAZIL_SEASON_ID) return null

  const teamsByCode = resolveTeams(teams)
  if (!teamsByCode) return null

  const standings: TeamStanding[] = []

  for (const [groupName, codes] of Object.entries(KINGS_CUP_BRAZIL_GROUPS)) {
    codes.forEach((code, index) => {
      const team = teamsByCode[code]
      if (team) {
        standings.push({
          id: String(team.id),
          name: team.name,
          shortName: team.shortName,
          logo: team.logo,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          rank: index + 1,
          positionLegend: null,
          groupName,
        })
      }
    })
  }

  return standings
}
