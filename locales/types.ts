import { ptBR } from "./pt-BR"
import { en } from "./en"
import { es } from "./es"

export type Locale = "pt-BR" | "en" | "es"
export type LocaleMessages = typeof ptBR

export const messages: Record<Locale, LocaleMessages> = {
  "pt-BR": ptBR,
  en,
  es,
} as const

export type LocalizedMessages = LocaleMessages
