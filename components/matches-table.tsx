"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, ExternalLink } from "lucide-react"
import Image from "next/image"
import type { Round, Team } from "@/types/kings-league"
import { cn } from "@/lib/utils"

interface MatchesTableProps {
  rounds: Round[]
  teams: Record<string, Team>
  onScoreUpdate: (
    roundId: number,
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => void
}

export default function MatchesTable({ rounds, teams, onScoreUpdate }: MatchesTableProps) {
  const [expandedRounds, setExpandedRounds] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, {
    home: string
    away: string
    shootoutWinner: string | null
  }>>({})
  const [showShootout, setShowShootout] = useState<Record<string, boolean>>({})

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleScoreChange = (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string
  ) => {
    const matchKey = `${roundId}-${matchId}`

    setScores((prev) => {
      const currentMatch = prev[matchKey] || { home: "", away: "", shootoutWinner: null }
      const updatedMatch = {
        ...currentMatch,
        [team]: value,
      }

      return {
        ...prev,
        [matchKey]: updatedMatch,
      }
    })

    const score = value === "" ? null : Number.parseInt(value, 10)

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
      winner === "home" ? 1 : winner === "away" ? 0 : null,
      winner === "home" ? 0 : winner === "away" ? 1 : null
    )
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
          shootoutWinner
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
    if (rounds.length > 0 && expandedRounds.length === 0) {
      const firstUnfinishedRound = rounds.find((round) => !round.ended)
      if (firstUnfinishedRound) {
        setExpandedRounds([firstUnfinishedRound.id.toString()])
      } else {
        setExpandedRounds([rounds[rounds.length - 1].id.toString()])
      }
    }
  }, [rounds, expandedRounds])

  return (
    <Accordion
      type="single"
      collapsible
      value={expandedRounds[0]}
      onValueChange={(value) => setExpandedRounds(value ? [value] : [])}
      className="space-y-2"
    >
      {rounds.map((round) => (
        <AccordionItem
          key={round.id}
          value={round.id.toString()}
          className="border rounded-lg overflow-hidden bg-[#1a1a1a] border-[#333]"
        >
          <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-[#252525] [&[data-state=open]>svg]:rotate-180 text-white">
            <div className="flex items-center gap-2 text-left">
              <Calendar className="w-4 h-4 text-[#F4AF23]" />
              <span className="font-medium text-sm">{round.name.replace('Jornada', 'Rodada')}</span>
              <span className="text-xs text-gray-400 ml-2">
                {round.ended ? (
                  <Badge variant="success" className="flex items-center gap-1 bg-green-600 text-xs py-0 h-5">
                    <Check className="w-3 h-3" />
                    Finalizada
                  </Badge>
                ) : (
                  <Badge variant="warning" className="flex items-center gap-1 bg-[#F4AF23] text-black text-xs py-0 h-5">
                    <Clock className="w-3 h-3" />
                    Pendente
                  </Badge>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2 bg-[#1a1a1a] text-white divide-y divide-[#333]">
            {round.matches.map((match) => {
              const homeTeam = teams[match.participants.homeTeamId]
              const awayTeam = teams[match.participants.awayTeamId]
              const matchKey = `${round.id}-${match.id}`
              const currentScores = scores[matchKey] || {
                home: "",
                away: "",
                shootoutWinner: null
              }
              const isMatchEnded = match.status === "ended"
              const showShootoutInputs = showShootout[matchKey]

              const homeScore = Number(match.scores.homeScore)
              const awayScore = Number(match.scores.awayScore)
              const shootoutWinner = currentScores.shootoutWinner

              let winner = null
              if (homeScore !== null && awayScore !== null) {
                if (homeScore > awayScore) {
                  winner = 'home'
                } else if (awayScore > homeScore) {
                  winner = 'away'
                } else if (shootoutWinner) {
                  winner = shootoutWinner
                }
              }

              if (!homeTeam || !awayTeam) return null

              return (
                <Card key={match.id} className="overflow-hidden border-0 bg-transparent text-white rounded-none">
                  <CardHeader className="py-2 px-3 bg-transparent">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{formatDate(match.date)}</span>
                      {match.metaInformation?.youtube_url && (
                        <a
                          href={match.metaInformation.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#F4AF23] hover:underline"
                          aria-label={`Assistir ${homeTeam.name} vs ${awayTeam.name} no YouTube`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">Ver no YouTube</span>
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                      <div className={cn(
                        "flex items-center justify-end gap-2",
                        winner === 'home' && 'text-green-400'
                      )}>
                        <div className="text-right">
                          <p className="font-medium text-sm">{homeTeam.shortName}</p>
                        </div>
                        {homeTeam.logo && (
                          <div className="w-10 h-10 relative">
                            <Image
                              src={homeTeam.logo.url || "/placeholder.svg"}
                              alt={homeTeam.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {isMatchEnded ? (
                        <div className="flex flex-col items-center">
                          <div className="text-base font-semibold">
                            <span className={cn(
                              winner === 'home' ? "text-green-400" : "text-gray-400"
                            )}>
                              {match.scores.homeScore}
                            </span>
                            <span className="text-gray-400 mx-2">x</span>
                            <span className={cn(
                              winner === 'away' ? "text-green-400" : "text-gray-400"
                            )}>
                              {match.scores.awayScore}
                            </span>
                          </div>
                          {match.scores.homeScore === match.scores.awayScore &&
                            match.scores.homeScoreP !== null &&
                            match.scores.awayScoreP !== null && (
                              <div className="text-xs text-gray-400 mt-1">
                                Vencedor nos pênaltis: {match.scores.homeScoreP > match.scores.awayScoreP ? homeTeam.shortName : awayTeam.shortName}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2">
                            <label className="sr-only" htmlFor={`home-score-${match.id}`}>
                              Placar {homeTeam.name}
                            </label>
                            <input
                              id={`home-score-${match.id}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={2}
                              className="w-8 h-8 text-center bg-[#333] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4AF23] text-white text-sm"
                              value={currentScores.home}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "")
                                handleScoreChange(round.id, match.id, "home", value)

                                if (value && value === currentScores.away) {
                                  setShowShootout(prev => ({
                                    ...prev,
                                    [matchKey]: true
                                  }))
                                }
                              }}
                              aria-label={`Placar ${homeTeam.name}`}
                            />
                            <span className="text-gray-400">x</span>
                            <label className="sr-only" htmlFor={`away-score-${match.id}`}>
                              Placar {awayTeam.name}
                            </label>
                            <input
                              id={`away-score-${match.id}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={2}
                              className="w-8 h-8 text-center bg-[#333] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4AF23] text-white text-sm"
                              value={currentScores.away}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "")
                                handleScoreChange(round.id, match.id, "away", value)

                                if (value && value === currentScores.home) {
                                  setShowShootout(prev => ({
                                    ...prev,
                                    [matchKey]: true
                                  }))
                                }
                              }}
                              aria-label={`Placar ${awayTeam.name}`}
                            />
                          </div>

                          {showShootoutInputs && (
                            <div className="flex flex-col items-center gap-1 border-t border-[#333] mt-2 pt-2">
                              <span className="text-xs text-gray-400 mb-1">Vencedor nos pênaltis</span>
                              <div className="flex gap-1 w-full justify-center">
                                <button
                                  className={cn(
                                    "px-3 py-1 text-xs rounded transition-colors flex-1 max-w-24",
                                    shootoutWinner === "home"
                                      ? "bg-green-600 text-white"
                                      : "bg-[#333] hover:bg-[#444] text-gray-300"
                                  )}
                                  onClick={() => handleShootoutWinner(round.id, match.id, shootoutWinner === "home" ? null : "home")}
                                >
                                  {homeTeam.shortName}
                                </button>
                                <button
                                  className={cn(
                                    "px-3 py-1 text-xs rounded transition-colors flex-1 max-w-24",
                                    shootoutWinner === "away"
                                      ? "bg-green-600 text-white"
                                      : "bg-[#333] hover:bg-[#444] text-gray-300"
                                  )}
                                  onClick={() => handleShootoutWinner(round.id, match.id, shootoutWinner === "away" ? null : "away")}
                                >
                                  {awayTeam.shortName}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={cn(
                        "flex items-center gap-2",
                        winner === 'away' && 'text-green-400'
                      )}>
                        {awayTeam.logo && (
                          <div className="w-10 h-10 relative">
                            <Image
                              src={awayTeam.logo.url || "/placeholder.svg"}
                              alt={awayTeam.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-medium text-sm">{awayTeam.shortName}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
