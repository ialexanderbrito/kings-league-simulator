"use client"

import React from "react"
import { Globe, ChevronDown, Check, Sparkles } from "lucide-react"
import { useLeague } from "@/contexts/league-context"
import { AppleFlag } from "@/components/ui/apple-flag"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"

export function LeagueSelector() {
  const { selectedLeague, selectedSeasonId, availableLeagues, setLeague, setSeason } = useLeague()
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-8.5 rounded-full",
            "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 hover:border-white/20",
            "active:scale-[0.97] transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
          )}
          aria-label={`${t.league.selected}: ${selectedLeague.name}`}
        >
          <AppleFlag
            country={selectedLeague.countryIso}
            emoji={selectedLeague.flag}
            size={16}
            className="shrink-0"
          />
          <span className="sr-only">
            {selectedLeague.shortName}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-400 transition-transform duration-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="liquid-glass-menu w-64 max-h-[85vh] overflow-y-auto rounded-2xl p-1.5 shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.league.current}</span>
          </span>
          <Globe className="w-3 h-3 text-[var(--team-primary)]" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 my-1" />

        {availableLeagues.map((league) => {
          const isSelected = selectedLeague.id === league.id

          return (
            <div key={league.id} className="mb-1 last:mb-0">
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer flex items-center justify-between py-2 px-2.5 rounded-xl transition-all duration-150 text-xs",
                  "focus:bg-white/[0.08] focus:text-white data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white",
                  isSelected
                    ? "bg-amber-400/10 text-white font-semibold border border-amber-400/25 shadow-sm"
                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                )}
                onClick={() => setLeague(league.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AppleFlag
                    country={league.countryIso}
                    emoji={league.flag}
                    size={20}
                    className="shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-semibold">{league.name}</span>
                    <span className="text-[10px] text-zinc-400">{league.activeSeasonName}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--team-primary)] shrink-0 ml-2" />}
              </DropdownMenuItem>

              {/* Se a liga estiver selecionada e tiver múltiplas temporadas, mostra opções */}
              {isSelected && league.seasons.length > 1 && (
                <div className="ml-7 my-1 pl-2 border-l border-white/10 space-y-0.5">
                  {league.seasons.map((season) => {
                    const isSeasonActive = selectedSeasonId === season.id
                    return (
                      <button
                        key={season.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSeason(season.id)
                        }}
                        className={cn(
                          "w-full text-left flex items-center justify-between py-1 px-2 rounded-lg text-[11px] transition-colors",
                          isSeasonActive
                            ? "bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span className="truncate">{season.displayName || season.name}</span>
                        {season.id === 69 && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black ml-1">
                            {t.league.new}
                          </span>
                        )}
                        {isSeasonActive && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
