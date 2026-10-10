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
 * Gera a URL do proxy de imagem para evitar problemas de CORS
 */
export function getProxyImageUrl(originalUrl: string | undefined | null): string {
  if (!originalUrl) return "/placeholder.svg"
  // Se já é uma URL relativa, do placeholder ou data URI, retorna direto
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
