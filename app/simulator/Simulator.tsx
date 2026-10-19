"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { EmptyLeagueState } from "@/components/empty-league-state"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { calculateStandings } from "@/lib/calculate-standings"
import { 
  saveSimulatedStandings, 
  saveSimulatedRounds, 
  saveSimulatedTeams, 
  clearSimulatedData,
  getSimulatedRounds,
  getSimulatedStandings
} from "@/lib/simulated-data-manager"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MainContent } from "@/components/layout/main-content"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { SimulatorControls } from "@/components/simulator-controls"
import { AppleFlag } from "@/components/ui/apple-flag"
import { useLeague } from "@/contexts/league-context"
import { useLocale } from "@/contexts/locale-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { areAllRoundsComplete } from "@/lib/regular-season"
import { getLeagueQualification } from "@/lib/league-format"
import { GradientTitle } from "@/components/ui/gradient-title"

export default function SimulatorPage() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [activeTab, setActiveTab] = useState<"matches" | "team">("matches")
  const [showPlayoffs, setShowPlayoffs] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const router = useRouter()
  const { selectedLeague, selectedSeasonId, setSeason } = useLeague()
  const { t } = useLocale()

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      setUsingFallback(false)

      const data = await fetchLeagueData({
        seasonId: selectedSeasonId,
        competitionId: selectedLeague.competitionId,
      })

      if (data.rounds.length === 1 && data.rounds[0].matches.length === 1) {
        setUsingFallback(true)
      }

      setLeagueData(data)

      const teamsDict: Record<string, Team> = {}
      data.teams.forEach((team) => {
        teamsDict[team.id] = team
      })
      setTeams(teamsDict)

      // Restaura dados simulados previamente pelo usuário se existirem (valida seasonId)
      const savedRounds = getSimulatedRounds(data.id)
      const savedStandings = getSimulatedStandings(data.id)

      let effectiveRounds = data.rounds
      if (savedRounds && savedRounds.length > 0) {
        // Enriquecer savedRounds garantindo groupName oficial nas partidas
        const enrichedRounds = savedRounds.map((sr) => {
          const officialRound = data.rounds.find((r) => r.id === sr.id);
          return {
            ...sr,
            matches: sr.matches.map((sm) => {
              const officialMatch = officialRound?.matches.find((m) => m.id === sm.id);
              return {
                ...sm,
                groupName: sm.groupName || officialMatch?.groupName,
              };
            }),
          };
        });
        effectiveRounds = enrichedRounds;
        setRounds(enrichedRounds);
      } else {
        setRounds(data.rounds);
      }

      // Sempre calcula os standings a partir das rodadas efetivas (sejam elas simuladas salvas ou oficiais)
      // para garantir que partidas Challenger não pontuem nem alterem V-D/saldo de gols
      const computedStandingsObj = calculateStandings(effectiveRounds, teamsDict, data.standings || []);
      let initialStandings = Object.values(computedStandingsObj).flat();
      const seenIds = new Set<string>();
      initialStandings = initialStandings.filter((s) => {
        if (seenIds.has(s.id)) return false;
        seenIds.add(s.id);
        return true;
      });
      setStandings(initialStandings);

      // Se a liga/temporada estiver nos playoffs (fase regular completa ou playoffs oficiais), abre direto nos playoffs
      const isPlayoffsStage = (effectiveRounds.length > 0 && areAllRoundsComplete(effectiveRounds)) ||
        (effectiveRounds.length === 0 && Array.isArray(data.playoffs) && data.playoffs.length > 0);
      setShowPlayoffs(isPlayoffsStage);

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || t.errors.load)
      setDebugInfo(`${t.simulator.technicalInfo}: ` + (err.stack ? err.stack.split("\n")[0] : t.simulator.unknownError))
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedSeasonId, selectedLeague.competitionId])

  // Refs para evitar stale closures no intervalo
  const roundsRef = useRef(rounds);
  const teamsRef = useRef(teams);
  const leagueDataRef = useRef(leagueData);

  useEffect(() => {
    roundsRef.current = rounds;
    teamsRef.current = teams;
    leagueDataRef.current = leagueData;
  }, [rounds, teams, leagueData]);

  // Atualiza placares apenas de partidas AO VIVO em tempo real (polling a cada 30s)
  const updateLiveMatches = useCallback(async () => {
    const currentRounds = roundsRef.current;
    const currentTeams = teamsRef.current;
    const currentLeagueData = leagueDataRef.current;

    if (!currentRounds || currentRounds.length === 0) return;

    // Identifica apenas partidas ao vivo
    const liveMatches = currentRounds.flatMap(r => r.matches || []).filter(match => {
      const status = (match.status || "").toString().toLowerCase();
      return status.includes("inplay") || status.includes("live") || status.includes("in_progress");
    });

    if (liveMatches.length === 0) return;

    // Busca dados apenas das partidas ao vivo
    const results = await Promise.all(
      liveMatches.map(async (match) => {
        if (!match?.id) return null;
        try {
          const res = await fetch(`/api/official-matches?matchId=${match.id}`);
          if (!res.ok) return null;
          const json = await res.json();
          if (!json || !json.id) return null;

          let scores = {
            homeScore: null as number | null,
            awayScore: null as number | null,
            homeScore1T: null as number | null,
            awayScore1T: null as number | null,
            homeScore2T: null as number | null,
            awayScore2T: null as number | null,
            homeScore3T: null as number | null,
            awayScore3T: null as number | null,
            homeScoreP: null as number | null,
            awayScoreP: null as number | null,
          };

          if (json.score) {
            scores.homeScore = json.score.home;
            scores.awayScore = json.score.away;
          } else if (json.scores) {
            scores = { ...scores, ...json.scores };
          }

          if (json.periods && Array.isArray(json.periods)) {
            json.periods.forEach((p: any, idx: number) => {
              if (idx === 0) {
                scores.homeScore1T = p.home;
                scores.awayScore1T = p.away;
              } else if (idx === 1) {
                scores.homeScore2T = p.home;
                scores.awayScore2T = p.away;
              } else if (idx === 2) {
                scores.homeScore3T = p.home;
                scores.awayScore3T = p.away;
              }
            });
          }

          if (json.penalties) {
            scores.homeScoreP = json.penalties.home;
            scores.awayScoreP = json.penalties.away;
          }

          return {
            id: match.id,
            status: json.status || json.matchStatus || match.status,
            scores,
            metaInformation: json.metaInformation || match.metaInformation,
          };
        } catch {
          return null;
        }
      })
    );

    const officialById = new Map<number, typeof results[0]>();
    results.forEach((m) => {
      if (m && m.id) officialById.set(Number(m.id), m);
    });

    if (officialById.size === 0) return;

    // Atualiza apenas as partidas ao vivo nos rounds
    const updatedRounds = currentRounds.map((round) => ({
      ...round,
      matches: Array.isArray(round.matches)
        ? round.matches.map((match) => {
          const official = officialById.get(Number(match.id));
          if (official) {
            return {
              ...match,
              status: official.status ?? match.status,
              scores: {
                homeScore: official.scores?.homeScore ?? match.scores?.homeScore ?? null,
                awayScore: official.scores?.awayScore ?? match.scores?.awayScore ?? null,
                homeScore1T: official.scores?.homeScore1T ?? match.scores?.homeScore1T ?? null,
                awayScore1T: official.scores?.awayScore1T ?? match.scores?.awayScore1T ?? null,
                homeScore2T: official.scores?.homeScore2T ?? match.scores?.homeScore2T ?? null,
                awayScore2T: official.scores?.awayScore2T ?? match.scores?.awayScore2T ?? null,
                homeScore3T: official.scores?.homeScore3T ?? match.scores?.homeScore3T ?? null,
                awayScore3T: official.scores?.awayScore3T ?? match.scores?.awayScore3T ?? null,
                homeScoreP: official.scores?.homeScoreP ?? match.scores?.homeScoreP ?? null,
                awayScoreP: official.scores?.awayScoreP ?? match.scores?.awayScoreP ?? null,
              },
              metaInformation: official.metaInformation ?? match.metaInformation,
            };
          }
          return match;
        })
        : [],
    }));

    setRounds(updatedRounds);

    // Atualiza standings se necessário
    if (currentTeams && Object.keys(currentTeams).length > 0 && currentLeagueData) {
      const updatedStandingsObj = calculateStandings(updatedRounds, currentTeams, currentLeagueData.standings || []);
      let updatedStandings = Object.values(updatedStandingsObj).flat();
      const seenIds = new Set<string>();
      updatedStandings = updatedStandings.filter((s) => {
        if (seenIds.has(s.id)) return false;
        seenIds.add(s.id);
        return true;
      });
      setStandings(updatedStandings);
    }
  }, []);

  // Polling a cada 30 segundos para partidas ao vivo
  useEffect(() => {
    if (!leagueData || rounds.length === 0) return;

    // Executa imediatamente
    updateLiveMatches();

    // Polling a cada 30 segundos
    const interval = setInterval(updateLiveMatches, 30000);

    return () => clearInterval(interval);
  }, [leagueData, updateLiveMatches, rounds.length]);

  const handleScoreUpdate = (
    roundId: number,
    matchId: number,
    homeScore: string | number | null,
    awayScore: string | number | null,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => {
    setPreviousStandings(standings)

    const parseScore = (v: string | number | null) => {
      if (v === null) return null
      if (typeof v === 'string') {
        const t = v.trim()
        if (t === '') return null
        const n = Number(t)
        return Number.isNaN(n) ? null : n
      }
      return v
    }

    const hScore = parseScore(homeScore)
    const aScore = parseScore(awayScore)

    const updateRoundCollection = (sourceRounds: Round[]) => sourceRounds.map((round) => {
      if (round.id === roundId) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            const updatedScores = { ...match.scores }

            if (homeScore !== undefined) {
              updatedScores.homeScore = hScore
            }

            if (awayScore !== undefined) {
              updatedScores.awayScore = aScore
            }

            // Se o placar não for mais empate, limpa shootouts
            if (
              updatedScores.homeScore !== null &&
              updatedScores.awayScore !== null &&
              updatedScores.homeScore !== updatedScores.awayScore
            ) {
              updatedScores.homeScoreP = null
              updatedScores.awayScoreP = null
            } else {
              // Atualiza o placar de Shootout se for definido
              if (homeShootoutScore !== undefined) {
                updatedScores.homeScoreP = homeShootoutScore
              }
              if (awayShootoutScore !== undefined) {
                updatedScores.awayScoreP = awayShootoutScore
              }
            }

            return {
              ...match,
              scores: updatedScores,
            }
          }
          return match
        })

        return {
          ...round,
          matches: updatedMatches,
        }
      }
      return round
    })
    const updatedRounds = updateRoundCollection(rounds)
    const updatedPlayInRounds = updateRoundCollection(leagueData?.playInRounds ?? [])

    setRounds(updatedRounds)
    if (updatedPlayInRounds.some((round, index) => round !== (leagueData?.playInRounds ?? [])[index])) {
      setLeagueData((current) => current ? { ...current, playInRounds: updatedPlayInRounds } : current)
    }

    const updatedStandingsObj = calculateStandings(updatedRounds, teams, leagueData?.standings || [])
    let updatedStandings = Object.values(updatedStandingsObj).flat()
    const seenIds = new Set<string>()
    updatedStandings = updatedStandings.filter((s) => {
      if (seenIds.has(s.id)) return false
      seenIds.add(s.id)
      return true
    })
    setStandings(updatedStandings)

    // Salvar dados simulados no localStorage para uso nos playoffs
    saveSimulatedStandings(updatedStandings, leagueData?.id)
    saveSimulatedRounds(updatedRounds, leagueData?.id)
    saveSimulatedTeams(teams)
  }

  // Verifica se há alguma alteração de placar em relação aos dados oficiais da API
  const hasModifications = useMemo(() => {
    if (!leagueData || !rounds.length) return false
    return rounds.some((round) => {
      const origRound = leagueData.rounds.find((r) => r.id === round.id)
      if (!origRound) return false
      return round.matches.some((match) => {
        const origMatch = origRound.matches.find((m) => m.id === match.id)
        if (!origMatch) return false
        return (
          match.scores.homeScore !== origMatch.scores.homeScore ||
          match.scores.awayScore !== origMatch.scores.awayScore ||
          match.scores.homeScoreP !== origMatch.scores.homeScoreP ||
          match.scores.awayScoreP !== origMatch.scores.awayScoreP
        )
      })
    })
  }, [rounds, leagueData])

  const handleResetSimulation = () => {
    clearSimulatedData()
    if (leagueData) {
      setRounds(leagueData.rounds)
      const updatedStandingsObj = calculateStandings(leagueData.rounds, teams, leagueData.standings || [])
      let parsedStandings = Object.values(updatedStandingsObj).flat()
      const seenIds = new Set<string>()
      parsedStandings = parsedStandings.filter((s) => {
        if (seenIds.has(s.id)) return false
        seenIds.add(s.id)
        return true
      })
      setStandings(parsedStandings)
      setPreviousStandings([])

      const isPlayoffsStage = (leagueData.rounds.length > 0 && areAllRoundsComplete(leagueData.rounds)) ||
        (leagueData.rounds.length === 0 && Array.isArray(leagueData.playoffs) && leagueData.playoffs.length > 0)
      setShowPlayoffs(isPlayoffsStage)
      setResetKey((k) => k + 1)
    }
    toast.success(t.simulator.officialResultsReset)
  }

  const handleSimulateRemaining = () => {
    if (!rounds.length || !leagueData) return

    setPreviousStandings(standings)

    const hasUnplayed = rounds.some((r) =>
      r.matches.some((m) => m.status !== "ended" || m.scores.homeScore === null)
    )

    const updatedRounds = rounds.map((round) => ({
      ...round,
      matches: round.matches.map((match) => {
        // Se houver partidas não finalizadas oficialmente, simula apenas elas.
        // Se todas já estiverem finalizadas, permite simular para testes/previsões!
        if (hasUnplayed && match.status === "ended") return match

        const homeScore = Math.floor(Math.random() * 5) + 1
        const awayScore = Math.floor(Math.random() * 5) + 1
        let homeScoreP: number | null = null
        let awayScoreP: number | null = null

        // Na Kings League não há empate: quem empata vai para Shootout
        if (homeScore === awayScore) {
          const homeWins = Math.random() > 0.5
          homeScoreP = homeWins ? 3 : 2
          awayScoreP = homeWins ? 2 : 3
        }

        return {
          ...match,
          scores: {
            ...match.scores,
            homeScore,
            awayScore,
            homeScoreP,
            awayScoreP,
          },
        }
      }),
    }))

    setRounds(updatedRounds)

    const updatedStandingsObj = calculateStandings(updatedRounds, teams, leagueData.standings || [])
    let updatedStandings = Object.values(updatedStandingsObj).flat()
    const seenIds = new Set<string>()
    updatedStandings = updatedStandings.filter((s) => {
      if (seenIds.has(s.id)) return false
      seenIds.add(s.id)
      return true
    })
    setStandings(updatedStandings)

    saveSimulatedStandings(updatedStandings, leagueData.id)
    saveSimulatedRounds(updatedRounds, leagueData.id)
    saveSimulatedTeams(teams)
    toast.success(t.simulator.scoresPredicted)
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t.tier.linkCopied)
    }
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const groupedStandings = useMemo(() => {
    const hasTwoGroups = Boolean(
      standings.some((s: any) => s.groupName === 'A') &&
      standings.some((s: any) => s.groupName === 'B')
    )

    if (!hasTwoGroups) {
      // Tabela única regular (Split sem grupos)
      const sorted = [...standings].sort((a: any, b: any) => {
        const rankA = Number(a.rank ?? 0)
        const rankB = Number(b.rank ?? 0)
        if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB

        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0)
        if ((b.won ?? 0) !== (a.won ?? 0)) return (b.won ?? 0) - (a.won ?? 0)
        const gdA = a.goalDifference ?? ((a.goalsFor ?? 0) - (a.goalsAgainst ?? 0))
        const gdB = b.goalDifference ?? ((b.goalsFor ?? 0) - (b.goalsAgainst ?? 0))
        if (gdB !== gdA) return gdB - gdA
        if ((b.goalsFor ?? 0) !== (a.goalsFor ?? 0)) return (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
        return String(a.name ?? "").localeCompare(String(b.name ?? ""))
      })
      return [{ groupName: "Regular", standings: sorted }]
    }

    const groups: Record<string, any[]> = {}
    standings.forEach((s: any) => {
      const g = s.groupName || s.group || "A"
      if (!groups[g]) groups[g] = []
      groups[g].push(s)
    })

    // Ordenação estável: A primeiro, B por último, demais em ordem alfabética
    const keys = Object.keys(groups)
    const middle = keys.filter(k => k !== 'A' && k !== 'B').sort((a, b) => a.localeCompare(b))
    const orderedKeys: string[] = []
    if (keys.includes('A')) orderedKeys.push('A')
    orderedKeys.push(...middle)
    if (keys.includes('B')) orderedKeys.push('B')

    // Preserva a ordenação oficial/calculada por rank
    orderedKeys.forEach((k) => {
      const arr = groups[k] || []
      arr.sort((a: any, b: any) => {
        const rankA = Number(a.rank ?? 0)
        const rankB = Number(b.rank ?? 0)
        if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB

        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0)
        if ((b.won ?? 0) !== (a.won ?? 0)) return (b.won ?? 0) - (a.won ?? 0)
        const gdA = a.goalDifference ?? ((a.goalsFor ?? 0) - (a.goalsAgainst ?? 0))
        const gdB = b.goalDifference ?? ((b.goalsFor ?? 0) - (b.goalsAgainst ?? 0))
        if (gdB !== gdA) return gdB - gdA
        if ((b.goalsFor ?? 0) !== (a.goalsFor ?? 0)) return (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
        return String(a.name ?? "").localeCompare(String(b.name ?? ""))
      })
      groups[k] = arr
    })

    return orderedKeys.map((groupName) => ({ groupName, standings: groups[groupName] }))
  }, [standings])

  const handleTogglePlayoffs = () => {
    setShowPlayoffs((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById("matches-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 60);
      }
      return next;
    });
  };

  const regularSeasonComplete = areAllRoundsComplete(rounds)
  const hasPlayoffsData = Array.isArray(leagueData?.playoffs) && leagueData.playoffs.length > 0
  const canShowPlayoffs = regularSeasonComplete || hasPlayoffsData

  useEffect(() => {
    if (!canShowPlayoffs) setShowPlayoffs(false)
  }, [canShowPlayoffs])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
  }

  // Só considera a liga vazia depois que a consulta terminou com sucesso.
  const normalizedStandings = Array.isArray(leagueData?.standings)
    ? leagueData.standings
    : leagueData?.standings && typeof leagueData.standings === "object"
      ? Object.values(leagueData.standings).flat()
      : []
  const isEmptyLeagueData = Boolean(
    leagueData && leagueData.rounds.length === 0 && normalizedStandings.length === 0
  )

  if (isEmptyLeagueData) {
    return (
      <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
        <Header
          loading={loading}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={setActiveTab}
        />
        <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col">
          <EmptyLeagueState />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
                <AppleFlag country={selectedLeague.countryIso} emoji={selectedLeague.flag} size={14} />
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
                  {t.home.officialSeason} • {selectedLeague.name}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  <GradientTitle title={t.pages.simulatorTitle} />
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.04] border border-white/10 text-zinc-400 select-none">
                  <span className={cn("w-1.5 h-1.5 rounded-full", hasModifications ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                  {hasModifications ? t.pages.simulationActive : t.pages.official}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {t.pages.simulatorDescription}
              </p>
            </div>

            <SimulatorControls
              onReset={handleResetSimulation}
              showPlayoffs={showPlayoffs}
              onTogglePlayoffs={handleTogglePlayoffs}
              onShare={handleShare}
              hasModifications={hasModifications}
              canShowPlayoffs={canShowPlayoffs}
            />
          </div>
        </div>

        {rounds.length === 0 && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  {t.simulator.matchesNotStartedTitle}
                </h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {t.simulator.matchesNotStartedDesc.replace("{season}", leagueData?.name || selectedLeague.name)}
                </p>
              </div>
            </div>
          </div>
        )}

        {usingFallback && (
          <Alert className="mb-6 bg-[#332700] border-[#F4AF23] text-white">
            <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
            <AlertTitle className="text-[#F4AF23]">{t.ui.noData}</AlertTitle>
            <AlertDescription>
              {t.simulator.fallbackDesc}
            </AlertDescription>
          </Alert>
        )}

        <MainContent
          rounds={rounds}
          teams={teams}
          dataKey={leagueData ? `${leagueData.id}-${selectedLeague.competitionId}-${resetKey}` : undefined}
          standings={standings}
          groupedStandings={groupedStandings}
          previousStandings={previousStandings}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          onScoreUpdate={handleScoreUpdate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showPlayoffs={showPlayoffs}
          onTogglePlayoffs={handleTogglePlayoffs}
          playoffs={leagueData?.playoffs}
          playInRounds={leagueData?.playInRounds}
          qualification={getLeagueQualification(selectedLeague.id)}
          leagueId={selectedLeague.id}
        />
      </div>
      <Footer />

      {/* Adicionando Schema Markup para melhorar dados estruturados */}
      <SchemaMarkup
        type="league"
        teams={teams}
        standings={standings}
        eventName="Kings League - Temporada Atual"
        startDate={new Date().toISOString()}
      />
    </main>
  )
}
