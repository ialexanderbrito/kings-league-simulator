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
