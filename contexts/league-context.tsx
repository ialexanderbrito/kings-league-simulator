"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AVAILABLE_LEAGUES, type AvailableLeague } from "@/app/api/competitions/route"

interface LeagueContextType {
  selectedLeague: AvailableLeague
  selectedSeasonId: number
  availableLeagues: AvailableLeague[]
  setLeague: (leagueId: string) => void
  setSeason: (seasonId: number) => void
}

const defaultLeague = AVAILABLE_LEAGUES[0] // Brazil
const defaultSeasonId = defaultLeague.activeSeasonId

const LeagueContext = createContext<LeagueContextType>({
  selectedLeague: defaultLeague,
  selectedSeasonId: defaultSeasonId,
  availableLeagues: AVAILABLE_LEAGUES,
  setLeague: () => {},
  setSeason: () => {},
})

const STORAGE_LEAGUE_KEY = "@kl-simulador:selectedLeague"
const STORAGE_SEASON_KEY = "@kl-simulador:selectedSeason"

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [selectedLeague, setSelectedLeagueState] = useState<AvailableLeague>(defaultLeague)
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<number>(defaultSeasonId)

  // Carrega preferência do usuário do localStorage no client
  useEffect(() => {
    try {
      const savedLeagueId = localStorage.getItem(STORAGE_LEAGUE_KEY)
      const savedSeasonId = localStorage.getItem(STORAGE_SEASON_KEY)

      if (savedLeagueId) {
        const foundLeague = AVAILABLE_LEAGUES.find((l) => l.id === savedLeagueId)
        if (foundLeague) {
          setSelectedLeagueState(foundLeague)

          if (savedSeasonId) {
            const seasonNum = Number(savedSeasonId)
            const hasSeason = foundLeague.seasons.some((s) => s.id === seasonNum)
            if (hasSeason) {
              setSelectedSeasonIdState(seasonNum)
              return
            }
          }
          setSelectedSeasonIdState(foundLeague.activeSeasonId)
          return
        }
      }
    } catch {}
  }, [])

  const setLeague = (leagueId: string) => {
    const found = AVAILABLE_LEAGUES.find((l) => l.id === leagueId)
    if (!found) return

    setSelectedLeagueState(found)
    setSelectedSeasonIdState(found.activeSeasonId)

    try {
      localStorage.setItem(STORAGE_LEAGUE_KEY, found.id)
      localStorage.setItem(STORAGE_SEASON_KEY, String(found.activeSeasonId))
    } catch {}
  }

  const setSeason = (seasonId: number) => {
    const hasSeason = selectedLeague.seasons.some((s) => s.id === seasonId)
    if (!hasSeason) return

    setSelectedSeasonIdState(seasonId)

    try {
      localStorage.setItem(STORAGE_SEASON_KEY, String(seasonId))
    } catch {}
  }

  return (
    <LeagueContext.Provider
      value={{
        selectedLeague,
        selectedSeasonId,
        availableLeagues: AVAILABLE_LEAGUES,
        setLeague,
        setSeason,
      }}
    >
      {children}
    </LeagueContext.Provider>
  )
}

export function useLeague() {
  return useContext(LeagueContext)
}
