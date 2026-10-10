import { Player, PlayerStats } from "@/types/kings-league"

/**
 * Mapeamento e calibração de Overalls realistas para as principais estrelas e lendas
 * da Kings League Brasil e Mundial.
 * 
 * Motivação: A API oficial da Kings League / Kama Football possui notas defasadas,
 * nulas ou inconsistentes (ex: Kelvin Oliveira, eleito melhor jogador do mundo de 7v7
 * e MVP da Kings World Cup, com média oficial 88 ou 74, inferior a jogadores reservas).
 * 
 * Aqui calibramos com base em status histórico, desempenho em quadra, MVP awards e renome mundial.
 */

interface StarPlayerCalibration {
  overall: number
  tier: "GOAT" | "LEGEND" | "SUPERSTAR" | "STAR" | "SOLID"
}

// Mapeamento por ID numérico e por nome normalizado (para cobrir splits diferentes)
const STAR_PLAYERS_BY_ID: Record<number, StarPlayerCalibration> = {
  // G3X FC
  53010: { overall: 97, tier: "GOAT" },      // Kelvin Oliveira - Rei da Kings League, MVP Mundial
  34112: { overall: 93, tier: "SUPERSTAR" }, // Andreas Vaz - Maestro do meio-campo
  70132: { overall: 90, tier: "STAR" },      // Gabriel Braga - Paredão / Goleiraço
  68909: { overall: 88, tier: "STAR" },      // Wembley Luiz - Capitão e xerife
  33967: { overall: 86, tier: "SOLID" },     // Thiago 'TH' Brito
  71124: { overall: 86, tier: "SOLID" },     // Matheus Rufino
  34619: { overall: 85, tier: "SOLID" },     // Josildo Barata
  68215: { overall: 85, tier: "SOLID" },     // Gabriel Medeiros
  69648: { overall: 84, tier: "SOLID" },     // Ryan Lima
  79730: { overall: 84, tier: "SOLID" },     // Ton 'Spider'
  84745: { overall: 83, tier: "SOLID" },     // Gabriel Messias
  84746: { overall: 83, tier: "SOLID" },     // João Guimarães
  84756: { overall: 83, tier: "SOLID" },     // Marinho Filho

  // FURIA FC
  33918: { overall: 92, tier: "SUPERSTAR" }, // Lipão Pinheiro - Artilheiro nato
  33904: { overall: 91, tier: "SUPERSTAR" }, // Jeffinho Honorato - Drible e visão
  33932: { overall: 90, tier: "STAR" },      // Leleti Garcia - Finalizador implacável
  71542: { overall: 89, tier: "STAR" },      // Victor Hugo - Goleiro de elite
  87617: { overall: 87, tier: "STAR" },      // Juninho Manella - Estrela ofensiva
  87431: { overall: 87, tier: "SOLID" },     // Tiago Marinho - Goleiro lenda
  71032: { overall: 84, tier: "SOLID" },     // João Pelegrini
  70387: { overall: 83, tier: "SOLID" },     // Kenu Leandro
  71665: { overall: 83, tier: "SOLID" },     // Matheus 'Dedo'
  84722: { overall: 85, tier: "SOLID" },     // Cleberson 'C99'
  84744: { overall: 85, tier: "SOLID" },     // Luiz Camilo

  // NYVELADOS FC
  86931: { overall: 88, tier: "STAR" },      // Carlos 'Ferrão' - Ajustado p/ rendimento na Kings League
  86975: { overall: 92, tier: "SUPERSTAR" }, // Dieguinho Assis - Pivô dominante
  78021: { overall: 88, tier: "STAR" },      // Léo 'Gol'
  85044: { overall: 88, tier: "STAR" },      // Luandrio 'Pé Fino'
  86974: { overall: 87, tier: "STAR" },      // Igor 'BB'
  67804: { overall: 84, tier: "SOLID" },     // Ailton José
  71635: { overall: 83, tier: "SOLID" },     // Lucas 'Japa'
  71725: { overall: 83, tier: "SOLID" },     // Bruno 'Gan'

  // DIBRADOS FC / FC REAL ELITE
  87490: { overall: 88, tier: "STAR" },      // Ricardinho Braga - Ajustado p/ rendimento na Kings League
  67826: { overall: 89, tier: "STAR" },      // Gabriel Costa - Artilheiro
  78043: { overall: 88, tier: "STAR" },      // Jonatas 'Batman'
  87006: { overall: 87, tier: "STAR" },      // Raphael Augusto
  87478: { overall: 87, tier: "STAR" },      // Chay Medeiros
  87281: { overall: 86, tier: "SOLID" },     // Etinho Lima
  68281: { overall: 85, tier: "SOLID" },     // Ivo Alves
  69243: { overall: 83, tier: "SOLID" },     // Matheus Bueno
  68012: { overall: 82, tier: "SOLID" },     // Marcello 'Marcelinho' Junior

  // PODPAH FUNKBOL CLUBE
  87590: { overall: 86, tier: "SOLID" },     // Deives Moraes - Ajustado p/ rendimento na Kings League
  78044: { overall: 88, tier: "STAR" },      // Caio Miranda
  84733: { overall: 88, tier: "STAR" },      // Igor Campos - Goleiro
  80131: { overall: 88, tier: "STAR" },      // Luan 'Mestre'
  78040: { overall: 87, tier: "STAR" },      // Juninho Antunes
  78062: { overall: 87, tier: "STAR" },      // William Jesus
  68575: { overall: 85, tier: "SOLID" },     // Jhonatas 'MlkJhoow' Goes
  68330: { overall: 84, tier: "SOLID" },     // Vini Alexandre
  61650: { overall: 84, tier: "SOLID" },     // Martín Lara

  // CAPIM FC
  52450: { overall: 85, tier: "SOLID" },     // Williams 'Vassoura' - Ajustado p/ rendimento na Kings League
  94:    { overall: 88, tier: "STAR" },      // Álex Guti (Wildcard Espanha)
  198:   { overall: 88, tier: "STAR" },      // Dani Liñares (Wildcard Espanha)
  215:   { overall: 87, tier: "STAR" },      // Gerard Nolla (Wildcard Espanha)
  80098: { overall: 87, tier: "STAR" },      // Igo Canindé
  84707: { overall: 86, tier: "SOLID" },     // Marcos 'Bolivia'
  69089: { overall: 84, tier: "SOLID" },     // Murillo Donato
  71664: { overall: 83, tier: "SOLID" },     // Breno Arantes

  // FLUXO FC
  34219: { overall: 88, tier: "STAR" },      // Well Andrade
  68339: { overall: 87, tier: "STAR" },      // João Pedro - Goleiro
  78054: { overall: 87, tier: "STAR" },      // Helber Júnior
  78058: { overall: 86, tier: "SOLID" },     // Matheus 'Chaveirinho'
  68029: { overall: 85, tier: "SOLID" },     // Tuco Magalhães
  70864: { overall: 84, tier: "SOLID" },     // Murillo Pulino
  71687: { overall: 83, tier: "SOLID" },     // Gustavinho Henrique

  // LOUD SC
  84752: { overall: 91, tier: "SUPERSTAR" }, // Daniel Shiraishi - Campeão mundial futsal
  84748: { overall: 88, tier: "STAR" },      // Matheus 'Biro'
  84755: { overall: 88, tier: "STAR" },      // Felipe Viana
  78056: { overall: 87, tier: "STAR" },      // Esaú Nascimento - Goleiro
  85252: { overall: 87, tier: "STAR" },      // Walid Jaadi
  71382: { overall: 84, tier: "SOLID" },     // Felipe Cassiano
  68692: { overall: 83, tier: "SOLID" },     // Thiago Oliveira

  // DESIMPAIN
  71122: { overall: 91, tier: "SUPERSTAR" }, // Davi Ilario - Fora da curva / Camisa 10 da DesimpaiN
  69184: { overall: 85, tier: "SOLID" },     // Victor 'VB' Bueno
  69617: { overall: 85, tier: "SOLID" },     // Douglinhas Melo
  79961: { overall: 85, tier: "SOLID" },     // Luisinho Alves
  68892: { overall: 83, tier: "SOLID" },     // Andrey Profeta
  71330: { overall: 82, tier: "SOLID" },     // Henry 'Japa'
  80101: { overall: 84, tier: "SOLID" },     // Juvenal Oliveira

  // DENDELE FC
  68844: { overall: 87, tier: "STAR" },      // Ryan Soares
  78025: { overall: 87, tier: "STAR" },      // Cristhian 'Canhoto'
  78027: { overall: 86, tier: "SOLID" },     // Lyncoln Oliveira
  69094: { overall: 84, tier: "SOLID" },     // Maikon Santos - Goleiro
  71448: { overall: 83, tier: "SOLID" },     // Gabriel Repulho
  71567: { overall: 83, tier: "SOLID" },     // Gui Carvalho
}

