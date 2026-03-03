import { TierListData, TierListState, TierItem } from "@/types/kings-league";
import LZString from "lz-string";

// Chave para armazenamento no localStorage
const TIER_LIST_KEY = '@kl-simulador:tierList';

// Configuração padrão das tiers
export const DEFAULT_TIERS: TierItem[] = [
  {
    id: 'tier-1',
    name: 'Campeão',
    color: '#FFD700', // Dourado
    teams: []
  },
  {
    id: 'tier-2',
    name: 'Semifinal',
    color: '#C0C0C0', // Prata
    teams: []
  },
  {
    id: 'tier-3',
    name: 'Playoffs',
    color: '#CD7F32', // Bronze
    teams: []
  },
  {
    id: 'tier-4',
    name: 'Pode Surpreender',
    color: '#4CAF50', // Verde
    teams: []
  },
  {
    id: 'tier-5',
    name: 'Pior Campanha',
    color: '#F44336', // Vermelho
    teams: []
  }
];

/**
 * Salva a tier list no localStorage
 */
export function saveTierList(data: TierListData): void {
  if (typeof window === 'undefined') return;
  
  const stateWithTimestamp: TierListState = {
    ...data,
    timestamp: Date.now()
  };
  
  localStorage.setItem(TIER_LIST_KEY, JSON.stringify(stateWithTimestamp));
}

/**
 * Obtém a tier list do localStorage
 */
export function getTierList(): TierListState | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(TIER_LIST_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar tier list:', error);
    return null;
  }
}

/**
 * Limpa a tier list do localStorage
 */
export function clearTierList(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TIER_LIST_KEY);
}

/**
 * Verifica se existe uma tier list salva
 */
export function hasSavedTierList(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(TIER_LIST_KEY);
}

/**
 * Codifica a tier list para uma string comprimida para URL
 */
export function encodeTierListToURL(data: TierListData): string {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
  } catch (error) {
    console.error('Erro ao codificar tier list:', error);
    return '';
  }
}

/**
 * Decodifica a tier list de uma string comprimida da URL
 */
export function decodeTierListFromURL(hash: string): TierListData | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;
    
    const data = JSON.parse(decompressed) as TierListData;
    
    // Validação básica
    if (!data.tiers || !Array.isArray(data.tiers)) return null;
    if (!data.unassigned || !Array.isArray(data.unassigned)) return null;
    
    return data;
  } catch (error) {
    console.error('Erro ao decodificar tier list:', error);
    return null;
  }
}

/**
 * Gera uma nova tier com valores padrão
 */
export function createNewTier(id: string, index: number): TierItem {
  const defaultColors = [
    '#9C27B0', // Roxo
    '#2196F3', // Azul
    '#FF9800', // Laranja
    '#00BCD4', // Ciano
    '#E91E63', // Rosa
    '#795548', // Marrom
    '#607D8B', // Cinza-azulado
  ];
  
  return {
    id,
    name: `Tier ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
    color: defaultColors[index % defaultColors.length],
    teams: []
  };
}

/**
 * Obtém tier list inicial com tiers padrão e todos os times não atribuídos
 */
export function getInitialTierListData(allTeamIds: string[]): TierListData {
  return {
    tiers: DEFAULT_TIERS,
    unassigned: allTeamIds
  };
}

/**
 * Move um time entre tiers ou para/da área de não atribuídos
 */
export function moveTeam(
  data: TierListData,
  teamId: string,
  fromTierId: string | 'unassigned',
  toTierId: string | 'unassigned'
): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  
  // Remove do local de origem
  if (fromTierId === 'unassigned') {
    newData.unassigned = newData.unassigned.filter(id => id !== teamId);
  } else {
    const fromTier = newData.tiers.find(t => t.id === fromTierId);
    if (fromTier) {
      fromTier.teams = fromTier.teams.filter(id => id !== teamId);
    }
  }
  
  // Adiciona no destino
  if (toTierId === 'unassigned') {
    newData.unassigned.push(teamId);
  } else {
    const toTier = newData.tiers.find(t => t.id === toTierId);
    if (toTier) {
      toTier.teams.push(teamId);
    }
  }
  
  return newData;
}
