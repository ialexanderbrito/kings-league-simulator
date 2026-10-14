import { TierListData, TierListState, TierItem } from "@/types/kings-league";
import LZString from "lz-string";
import { Locale, messages } from "@/locales/types";

// Chave para armazenamento no localStorage
const TIER_LIST_KEY = '@kl-simulador:tierList';

function getTierListKey(scope = "default"): string {
  return `${TIER_LIST_KEY}:${scope}`;
}

// Configuração padrão das tiers
export function getDefaultTiers(locale: Locale = 'pt-BR'): TierItem[] {
  const t = (messages[locale] || messages['pt-BR']).tier;
  return [
    {
      id: 'tier-1',
      name: t.presetKingsLeagueTier1,
      color: '#FFD700', // Dourado
      teams: []
    },
    {
      id: 'tier-2',
      name: t.presetKingsLeagueTier2,
      color: '#C0C0C0', // Prata
      teams: []
    },
    {
      id: 'tier-3',
      name: t.presetKingsLeagueTier3,
      color: '#CD7F32', // Bronze
      teams: []
    },
    {
      id: 'tier-4',
      name: t.presetKingsLeagueTier4,
      color: '#4CAF50', // Verde
      teams: []
    },
    {
      id: 'tier-5',
      name: t.presetKingsLeagueTier5,
      color: '#F44336', // Vermelho
      teams: []
    }
  ];
}

export const DEFAULT_TIERS: TierItem[] = getDefaultTiers('pt-BR');

/**
 * Salva a tier list no localStorage
 */
export function saveTierList(data: TierListData, scope = "default"): void {
  if (typeof window === 'undefined') return;
  
  const stateWithTimestamp: TierListState = {
    ...data,
    timestamp: Date.now()
  };
  
  localStorage.setItem(getTierListKey(scope), JSON.stringify(stateWithTimestamp));
}

/**
 * Obtém a tier list do localStorage
 */
export function getTierList(scope = "default"): TierListState | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(getTierListKey(scope));
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
export function clearTierList(scope = "default"): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getTierListKey(scope));
}

/**
 * Verifica se existe uma tier list salva
 */
export function hasSavedTierList(scope = "default"): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(getTierListKey(scope));
}

// Mapa de cores comuns para códigos curtos (economia de bytes)
const COLOR_MAP: Record<string, string> = {
  '#FFD700': '1', // Dourado
  '#C0C0C0': '2', // Prata
  '#CD7F32': '3', // Bronze
  '#4CAF50': '4', // Verde
  '#F44336': '5', // Vermelho
  '#9C27B0': '6', // Roxo
  '#2196F3': '7', // Azul
  '#FF9800': '8', // Laranja
  '#00BCD4': '9', // Ciano
  '#E91E63': 'A', // Rosa
  '#795548': 'B', // Marrom
  '#607D8B': 'C', // Cinza-azulado
};

const COLOR_MAP_REVERSE: Record<string, string> = Object.entries(COLOR_MAP).reduce(
  (acc, [hex, code]) => ({ ...acc, [code]: hex }),
  {}
);

/**
 * Codifica a tier list para uma string comprimida para URL
 * Usa formato ultra-otimizado para máxima compactação
 */
