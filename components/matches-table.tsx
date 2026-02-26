"use client"

import { useEffect, useState } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import type { Round, Team } from "@/types/kings-league"
import { RoundSelector } from "@/components/matches/round-selector"
import { DateGroup } from "@/components/matches/date-group"
import { DateFormatter } from "@/lib/date-formatter"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn } from "@/lib/utils"
import { PlayoffBracketView } from "@/components/playoffs/playoff-bracket-view"
import { generatePlayoffBracket } from "@/lib/generate-playoff-bracket"
import { calculateStandings } from "@/lib/calculate-standings"
import { getSimulatedPlayoffs, getSimulatedStandings } from "@/lib/simulated-data-manager"
import { useMemo } from "react"

interface MatchesTableProps {
  rounds: Round[]
  teams: Record<string, Team>
  onScoreUpdate: (
    roundId: number,
    matchId: number,
    homeScore: number | null | string,
    awayScore: number | null | string,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => void
}

export default function MatchesTable({ rounds, teams, onScoreUpdate }: MatchesTableProps) {
  const [showPlayoffs, setShowPlayoffs] = useState(false)
  const [selectedRound, setSelectedRound] = useState<string>("")
  const [scores, setScores] = useState<Record<string, { home: string; away: string; shootoutWinner: string | null }>>({})
  const [showShootout, setShowShootout] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  const { favoriteTeam } = useTeamTheme()

  // Build playoff bracket safely (client-only localStorage fallback). Use useMemo to avoid accessing localStorage on server.
  const playoffBracket = useMemo(() => {
    let bracket: any = null
    try {
      if (rounds.length > 0 && teams && Object.keys(teams).length >= 7) {
        // Try to build playoff bracket from available standings on rounds or by calculating standings
        const lastRound = rounds[rounds.length - 1]
        let standingsArray: any[] = []
        if (lastRound && (lastRound as any).standings && Array.isArray((lastRound as any).standings) && (lastRound as any).standings.length >= 7) {
          standingsArray = (lastRound as any).standings
        } else {
          // Calculate standings from rounds as a fallback
          try {
            const standingsObj = calculateStandings(rounds, teams, [])
            standingsArray = Object.values(standingsObj).flat()
          } catch (e) {
            standingsArray = []
          }
        }

        if (standingsArray.length >= 7) {
          bracket = generatePlayoffBracket(standingsArray as any[], teams)
        }
      }

      // If not possible yet, try to read simulated playoffs/standings from localStorage (client-only)
      if (!bracket && typeof window !== "undefined") {
        const simulated = getSimulatedPlayoffs()
        if (simulated) return simulated

        const simStandings = getSimulatedStandings()
        if (simStandings && Array.isArray(simStandings) && simStandings.length >= 7) {
          try {
            bracket = generatePlayoffBracket(simStandings as any[], teams)
          } catch { }
        }
      }
    } catch { }

    return bracket
  }, [rounds, teams])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize scores & shootout visibility from rounds
  useEffect(() => {
    const initialScores: Record<string, { home: string; away: string; shootoutWinner: string | null }> = {}
    const initialShowShootout: Record<string, boolean> = {}

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const matchKey = `${round.id}-${match.id}`
        const shootoutWinner =
          match.scores.homeScoreP !== null && match.scores.awayScoreP !== null
            ? match.scores.homeScoreP > match.scores.awayScoreP
              ? "home"
              : "away"
            : null

        initialScores[matchKey] = {
          home: match.scores.homeScore !== null ? String(match.scores.homeScore) : "",
          away: match.scores.awayScore !== null ? String(match.scores.awayScore) : "",
          shootoutWinner: shootoutWinner,
        }

        initialShowShootout[matchKey] =
          (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) ||
          (match.scores.homeScore === match.scores.awayScore &&
            match.scores.homeScore !== null &&
            match.scores.awayScore !== null)
      })
    })

    setScores(initialScores)
    setShowShootout(initialShowShootout)
  }, [rounds])

  // Select default round (first unfinished or last)
  useEffect(() => {
    if (rounds.length > 0 && !selectedRound) {
      const firstUnfinishedRound = rounds.find((round) => {
        return !round.ended || round.matches.some((m) => m.scores.homeScore === null || m.scores.awayScore === null)
      })

      if (firstUnfinishedRound) setSelectedRound(String(firstUnfinishedRound.id))
      else setSelectedRound(String(rounds[rounds.length - 1].id))
    }
  }, [rounds, selectedRound])

  const currentRound = rounds.find((r) => String(r.id) === selectedRound)

  // Show Playoffs button only when the last round (9th) is selected and a bracket exists
  const isLastRoundSelected = rounds.length === 9 && selectedRound && Number(selectedRound) === rounds[rounds.length - 1].id
  const canShowPlayoffsButton = isLastRoundSelected && !!playoffBracket

  const getMatchesByDate = (round: Round) => {
    const matchesByDate: Record<string, typeof round.matches> = {}
    round.matches.forEach((match) => {
      const dateOnly = DateFormatter.formatDateForGrouping(match.date)
      if (!matchesByDate[dateOnly]) matchesByDate[dateOnly] = []
      matchesByDate[dateOnly].push(match)
    })
    return matchesByDate
  }

  const handleRoundSelect = (roundId: string) => setSelectedRound(roundId)

  // When user selects a round, ensure we exit playoffs view
  const handleRoundSelectAndExitPlayoffs = (roundId: string) => {
    setSelectedRound(roundId)
    setShowPlayoffs(false)
  }

  const handleScoreChange = (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string,
    isBackspace?: boolean
  ) => {
    const matchKey = `${roundId}-${matchId}`

    if (isBackspace) {
      setScores((prev) => ({
        ...prev,
        [matchKey]: { ...(prev[matchKey] ?? { home: "", away: "", shootoutWinner: null }), [team]: "" },
      }))

      onScoreUpdate(roundId, matchId, team === "home" ? "" : null, team === "away" ? "" : null)
      return
    }

    setScores((prev) => {
      const currentMatch = prev[matchKey] ?? { home: "", away: "", shootoutWinner: null }
      const updated = { ...prev, [matchKey]: { ...currentMatch, [team]: value } }

      const updatedMatch = updated[matchKey]
      if (updatedMatch.home && updatedMatch.away && updatedMatch.home === updatedMatch.away) {
        setShowShootout((s) => ({ ...s, [matchKey]: true }))
      }

      return updated
    })

    const score = value === "" ? null : Number(value)
    onScoreUpdate(roundId, matchId, team === "home" ? score : null, team === "away" ? score : null)
  }

  const handleShootoutWinner = (roundId: number, matchId: number, winner: "home" | "away" | null) => {
    const matchKey = `${roundId}-${matchId}`
    setScores((prev) => ({ ...(prev ?? {}), [matchKey]: { ...(prev[matchKey] ?? { home: "", away: "", shootoutWinner: null }), shootoutWinner: winner } }))

    const current = scores[matchKey]
    onScoreUpdate(
      roundId,
      matchId,
      current?.home ? Number(current.home) : null,
      current?.away ? Number(current.away) : null,
      winner === "home" ? 5 : winner === "away" ? 3 : undefined,
      winner === "home" ? 3 : winner === "away" ? 5 : undefined
    )

    if (winner === null) setShowShootout((s) => ({ ...s, [matchKey]: false }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F4AF23]/10 border border-[#F4AF23]/20">
            <Calendar className="w-5 h-5 text-[#F4AF23]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Partidas</h2>
            <p className="text-sm text-gray-500">Simule os resultados</p>
          </div>
        </div>

        {canShowPlayoffsButton && (
          <button
            onClick={() => setShowPlayoffs(true)}
            aria-label="Ver playoffs"
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full",
              "bg-[#F4AF23] text-black",
              "transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[#F4AF23]/25",
              "focus:outline-none focus:ring-2 focus:ring-[#F4AF23]/50"
            )}
          >
            <span>Playoffs</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Round Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <RoundSelector rounds={rounds} selectedRound={selectedRound} onRoundSelect={handleRoundSelectAndExitPlayoffs} />
        </div>

        {canShowPlayoffsButton && (
          <button
            onClick={() => setShowPlayoffs(true)}
            aria-label="Ver playoffs"
            className={cn(
              "sm:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full",
              "bg-[#F4AF23] text-black",
              "transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[#F4AF23]/25",
              "focus:outline-none focus:ring-2 focus:ring-[#F4AF23]/50"
            )}
          >
            <span>Ver Playoffs</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Matches or Playoffs */}
      {showPlayoffs ? (
        <div className="mt-8">
          <PlayoffBracketView bracket={playoffBracket} teams={teams} onBracketUpdate={() => { }} />
        </div>
      ) : currentRound ? (
        <div className="space-y-6" role="region" aria-label="Partidas da rodada">
          {Object.entries(getMatchesByDate(currentRound)).map(([date, matches]) => (
            <DateGroup
              key={date}
              date={date}
              matches={matches}
              round={currentRound}
              teams={teams}
              scores={scores}
              showShootout={showShootout}
              onScoreChange={handleScoreChange}
              onShootoutWinnerSelect={handleShootoutWinner}
              favoriteTeam={favoriteTeam}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Calendar className="w-8 h-8 text-gray-600" aria-hidden="true" />
          </div>
          <p className="text-gray-500 text-sm">Selecione uma rodada para visualizar as partidas</p>
        </div>
      )}
    </div>
  )
}

