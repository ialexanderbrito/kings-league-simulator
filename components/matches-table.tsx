"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import type { Round, Team } from "@/types/kings-league"
import { RoundSelector } from "@/components/matches/round-selector"
import { DateGroup } from "@/components/matches/date-group"
import { DateFormatter } from "@/lib/date-formatter"
import { useTeamTheme } from "@/contexts/team-theme-context"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
  const [selectedRound, setSelectedRound] = useState<string>("")
  const [scores, setScores] = useState<Record<string, {
    home: string
    away: string
    shootoutWinner: string | null
  }>>({})
  const [showShootout, setShowShootout] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  const { favoriteTeam } = useTeamTheme()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleScoreChange = (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string,
    isBackspace?: boolean
  ) => {
    const matchKey = `${roundId}-${matchId}`

    if (isBackspace) {
      setScores((prev) => {
        const currentMatch = prev[matchKey] || { home: "", away: "", shootoutWinner: null }
        return {
          ...prev,
          [matchKey]: {
            ...currentMatch,
            [team]: ""
          }
        }
      })

      onScoreUpdate(
        roundId,
        matchId,
        team === "home" ? '' : null,
        team === "away" ? '' : null,
        undefined,
        undefined
      )
      return
    }

    setScores((prev) => {
      const currentMatch = prev[matchKey] || { home: "", away: "", shootoutWinner: null }

      const newScores = {
        ...prev,
        [matchKey]: {
          ...currentMatch,
          [team]: value
        }
      }

      const updatedMatch = newScores[matchKey]

      if (updatedMatch.home && updatedMatch.away && updatedMatch.home === updatedMatch.away) {
        setShowShootout(prev => ({
          ...prev,
          [matchKey]: true
        }))
      }

      return newScores
    })

    const score = value === "" ? null : Number(value)

    onScoreUpdate(
      roundId,
      matchId,
      team === "home" ? score : null,
      team === "away" ? score : null,
      undefined,
      undefined
    )
  }

  const handleShootoutWinner = (roundId: number, matchId: number, winner: "home" | "away" | null) => {
    const matchKey = `${roundId}-${matchId}`

    setScores((prev) => {
      const currentMatch = prev[matchKey] || { home: "", away: "", shootoutWinner: null }
      return {
        ...prev,
        [matchKey]: {
          ...currentMatch,
          shootoutWinner: winner
        }
      }
    })

    const currentScores = scores[matchKey]

    onScoreUpdate(
      roundId,
      matchId,
      currentScores?.home ? Number(currentScores.home) : null,
      currentScores?.away ? Number(currentScores.away) : null,
      winner === "home" ? 5 : winner === "away" ? 3 : undefined,
      winner === "home" ? 3 : winner === "away" ? 5 : undefined
    )

    if (winner === null) {
      setShowShootout(prev => ({
        ...prev,
        [matchKey]: false
      }))
    }
  }

  const handleRoundSelect = (roundId: string) => {
    setSelectedRound(roundId)
  }

  useEffect(() => {
    const initialScores: Record<string, {
      home: string
      away: string
      shootoutWinner: string | null
    }> = {}
    const initialShowShootout: Record<string, boolean> = {}

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const matchKey = `${round.id}-${match.id}`

        const shootoutWinner = match.scores.homeScoreP !== null && match.scores.awayScoreP !== null
          ? match.scores.homeScoreP > match.scores.awayScoreP
            ? "home"
            : "away"
          : null

        initialScores[matchKey] = {
          home: match.scores.homeScore !== null ? match.scores.homeScore.toString() : "",
          away: match.scores.awayScore !== null ? match.scores.awayScore.toString() : "",
          shootoutWinner: shootoutWinner
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

  useEffect(() => {
    if (rounds.length > 0 && !selectedRound) {
      // Encontrar a rodada atual (primeira rodada não encerrada)
      const firstUnfinishedRound = rounds.find((round) => {
        // Verificar se a rodada não está encerrada OU se não tem todas as partidas finalizadas
        return !round.ended || round.matches.some(
          match => match.scores.homeScore === null || match.scores.awayScore === null
        );
      });

      if (firstUnfinishedRound) {
        setSelectedRound(firstUnfinishedRound.id.toString());
      } else {
        // Se todas rodadas estiverem encerradas, seleciona a última
        setSelectedRound(rounds[rounds.length - 1].id.toString());
      }
    }
  }, [rounds, selectedRound])

  const currentRound = rounds.find(round => round.id.toString() === selectedRound)

  const getMatchesByDate = (round: Round) => {
    const matchesByDate: Record<string, typeof round.matches> = {}

    round?.matches.forEach(match => {
      const dateOnly = DateFormatter.formatDateForGrouping(match.date)
      if (!matchesByDate[dateOnly]) {
        matchesByDate[dateOnly] = []
      }
      matchesByDate[dateOnly].push(match)
    })

    return matchesByDate
  }

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[var(--team-primary)]/10">
              <Calendar className="w-5 h-5 text-[var(--team-primary)]" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-foreground">
                Calendário e Resultados
              </h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe as partidas e simule resultados
              </p>
            </div>
          </div>

          {rounds.every(round => round.ended) && (
            <Link
              href="/playoffs"
              onClick={() => handleRoundSelect("playoffs")}
              aria-label="Ver playoffs"
              className={cn(
                "hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full",
                "bg-[var(--team-primary)] text-background shadow-md shadow-[var(--team-primary)]/20",
                "transition-all duration-200 hover:brightness-95",
                "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background"
              )}
            >
              <span>Playoffs</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <RoundSelector
                rounds={rounds}
                selectedRound={selectedRound}
                onRoundSelect={handleRoundSelect}
              />
            </div>

            {rounds.every(round => round.ended) && (
              <Link
                href="/playoffs"
                onClick={() => handleRoundSelect("playoffs")}
                aria-label="Ver playoffs"
                className={cn(
                  "sm:hidden flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full",
                  "bg-[var(--team-primary)] text-background shadow-md shadow-[var(--team-primary)]/20",
                  "transition-all duration-200 hover:brightness-95",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background"
                )}
              >
                <span>Ver Playoffs</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {currentRound ? (
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
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground text-sm">
                Selecione uma rodada para visualizar as partidas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
