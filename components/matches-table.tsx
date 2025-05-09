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
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="border-b border-[#333] pb-2">
        <div className="flex items-center gap-2 text-[var(--team-primary)]">
          <Calendar className="w-5 h-5" />
          <span className="text-lg font-medium">Calendário e Resultados</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">Acompanhe as partidas e simule resultados</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <RoundSelector
              rounds={rounds}
              selectedRound={selectedRound}
              onRoundSelect={handleRoundSelect}
            />

            {/* se as rodadas acabaram mostrar o playoffs */}

            {rounds.every(round => round.ended) && (
              <Link
                href={"/playoffs"}
                onClick={() => handleRoundSelect("playoffs")}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors bg-[var(--team-primary)] text-black filter hover:brightness-95",
                )}
              >
                Playoffs
              </Link>
            )}
          </div>

          {currentRound && (
            <div className="space-y-4 mt-4">
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
