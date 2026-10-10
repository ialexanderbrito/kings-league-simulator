import type { ScenarioSnapshot } from "@/types/kings-league"

const SCENARIOS_KEY = "@kl-simulador:scenarios:v1"
const ACTIVE_COMPARISON_KEY = "@kl-simulador:scenarios:comparison:v1"
const MAX_SCENARIOS = 10

type ScenarioComparisonState = {
  leftScenarioId: string | null
  rightScenarioId: string | null
  teamId: string | null
}

const DEFAULT_COMPARISON_STATE: ScenarioComparisonState = {
  leftScenarioId: null,
  rightScenarioId: null,
  teamId: null,
}

function canUseStorage(): boolean {
  return typeof window !== "undefined"
}

function safeParseScenarios(rawData: string | null): ScenarioSnapshot[] {
  if (!rawData) return []

  try {
    const parsed = JSON.parse(rawData)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is ScenarioSnapshot =>
        item &&
        item.version === 1 &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.teamId === "string" &&
        Array.isArray(item.rounds) &&
        Array.isArray(item.standings),
    )
  } catch (error) {
    console.error("Erro ao carregar cenários salvos:", error)
    return []
  }
}

export function getSavedScenarios(): ScenarioSnapshot[] {
  if (!canUseStorage()) return []

  const rawData = localStorage.getItem(SCENARIOS_KEY)
  return safeParseScenarios(rawData).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getScenarioById(scenarioId: string): ScenarioSnapshot | null {
  const scenarios = getSavedScenarios()
  return scenarios.find((scenario) => scenario.id === scenarioId) ?? null
}

export function saveScenario(snapshot: ScenarioSnapshot): ScenarioSnapshot[] {
  if (!canUseStorage()) return []

  const current = getSavedScenarios()
  const withoutCurrent = current.filter((scenario) => scenario.id !== snapshot.id)
  const next = [snapshot, ...withoutCurrent].slice(0, MAX_SCENARIOS)

  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next))

  return next
}

export function deleteScenario(scenarioId: string): ScenarioSnapshot[] {
  if (!canUseStorage()) return []

  const next = getSavedScenarios().filter((scenario) => scenario.id !== scenarioId)
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next))

  const currentComparison = getScenarioComparisonState()
  if (currentComparison.leftScenarioId === scenarioId || currentComparison.rightScenarioId === scenarioId) {
    saveScenarioComparisonState({
      leftScenarioId:
        currentComparison.leftScenarioId === scenarioId ? null : currentComparison.leftScenarioId,
      rightScenarioId:
        currentComparison.rightScenarioId === scenarioId ? null : currentComparison.rightScenarioId,
      teamId: currentComparison.teamId,
    })
  }

  return next
}

export function clearAllScenarios(): void {
  if (!canUseStorage()) return

  localStorage.removeItem(SCENARIOS_KEY)
  localStorage.removeItem(ACTIVE_COMPARISON_KEY)
}

export function getScenarioComparisonState(): ScenarioComparisonState {
  if (!canUseStorage()) return DEFAULT_COMPARISON_STATE

  const rawData = localStorage.getItem(ACTIVE_COMPARISON_KEY)
  if (!rawData) return DEFAULT_COMPARISON_STATE

  try {
    const parsed = JSON.parse(rawData)
    return {
      leftScenarioId: typeof parsed?.leftScenarioId === "string" ? parsed.leftScenarioId : null,
      rightScenarioId: typeof parsed?.rightScenarioId === "string" ? parsed.rightScenarioId : null,
      teamId: typeof parsed?.teamId === "string" ? parsed.teamId : null,
    }
  } catch (error) {
    console.error("Erro ao carregar estado de comparação:", error)
    return DEFAULT_COMPARISON_STATE
  }
}

export function saveScenarioComparisonState(state: ScenarioComparisonState): void {
  if (!canUseStorage()) return

  localStorage.setItem(ACTIVE_COMPARISON_KEY, JSON.stringify(state))
}

export function duplicateScenario(snapshot: ScenarioSnapshot): ScenarioSnapshot {
  const now = Date.now()

  return {
    ...snapshot,
    id: crypto.randomUUID(),
    name: `${snapshot.name} (cópia)`,
    createdAt: now,
    updatedAt: now,
  }
}
