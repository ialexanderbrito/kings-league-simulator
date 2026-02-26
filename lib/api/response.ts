import { NextResponse } from "next/server"
import { CORS_HEADERS, CORS_HEADERS_GET_ONLY } from "./cors"
import { CACHE_DURATIONS, type CacheDuration } from "./constants"

interface ResponseOptions {
  /** Duração do cache (SHORT, MEDIUM, LONG) ou configuração personalizada */
  cache?: CacheDuration | { maxAge: number; sMaxAge: number }
  /** Status HTTP (padrão: 200) */
  status?: number
  /** Se true, permite método POST além de GET nos headers CORS */
  allowPost?: boolean
}

/**
 * Cria uma resposta de sucesso padronizada com CORS e cache
 */
export function createSuccessResponse<T>(data: T, options: ResponseOptions = {}) {
  const { cache, status = 200, allowPost = false } = options
  const corsHeaders = allowPost ? CORS_HEADERS : CORS_HEADERS_GET_ONLY

  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  }

  // Adiciona headers de cache se especificado
  if (cache) {
    const cacheConfig = typeof cache === "string" ? CACHE_DURATIONS[cache] : cache
    headers["Cache-Control"] = `public, max-age=${cacheConfig.maxAge}, s-maxage=${cacheConfig.sMaxAge}`
  }

  return new NextResponse(JSON.stringify(data), {
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