// Mapeamento por correspondência de texto para estrelas (caso mudem os IDs entre edições/splits)
interface StarNameRule {
  match: RegExp
  overall: number
}

const STAR_NAME_RULES: StarNameRule[] = [
  { match: /kelvin(\s+oliveira)?/i, overall: 97 }, // Kelvin Oliveira (Rei da Kings League)
  { match: /andreas\s+vaz/i, overall: 93 },        // Andreas Vaz
  { match: /lip[aã]o/i, overall: 92 },             // Lipão Pinheiro
  { match: /dieguinho/i, overall: 92 },            // Dieguinho Assis
  { match: /jeffinho/i, overall: 91 },             // Jeffinho Honorato
  { match: /shiraishi/i, overall: 91 },            // Daniel Shiraishi
  { match: /davi\s+ilario|ilario/i, overall: 91 }, // Davi Ilario (Fora da curva DesimpaiN)
  { match: /leleti/i, overall: 90 },               // Leleti Garcia
  { match: /falc[aã]o/i, overall: 88 },            // Falcão (Rei do Futsal, calibrado p/ Kings League)
  { match: /ricardinho(\s+braga)?/i, overall: 88 },// Ricardinho (calibrado p/ Kings League)
  { match: /ferr[aã]o/i, overall: 88 },            // Ferrão (calibrado p/ Kings League)
  { match: /manella/i, overall: 87 },              // Juninho Manella
  { match: /deives/i, overall: 86 },               // Deives Moraes (calibrado p/ Kings League)
  { match: /vassoura/i, overall: 85 },             // Williams Vassoura (calibrado p/ Kings League)
]

