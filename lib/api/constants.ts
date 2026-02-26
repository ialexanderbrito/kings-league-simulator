/**
 * Constantes compartilhadas para todas as rotas da API
 */

// ID da temporada atual da Kings League Brasil
export const SEASON_ID = process.env.KINGS_LEAGUE_SEASON_ID

// ID da competição Kings League Brasil
export const COMPETITION_ID = process.env.COMPETITION_ID

// URL base da API da Kings League
export const KINGS_LEAGUE_BASE_URL = "https://kingsleague.pro/api/v1"

/**
 * Headers padrão para requisições à API da Kings League
 */
export const KINGS_LEAGUE_HEADERS = {
  accept: "*/*",
  "accept-language": "pt-BR,pt-PT;q=0.9,pt;q=0.8",
  referer: "https://kingsleague.pro/pt/brazil",
  "sec-ch-ua": '"Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
} as const

/**
 * Headers simplificados para requisições à API da Kings League
 */
export const KINGS_LEAGUE_SIMPLE_HEADERS = {
  referer: "https://kingsleague.pro/pt/brazil",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
} as const

/**
 * Configurações de cache predefinidas
 */
export const CACHE_DURATIONS = {
  /** Cache curto: 5 minutos (para dados que mudam frequentemente) */
  SHORT: {
    revalidate: 300,
    maxAge: 300,
    sMaxAge: 600,
  },
  /** Cache médio: 1 hora (para dados semi-estáticos) */
  MEDIUM: {
    revalidate: 3600,
    maxAge: 1800,
    sMaxAge: 3600,
  },
  /** Cache longo: 12 horas (para dados estáticos como detalhes de times/jogadores) */
  LONG: {
    revalidate: 43200,
    maxAge: 21600,
    sMaxAge: 43200,
  },
  /** Cache diário: 24 horas (para dados que mudam raramente, ex: estatísticas diárias) */
  DAILY: {
    revalidate: 86400,
    maxAge: 86400,
    sMaxAge: 86400,
  },
} as const

export type CacheDuration = keyof typeof CACHE_DURATIONS
