import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Player } from "@/types/kings-league"
import { getCalibratedPlayerOverall } from "./player-ratings"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlayerOverall(player: Player): number {
  return getCalibratedPlayerOverall(player)
}

/**
 * Retorna a URL da imagem diretamente da CDN oficial (kama.football / Cloudinary).
 * Otimizado para Vercel Free Tier: evita invocações de Serverless Function e
 * economiza 100% de transferência de dados/banda na Vercel.
 */
export function getProxyImageUrl(originalUrl: string | undefined | null): string {
  if (!originalUrl) return "/placeholder.svg"
  return originalUrl
}

/**
 * Retorna a URL via proxy interno apenas quando estritamente necessário (ex: manipulação em canvas)
 */
export function getInternalProxyImageUrl(originalUrl: string | undefined | null): string {
  if (!originalUrl) return "/placeholder.svg"
  if (originalUrl.startsWith("/") || originalUrl.startsWith("data:")) return originalUrl
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
}

/**
 * Calcula a idade com base em uma data de nascimento
 */
export function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