export function encodeTierListToURL(data: TierListData): string {
  try {
    // Validação dos dados de entrada
    if (!data || !data.tiers || !Array.isArray(data.tiers)) {
      console.error('Dados inválidos: tiers não é um array', data);
      return '';
    }
    if (!data.unassigned || !Array.isArray(data.unassigned)) {
      console.error('Dados inválidos: unassigned não é um array', data);
      return '';
    }

    // Formato ultra-compacto: 
    // tiers: [[nome,cor,[times]], ...]
    // unassigned: [times]
    // Apenas o necessário, sem IDs de tier (reconstruídos no decode)
    const optimized = [
      data.tiers.map(t => [
        t.name, 
        COLOR_MAP[t.color] || t.color, // Usa código curto se disponível
        (t.teams || [])
          .filter(id => id && typeof id === 'string') // Garante que é string
          .map(id => String(id).replace('team-', '')) // Remove prefixo repetitivo
      ]),
      data.unassigned
        .filter(id => id && typeof id === 'string') // Garante que é string
        .map(id => String(id).replace('team-', ''))
    ];
    
    const jsonString = JSON.stringify(optimized);
    
    // Usa Base64 que é mais compacto que EncodedURIComponent
    const compressed = LZString.compressToBase64(jsonString);
    
    // Torna URL-safe substituindo caracteres problemáticos
    return compressed
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Remove padding
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
    // Reverte a conversão URL-safe
    let compressed = hash
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Adiciona padding se necessário
    while (compressed.length % 4) {
      compressed += '=';
    }
    
    const decompressed = LZString.decompressFromBase64(compressed);
    if (!decompressed) {
      // Fallback para formato antigo
      const oldDecompressed = LZString.decompressFromEncodedURIComponent(hash);
      if (!oldDecompressed) return null;
      
      const oldData = JSON.parse(oldDecompressed) as TierListData;
      if (!oldData.tiers || !Array.isArray(oldData.tiers)) return null;
      if (!oldData.unassigned || !Array.isArray(oldData.unassigned)) return null;
      return oldData;
    }
    
    const parsed = JSON.parse(decompressed);
    
    // Formato otimizado
    if (Array.isArray(parsed) && parsed.length === 2) {
      const [tiersData, unassigned] = parsed;
      
      if (!Array.isArray(tiersData) || !Array.isArray(unassigned)) return null;
      
      const tiers = tiersData.map((tierData, index) => ({
        id: `tier-${index + 1}`,
        name: tierData[0],
        color: COLOR_MAP_REVERSE[tierData[1]] || tierData[1], // Restaura cor
        teams: (tierData[2] || [])
          .filter((id: string) => id && typeof id === 'string') // Garante que é string
          .map((id: string) => {
            const idStr = String(id);
            return idStr.startsWith('team-') ? idStr : `team-${idStr}`; // Restaura prefixo se necessário
          })
      }));
      
      return { 
        tiers, 
        unassigned: (unassigned || [])
          .filter(id => id && typeof id === 'string') // Garante que é string
          .map(id => {
            const idStr = String(id);
            return idStr.startsWith('team-') ? idStr : `team-${idStr}`; // Restaura prefixo se necessário
          })
      };
    }
    
    // Fallback para formato antigo (compatibilidade)
    const data = parsed as TierListData;
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
export function getInitialTierListData(allTeamIds: string[], locale: Locale = 'pt-BR'): TierListData {
  return {
    tiers: getDefaultTiers(locale),
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

/**
 * Move uma tier para cima na lista
 */
export function moveTierUp(data: TierListData, tierId: string): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  const index = newData.tiers.findIndex(t => t.id === tierId);
  
  // Se já está no topo ou não encontrou, retorna sem alterações
  if (index <= 0) return data;
  
  // Troca de posição com o item anterior
  [newData.tiers[index - 1], newData.tiers[index]] = [newData.tiers[index], newData.tiers[index - 1]];
  
  return newData;
}

/**
 * Move uma tier para baixo na lista
 */
export function moveTierDown(data: TierListData, tierId: string): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  const index = newData.tiers.findIndex(t => t.id === tierId);
  
  // Se já está no final ou não encontrou, retorna sem alterações
  if (index === -1 || index >= newData.tiers.length - 1) return data;
  
  // Troca de posição com o próximo item
  [newData.tiers[index], newData.tiers[index + 1]] = [newData.tiers[index + 1], newData.tiers[index]];
  
  return newData;
}

/**
 * Move todos os times de todas as tiers de volta para o pool de não atribuídos,
 * mantendo os nomes e cores customizados das tiers.
 */
export function resetTeamsToPool(data: TierListData): TierListData {
  const allTeamIds: string[] = [];
  const emptyTiers = data.tiers.map(t => {
    allTeamIds.push(...t.teams);
    return { ...t, teams: [] };
  });
  allTeamIds.push(...data.unassigned);

  const uniqueTeamIds = Array.from(new Set(allTeamIds));

  return {
    tiers: emptyTiers,
    unassigned: uniqueTeamIds,
  };
}

/**
 * Adiciona uma nova tier imediatamente acima de uma tier existente
 */
export function addTierAbove(data: TierListData, targetTierId: string): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  const index = newData.tiers.findIndex(t => t.id === targetTierId);
  if (index === -1) return data;

  const newTier = createNewTier(`tier-${Date.now()}`, newData.tiers.length);
  newData.tiers.splice(index, 0, newTier);
  return newData;
}

/**
 * Adiciona uma nova tier imediatamente abaixo de uma tier existente
 */
export function addTierBelow(data: TierListData, targetTierId: string): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  const index = newData.tiers.findIndex(t => t.id === targetTierId);
  if (index === -1) return data;

  const newTier = createNewTier(`tier-${Date.now()}`, newData.tiers.length);
  newData.tiers.splice(index + 1, 0, newTier);
  return newData;
}

