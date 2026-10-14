"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { messages, type Locale, type LocalizedMessages } from "@/locales/types"

export type { Locale } from "@/locales/types"

const STORAGE_KEY = "@kl-simulador:locale"
const defaultLocale: Locale = "pt-BR"

function getMessages(locale: Locale): LocalizedMessages {
  return messages[locale] as LocalizedMessages
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: LocalizedMessages
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: getMessages(defaultLocale),
})

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale
  if (navigator.language.toLowerCase().startsWith("es")) return "es"
  if (navigator.language.toLowerCase().startsWith("en")) return "en"
  return defaultLocale
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    const nextLocale = saved && saved in messages ? saved : detectLocale()
    setLocaleState(nextLocale)
    document.documentElement.lang = nextLocale
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    localStorage.setItem(STORAGE_KEY, nextLocale)
    document.documentElement.lang = nextLocale
  }

  const value = useMemo(() => ({ locale, setLocale, t: getMessages(locale) }), [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}