/**
 * Função determinística para gerar números estáveis para jogadores
 * sem causar oscilações em re-renders.
 */
function getDeterministicHash(id: string | number, min: number, max: number): number {
  let hash = 0
  const idStr = String(id)
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  return min + (Math.abs(hash) % (max - min + 1))
}

/**
 * Parser de atributo numérico com fallback seguro
 */
function parseAttribute(val: string | undefined | null, fallback = 70): number {
  if (!val) return fallback
  const parsed = Number.parseFloat(val)
  return Number.isNaN(parsed) ? fallback : parsed
}

/**
 * Calcula o overall ponderado por posição a partir das métricas individuais do jogador
 */
function calculatePositionWeightedRating(player: Player): number | null {
  const meta = player.metaInformation
  if (!meta) return null

  // Verificar se o jogador possui métricas detalhadas
  const hasDetailedStats = 
    Boolean(meta.skills || meta.shooting || meta.passing || meta.defence || meta.physical || meta.diving || meta.reflexes)

  if (!hasDetailedStats) return null

  if (player.role === "goalkeeper") {
    const reflexes = parseAttribute(meta.reflexes, 75)
    const diving = parseAttribute(meta.diving, 74)
    const handling = parseAttribute(meta.handling, 73)
    const anticipation = parseAttribute(meta.anticipation, 74)
    const passing = parseAttribute(meta.goalkeeperPassing || meta.passing, 70)

    return Math.round(
      reflexes * 0.30 +
      diving * 0.25 +
      handling * 0.20 +
      anticipation * 0.15 +
      passing * 0.10
    )
  }

  const skills = parseAttribute(meta.skills, 74)
  const shooting = parseAttribute(meta.shooting, 72)
  const passing = parseAttribute(meta.passing, 73)
  const defence = parseAttribute(meta.defence, 71)
  const physical = parseAttribute(meta.physical, 74)
  const duels = parseAttribute(meta.duels, physical)

  if (player.role === "forward") {
    return Math.round(
      shooting * 0.35 +
      skills * 0.25 +
      duels * 0.20 +
      passing * 0.20
    )
  }

  if (player.role === "midfielder") {
    return Math.round(
      passing * 0.30 +
      skills * 0.25 +
      duels * 0.20 +
      shooting * 0.15 +
      defence * 0.10
    )
  }

  // Defender
  return Math.round(
    defence * 0.35 +
    duels * 0.25 +
    physical * 0.20 +
    passing * 0.20
  )
}

