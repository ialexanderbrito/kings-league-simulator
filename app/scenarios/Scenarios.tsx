"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EmptyLeagueState } from "@/components/empty-league-state"
import { ErrorState } from "@/components/ui/error-state"
import { ScenariosSkeleton } from "@/components/skeletons/scenarios-skeleton"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import {
  applyTeamPresetToRounds,
  calculateScenarioStandings,
  getScenarioMetricsForTeam,
  getUpcomingMatchesForTeam,
  updateScenarioMatchScore,
} from "@/lib/scenario-engine"
import {
  deleteScenario,
  duplicateScenario,
  getSavedScenarios,
  getScenarioComparisonState,
  saveScenario,
  saveScenarioComparisonState,
} from "@/lib/scenario-manager"
import type {
  Round,
  ScenarioMetrics,
  ScenarioPreset,
  ScenarioSnapshot,
  Team,
  TeamStanding,
} from "@/types/kings-league"
import { useToast } from "@/hooks/use-toast"
import { cn, getProxyImageUrl } from "@/lib/utils"

const PRESET_OPTIONS: Array<{
  value: ScenarioPreset
  label: string
  description: string
}> = [
    {
      value: "win-all",
      label: "Time ganha todos",
      description: "Define vitória em todos os próximos jogos do time escolhido.",
    },
    {
      value: "lose-all",
      label: "Time perde todos",
      description: "Define derrota em todos os próximos jogos do time escolhido.",
    },
    {
      value: "draw-win-shootout",
      label: "Empata e vence no shootout",
      description: "Define empate e vitória no shootout para o time.",
    },
    {
      value: "draw-lose-shootout",
      label: "Empata e perde no shootout",
      description: "Define empate e derrota no shootout para o time.",
    },
    {
      value: "clear-team-games",
      label: "Limpar jogos do time",
      description: "Restaura os próximos jogos do time para o estado original.",
    },
  ]

const PRESET_LABELS: Record<ScenarioPreset, string> = {
  "win-all": "Ganha todos",
  "lose-all": "Perde todos",
  "draw-win-shootout": "Empata e vence no shootout",
  "draw-lose-shootout": "Empata e perde no shootout",
  "clear-team-games": "Limpar jogos do time",
}

