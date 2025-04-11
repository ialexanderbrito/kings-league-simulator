"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, ExternalLink, Youtube, Calendar as DateIcon, Trophy } from "lucide-react"
import Image from "next/image"
import type { Round, Team } from "@/types/kings-league"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) return dateString // Retornar a string ISO no servidor

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dateString
    }
  }

  const formatDateForGrouping = (dateString: string) => {
    if (!isClient) return dateString.split('T')[0] // No servidor, apenas retorna a data

    try {
      const date = new Date(dateString)
      // Usando a data com o timezone local para agrupamento
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    } catch (error) {
      console.error("Erro ao formatar data para agrupamento:", error)
      return dateString.split('T')[0]
    }
  }

  const formatDateDisplay = (dateString: string) => {
    if (!isClient) return dateString // Retornar a string ISO no servidor

    try {
      // Criando a data evitando problemas de fuso horário
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day, 12, 0, 0) // Usando meio-dia para evitar problemas de fuso horário

      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(date)
    } catch (error) {
      console.error("Erro ao formatar exibição da data:", error)
      return dateString
    }
  }

  const getWeekdayName = (dateString: string) => {
    if (!isClient) return ""

    try {
      // Criando a data evitando problemas de fuso horário
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day, 12, 0, 0) // Usando meio-dia para evitar problemas de fuso horário
      return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "")
    } catch (error) {
      console.error("Erro ao obter dia da semana:", error)
      return ""
    }
  }

  const handleScoreChange = (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string,
    isBackspace?: boolean
  ) => {
    const matchKey = `${roundId}-${matchId}`

    // Se for backspace e o valor tiver apenas um dígito, limpar o campo
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
        team === "home" ? null : null,
        team === "away" ? null : null,
        undefined,
        undefined
      )
      return
    }

    // Tratar entrada normal de números
    setScores((prev) => {
      const currentMatch = prev[matchKey] || { home: "", away: "", shootoutWinner: null }
      return {
        ...prev,
        [matchKey]: {
          ...currentMatch,
          [team]: value
        }
      }
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
    // Atribuindo valores corretos para pênaltis: o vencedor recebe valor maior
    // ou null quando não há vencedor definido
    onScoreUpdate(
      roundId,
      matchId,
      currentScores?.home ? Number(currentScores.home) : null,
      currentScores?.away ? Number(currentScores.away) : null,
      winner === "home" ? 5 : winner === "away" ? 3 : null,
      winner === "home" ? 3 : winner === "away" ? 5 : null
    )

    // Se não houver vencedor definido, ocultar a seção de pênaltis
    if (winner === null) {
      setShowShootout(prev => ({
        ...prev,
        [matchKey]: false
      }))
    }
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
        // Corrigindo a lógica do vencedor dos pênaltis
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
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="border-b border-[#333] pb-2">
        <div className="flex items-center gap-2 text-[#F4AF23]">
          <Calendar className="w-5 h-5" />
          <span className="text-lg font-medium">Calendário e Resultados</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">Acompanhe as partidas e simule resultados</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <ScrollArea className="w-full pb-1">
            <div className="flex space-x-1 px-1 min-w-max pb-1">
              {rounds.map((round) => (
                <button
                  key={round.id}
                  onClick={() => setExpandedRounds([round.id.toString()])}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                    expandedRounds[0] === round.id.toString()
                      ? "bg-[#F4AF23] text-black"
                      : "bg-[#252525] text-gray-300 hover:bg-[#333]"
                  )}
                >
                  {round.name.replace('Jornada', 'R').replace('Rodada', 'R')}
                  {round.ended && <Check className="inline w-3 h-3 ml-1" />}
                </button>
              ))}
            </div>
            <ScrollBar
              orientation="horizontal"
              className="h-1.5 bg-transparent mt-1"
              thumbClassName="bg-[#F4AF23]/40 hover:bg-[#F4AF23]/60 active:bg-[#F4AF23]/80 transition-colors duration-200"
            />
          </ScrollArea>

          {rounds.map((round) => {
            if (expandedRounds[0] !== round.id.toString()) return null;

            const matchesByDate: Record<string, typeof round.matches> = {};
            round.matches.forEach(match => {
              // Pegar apenas a data (sem horas)
              const dateOnly = formatDateForGrouping(match.date);
              if (!matchesByDate[dateOnly]) {
                matchesByDate[dateOnly] = [];
              }
              matchesByDate[dateOnly].push(match);
            });

            return (
              <div key={round.id} className="space-y-4">
                {Object.entries(matchesByDate).map(([date, matches], index) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
                      <DateIcon className="w-3.5 h-3.5" />
                      <span>{getWeekdayName(date)}, {formatDateDisplay(date)}</span>
                    </div>

                    <div className="space-y-2">
                      {matches.map((match) => {
                        const homeTeam = teams[match.participants.homeTeamId];
                        const awayTeam = teams[match.participants.awayTeamId];
                        const matchKey = `${round.id}-${match.id}`;
                        const currentScores = scores[matchKey] || {
                          home: "",
                          away: "",
                          shootoutWinner: null
                        };
                        const isMatchEnded = match.status === "ended";
                        const showShootoutInputs = showShootout[matchKey];

                        const homeScore = match.scores.homeScore;
                        const awayScore = match.scores.awayScore;
                        const shootoutWinner = currentScores.shootoutWinner;

                        let winner = null;
                        if (homeScore !== null && awayScore !== null) {
                          if (homeScore > awayScore) {
                            winner = 'home';
                          } else if (awayScore > homeScore) {
                            winner = 'away';
                          } else if (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) {
                            // Se houve pênaltis, determina o vencedor baseado no placar dos pênaltis
                            winner = match.scores.homeScoreP > match.scores.awayScoreP ? 'home' : 'away';
                          }
                        }

                        if (!homeTeam || !awayTeam) return null;

                        return (
                          <div
                            key={match.id}
                            className="bg-[#252525] rounded-md p-3 border border-[#333] hover:border-[#444] transition-colors"
                          >
                            <div className="grid grid-cols-[minmax(0,1.2fr),auto,minmax(0,1.2fr)] sm:grid-cols-[minmax(0,1.5fr),auto,minmax(0,1.5fr)] items-center gap-2 md:gap-4 w-full">
                              {/* Time da casa */}
                              <div className={cn("flex items-center justify-end gap-1 sm:gap-2 min-w-0", showShootoutInputs ? 'mt-0' : 'mt-4')}>
                                <div className="flex-1 text-right overflow-hidden">
                                  <p className={cn(
                                    "font-medium text-xs sm:text-sm md:text-base truncate max-w-full",
                                    winner === 'home' ? "text-green-400" : "text-white"
                                  )}
                                    title={homeTeam.name} // Tooltip nativo para mostrar nome completo
                                  >
                                    {homeTeam.name}
                                  </p>
                                  <p className="text-xs text-gray-400 hidden md:block truncate">
                                    {homeTeam.shortName}
                                  </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                                  <Image
                                    src={homeTeam.logo?.url || "/placeholder.svg"}
                                    alt={homeTeam.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                </div>
                              </div>

                              {/* Placar */}
                              <div className="flex flex-col items-center px-1 sm:px-2">
                                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 text-center">
                                  {formatDate(match.date)}
                                </div>

                                {isMatchEnded ? (
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center">
                                      <div className={cn(
                                        "w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded bg-[#333] font-semibold text-sm sm:text-base",
                                        winner === 'home' && "bg-green-900/50"
                                      )}>
                                        {match.scores.homeScore}
                                      </div>
                                      <span className="text-gray-400 mx-1">:</span>
                                      <div className={cn(
                                        "w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded bg-[#333] font-semibold text-sm sm:text-base",
                                        winner === 'away' && "bg-green-900/50"
                                      )}>
                                        {match.scores.awayScore}
                                      </div>
                                    </div>

                                    {/* Mostrar pênaltis abaixo do placar principal */}
                                    {match.scores.homeScoreP !== null && match.scores.awayScoreP !== null && (
                                      <div className="flex items-center mt-1.5">
                                        <span className="text-[10px] sm:text-xs text-gray-400 mr-1">(pen</span>
                                        <span className={cn(
                                          "text-[10px] sm:text-xs font-medium",
                                          match.scores.homeScoreP > match.scores.awayScoreP
                                            ? "text-green-400"
                                            : "text-gray-400"
                                        )}>
                                          {match.scores.homeScoreP}
                                        </span>
                                        <span className="text-gray-400 mx-0.5">:</span>
                                        <span className={cn(
                                          "text-[10px] sm:text-xs font-medium",
                                          match.scores.awayScoreP > match.scores.homeScoreP
                                            ? "text-green-400"
                                            : "text-gray-400"
                                        )}>
                                          {match.scores.awayScoreP}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-400 ml-1">)</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={2}
                                        className="w-8 h-8 text-center bg-[#333] border border-[#444] rounded focus:outline-none focus:ring-1 focus:ring-[#F4AF23] text-white text-sm"
                                        onKeyDown={(e) => {
                                          if (e.key === "Backspace" && currentScores.home.length === 1) {
                                            handleScoreChange(round.id, match.id, "home", "", true);
                                          }
                                        }}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/[^0-9]/g, "");
                                          if (value.length <= 2) {
                                            handleScoreChange(round.id, match.id, "home", value);

                                            if (value && value === currentScores.away) {
                                              setShowShootout(prev => ({
                                                ...prev,
                                                [matchKey]: true
                                              }))
                                            }
                                          }
                                        }}
                                        aria-label={`Placar ${homeTeam.name}`}
                                      />
                                      <span className="text-gray-400">:</span>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={2}
                                        className="w-8 h-8 text-center bg-[#333] border border-[#444] rounded focus:outline-none focus:ring-1 focus:ring-[#F4AF23] text-white text-sm"
                                        onKeyDown={(e) => {
                                          if (e.key === "Backspace" && currentScores.away.length === 1) {
                                            handleScoreChange(round.id, match.id, "away", "", true);
                                          }
                                        }}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/[^0-9]/g, "");
                                          if (value.length <= 2) {
                                            handleScoreChange(round.id, match.id, "away", value);

                                            if (value && value === currentScores.home) {
                                              setShowShootout(prev => ({
                                                ...prev,
                                                [matchKey]: true
                                              }))
                                            }
                                          }
                                        }}
                                        aria-label={`Placar ${awayTeam.name}`}
                                      />
                                    </div>

                                    {showShootoutInputs && (
                                      <div className="flex gap-1 items-center">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                className={cn(
                                                  "w-4 h-4 rounded-full border transition-colors",
                                                  shootoutWinner === "home"
                                                    ? "bg-green-600 border-green-500"
                                                    : "bg-[#333] border-[#555] hover:bg-[#444]"
                                                )}
                                                onClick={() => handleShootoutWinner(round.id, match.id, shootoutWinner === "home" ? null : "home")}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                              <p>{homeTeam.shortName} vence nos pênaltis</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <Trophy className="w-4 h-4 text-[#F4AF23] mx-1" />

                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                className={cn(
                                                  "w-4 h-4 rounded-full border transition-colors",
                                                  shootoutWinner === "away"
                                                    ? "bg-green-600 border-green-500"
                                                    : "bg-[#333] border-[#555] hover:bg-[#444]"
                                                )}
                                                onClick={() => handleShootoutWinner(round.id, match.id, shootoutWinner === "away" ? null : "away")}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                              <p>{awayTeam.shortName} vence nos pênaltis</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Link do YouTube */}
                                {match.metaInformation?.youtube_url && (
                                  <a
                                    href={match.metaInformation.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[#F4AF23] hover:underline text-[10px] sm:text-xs mt-1"
                                  >
                                    <Youtube className="w-3 h-3" />
                                    <span>Assistir</span>
                                  </a>
                                )}
                              </div>

                              {/* Time visitante */}
                              <div className={cn("flex items-center justify-start gap-1 sm:gap-2", showShootoutInputs ? 'mt-0' : 'mt-4')}>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                                  <Image
                                    src={awayTeam.logo?.url || "/placeholder.svg"}
                                    alt={awayTeam.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                  <p className={cn(
                                    "font-medium text-xs sm:text-sm md:text-base truncate max-w-full",
                                    winner === 'away' ? "text-green-400" : "text-white"
                                  )}
                                    title={awayTeam.name} // Tooltip nativo para mostrar nome completo
                                  >
                                    {awayTeam.name}
                                  </p>
                                  <p className="text-xs text-gray-400 hidden md:block truncate">
                                    {awayTeam.shortName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
