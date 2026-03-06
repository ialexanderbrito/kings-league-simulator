import type { Round } from '@/types/kings-league'

const TEAM_NAME_TO_ID: Record<string, string> = {
  'DesimpaiN': '168',
  'Furia FC': '50',
  'Fluxo FC': '160',
  'Nyvelados': '163',
  'Podpah Funkbol Clube': '164',
  'G3X': '49',
  'Capim FC': '167',
  'Dibrados': '220',
  'Dendele': '161',
  'LOUD SC': '162',
}

/**
 * Rodada 2 (MD2) - Matches pendentes
 */
const ROUND_2: Round = {
  id: 548,
  name: 'Rodada 2',
  ended: false,
  startDate: '2026-03-16T20:00:00.000Z',
  finishDate: '',
  matches: [
    {
      id: 5001,
      date: '2026-03-16T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['DesimpaiN'],
        awayTeamId: TEAM_NAME_TO_ID['Furia FC'],
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
    },
    {
      id: 5002,
      date: '2026-03-16T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Fluxo FC'],
        awayTeamId: TEAM_NAME_TO_ID['Nyvelados'],
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
    },
    {
      id: 5003,
      date: '2026-03-16T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Podpah Funkbol Clube'],
        awayTeamId: TEAM_NAME_TO_ID['G3X'],
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
    },
    {
      id: 5004,
      date: '2026-03-16T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Capim FC'],
        awayTeamId: TEAM_NAME_TO_ID['Dibrados'],
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
    },
    {
      id: 5005,
      date: '2026-03-16T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Dendele'],
        awayTeamId: TEAM_NAME_TO_ID['LOUD SC'],
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
    },
  ],
}

/**
 * Rodada 3 (MD3) - Matches pendentes
 */
const ROUND_3: Round = {
  id: 549,
  name: 'Rodada 3',
  ended: false,
  startDate: '2026-03-23T20:00:00.000Z',
  finishDate: '',
  matches: [
    {
      id: 5006,
      date: '2026-03-23T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['G3X'],
        awayTeamId: TEAM_NAME_TO_ID['Dibrados'],
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
    },
    {
      id: 5007,
      date: '2026-03-23T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Nyvelados'],
        awayTeamId: TEAM_NAME_TO_ID['LOUD SC'],
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
    },
    {
      id: 5008,
      date: '2026-03-23T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Fluxo FC'],
        awayTeamId: TEAM_NAME_TO_ID['DesimpaiN'],
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
    },
    {
      id: 5009,
      date: '2026-03-23T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Furia FC'],
        awayTeamId: TEAM_NAME_TO_ID['Podpah Funkbol Clube'],
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
    },
    {
      id: 5010,
      date: '2026-03-23T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Capim FC'],
        awayTeamId: TEAM_NAME_TO_ID['Dendele'],
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
    },
  ],
}

/**
 * Rodada 4 (MD4) - Matches pendentes
 */
const ROUND_4: Round = {
  id: 550,
  name: 'Rodada 4',
  ended: false,
  startDate: '2026-03-30T20:00:00.000Z',
  finishDate: '',
  matches: [
    {
      id: 5011,
      date: '2026-03-30T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['DesimpaiN'],
        awayTeamId: TEAM_NAME_TO_ID['LOUD SC'],
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
    },
    {
      id: 5012,
      date: '2026-03-30T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Podpah Funkbol Clube'],
        awayTeamId: TEAM_NAME_TO_ID['Dibrados'],
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
    },
    {
      id: 5013,
      date: '2026-03-30T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Dendele'],
        awayTeamId: TEAM_NAME_TO_ID['Nyvelados'],
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
    },
    {
      id: 5014,
      date: '2026-03-30T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['Fluxo FC'],
        awayTeamId: TEAM_NAME_TO_ID['Capim FC'],
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
    },
    {
      id: 5015,
      date: '2026-03-30T20:00:00.000Z',
      status: 'not_started',
      participants: {
        homeTeamId: TEAM_NAME_TO_ID['G3X'],
        awayTeamId: TEAM_NAME_TO_ID['Furia FC'],
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
    },
  ],
}

/**
 * Retorna as rodadas pendentes que devem ser mergeadas com os dados oficiais
 */
export function getPendingRounds(): Round[] {
  return [ROUND_2, ROUND_3, ROUND_4]
}

/**
 * Verifica se uma rodada é uma rodada pendente
 */
export function isPendingRound(roundId: number): boolean {
  return roundId >= 2 && roundId <= 4
}

/**
 * Obtém uma rodada pendente específica por ID
 */
export function getPendingRoundById(roundId: number): Round | undefined {
  const rounds = getPendingRounds()
  return rounds.find(r => r.id === roundId)
}