/**
 * Calcula bônus de pontuação por histórico e estatísticas reais de partida
 */
function calculateStatsBonus(stats?: PlayerStats | null): number {
  if (!stats) return 0
  let bonus = 0

  const matches = stats.matchesPlayed || 0
  if (matches > 0) {
    // Bônus por MVP: jogadores decisivos ganham até 4 pontos de overall
    const mvps = stats.mvps || 0
    bonus += Math.min(4, Math.round(mvps * 1.5))

    // Bônus por taxa de gols + assistências
    const gPlusA = (stats.goalsScored || 0) + (stats.assists || 0)
    const gRate = gPlusA / matches
    if (gRate >= 1.0) bonus += 2
    else if (gRate >= 0.5) bonus += 1
  }

  return bonus
}

/**
 * Função principal exportada: calcula o Overall realista, balanceado
 * e fiel à realidade da Kings League.
 */
export function getCalibratedPlayerOverall(player: Player): number {
  if (!player) return 75

  // 1. Verificação direta na tabela de estrelas e lendas por ID
  const starById = STAR_PLAYERS_BY_ID[Number(player.id)]
  if (starById) {
    return starById.overall
  }

  // 2. Verificação por regras de nome/apelido
  const playerFullName = `${player.shortName || ""} ${(player as any).nickname || ""} ${(player as any).firstName || ""} ${(player as any).lastName || ""}`.toLowerCase()
  for (const rule of STAR_NAME_RULES) {
    if (rule.match.test(playerFullName)) {
      return rule.overall
    }
  }

  // 3. Verificação de status/categoria especial
  const isWildcard =
    player.category === "wildcard" ||
    (player.metaInformation as any)?.category === "president" ||
    (player.metaInformation as any)?.category === "wildcard" ||
    player.metaInformation?.status?.toLowerCase().includes("wildcard") ||
    player.metaInformation?.status?.toLowerCase().includes("jogador 11") ||
    player.metaInformation?.status?.toLowerCase().includes("jogador 12") ||
    player.metaInformation?.status?.toLowerCase().includes("jogador 13")

  // 4. Se tiver atributos detalhados, calcula média ponderada fiel
  const weightedStats = calculatePositionWeightedRating(player)
  const statsBonus = calculateStatsBonus(player.stats)

  if (weightedStats !== null) {
    let calibrated = weightedStats + statsBonus

    // Ajuste de curva: Wildcards com atributos têm piso de qualidade garantido
    if (isWildcard) {
      calibrated = Math.max(86, Math.min(93, calibrated))
    } else {
      calibrated = Math.max(73, Math.min(86, calibrated))
    }

    return calibrated
  }

  // 5. Se tiver `average` oficial da API, calibrar com segurança
  const rawAverage = player.metaInformation?.average ? Number(player.metaInformation.average) : null
  if (rawAverage && !isNaN(rawAverage) && rawAverage > 71) {
    let scaled = rawAverage + statsBonus
    if (isWildcard) {
      // Wildcards escalam entre 87 e 92 se tiverem boa média
      scaled = Math.max(86, Math.min(93, Math.round(86 + (rawAverage - 72) * 0.5)))
    } else {
      scaled = Math.max(74, Math.min(86, Math.round(scaled)))
    }
    return scaled
  }

  // 6. Fallback determinístico elegante por ID para atletas da base ou do draft sem atributos
  if (isWildcard) {
    // Wildcards sem stats cadastrados na API recebem notas de destaque consistentes (86 a 91)
    return getDeterministicHash(player.id, 86, 91)
  }

  // Jogadores comuns de draft recebem notas sólidas e realistas (75 a 84)
  return getDeterministicHash(player.id, 75, 84)
}
