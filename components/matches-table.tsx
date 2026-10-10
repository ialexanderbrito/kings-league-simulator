"use client"

import { useEffect, useState, useMemo } from "react"
import { Calendar, ChevronRight, Swords } from "lucide-react"
import type { Round, Team, TeamStanding } from "@/types/kings-league"
import { RoundSelector } from "@/components/matches/round-selector"
import { DateGroup } from "@/components/matches/date-group"
import { DateFormatter } from "@/lib/date-formatter"
import { cn } from "@/lib/utils"
import { PlayoffBracketView } from "@/components/playoffs/playoff-bracket-view"
import { generatePlayoffBracket } from "@/lib/generate-playoff-bracket"
import { calculateStandings } from "@/lib/calculate-standings"
import { getSimulatedPlayoffs, getSimulatedStandings } from "@/lib/simulated-data-manager"

interface MatchesTableProps {
  rounds: Round[]
  teams: Record<string, Team>
  standings?: TeamStanding[]
  onScoreUpdate: (
    roundId: number,
    matchId: number,
    homeScore: number | null | string,
    awayScore: number | null | string,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => void
  showPlayoffs?: boolean
  onTogglePlayoffs?: () => void
  playoffs?: any[]
}

export default function MatchesTable({
  rounds,
  teams,
  standings,
  onScoreUpdate,
  showPlayoffs: externalShowPlayoffs,
  onTogglePlayoffs: externalTogglePlayoffs,
  playoffs,
}: MatchesTableProps) {
  const [internalShowPlayoffs, setInternalShowPlayoffs] = useState(false)
  const showPlayoffs = externalShowPlayoffs !== undefined ? externalShowPlayoffs : internalShowPlayoffs
  const handleTogglePlayoffs = () => {
    if (externalTogglePlayoffs) {
      externalTogglePlayoffs()
    } else {
      setInternalShowPlayoffs((prev) => !prev)
    }
  }
  const [selectedRound, setSelectedRound] = useState<string>("")
  const [scores, setScores] = useState<Record<string, { home: string; away: string; shootoutWinner: string | null }>>({})
  const [showShootout, setShowShootout] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  const [customBracket, setCustomBracket] = useState<any>(null)

  useEffect(() => {
    setCustomBracket(null)
  }, [rounds, playoffs])

  // Build playoff bracket reliably using standings first and official playoffs
  const playoffBracket = useMemo(() => {
    if (customBracket) return customBracket

    let bracket: any = null
    try {
      if (standings && standings.length >= 7 && teams && Object.keys(teams).length >= 7) {
        bracket = generatePlayoffBracket(standings, teams, rounds, playoffs)
      } else if (rounds.length > 0 && teams && Object.keys(teams).length >= 7) {
        const standingsObj = calculateStandings(rounds, teams, [])
        let standingsArray = Object.values(standingsObj).flat()
        const seen = new Set<string>()
        standingsArray = standingsArray.filter((s) => {
          if (seen.has(s.id)) return false
          seen.add(s.id)
          return true
        })
        if (standingsArray.length >= 7) {
          bracket = generatePlayoffBracket(standingsArray, teams, rounds, playoffs)
        }
      }
    } catch (e) {
      console.warn("Could not generate playoff bracket:", e)
    }

    if (!bracket && typeof window !== "undefined") {
      try {
        const simulated = getSimulatedPlayoffs()
        if (simulated) return simulated

        const simStandings = getSimulatedStandings()
        if (simStandings && Array.isArray(simStandings) && simStandings.length >= 7) {
          bracket = generatePlayoffBracket(simStandings, teams, rounds, playoffs)
        }
      } catch {}
    }

    return bracket
  }, [standings, rounds, teams, playoffs, customBracket])

  // Mapeamento confiável de times para seus respectivos grupos (apenas quando houver grupos A e B)
  const teamGroupMap = useMemo(() => {
    const hasGroups =
      Boolean(standings?.some((s) => s.groupName === 'A' || s.groupName === 'B')) ||
      Boolean(rounds?.some((r) => r.matches?.some((m) => m.groupName === 'A' || m.groupName === 'B')));

    if (!hasGroups) {
      return {};
    }

    const map: Record<string, string> = {};
    if (standings && standings.length > 0) {
      standings.forEach((s) => {
        const g = s.groupName || (s as any).group;
        if (g && (g === 'A' || g === 'B')) {
          map[s.id] = g;
        }
      });
    }
    rounds.forEach((r) => {
      r.matches.forEach((m) => {
        if (m.groupName === 'A' || m.groupName === 'B') {
          if (!map[m.participants.homeTeamId]) map[m.participants.homeTeamId] = m.groupName;
          if (!map[m.participants.awayTeamId]) map[m.participants.awayTeamId] = m.groupName;
        }
      });
    });
    return map;
  }, [standings, rounds]);

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
    if (showPlayoffs) {
      handleTogglePlayoffs()
    }
  }

