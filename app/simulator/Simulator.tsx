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
import KingsLeagueLogo from "@/components/kings-league-logo"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
  const router = useRouter()

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      setUsingFallback(false)

      const data = await fetchLeagueData()

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
        setRounds(enrichedRounds);
      } else {
        setRounds(data.rounds);
      }

      if (savedStandings && savedStandings.length > 0) {
        setStandings(savedStandings)
      } else {
        let parsedStandings: any[] = []
        if (Array.isArray(data.standings)) {
          parsedStandings = data.standings
        } else if (data.standings && typeof data.standings === 'object') {
          parsedStandings = Object.values(data.standings).flat()
        }
        setStandings(parsedStandings as any[])
      }

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Erro ao carregar dados. Tente novamente.")
      setDebugInfo("Informações técnicas: " + (err.stack ? err.stack.split("\n")[0] : "Erro desconhecido"))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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

    const updatedRounds = rounds.map((round) => {
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

    setRounds(updatedRounds)

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
      let parsedStandings: any[] = []
      if (Array.isArray(leagueData.standings)) {
        parsedStandings = leagueData.standings
      } else if (leagueData.standings && typeof leagueData.standings === 'object') {
        parsedStandings = Object.values(leagueData.standings).flat()
      }
      setStandings(parsedStandings as any[])
      setPreviousStandings([])
    }
    toast.success("Resultados oficiais restaurados!")
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
    toast.success("Placares previstos com sucesso!")
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copiado para a área de transferência!")
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

  if (loading) {
    return <LoadingState />
  }

  // Handle empty league data (no teams, rounds, or standings)
  const isEmptyLeagueData = leagueData?.rounds.length === 0 || leagueData?.standings.length === 0

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

  if (error) {
    return <ErrorState error={error} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-2.5 sm:px-4 py-2.5 sm:py-3.5 max-w-7xl flex-1 flex flex-col">
        {/* Header Compacto de Transmissão / Streamer */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4 mb-2.5 sm:mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <KingsLeagueLogo width={18} height={22} className="drop-shadow-[0_0_8px_rgba(244,175,35,0.4)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-none truncate">
                  Simulador <span className="text-[var(--team-primary,#F4AF23)]">Kings League Brasil</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-900/60 border border-zinc-800 text-zinc-400 select-none">
                  <span className={cn("w-1.5 h-1.5 rounded-full", hasModifications ? "bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]")} />
                  {hasModifications ? "Simulação Ativa" : "Oficial"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 hidden xs:block truncate">
                5 jogos por rodada • Classificação recalculada em tempo real
              </p>
            </div>
          </div>

          <SimulatorControls
            onReset={handleResetSimulation}
            showPlayoffs={showPlayoffs}
            onTogglePlayoffs={handleTogglePlayoffs}
            onShare={handleShare}
            hasModifications={hasModifications}
          />
        </div>

        {usingFallback && (
          <Alert className="mb-6 bg-[#332700] border-[#F4AF23] text-white">
            <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
            <AlertTitle className="text-[#F4AF23]">Usando dados de demonstração</AlertTitle>
            <AlertDescription>
              Não foi possível acessar todos os dados da API da Kings League. Estamos usando dados parciais para que
              você possa testar o simulador.
            </AlertDescription>
          </Alert>
        )}

        <MainContent
          rounds={rounds}
          teams={teams}
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

