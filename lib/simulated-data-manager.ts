import { TeamStanding, Round, Team } from "@/types/kings-league";

// Chaves para armazenamento no localStorage
const SIMULATED_STANDINGS_KEY = '@kl-simulador:standings';
const SIMULATED_ROUNDS_KEY = '@kl-simulador:rounds';
const SIMULATED_TEAMS_KEY = '@kl-simulador:teams';

/**
 * Salva a classificação simulada no localStorage
 */
export function saveSimulatedStandings(standings: TeamStanding[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_STANDINGS_KEY, JSON.stringify(standings));
}

/**
 * Obtém a classificação simulada do localStorage
 */
export function getSimulatedStandings(): TeamStanding[] | null {
  if (typeof window === 'undefined') return null;
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
export function saveSimulatedRounds(rounds: Round[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_ROUNDS_KEY, JSON.stringify(rounds));
}

/**
 * Obtém as rodadas simuladas do localStorage
 */
export function getSimulatedRounds(): Round[] | null {
  if (typeof window === 'undefined') return null;
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
export function saveSimulatedTeams(teams: Record<string, Team>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_TEAMS_KEY, JSON.stringify(teams));
}

/**
 * Obtém os times do localStorage
 */
export function getSimulatedTeams(): Record<string, Team> | null {
  if (typeof window === 'undefined') return null;
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
}

/**
 * Verifica se existem dados simulados
 */
export function hasSimulatedData(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(SIMULATED_STANDINGS_KEY);
}