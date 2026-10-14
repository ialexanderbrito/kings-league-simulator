"use client"

import { useEffect, useState } from "react"
import { CalendarClock } from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

interface EmptyLeagueStateProps {
  title?: string
  description?: string
  showTimestamp?: boolean
  variant?: "default" | "compact"
}

export function EmptyLeagueState({
  title,
  description,
  showTimestamp = false,
  variant = "default",
}: EmptyLeagueStateProps) {
  const { t, locale } = useLocale()
  const [checkedAt, setCheckedAt] = useState("")

  useEffect(() => {
    if (!showTimestamp) return
    setCheckedAt(new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date()))
  }, [locale, showTimestamp])

  return (
    <section
      className={[
        "mx-auto flex w-full flex-col items-center text-center",
        variant === "compact" ? "max-w-xl py-10 px-4" : "max-w-2xl py-16 px-5 sm:px-8",
      ].join(" ")}
      aria-labelledby="empty-league-title"
    >
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] shadow-[0_0_50px_-20px_rgba(251,191,36,0.38)]">
        <div className="absolute inset-1 rounded-xl border border-amber-300/[0.08]" />
        <CalendarClock className="h-7 w-7 text-amber-300" strokeWidth={1.7} aria-hidden="true" />
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300/80">
        {t.ui.noData}
      </p>
      <h2
        id="empty-league-title"
        className="max-w-lg text-xl font-black tracking-tight text-white sm:text-2xl"
      >
        {title || t.ui.emptyDataTitle}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
        {description || t.ui.emptyDataDescription}
      </p>

      {showTimestamp && checkedAt && (
        <p className="mt-6 border-t border-white/[0.07] pt-4 text-[11px] text-zinc-600">
          {locale === "pt-BR" ? "Verificado em" : locale === "es" ? "Comprobado el" : "Checked on"} {checkedAt}
        </p>
      )}
    </section>
  )
}
