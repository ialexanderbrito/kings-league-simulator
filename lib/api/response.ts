import { NextResponse } from "next/server"
import { CORS_HEADERS, CORS_HEADERS_GET_ONLY } from "./cors"
import { CACHE_DURATIONS, type CacheDuration } from "./constants"

import crypto from "crypto"

interface CacheCustomConfig {
  maxAge: number
  sMaxAge: number
  swr?: number
}

interface ResponseOptions {
  /** Duração do cache (LIVE, SHORT, MEDIUM, LONG, DAILY) ou configuração personalizada */
  cache?: CacheDuration | CacheCustomConfig
  /** Status HTTP (padrão: 200) */
  status?: number
  /** Se true, permite método POST além de GET nos headers CORS */
  allowPost?: boolean
  /** Request original para suportar validação de ETag e resposta 304 */
  req?: Request
}

function generateETag(content: string): string {
  return `"${crypto.createHash("md5").update(content).digest("hex")}"`
}

/**
 * Cria uma resposta de sucesso padronizada com CORS, Cache otimizado (SWR) e ETag
 */
export function createSuccessResponse<T>(data: T, options: ResponseOptions = {}) {
  const { cache, status = 200, allowPost = false, req } = options
  const corsHeaders = allowPost ? CORS_HEADERS : CORS_HEADERS_GET_ONLY

  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
  }

  // Adiciona headers de cache se especificado (otimizado para Edge Cache da Vercel)
  if (cache) {
    const cacheConfig = (typeof cache === "string" ? CACHE_DURATIONS[cache] : cache) as CacheCustomConfig
    const swrPart = cacheConfig.swr ? `, stale-while-revalidate=${cacheConfig.swr}` : ""
    headers["Cache-Control"] = `public, max-age=${cacheConfig.maxAge}, s-maxage=${cacheConfig.sMaxAge}${swrPart}`
    headers["CDN-Cache-Control"] = `public, s-maxage=${cacheConfig.sMaxAge}${swrPart}`
    headers["Vercel-CDN-Cache-Control"] = `public, s-maxage=${cacheConfig.sMaxAge}${swrPart}`
  }

  const bodyString = typeof data === "string" ? data : JSON.stringify(data)
  const etag = generateETag(bodyString)
  headers["ETag"] = etag

  // Verifica se o cliente enviou If-None-Match correspondente (304 Not Modified)
  if (req) {
    const ifNoneMatch = req.headers.get("if-none-match")
    if (ifNoneMatch) {
      const cleanClientEtag = ifNoneMatch.replace(/^W\//, "").replace(/"/g, "").trim()
      const cleanServerEtag = etag.replace(/^W\//, "").replace(/"/g, "").trim()
      if (cleanClientEtag === cleanServerEtag || ifNoneMatch === "*") {
        return new NextResponse(null, {
          status: 304,
          headers,
        })
      }
    }
  }

  return new NextResponse(bodyString, {
    status,
    headers,
  })
}


interface ErrorResponseOptions {
  /** Status HTTP (padrão: 500) */
  status?: number
  /** Se true, permite método POST além de GET nos headers CORS */
  allowPost?: boolean
}

/**
 * Cria uma resposta de erro padronizada com CORS
 * SEGURANÇA: Nunca expõe stack trace em produção
 */
export function createErrorResponse(
  mensagem: string,
  erro: Error | unknown,
  options: ErrorResponseOptions = {}
) {
  const { status = 500, allowPost = false } = options
  const corsHeaders = allowPost ? CORS_HEADERS : CORS_HEADERS_GET_ONLY

  const errorMessage = erro instanceof Error ? erro.message : "Erro desconhecido"

  return NextResponse.json(
    {
      erro: mensagem,
      mensagem: errorMessage,
    },
    {
      status,
      headers: corsHeaders,
    }
  )
}

/**
 * Cria uma resposta JSON simples com CORS (sem cache)
 */
export function createJsonResponse<T>(
  data: T,
  options: { status?: number; allowPost?: boolean } = {}
) {
  const { status = 200, allowPost = false } = options
  const corsHeaders = allowPost ? CORS_HEADERS : CORS_HEADERS_GET_ONLY

  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  })
}
