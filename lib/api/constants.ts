/**
 * Constantes compartilhadas para todas as rotas da API
 */

// ID da temporada atual da Kings League Brasil
export const SEASON_ID = process.env.KINGS_LEAGUE_SEASON_ID || "69"

// ID da competição Kings League Brasil
export const COMPETITION_ID = process.env.COMPETITION_ID || "17"

// URL base da API da Kings League
export const KINGS_LEAGUE_BASE_URL = "https://kingsleague.pro/api/v1"

/**
 * Headers padrão para requisições à API da Kings League
 */
export const KINGS_LEAGUE_HEADERS: Record<string, string> = {
  Accept: "*/*",
  "Accept-Language": "pt-BR,pt-PT;q=0.9,pt;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Priority: "u=1, i",
  Referer: "https://kingsleague.pro/en/brazil/matches",
  "Sec-Ch-Ua": '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
  "Sec-Ch-Ua-Arch": "x86",
  "Sec-Ch-Ua-Bitness": "64",
  "Sec-Ch-Ua-Full-Version": "154.0.4258.53",
  "Sec-Ch-Ua-Full-Version-List": '"Chromium";v="154.0.8037.93", "Microsoft Edge";v="154.0.4258.53", "Not A(Brand";v="99.0.0.0"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Model": '""',
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Ch-Ua-Platform-Version": "19.0.0",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0",
}

// Injeta Cookie se definido em variável de ambiente
if (process.env.KINGS_LEAGUE_COOKIE) {
  KINGS_LEAGUE_HEADERS.Cookie = process.env.KINGS_LEAGUE_COOKIE
}

/**
 * Headers simplificados (agora usando os mesmos headers completos atualizados)
 */
export const KINGS_LEAGUE_SIMPLE_HEADERS = KINGS_LEAGUE_HEADERS

/**
 * Configurações de cache predefinidas
 */
export const CACHE_DURATIONS = {
  /** Cache em tempo real / live: 30 segundos */
  LIVE: {
    revalidate: 30,
    maxAge: 10,
    sMaxAge: 30,
    swr: 60,
  },
  /** Cache curto: 5 minutos (para dados que mudam com frequência) */
  SHORT: {
    revalidate: 300,
    maxAge: 120,
    sMaxAge: 300,
    swr: 600,
  },
  /** Cache médio: 1 hora (para dados semi-estáticos) */
  MEDIUM: {
    revalidate: 3600,
    maxAge: 900,
    sMaxAge: 3600,
    swr: 7200,
  },
  /** Cache longo: 12 horas (para dados estáticos como detalhes de times/jogadores) */
  LONG: {
    revalidate: 43200,
    maxAge: 3600,
    sMaxAge: 43200,
    swr: 86400,
  },
  /** Cache diário: 24 horas (para dados que mudam raramente, ex: estatísticas diárias) */
  DAILY: {
    revalidate: 86400,
    maxAge: 7200,
    sMaxAge: 86400,
    swr: 172800,
  },
} as const

export type CacheDuration = keyof typeof CACHE_DURATIONS