/**
 * Move os times de uma tier específica de volta para o banco de não atribuídos
 */
export function clearTierTeams(data: TierListData, tierId: string): TierListData {
  const newData = JSON.parse(JSON.stringify(data)) as TierListData;
  const tier = newData.tiers.find(t => t.id === tierId);
  if (!tier || tier.teams.length === 0) return data;

  newData.unassigned = Array.from(new Set([...newData.unassigned, ...tier.teams]));
  tier.teams = [];
  return newData;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  tiers: { name: string; color: string }[];
}

export function getPresetLists(locale: Locale = 'pt-BR'): PresetTemplate[] {
  const t = (messages[locale] || messages['pt-BR']).tier;
  return [
    {
      id: 'kings-league',
      name: t.presetKingsLeagueTitle,
      description: t.presetKingsLeagueDesc,
      tiers: [
        { name: t.presetKingsLeagueTier1, color: '#FFD700' },
        { name: t.presetKingsLeagueTier2, color: '#C0C0C0' },
        { name: t.presetKingsLeagueTier3, color: '#CD7F32' },
        { name: t.presetKingsLeagueTier4, color: '#10B981' },
        { name: t.presetKingsLeagueTier5, color: '#EF4444' },
      ]
    },
    {
      id: 'classic-s-f',
      name: t.presetClassicTitle,
      description: t.presetClassicDesc,
      tiers: [
        { name: 'S', color: '#FF7F7F' },
        { name: 'A', color: '#FFBF7F' },
        { name: 'B', color: '#FFDF7F' },
        { name: 'C', color: '#FFFF7F' },
        { name: 'D', color: '#BFFF7F' },
        { name: 'E', color: '#7FFFFF' },
        { name: 'F', color: '#7FBFFF' },
      ]
    },
    {
      id: 'tournament',
      name: t.presetTournamentTitle,
      description: t.presetTournamentDesc,
      tiers: [
        { name: t.presetTournamentTier1, color: '#FFD700' },
        { name: t.presetTournamentTier2, color: '#10B981' },
        { name: t.presetTournamentTier3, color: '#3B82F6' },
        { name: t.presetTournamentTier4, color: '#F59E0B' },
        { name: t.presetTournamentTier5, color: '#EF4444' },
      ]
    }
  ];
}

export const PRESET_LISTS: PresetTemplate[] = getPresetLists('pt-BR');

/**
 * Aplica um preset de tiers, devolvendo todos os times para o banco
 */
export function applyPreset(data: TierListData, preset: PresetTemplate): TierListData {
  const allTeamIds: string[] = [];
  data.tiers.forEach(t => allTeamIds.push(...t.teams));
  allTeamIds.push(...data.unassigned);
  const uniqueTeamIds = Array.from(new Set(allTeamIds));

  const newTiers: TierItem[] = preset.tiers.map((t, idx) => ({
    id: `tier-${idx + 1}`,
    name: t.name,
    color: t.color,
    teams: []
  }));

  return {
    tiers: newTiers,
    unassigned: uniqueTeamIds,
  };
}


