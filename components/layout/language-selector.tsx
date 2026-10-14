"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLocale, type Locale } from "@/contexts/locale-context"
import { AppleFlag } from "@/components/ui/apple-flag"
import { cn } from "@/lib/utils"

const localeOptions: Array<{ id: Locale; code: string; iso: string }> = [
  { id: "pt-BR", code: "pt", iso: "BR" },
  { id: "en", code: "en", iso: "US" },
  { id: "es", code: "es", iso: "ES" },
]

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale()
  const current = localeOptions.find((option) => option.id === locale) ?? localeOptions[0]
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Keep the server markup and the first browser render identical. The saved
  // locale and Radix menu IDs are applied only after hydration.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={t.language}
        disabled
        className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-400"
      >
        <span className="text-[11px] font-semibold lowercase tracking-wide" aria-hidden="true">pt</span>
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20",
            "active:scale-[0.97] transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
          )}
          aria-label={`${t.language}: ${t.languages[locale]}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider" aria-hidden="true">
            {current.code}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="liquid-glass-menu w-44 rounded-2xl p-1.5 shadow-2xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5">
          {t.language}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 my-1" />
        {localeOptions.map((option) => {
          const isSelected = locale === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => setLocale(option.id)}
              className={cn(
                "cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-xs transition-all duration-150",
                "focus:bg-white/[0.08] focus:text-white data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white",
                isSelected
                  ? "bg-amber-400/10 text-white font-semibold border border-amber-400/25 shadow-sm"
                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <AppleFlag country={option.iso} size={18} alt="" />
              <span className="flex-1 font-medium">{t.languages[option.id]}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-[var(--team-primary)] ml-auto shrink-0" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
