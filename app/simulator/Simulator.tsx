"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import TeamCarousel from "@/components/team-carousel"
import { EmptyLeagueState } from "@/components/empty-league-state"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { calculateStandings } from "@/lib/calculate-standings"
import { saveSimulatedStandings, saveSimulatedRounds, saveSimulatedTeams } from "@/lib/simulated-data-manager"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MainContent } from "@/components/layout/main-content"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { useRouter } from "next/navigation"

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

      setRounds(data.rounds)
      // Garante que standings seja sempre um array de TeamStanding
      let parsedStandings: any[] = []
      if (Array.isArray(data.standings)) {
        parsedStandings = data.standings
      } else if (data.standings && typeof data.standings === 'object') {
        parsedStandings = Object.values(data.standings).flat()
      }
      setStandings(parsedStandings as any[])

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
            if (match.status === "ended") {
              return match
            }

            const updatedScores = { ...match.scores }

            if (homeScore !== null && homeScore !== undefined) {
              updatedScores.homeScore = hScore
            }

            if (awayScore !== null && awayScore !== undefined) {
              updatedScores.awayScore = aScore
            }

            // Atualiza o placar de Shootout se for definido
            if (homeShootoutScore !== undefined) {
              updatedScores.homeScoreP = homeShootoutScore
            }

            if (awayShootoutScore !== undefined) {
              updatedScores.awayScoreP = awayShootoutScore
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
    // Deduplicar por id (mantendo a primeira ocorrência, que já foi ordenada por pontos)
    const seenIds = new Set<string>()
    updatedStandings = updatedStandings.filter((s) => {
      if (seenIds.has(s.id)) return false
      seenIds.add(s.id)
      return true
    })
    setStandings(updatedStandings)

    // Salvar dados simulados no localStorage para uso nos playoffs
    saveSimulatedStandings(updatedStandings)
    saveSimulatedRounds(updatedRounds)
    saveSimulatedTeams(teams)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }
  const groupedStandings = useMemo(() => {
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

    // Sort each group's standings to match full table ordering: points desc, goalDifference desc, goalsFor desc, won desc
    orderedKeys.forEach((k) => {
      const arr = groups[k] || []
      arr.sort((a: any, b: any) => {
        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0)
        const gdA = a.goalDifference ?? ((a.goalsFor ?? 0) - (a.goalsAgainst ?? 0))
        const gdB = b.goalDifference ?? ((b.goalsFor ?? 0) - (b.goalsAgainst ?? 0))
        if (gdB !== gdA) return gdB - gdA
        if ((b.goalsFor ?? 0) !== (a.goalsFor ?? 0)) return (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
        return (b.won ?? 0) - (a.won ?? 0)
      })
      groups[k] = arr
    })

    return orderedKeys.map((groupName) => ({ groupName, standings: groups[groupName] }))
  }, [standings])


  if (loading) {
    return <LoadingState />
  }

  // Handle empty league data (no teams, rounds, or standings)
  const isEmptyLeagueData = leagueData?.rounds.length === 0 || leagueData?.standings.length === 0

  if (isEmptyLeagueData) {
    return (
      <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] min-h-screen text-white">
        <Header
          loading={loading}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={setActiveTab}
        />
        <div className="container mx-auto px-4">
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
    <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] min-h-screen text-white">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-4">
        <div className="pt-4 pb-2">
          <TeamCarousel
            teams={leagueData?.teams || []}
            onTeamSelect={handleTeamSelect}
            className="mb-6"
            loading={loading}
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
          groupedStandings={groupedStandings}
          previousStandings={previousStandings}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          onScoreUpdate={handleScoreUpdate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