function createScenarioId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `scenario-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function formatMatchDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return "Data não disponível"

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateTime(value: number): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getShootoutWinner(match: Round["matches"][number]): "home" | "away" | null {
  const { homeScoreP, awayScoreP } = match.scores

  if (homeScoreP === null || awayScoreP === null) return null
  if (homeScoreP === awayScoreP) return null

  return homeScoreP > awayScoreP ? "home" : "away"
}

function scoreToInputValue(score: number | null): string {
  return score === null ? "" : String(score)
}

function deltaClassName(value: number): string {
  if (value > 0) return "text-emerald-400"
  if (value < 0) return "text-red-400"
  return "text-gray-400"
}

function rankDeltaClassName(value: number): string {
  if (value > 0) return "text-emerald-400"
  if (value < 0) return "text-red-400"
  return "text-gray-400"
}

function TeamLogo({ team, size = "sm" }: { team?: Team; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClass =
    size === "xl"
      ? "w-20 h-20"
      : size === "lg"
        ? "w-14 h-14"
        : size === "md"
          ? "w-10 h-10"
          : "w-8 h-8"

  if (!team) {
    return (
      <div
        className={cn(
          sizeClass,
          "rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-500",
        )}
      >
        ?
      </div>
    )
  }

  return (
    <div className={cn(sizeClass, "rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center")}>
      <img
        src={getProxyImageUrl(team.logo?.url)}
        alt={`Logo ${team.name}`}
        className="w-full h-full object-contain"
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  )
}

function filterTeamsBySearch(teams: Team[], searchValue: string): Team[] {
  const search = searchValue.trim().toLowerCase()
  if (!search) return teams

  return teams.filter((team) => {
    const byName = team.name.toLowerCase().includes(search)
    const byShort = team.shortName.toLowerCase().includes(search)
    return byName || byShort
  })
}

function SectionCard({
  title,
  description,
  badge,
  children,
}: {
  title: string
  description?: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl bg-[#111111] border border-white/10 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="text-sm text-gray-400 mt-1 max-w-3xl">{description}</p> : null}
        </div>
        {badge}
      </div>
      {children}
    </section>
  )
}

function MetricCard({
  label,
  left,
  right,
  delta,
  tone = "neutral",
}: {
  label: string
  left: number
  right: number
  delta: number
  tone?: "neutral" | "rank"
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <div className="text-xs text-gray-300">
          <span className="text-gray-500">A</span>: <span className="font-semibold text-white">{left}</span>
        </div>
        <div className="text-xs text-gray-300">
          <span className="text-gray-500">B</span>: <span className="font-semibold text-white">{right}</span>
        </div>
      </div>
      <p
        className={cn(
          "text-sm font-semibold mt-2",
          tone === "rank" ? rankDeltaClassName(delta) : deltaClassName(delta),
        )}
      >
        Δ: {delta > 0 ? "+" : ""}
        {delta}
      </p>
    </div>
  )
}

function buildComparisonSummary(
  teamName: string,
  leftMetrics: ScenarioMetrics,
  rightMetrics: ScenarioMetrics,
): string {
  const rankChange = leftMetrics.rank - rightMetrics.rank
  const pointsChange = rightMetrics.points - leftMetrics.points
  const goalDiffChange = rightMetrics.goalDifference - leftMetrics.goalDifference

  const rankText =
    rankChange === 0
      ? "mantém a posição"
      : `${Math.abs(rankChange)} posição${Math.abs(rankChange) === 1 ? "" : "s"} ${rankChange > 0 ? "acima" : "abaixo"}`

  const pointsText =
    pointsChange === 0
      ? "sem variação de pontos"
      : `${Math.abs(pointsChange)} ponto${Math.abs(pointsChange) === 1 ? "" : "s"} ${pointsChange > 0 ? "a mais" : "a menos"}`

  const goalDiffText =
    goalDiffChange === 0
      ? "saldo igual"
      : `${Math.abs(goalDiffChange)} no saldo de gols ${goalDiffChange > 0 ? "a mais" : "a menos"}`

  return `No cenário B, ${teamName} ${rankText}, com ${pointsText} e ${goalDiffText}.`
}

export default function ScenariosPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [baseRounds, setBaseRounds] = useState<Round[]>([])
  const [standingsSeed, setStandingsSeed] = useState<TeamStanding[]>([])

  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [teamSearch, setTeamSearch] = useState("")
  const [preset, setPreset] = useState<ScenarioPreset>("win-all")
  const [scenarioName, setScenarioName] = useState("")
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null)

  const [workingRounds, setWorkingRounds] = useState<Round[]>([])
  const [workingStandings, setWorkingStandings] = useState<TeamStanding[]>([])

  const [savedScenarios, setSavedScenarios] = useState<ScenarioSnapshot[]>([])

  const [compareLeftScenarioId, setCompareLeftScenarioId] = useState<string>("")
  const [compareRightScenarioId, setCompareRightScenarioId] = useState<string>("")
  const [compareTeamId, setCompareTeamId] = useState<string>("")
  const [compareTeamSearch, setCompareTeamSearch] = useState("")

  const sortedTeams = useMemo(
    () => Object.values(teams).sort((a, b) => a.name.localeCompare(b.name)),
    [teams],
  )

  const selectedPreset = useMemo(
    () => PRESET_OPTIONS.find((option) => option.value === preset),
    [preset],
  )

  const selectedTeamData = useMemo(() => {
    if (!selectedTeam) return null
    return teams[selectedTeam] ?? null
  }, [selectedTeam, teams])

  const compareTeamData = useMemo(() => {
    if (!compareTeamId) return null
    return teams[compareTeamId] ?? null
  }, [compareTeamId, teams])

  const filteredTeamsForBuilder = useMemo(() => {
    return filterTeamsBySearch(sortedTeams, teamSearch)
  }, [sortedTeams, teamSearch])

  const filteredTeamsForCompare = useMemo(() => {
    return filterTeamsBySearch(sortedTeams, compareTeamSearch)
  }, [sortedTeams, compareTeamSearch])

  const editingScenario = useMemo(
    () => savedScenarios.find((scenario) => scenario.id === editingScenarioId) ?? null,
    [editingScenarioId, savedScenarios],
  )

  const upcomingTeamMatches = useMemo(() => {
    if (!selectedTeam || workingRounds.length === 0) return []
    return getUpcomingMatchesForTeam(workingRounds, selectedTeam)
  }, [workingRounds, selectedTeam])

  const leftScenario = useMemo(
    () => savedScenarios.find((scenario) => scenario.id === compareLeftScenarioId) ?? null,
    [compareLeftScenarioId, savedScenarios],
  )

  const rightScenario = useMemo(
    () => savedScenarios.find((scenario) => scenario.id === compareRightScenarioId) ?? null,
    [compareRightScenarioId, savedScenarios],
  )

  const leftMetrics = useMemo<ScenarioMetrics | null>(() => {
    if (!compareTeamId || !leftScenario) return null
    return getScenarioMetricsForTeam(leftScenario.standings, compareTeamId)
  }, [compareTeamId, leftScenario])

  const rightMetrics = useMemo<ScenarioMetrics | null>(() => {
    if (!compareTeamId || !rightScenario) return null
    return getScenarioMetricsForTeam(rightScenario.standings, compareTeamId)
  }, [compareTeamId, rightScenario])

  const comparisonSummary = useMemo(() => {
    if (!compareTeamData || !leftMetrics || !rightMetrics) return null

    return buildComparisonSummary(compareTeamData.name, leftMetrics, rightMetrics)
  }, [compareTeamData, leftMetrics, rightMetrics])

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchLeagueData()

        if (!mounted) return

        const teamsDictionary: Record<string, Team> = {}
        data.teams.forEach((team) => {
          teamsDictionary[team.id] = team
        })

        const calculatedBaseStandings = calculateScenarioStandings(
          data.rounds,
          teamsDictionary,
          data.standings,
        )

        const saved = getSavedScenarios()
        const comparison = getScenarioComparisonState()

        const defaultTeamId = data.teams[0]?.id ?? ""

        setTeams(teamsDictionary)
        setBaseRounds(data.rounds)
        setStandingsSeed(data.standings)

        setWorkingRounds(data.rounds)
        setWorkingStandings(calculatedBaseStandings)

        setSavedScenarios(saved)

        setSelectedTeam(defaultTeamId)
        setCompareTeamId(comparison.teamId || defaultTeamId)

        if (saved.length > 0) {
          setCompareLeftScenarioId(comparison.leftScenarioId || saved[0].id)
          setCompareRightScenarioId(
            comparison.rightScenarioId || saved[1]?.id || comparison.leftScenarioId || saved[0].id,
          )
        }
      } catch (loadError: any) {
        if (!mounted) return

        setError(loadError?.message || "Não foi possível carregar os dados da liga.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (loading) return

    saveScenarioComparisonState({
      leftScenarioId: compareLeftScenarioId || null,
      rightScenarioId: compareRightScenarioId || null,
      teamId: compareTeamId || null,
    })
  }, [compareLeftScenarioId, compareRightScenarioId, compareTeamId, loading])

  useEffect(() => {
    if (!selectedTeam || compareTeamId) return
    setCompareTeamId(selectedTeam)
  }, [selectedTeam, compareTeamId])

  const getTeamName = (teamId: string): string => teams[teamId]?.name ?? "Time"

  const recalculateWorkingStandings = (rounds: Round[]) => {
    const nextStandings = calculateScenarioStandings(rounds, teams, standingsSeed)
    setWorkingRounds(rounds)
    setWorkingStandings(nextStandings)
  }

  const handleApplyPreset = () => {
    if (!selectedTeam) {
      toast({
        title: "Escolha um time",
        description: "Selecione um time antes de aplicar um preset.",
        variant: "destructive",
      })
      return
    }

    const updatedRounds = applyTeamPresetToRounds(workingRounds, baseRounds, selectedTeam, preset)
    recalculateWorkingStandings(updatedRounds)

    if (!scenarioName.trim()) {
      setScenarioName(`${getTeamName(selectedTeam)} - ${selectedPreset?.label ?? "Cenário"}`)
    }

    toast({
      title: "Preset aplicado",
      description: `Regras aplicadas para ${getTeamName(selectedTeam)}.`,
    })
  }

  const handleResetBuilder = () => {
    const recalculated = calculateScenarioStandings(baseRounds, teams, standingsSeed)
    setWorkingRounds(baseRounds)
    setWorkingStandings(recalculated)
    setEditingScenarioId(null)
    setScenarioName("")
    setPreset("win-all")

    toast({
      title: "Editor resetado",
      description: "Os jogos voltaram para os dados originais.",
    })
  }

  const handleSaveScenario = () => {
    if (!selectedTeam) {
      toast({
        title: "Escolha um time",
        description: "Selecione um time para salvar o cenário.",
        variant: "destructive",
      })
      return
    }

    const now = Date.now()

    const snapshot: ScenarioSnapshot = {
      version: 1,
      id: editingScenario?.id ?? createScenarioId(),
      name: scenarioName.trim() || `${getTeamName(selectedTeam)} - Cenário`,
      teamId: selectedTeam,
      preset,
      rounds: workingRounds,
      standings: workingStandings,
      createdAt: editingScenario?.createdAt ?? now,
      updatedAt: now,
    }

    const nextScenarios = saveScenario(snapshot)
    setSavedScenarios(nextScenarios)
    setEditingScenarioId(snapshot.id)

    if (!compareLeftScenarioId) {
      setCompareLeftScenarioId(snapshot.id)
    } else if (!compareRightScenarioId && compareLeftScenarioId !== snapshot.id) {
      setCompareRightScenarioId(snapshot.id)
    }

    toast({
      title: "Cenário salvo",
      description: `"${snapshot.name}" foi salvo com sucesso.`,
    })
  }

  const handleLoadScenario = (scenario: ScenarioSnapshot) => {
    setEditingScenarioId(scenario.id)
    setScenarioName(scenario.name)
    setSelectedTeam(scenario.teamId)
    setPreset(scenario.preset)
    setWorkingRounds(scenario.rounds)
    setWorkingStandings(scenario.standings)

    toast({
      title: "Cenário carregado",
      description: `"${scenario.name}" está pronto para edição.`,
    })
  }

  const handleDuplicateScenario = (scenarioId: string) => {
    const source = savedScenarios.find((scenario) => scenario.id === scenarioId)
    if (!source) return

    const duplicated = duplicateScenario(source)
    const nextScenarios = saveScenario(duplicated)
    setSavedScenarios(nextScenarios)

    toast({
      title: "Cenário duplicado",
      description: `Cópia de "${source.name}" criada com sucesso.`,
    })
  }

  const handleDeleteScenario = (scenarioId: string) => {
    const nextScenarios = deleteScenario(scenarioId)
    setSavedScenarios(nextScenarios)

    if (editingScenarioId === scenarioId) {
      handleResetBuilder()
    }

    if (compareLeftScenarioId === scenarioId) {
      setCompareLeftScenarioId(nextScenarios[0]?.id || "")
    }

    if (compareRightScenarioId === scenarioId) {
      setCompareRightScenarioId(nextScenarios[1]?.id || nextScenarios[0]?.id || "")
    }

    toast({
      title: "Cenário removido",
      description: "O cenário selecionado foi excluído.",
    })
  }

  const handleManualScoreChange = (
    roundId: number,
    matchId: number,
    side: "home" | "away",
    value: string,
  ) => {
    const round = workingRounds.find((item) => item.id === roundId)
    const match = round?.matches.find((item) => item.id === matchId)
    if (!match) return

    const homeInput = side === "home" ? value : scoreToInputValue(match.scores.homeScore)
    const awayInput = side === "away" ? value : scoreToInputValue(match.scores.awayScore)

    const shouldKeepShootout =
      homeInput !== "" && awayInput !== "" && Number(homeInput) === Number(awayInput)

    const updatedRounds = updateScenarioMatchScore(
      workingRounds,
      roundId,
      matchId,
      homeInput,
      awayInput,
      shouldKeepShootout ? getShootoutWinner(match) : null,
    )

    recalculateWorkingStandings(updatedRounds)
  }

  const handleShootoutWinnerChange = (
    roundId: number,
    matchId: number,
    winner: "home" | "away" | null,
  ) => {
    const round = workingRounds.find((item) => item.id === roundId)
    const match = round?.matches.find((item) => item.id === matchId)
    if (!match) return

    const updatedRounds = updateScenarioMatchScore(
      workingRounds,
      roundId,
      matchId,
      scoreToInputValue(match.scores.homeScore),
      scoreToInputValue(match.scores.awayScore),
      winner,
    )

    recalculateWorkingStandings(updatedRounds)
  }

  const metricRows: Array<{
    label: string
    left: number
    right: number
    delta: number
    tone?: "neutral" | "rank"
  }> = [
      {
        label: "Posição",
        left: leftMetrics?.rank ?? 0,
        right: rightMetrics?.rank ?? 0,
        delta: (leftMetrics?.rank ?? 0) - (rightMetrics?.rank ?? 0),
        tone: "rank",
      },
      {
        label: "Pontos",
        left: leftMetrics?.points ?? 0,
        right: rightMetrics?.points ?? 0,
        delta: (rightMetrics?.points ?? 0) - (leftMetrics?.points ?? 0),
      },
      {
        label: "Saldo de gols",
        left: leftMetrics?.goalDifference ?? 0,
        right: rightMetrics?.goalDifference ?? 0,
        delta: (rightMetrics?.goalDifference ?? 0) - (leftMetrics?.goalDifference ?? 0),
      },
      {
        label: "Vitórias",
        left: leftMetrics?.won ?? 0,
        right: rightMetrics?.won ?? 0,
        delta: (rightMetrics?.won ?? 0) - (leftMetrics?.won ?? 0),
      },
    ]

  if (loading) {
    return <ScenariosSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar cenários"
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (baseRounds.length === 0 || Object.keys(teams).length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <Header
          loading={false}
          selectedTeam={selectedTeam || null}
          onTeamSelect={setSelectedTeam}
          setActiveTab={() => { }}
        />
        <div className="container mx-auto px-4">
          <EmptyLeagueState />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] text-white">
      <Header
        loading={false}
        selectedTeam={selectedTeam || null}
        onTeamSelect={setSelectedTeam}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold">Cenários</h1>
          <p className="text-gray-400 max-w-3xl">
            Escolha um time, defina o que acontece nos próximos jogos e compare cenários sem complicação.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
          <SectionCard
            title="Criar cenário"
            description="Fluxo em 3 passos: selecione o time, aplique uma regra e salve o cenário."
            badge={
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {editingScenario ? `Editando: ${editingScenario.name}` : "Novo"}
              </span>
            }
          >

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <TeamLogo team={selectedTeamData || undefined} size="xl" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Time selecionado</p>
                    <h3 className="text-lg font-semibold text-white">
                      {selectedTeamData?.name ?? "Escolha um time"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {selectedTeamData
                        ? `Aplicando cenários para ${selectedTeamData.shortName}`
                        : "Clique em uma logo para começar."}
                    </p>
                  </div>
                </div>

                <div className="sm:ml-auto flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    Passo 1
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    Passo 2
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    Passo 3
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-300">1) Time</p>
                <input
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                  placeholder="Buscar time"
                  className="w-full h-10 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 text-sm outline-none focus:border-[var(--team-primary,#F4AF23)]"
                />

                <div className="max-h-[240px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredTeamsForBuilder.map((team) => {
                      const isSelected = team.id === selectedTeam

                      return (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team.id)}
                          className={cn(
                            "rounded-2xl border p-3 transition-all text-left",
                            isSelected
                              ? "border-[var(--team-primary,#F4AF23)] bg-[var(--team-primary,#F4AF23)]/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                          )}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <TeamLogo team={team} size="lg" />
                            <div className="min-w-0 w-full">
                              <p className="text-xs font-semibold text-white truncate">{team.shortName}</p>
                              <p className="text-[10px] text-gray-400 truncate">{team.name}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-300">2) Estratégia</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_OPTIONS.map((option) => {
                  const isSelected = preset === option.value

                  return (
                    <button
                      key={option.value}
                      onClick={() => setPreset(option.value)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition-all",
                        isSelected
                          ? "border-[var(--team-primary,#F4AF23)] bg-[var(--team-primary,#F4AF23)]/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                      )}
                    >
                      <p className="text-sm font-semibold text-white">{option.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm text-gray-300">3) Nome do cenário</span>
              <input
                value={scenarioName}
                onChange={(event) => setScenarioName(event.target.value)}
                placeholder={
                  selectedTeamData
                    ? `${selectedTeamData.name} - ${PRESET_LABELS[preset]}`
                    : "Ex.: Fluxo ideal"
                }
                className="w-full h-11 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 text-sm outline-none focus:border-[var(--team-primary,#F4AF23)]"
              />
            </label>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-gray-300">
              {selectedTeamData
                ? `Selecionado: ${selectedTeamData.name} · Regra: ${selectedPreset?.label}`
                : "Escolha um time para iniciar."}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleApplyPreset}
                className="h-10 px-4 rounded-xl bg-[var(--team-primary,#F4AF23)] text-black text-sm font-semibold hover:brightness-110 transition"
              >
                Aplicar preset
              </button>
              <button
                onClick={handleSaveScenario}
                className="h-10 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition"
              >
                Salvar cenário
              </button>
              <button
                onClick={handleResetBuilder}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-200 hover:bg-white/10 transition"
              >
                Resetar
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Jogos futuros no editor: <span className="text-white font-semibold">{upcomingTeamMatches.length}</span>
            </p>
          </SectionCard>

          <SectionCard
            title="Cenários salvos"
            description="A lista fica compacta para reencontrar, duplicar ou comparar sem poluição visual."
            badge={<span className="text-xs text-gray-400">{savedScenarios.length}/10</span>}
          >

            {savedScenarios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-gray-400 text-center">
                Nenhum cenário salvo ainda.
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {savedScenarios.map((scenario) => {
                  const scenarioTeam = teams[scenario.teamId]

                  return (
                    <article
                      key={scenario.id}
                      className={cn(
                        "rounded-xl border p-3",
                        editingScenarioId === scenario.id
                          ? "border-[var(--team-primary,#F4AF23)]/40 bg-[var(--team-primary,#F4AF23)]/5"
                          : "border-white/10 bg-white/[0.02]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <TeamLogo team={scenarioTeam} size="lg" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{scenario.name}</h3>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {scenarioTeam?.name ?? "Time"} · {PRESET_LABELS[scenario.preset]} · {formatDateTime(scenario.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicateScenario(scenario.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300"
                            title="Duplicar cenário"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleDeleteScenario(scenario.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300"
                            title="Excluir cenário"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleLoadScenario(scenario)}
                          className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200"
                        >
                          Carregar
                        </button>
                        <button
                          onClick={() => setCompareLeftScenarioId(scenario.id)}
                          className={cn(
                            "h-8 px-3 rounded-lg border text-xs",
                            compareLeftScenarioId === scenario.id
                              ? "bg-[var(--team-primary,#F4AF23)]/20 border-[var(--team-primary,#F4AF23)]/40 text-[var(--team-primary,#F4AF23)]"
                              : "bg-white/5 border-white/10 text-gray-200",
                          )}
                        >
                          Usar como A
                        </button>
                        <button
                          onClick={() => setCompareRightScenarioId(scenario.id)}
                          className={cn(
                            "h-8 px-3 rounded-lg border text-xs",
                            compareRightScenarioId === scenario.id
                              ? "bg-[var(--team-primary,#F4AF23)]/20 border-[var(--team-primary,#F4AF23)]/40 text-[var(--team-primary,#F4AF23)]"
                              : "bg-white/5 border-white/10 text-gray-200",
                          )}
                        >
                          Usar como B
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </section>

        <SectionCard
          title="Ajuste manual dos próximos jogos"
          description="Opcional: abra só se quiser refinar placares específicos depois do preset."
        >
          <details className="rounded-xl border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 text-sm text-gray-200">
              <span className="font-medium">Ajuste manual avançado</span>
              <span className="text-xs text-gray-500">{upcomingTeamMatches.length} jogos</span>
            </summary>

            <div className="border-t border-white/10 p-4">
              {!selectedTeam ? (
                <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-gray-400 text-center">
                  Selecione um time para visualizar jogos futuros.
                </div>
              ) : upcomingTeamMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-gray-400 text-center">
                  Este time não possui próximos jogos com placar aberto.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTeamMatches.map(({ roundId, matchId, match }) => {
                    const homeTeam = teams[match.participants.homeTeamId]
                    const awayTeam = teams[match.participants.awayTeamId]
                    const isDraw =
                      match.scores.homeScore !== null &&
                      match.scores.awayScore !== null &&
                      match.scores.homeScore === match.scores.awayScore
                    const shootoutWinner = getShootoutWinner(match)

                    return (
                      <article
                        key={`${roundId}-${matchId}`}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <p className="text-xs text-gray-400 mb-2">Rodada {roundId} · {formatMatchDate(match.date)}</p>

                        <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                          <div className="flex items-center justify-end gap-2 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-300 truncate">{homeTeam?.name ?? "Casa"}</p>
                            <TeamLogo team={homeTeam} size="md" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={scoreToInputValue(match.scores.homeScore)}
                              onChange={(event) =>
                                handleManualScoreChange(roundId, matchId, "home", event.target.value)
                              }
                              className="h-10 w-14 rounded-lg bg-[#0d0d0d] border border-white/10 px-2 text-sm text-center outline-none focus:border-[var(--team-primary,#F4AF23)]"
                            />
                            <span className="text-gray-500 text-sm">x</span>
                            <input
                              type="number"
                              min={0}
                              value={scoreToInputValue(match.scores.awayScore)}
                              onChange={(event) =>
                                handleManualScoreChange(roundId, matchId, "away", event.target.value)
                              }
                              className="h-10 w-14 rounded-lg bg-[#0d0d0d] border border-white/10 px-2 text-sm text-center outline-none focus:border-[var(--team-primary,#F4AF23)]"
                            />
                          </div>

                          <div className="flex items-center justify-start gap-2 min-w-0">
                            <TeamLogo team={awayTeam} size="md" />
                            <p className="text-xs sm:text-sm text-gray-300 truncate">{awayTeam?.name ?? "Visitante"}</p>
                          </div>
                        </div>

                        {isDraw && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400">Shootout:</span>
                            <button
                              onClick={() => handleShootoutWinnerChange(roundId, matchId, "home")}
                              className={cn(
                                "h-8 px-3 rounded-lg border text-xs",
                                shootoutWinner === "home"
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-white/5 border-white/10 text-gray-200",
                              )}
                            >
                              {homeTeam?.shortName ?? "Casa"}
                            </button>
                            <button
                              onClick={() => handleShootoutWinnerChange(roundId, matchId, "away")}
                              className={cn(
                                "h-8 px-3 rounded-lg border text-xs",
                                shootoutWinner === "away"
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-white/5 border-white/10 text-gray-200",
                              )}
                            >
                              {awayTeam?.shortName ?? "Visitante"}
                            </button>
                            <button
                              onClick={() => handleShootoutWinnerChange(roundId, matchId, null)}
                              className="h-8 px-3 rounded-lg border bg-white/5 border-white/10 text-xs text-gray-200"
                            >
                              Limpar
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </details>
        </SectionCard>

        <SectionCard
          title="Comparar cenários por time"
          description="Compare dois cenários do mesmo time com um resumo curto e indicadores principais."
        >

          <div className="space-y-2">
            <p className="text-sm text-gray-300">Time para comparar</p>
            <input
              value={compareTeamSearch}
              onChange={(event) => setCompareTeamSearch(event.target.value)}
              placeholder="Buscar time para comparar"
              className="w-full h-10 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 text-sm outline-none focus:border-[var(--team-primary,#F4AF23)]"
            />

            <div className="max-h-[180px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredTeamsForCompare.map((team) => {
                  const isSelected = compareTeamId === team.id

                  return (
                    <button
                      key={team.id}
                      onClick={() => setCompareTeamId(team.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 transition-all flex items-center gap-3",
                        isSelected
                          ? "border-[var(--team-primary,#F4AF23)] bg-[var(--team-primary,#F4AF23)]/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                      )}
                    >
                      <TeamLogo team={team} size="lg" />
                      <span className="text-xs font-medium text-white truncate">{team.shortName}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-gray-300">Cenário A</span>
              <select
                value={compareLeftScenarioId}
                onChange={(event) => setCompareLeftScenarioId(event.target.value)}
                className="w-full h-11 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 text-sm outline-none focus:border-[var(--team-primary,#F4AF23)]"
              >
                <option value="">Selecione</option>
                {savedScenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-gray-300">Cenário B</span>
              <select
                value={compareRightScenarioId}
                onChange={(event) => setCompareRightScenarioId(event.target.value)}
                className="w-full h-11 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 text-sm outline-none focus:border-[var(--team-primary,#F4AF23)]"
              >
                <option value="">Selecione</option>
                {savedScenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!leftScenario || !rightScenario || !compareTeamId ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-gray-400 text-center">
              Selecione o time e os dois cenários para comparar.
            </div>
          ) : !leftMetrics || !rightMetrics ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-sm text-yellow-100">
              O time selecionado não foi encontrado em um dos cenários.
            </div>
          ) : (
            <div className="space-y-3">
              {compareTeamData && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center gap-2">
                  <TeamLogo team={compareTeamData} size="xl" />
                  <p className="text-sm text-gray-300">
                    Comparando impacto para <span className="text-white font-semibold">{compareTeamData.name}</span>
                  </p>
                </div>
              )}

              {comparisonSummary ? (
                <div className="rounded-xl border border-[var(--team-primary,#F4AF23)]/20 bg-[var(--team-primary,#F4AF23)]/8 p-3 text-sm text-gray-100">
                  {comparisonSummary}
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {metricRows.map((row) => (
                  <MetricCard
                    key={row.label}
                    label={row.label}
                    left={row.left}
                    right={row.right}
                    delta={row.delta}
                    tone={row.tone}
                  />
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <Footer />
    </main>
  )
}