  const handleScoreChange = (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string
  ) => {
    const targetRound = rounds.find((r) => r.id === roundId)
    const targetMatch = targetRound?.matches.find((m) => m.id === matchId)
    const isEnded = targetMatch?.status?.toLowerCase() === "ended" || targetMatch?.status?.toLowerCase() === "finished"
    if (isEnded) return

    const matchKey = `${roundId}-${matchId}`
    const currentMatch = scores[matchKey] ?? { home: "", away: "", shootoutWinner: null }
    const newHome = team === "home" ? value : currentMatch.home
    const newAway = team === "away" ? value : currentMatch.away
    const isTie = newHome !== "" && newAway !== "" && newHome === newAway

    setScores((prev) => ({
      ...prev,
      [matchKey]: {
        home: newHome,
        away: newAway,
        shootoutWinner: isTie ? currentMatch.shootoutWinner : null,
      },
    }))

    setShowShootout((s) => ({ ...s, [matchKey]: isTie }))

    const homeNum = newHome === "" ? null : Number(newHome)
    const awayNum = newAway === "" ? null : Number(newAway)

    onScoreUpdate(
      roundId,
      matchId,
      homeNum,
      awayNum,
      isTie && currentMatch.shootoutWinner === "home" ? 5 : isTie && currentMatch.shootoutWinner === "away" ? 3 : undefined,
      isTie && currentMatch.shootoutWinner === "home" ? 3 : isTie && currentMatch.shootoutWinner === "away" ? 5 : undefined
    )
  }

  const handleShootoutWinner = (roundId: number, matchId: number, winner: "home" | "away" | null) => {
    const targetRound = rounds.find((r) => r.id === roundId)
    const targetMatch = targetRound?.matches.find((m) => m.id === matchId)
    const isEnded = targetMatch?.status?.toLowerCase() === "ended" || targetMatch?.status?.toLowerCase() === "finished"
    if (isEnded) return

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
    <div className="space-y-2.5 sm:space-y-3">
      {/* Header da Seção de Jogos */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 shadow-sm flex-shrink-0">
            {showPlayoffs ? (
              <Swords className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
              {showPlayoffs ? "Mata-Mata (Playoffs)" : (currentRound?.name || "Partidas")}
            </h2>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800 flex-shrink-0">
              {showPlayoffs ? "Playoffs" : "5 Jogos"}
            </span>
          </div>
        </div>

        {/* Status pill quando nos playoffs */}
        {showPlayoffs && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/25 text-[10px] font-bold text-[var(--team-primary,#F4AF23)] select-none">
            <Swords className="w-3 h-3" />
            <span>Chaveamento</span>
          </div>
        )}
      </div>

      {/* Seletor de Rodadas com Liquid Glass */}
      <div className="pt-0">
        <RoundSelector 
          rounds={rounds} 
          selectedRound={selectedRound} 
          onRoundSelect={handleRoundSelectAndExitPlayoffs}
          showPlayoffs={showPlayoffs}
        />
      </div>

      {/* Partidas ou Chaveamento de Playoffs */}
      {showPlayoffs ? (
        <div className="pt-1">
          {playoffBracket ? (
            <PlayoffBracketView
              bracket={playoffBracket}
              teams={teams}
              hasTwoGroups={Boolean(standings?.some((s) => s.groupName === 'A') && standings?.some((s) => s.groupName === 'B'))}
              onBracketUpdate={(updated) => {
                setCustomBracket(updated)
                try {
                  saveSimulatedPlayoffs(updated)
                } catch {}
              }}
            />
          ) : (
            <div className="py-12 text-center rounded-2xl border border-zinc-800 bg-[#09090d]/80 p-6">
              <Swords className="w-8 h-8 text-[var(--team-primary,#F4AF23)] mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-white mb-1">Gerando Chaveamento de Mata-Mata...</p>
              <p className="text-xs text-zinc-400">Aguardando dados dos times para montar os confrontos.</p>
            </div>
          )}
        </div>
      ) : currentRound ? (
        <div className="space-y-2 sm:space-y-2.5" role="region" aria-label="Partidas da rodada">
          {Object.entries(getMatchesByDate(currentRound)).map(([date, matches]) => (
            <DateGroup
              key={date}
              date={date}
              matches={matches}
              round={currentRound}
              teams={teams}
              teamGroupMap={teamGroupMap}
              scores={scores}
              showShootout={showShootout}
              onScoreChange={handleScoreChange}
              onShootoutWinnerSelect={handleShootoutWinner}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 mb-3">
            <Calendar className="w-7 h-7 text-zinc-500" aria-hidden="true" />
          </div>
          <p className="text-zinc-400 text-sm">Selecione uma rodada para visualizar as partidas</p>
        </div>
      )}
    </div>
  )
}


