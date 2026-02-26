import { NextResponse } from "next/server"

/**
 * Headers CORS padrão para todas as rotas da API
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const

/**
 * Headers CORS apenas para métodos GET
 */
export const CORS_HEADERS_GET_ONLY = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const

/**
 * Cria um handler OPTIONS padrão para rotas da API
 * @param allowPost - Se true, permite método POST além de GET
 */
export function createOptionsHandler(allowPost = false) {
  return function OPTIONS() {
    return new NextResponse(null, {
      headers: allowPost ? CORS_HEADERS : CORS_HEADERS_GET_ONLY,
    })
  }
}
