"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, ExternalLink } from "lucide-react"
import Image from "next/image"
import type { Round, Team } from "@/types/kings-league"

interface MatchesTableProps {
  rounds: Round[]
  teams: Record<string, Team>
  onScoreUpdate: (roundId: number, matchId: number, homeScore: number | null, awayScore: number | null) => void
}

export default function MatchesTable({ rounds, teams, onScoreUpdate }: MatchesTableProps) {
  const [expandedRounds, setExpandedRounds] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})

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

  const handleScoreChange = (roundId: number, matchId: number, team: "home" | "away", value: string) => {
    const matchKey = `${roundId}-${matchId}`

    // Atualizar o estado local dos scores
    setScores((prev) => {
      const currentMatch = prev[matchKey] || { home: "", away: "" }
      const updatedMatch = {
        ...currentMatch,
        [team]: value,
      }

      return {
        ...prev,
        [matchKey]: updatedMatch,
      }
    })

    // Converter para número ou null e atualizar o estado global
    const score = value === "" ? null : Number.parseInt(value, 10)

    if (team === "home") {
      onScoreUpdate(roundId, matchId, score, null)
    } else {
      onScoreUpdate(roundId, matchId, null, score)
    }
  }

  // Inicializar o estado de scores com os valores atuais das partidas
  useEffect(() => {
    const initialScores: Record<string, { home: string; away: string }> = {}

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const matchKey = `${round.id}-${match.id}`
        initialScores[matchKey] = {
          home: match.scores.homeScore !== null ? match.scores.homeScore.toString() : "",
          away: match.scores.awayScore !== null ? match.scores.awayScore.toString() : "",
        }
      })
    })

    setScores(initialScores)
  }, [rounds])

  // Expandir a primeira rodada não finalizada por padrão
  useEffect(() => {
    if (rounds.length > 0 && expandedRounds.length === 0) {
      const firstUnfinishedRound = rounds.find((round) => !round.ended)
      if (firstUnfinishedRound) {
        setExpandedRounds([firstUnfinishedRound.id.toString()])
      } else {
        // Se todas estiverem finalizadas, expandir a última
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
      className="space-y-4"
    >
      {rounds.map((round) => (
        <AccordionItem
          key={round.id}
          value={round.id.toString()}
          className="border rounded-lg overflow-hidden bg-[#1a1a1a] border-[#333]"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#252525] [&[data-state=open]>svg]:rotate-180 text-white">
            <div className="flex items-center gap-2 text-left">
              <Calendar className="w-4 h-4 text-[#F4AF23]" />
              <span className="font-medium">{round.name}</span>
              <span className="text-sm text-gray-400 ml-2">
                {round.ended ? (
                  <Badge variant="success" className="flex items-center gap-1 bg-green-600">
                    <Check className="w-3 h-3" />
                    Finalizada
                  </Badge>
                ) : (
                  <Badge variant="warning" className="flex items-center gap-1 bg-[#F4AF23] text-black">
                    <Clock className="w-3 h-3" />
                    Pendente
                  </Badge>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 bg-[#1a1a1a] text-white">
            <div className="space-y-4">
              {round.matches.map((match) => {
                const homeTeam = teams[match.participants.homeTeamId]
                const awayTeam = teams[match.participants.awayTeamId]
                const matchKey = `${round.id}-${match.id}`
                const currentScores = scores[matchKey] || { home: "", away: "" }
                const isMatchEnded = match.status === "ended"

                if (!homeTeam || !awayTeam) {
                  console.warn(
                    `Time não encontrado: homeTeamId=${match.participants.homeTeamId}, awayTeamId=${match.participants.awayTeamId}`,
                  )
                  return null
                }

                return (
                  <Card key={match.id} className="overflow-hidden border-[#333] bg-[#252525] text-white">
                    <CardHeader className="py-2 px-4 bg-[#333]">
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
                            Ver no YouTube
                          </a>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <p className="font-medium">{homeTeam.shortName}</p>
                          </div>
                          {homeTeam.logo && (
                            <div className="w-12 h-12 relative">
                              <Image
                                src={homeTeam.logo.url || "/placeholder.svg"}
                                alt={homeTeam.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {isMatchEnded ? (
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-semibold">
                              <span
                                className={
                                  Number(match.scores.homeScore) > Number(match.scores.awayScore)
                                    ? "text-[#F4AF23]"
                                    : "text-gray-400"
                                }
                              >
                                {match.scores.homeScore}
                              </span>
                              <span className="text-gray-400 mx-2">x</span>
                              <span
                                className={
                                  Number(match.scores.awayScore) > Number(match.scores.homeScore)
                                    ? "text-[#F4AF23]"
                                    : "text-gray-400"
                                }
                              >
                                {match.scores.awayScore}
                              </span>
                            </div>
                            {match.scores.homeScore === match.scores.awayScore &&
                              match.scores.homeScoreP !== null &&
                              match.scores.awayScoreP !== null && (
                                <div className="text-sm text-gray-400 mt-1">
                                  Shootouts: {match.scores.homeScoreP} - {match.scores.awayScoreP}
                                </div>
                              )}
                          </div>
                        ) : (
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
                              className="w-10 h-8 text-center bg-[#333] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4AF23] text-white"
                              value={currentScores.home}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "")
                                handleScoreChange(round.id, match.id, "home", value)
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
                              className="w-10 h-8 text-center bg-[#333] border border-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4AF23] text-white"
                              value={currentScores.away}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "")
                                handleScoreChange(round.id, match.id, "away", value)
                              }}
                              aria-label={`Placar ${awayTeam.name}`}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {awayTeam.logo && (
                            <div className="w-12 h-12 relative">
                              <Image
                                src={awayTeam.logo.url || "/placeholder.svg"}
                                alt={awayTeam.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-medium">{awayTeam.shortName}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
