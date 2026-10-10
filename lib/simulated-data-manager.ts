import { TeamStanding, Round, Team, PlayoffBracket } from "@/types/kings-league";

// Chaves para armazenamento no localStorage
const SIMULATED_STANDINGS_KEY = '@kl-simulador:standings';
const SIMULATED_ROUNDS_KEY = '@kl-simulador:rounds';
const SIMULATED_TEAMS_KEY = '@kl-simulador:teams';
const SIMULATED_PLAYOFFS_KEY = '@kl-simulador:playoffs';
const SIMULATED_SEASON_KEY = '@kl-simulador:season_id';

/**
 * Salva o ID da temporada simulada
 */
export function saveSimulatedSeasonId(seasonId: number | string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_SEASON_KEY, String(seasonId));
}

/**
 * Obtém o ID da temporada simulada
 */
export function getSimulatedSeasonId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SIMULATED_SEASON_KEY);
}

/**
 * Salva a classificação simulada no localStorage
 */
export function saveSimulatedStandings(standings: TeamStanding[], seasonId?: number | string): void {
  if (typeof window === 'undefined') return;
  if (seasonId) localStorage.setItem(SIMULATED_SEASON_KEY, String(seasonId));
  localStorage.setItem(SIMULATED_STANDINGS_KEY, JSON.stringify(standings));
}

/**
 * Obtém a classificação simulada do localStorage
 */
export function getSimulatedStandings(expectedSeasonId?: number | string): TeamStanding[] | null {
  if (typeof window === 'undefined') return null;
  if (expectedSeasonId) {
    const savedSeason = localStorage.getItem(SIMULATED_SEASON_KEY);
    if (savedSeason && String(savedSeason) !== String(expectedSeasonId)) {
      clearSimulatedData();
      return null;
    }
  }
  const data = localStorage.getItem(SIMULATED_STANDINGS_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar classificação simulada:', error);
    return null;
  }
}

/**
 * Salva as rodadas simuladas no localStorage
 */
export function saveSimulatedRounds(rounds: Round[], seasonId?: number | string): void {
  if (typeof window === 'undefined') return;
  if (seasonId) localStorage.setItem(SIMULATED_SEASON_KEY, String(seasonId));
  localStorage.setItem(SIMULATED_ROUNDS_KEY, JSON.stringify(rounds));
}

/**
 * Obtém as rodadas simuladas do localStorage
 */
export function getSimulatedRounds(expectedSeasonId?: number | string): Round[] | null {
  if (typeof window === 'undefined') return null;
  if (expectedSeasonId) {
    const savedSeason = localStorage.getItem(SIMULATED_SEASON_KEY);
    if (savedSeason && String(savedSeason) !== String(expectedSeasonId)) {
      clearSimulatedData();
      return null;
    }
  }
  const data = localStorage.getItem(SIMULATED_ROUNDS_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar rodadas simuladas:', error);
    return null;
  }
}

/**
 * Salva os times no localStorage
 */
export function saveSimulatedTeams(teams: Record<string, Team>, seasonId?: number | string): void {
  if (typeof window === 'undefined') return;
  if (seasonId) localStorage.setItem(SIMULATED_SEASON_KEY, String(seasonId));
  localStorage.setItem(SIMULATED_TEAMS_KEY, JSON.stringify(teams));
}

/**
 * Obtém os times do localStorage
 */
export function getSimulatedTeams(expectedSeasonId?: number | string): Record<string, Team> | null {
  if (typeof window === 'undefined') return null;
  if (expectedSeasonId) {
    const savedSeason = localStorage.getItem(SIMULATED_SEASON_KEY);
    if (savedSeason && String(savedSeason) !== String(expectedSeasonId)) {
      clearSimulatedData();
      return null;
    }
  }
  const data = localStorage.getItem(SIMULATED_TEAMS_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar times simulados:', error);
    return null;
  }
}

/**
 * Limpa todos os dados simulados
 */
export function clearSimulatedData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SIMULATED_STANDINGS_KEY);
  localStorage.removeItem(SIMULATED_ROUNDS_KEY);
  localStorage.removeItem(SIMULATED_TEAMS_KEY);
  localStorage.removeItem(SIMULATED_PLAYOFFS_KEY);
  localStorage.removeItem(SIMULATED_SEASON_KEY);
}

/**
 * Verifica se existem dados simulados
 */
export function hasSimulatedData(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(SIMULATED_STANDINGS_KEY);
}

/**
 * Salva o chaveamento dos playoffs simulados no localStorage
 */
export function saveSimulatedPlayoffs(bracket: PlayoffBracket): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_PLAYOFFS_KEY, JSON.stringify(bracket));
}

/**
 * Obtém o chaveamento dos playoffs simulados do localStorage
 */
export function getSimulatedPlayoffs(): PlayoffBracket | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SIMULATED_PLAYOFFS_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar playoffs simulados:', error);
    return null;
  }
}

/**
 * Verifica se existem dados de playoffs simulados
 */
export function hasSimulatedPlayoffs(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(SIMULATED_PLAYOFFS_KEY);
}