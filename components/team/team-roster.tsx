"use client"

import { useMemo, useState } from "react"
import { PlayerCard } from "@/components/team/player-card"
import { PlayerModal } from "@/components/team/player-modal"
import { PlayerCardSkeleton } from "@/components/skeletons/player-card-skeleton"
import type { Player } from "@/types/kings-league"
import {
  calculateAge,
  cn,
  getPlayerOverall,
  getPlayerPhotoUrl,
  isWildcardPlayer,
  isInjuredPlayer,
  getPlayerOvrTier,
  DEFAULT_PLAYER_PHOTO_FALLBACK,
} from "@/lib/utils"
import {
  Users,
  Sparkles,
  Star,
  AlertTriangle,
  SlidersHorizontal,
  Goal,
  ShieldCheck,
  Shield,
  Zap,
  Target,
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Trophy,
  ChevronRight,
  ChevronDown,
  Check,
  Hash,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocale } from "@/contexts/locale-context"

interface TeamRosterProps {
  players: Player[]
  loading: boolean
  teamColor?: string
}

type RatingFilter = "all" | "wildcard" | "elite" | "rare" | "common" | "basic" | "injured"
type PositionFilter = "all" | "goalkeeper" | "defender" | "midfielder" | "forward"
type ViewMode = "cards" | "table"

export type TableSortColumn =
  | "jersey"
  | "name"
  | "role"
  | "ovr"
  | "age"
  | "height"
  | "matches"
  | "goals"
  | "assists"
  | "mvp"
  | "status"

export type SortDirection = "asc" | "desc"

interface PositionSectionConfig {
  role: Player["role"]
  titleKey: "roleGkPlural" | "roleDefPlural" | "roleMidPlural" | "roleFwdPlural"
  fallbackTitle: string
  abbr: string
  color: "amber" | "blue" | "emerald" | "rose"
  icon: typeof ShieldCheck
  descKey: "roleGkDesc" | "roleDefDesc" | "roleMidDesc" | "roleFwdDesc"
  fallbackDesc: string
}

const POSITION_SECTIONS: PositionSectionConfig[] = [
  {
    role: "goalkeeper",
    titleKey: "roleGkPlural",
    fallbackTitle: "Goleiros",
    abbr: "GOL",
    color: "amber",
    icon: ShieldCheck,
    descKey: "roleGkDesc",
    fallbackDesc: "Segurança sob as traves, reflexos e shootouts",
  },
  {
    role: "defender",
    titleKey: "roleDefPlural",
    fallbackTitle: "Defensores",
    abbr: "DEF",
    color: "blue",
    icon: Shield,
    descKey: "roleDefDesc",
    fallbackDesc: "Proteção de área, desarmes e saídas rápidas",
  },
  {
    role: "midfielder",
    titleKey: "roleMidPlural",
    fallbackTitle: "Meio-campistas",
    abbr: "MEI",
    color: "emerald",
    icon: Zap,
    descKey: "roleMidDesc",
    fallbackDesc: "Criação de jogadas, passes precisos e ritmo",
  },
  {
    role: "forward",
    titleKey: "roleFwdPlural",
    fallbackTitle: "Atacantes",
    abbr: "ATA",
    color: "rose",
    icon: Target,
    descKey: "roleFwdDesc",
    fallbackDesc: "Velocidade, poder de fogo e definição",
  },
]

function comparePlayers(
  a: Player,
  b: Player,
  column: TableSortColumn,
  direction: SortDirection
): number {
  let diff = 0

  switch (column) {
    case "jersey": {
      const numA = Number.parseInt(a.jersey || a.metaInformation?.jerseyNumber || "999", 10)
      const numB = Number.parseInt(b.jersey || b.metaInformation?.jerseyNumber || "999", 10)
      const validA = Number.isNaN(numA) ? 999 : numA
      const validB = Number.isNaN(numB) ? 999 : numB
      diff = validA - validB
      break
    }
    case "name": {
      const nameA = a.metaInformation?.fantasyName || a.shortName || ""
      const nameB = b.metaInformation?.fantasyName || b.shortName || ""
      diff = nameA.localeCompare(nameB, undefined, { sensitivity: "base" })
      break
    }
    case "role": {
      const roleOrder: Record<Player["role"], number> = {
        goalkeeper: 1,
        defender: 2,
        midfielder: 3,
        forward: 4,
      }
      diff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)
      break
    }
    case "ovr": {
      diff = getPlayerOverall(a) - getPlayerOverall(b)
      break
    }
    case "age": {
      const ageA = a.birthDate ? calculateAge(a.birthDate) : 0
      const ageB = b.birthDate ? calculateAge(b.birthDate) : 0
      diff = ageA - ageB
      break
    }
    case "height": {
      const hA = typeof a.height === "number" ? a.height : Number.parseInt(String(a.height || "0"), 10)
      const hB = typeof b.height === "number" ? b.height : Number.parseInt(String(b.height || "0"), 10)
      diff = (Number.isNaN(hA) ? 0 : hA) - (Number.isNaN(hB) ? 0 : hB)
      break
    }
    case "matches": {
      const mA = a.stats?.matchesPlayed || 0
      const mB = b.stats?.matchesPlayed || 0
      diff = mA - mB
      break
    }
    case "goals": {
      const gA = a.stats?.goalsScored || 0
      const gB = b.stats?.goalsScored || 0
      diff = gA - gB
      break
    }
    case "assists": {
      const asA = a.stats?.assists || 0
      const asB = b.stats?.assists || 0
      diff = asA - asB
      break
    }
    case "mvp": {
      const mvpA = a.stats?.mvps || 0
      const mvpB = b.stats?.mvps || 0
      diff = mvpA - mvpB
      break
    }
    case "status": {
      const injA = isInjuredPlayer(a) ? 1 : 0
      const injB = isInjuredPlayer(b) ? 1 : 0
      diff = injA - injB
      break
    }
  }

  if (diff !== 0) {
    return direction === "asc" ? diff : -diff
  }

  // Desempate 1: OVR descendente
  const ovrDiff = getPlayerOverall(b) - getPlayerOverall(a)
  if (ovrDiff !== 0) return ovrDiff

  // Desempate 2: Nome alfabético
  const nameA = a.metaInformation?.fantasyName || a.shortName || ""
  const nameB = b.metaInformation?.fantasyName || b.shortName || ""
  return nameA.localeCompare(nameB)
}

export function TeamRoster({ players, loading, teamColor }: TeamRosterProps) {
  const { t } = useLocale()
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<RatingFilter>("all")
  const [selectedPosition, setSelectedPosition] = useState<PositionFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<TableSortColumn>("ovr")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null)

  const handleColumnSort = (col: TableSortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(col)
      if (col === "name" || col === "jersey" || col === "role") {
        setSortDirection("asc")
      } else {
        setSortDirection("desc")
      }
    }
  }

  // Grupos estruturados para o DropdownMenu de ordenação (padrão League/Language Selector)
  const sortGroups = useMemo(() => {
    return [
      {
        id: "ratings",
        label: t.teamPage.overallPerformance || "Overall & Nível",
        options: [
          {
            col: "ovr" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: `${t.teamPage.sortByOvr} (OVR ↓)`,
            icon: Sparkles,
          },
          {
            col: "ovr" as TableSortColumn,
            dir: "asc" as SortDirection,
            label: `${t.teamPage.sortByOvrAsc} (OVR ↑)`,
            icon: Star,
          },
        ],
      },
      {
        id: "stats",
        label: t.teamPage.statsSummary || "Estatísticas da Liga",
        options: [
          {
            col: "goals" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: t.teamPage.sortByGoals,
            icon: Goal,
          },
          {
            col: "assists" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: t.teamPage.sortByAssists || "Assistências",
            icon: Zap,
          },
          {
            col: "mvp" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: t.teamPage.sortByMvp || "Mais MVPs",
            icon: Trophy,
          },
          {
            col: "matches" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: `${t.teamPage.statMatches}: Partidas Disputadas`,
            icon: Users,
          },
        ],
      },
      {
        id: "profile",
        label: t.teamPage.athleteInfo || "Dados & Perfil",
        options: [
          {
            col: "name" as TableSortColumn,
            dir: "asc" as SortDirection,
            label: `${t.teamPage.sortByName} (A → Z)`,
            icon: Users,
          },
          {
            col: "name" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: `${t.teamPage.sortByName} (Z → A)`,
            icon: Users,
          },
          {
            col: "jersey" as TableSortColumn,
            dir: "asc" as SortDirection,
            label: t.teamPage.sortByJersey || "Camisa (#)",
            icon: Hash,
          },
          {
            col: "age" as TableSortColumn,
            dir: "asc" as SortDirection,
            label: `${t.teamPage.sortByAge} (Mais Jovens)`,
            icon: Calendar,
          },
          {
            col: "age" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: `${t.teamPage.sortByAge} (Mais Experientes)`,
            icon: Calendar,
          },
          {
            col: "height" as TableSortColumn,
            dir: "desc" as SortDirection,
            label: t.teamPage.sortByHeight || "Mais Altos",
            icon: ArrowUpDown,
          },
          {
            col: "role" as TableSortColumn,
            dir: "asc" as SortDirection,
            label: t.teamPage.sortByRole || "Posição Tática",
            icon: Shield,
          },
        ],
      },
    ]
  }, [t])

  const currentSortItem = useMemo(() => {
    for (const group of sortGroups) {
      const match = group.options.find(
        (opt) => opt.col === sortColumn && opt.dir === sortDirection
      )
      if (match) return match
    }
    return null
  }, [sortGroups, sortColumn, sortDirection])

  const activeSortLabel = currentSortItem
    ? currentSortItem.label
    : `${sortColumn.toUpperCase()} (${sortDirection === "asc" ? "↑" : "↓"})`

  // Métricas gerais calculadas do elenco
  const totalPlayers = players.length

  const { draftedCount, wildcardCount, injuredCount, averageOvr, topPlayer } = useMemo<{
    draftedCount: number
    wildcardCount: number
    injuredCount: number
    averageOvr: string
    topPlayer: Player | null
  }>(() => {
    let drafted = 0
    let wildcard = 0
    let injured = 0
    let totalOvr = 0
    let bestPlayer: Player | null = null
    let bestOvr = -1

    players.forEach((p) => {
      const isWc = isWildcardPlayer(p)
      if (isWc) wildcard += 1
      else drafted += 1

      if (isInjuredPlayer(p)) {
        injured += 1
      }

      const ovr = getPlayerOverall(p)
      totalOvr += ovr

      if (ovr > bestOvr) {
        bestOvr = ovr
        bestPlayer = p
      }
    })

    const avg = totalPlayers > 0 ? (totalOvr / totalPlayers).toFixed(1) : "0"

    return {
      draftedCount: drafted,
      wildcardCount: wildcard,
      injuredCount: injured,
      averageOvr: avg,
      topPlayer: bestPlayer,
    }
  }, [players, totalPlayers])

  // Contagem por posição
  const positionCounts = useMemo(() => {
    const counts = {
      all: players.length,
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      forward: 0,
    }
    players.forEach((p) => {
      if (p.role in counts) {
        counts[p.role as keyof typeof counts] += 1
      }
    })
    return counts
  }, [players])

  // Contagem por tier estritamente alinhada com o OVR calibrado
  const tierCounts = useMemo(() => {
    const counts: Record<RatingFilter, number> = {
      all: players.length,
      wildcard: 0,
      elite: 0,
      rare: 0,
      common: 0,
      basic: 0,
      injured: 0,
    }

    players.forEach((p) => {
      if (isWildcardPlayer(p)) {
        counts.wildcard += 1
      }
      if (isInjuredPlayer(p)) {
        counts.injured += 1
      }
      const ovr = getPlayerOverall(p)
      const tier = getPlayerOvrTier(ovr)
      counts[tier as RatingFilter] += 1
    })

    return counts
  }, [players])

  // Filtragem e ordenação combinada
  const filteredAndSortedPlayers = useMemo(() => {
    let result = players

    // Filtro de Busca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const name = (p.shortName || "").toLowerCase()
        const fantasy = (p.metaInformation?.fantasyName || "").toLowerCase()
        return name.includes(q) || fantasy.includes(q)
      })
    }

    // Filtro por Posição
    if (selectedPosition !== "all") {
      result = result.filter((p) => p.role === selectedPosition)
    }

    // Filtro por Tier / DM / Wildcard
    if (selectedRatingFilter !== "all") {
      if (selectedRatingFilter === "wildcard") {
        result = result.filter(isWildcardPlayer)
      } else if (selectedRatingFilter === "injured") {
        result = result.filter(isInjuredPlayer)
      } else {
        result = result.filter((p) => getPlayerOvrTier(getPlayerOverall(p)) === selectedRatingFilter)
      }
    }

    // Ordenação dinâmica por qualquer coluna da tabela ou menu
    return [...result].sort((a, b) => comparePlayers(a, b, sortColumn, sortDirection))
  }, [players, searchQuery, selectedPosition, selectedRatingFilter, sortColumn, sortDirection])

  const isFilterActive =
    selectedRatingFilter !== "all" ||
    selectedPosition !== "all" ||
    searchQuery.trim() !== "" ||
    sortColumn !== "ovr" ||
    sortDirection !== "desc"

  const handleResetFilters = () => {
    setSelectedRatingFilter("all")
    setSelectedPosition("all")
    setSearchQuery("")
    setSortColumn("ovr")
    setSortDirection("desc")
  }

  if (loading) {
    return <TeamRosterSkeleton />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 4 CARDS DE COMANDO DO PLANTEL (CENTRAL TÁTICA KINGS LEAGUE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total de Atletas */}
        <div className="liquid-metric-card p-3.5 sm:p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              {t.teamPage.totalAthletes}
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
              {totalPlayers}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">{t.teamPage.athletes}</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium mt-1 truncate">
            {draftedCount} Draft • {wildcardCount} Wild Cards
          </p>
        </div>

        {/* Card 2: Média Geral OVR */}
        <div className="liquid-metric-card p-3.5 sm:p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              {t.teamPage.teamAverageOvr}
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-300 tabular-nums tracking-tight">
              {averageOvr}
            </span>
            <span className="text-[10px] font-mono font-bold text-sky-400/80 uppercase">
              OVR SQUAD
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium mt-1 truncate">
            Rating ponderado da equipe
          </p>
        </div>

        {/* Card 3: Craque do Time */}
        <div className="liquid-metric-card p-3.5 sm:p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              {t.teamPage.teamStar}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
          </div>
          {topPlayer ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/40 border border-amber-400/30 shrink-0 relative">
                <img
                  src={getPlayerPhotoUrl(topPlayer.image?.url)}
                  alt={topPlayer.shortName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                  {topPlayer.metaInformation?.fantasyName || topPlayer.shortName}
                </p>
                <span className="text-[10px] font-mono font-black text-amber-400">
                  {getPlayerOverall(topPlayer)} OVR • {topPlayer.role.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">-</span>
          )}
        </div>

        {/* Card 4: Departamento Médico */}
        <div className="liquid-metric-card p-3.5 sm:p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              {t.teamPage.recovering}
            </span>
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                injuredCount > 0
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-emerald-500/20 text-emerald-400"
              )}
            >
              {injuredCount > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-black tabular-nums tracking-tight",
                injuredCount > 0 ? "text-rose-400" : "text-emerald-400"
              )}
            >
              {injuredCount}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">{t.teamPage.athletes}</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium mt-1 truncate">
            {injuredCount === 0 ? t.teamPage.fullyFit : t.teamPage.medicalDept}
          </p>
        </div>
      </div>

      {/* TOOLBAR UNIFICADA DE FILTROS & VISUALIZAÇÃO */}
      <div className="relative rounded-3xl p-4 sm:p-5 border border-zinc-800 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)] space-y-4 overflow-hidden bg-gradient-to-b from-[#141420]/95 via-[#0e0e16]/95 to-[#09090e]/98 backdrop-blur-2xl">
        {/* Highlight sutil no topo do toolbar */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent pointer-events-none" />

        {/* Linha 1: Busca + Filtro por Posição + Ordenação + Toggle Modo de Vista */}
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.ui.search}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-black/50 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all duration-150 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded transition-colors"
                aria-label={t.ui.clear}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Abas de Posição Compactas (Todos, GOL, DEF, MEI, ATA) */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-zinc-800 gap-1 overflow-x-auto">
            <PositionTabButton
              active={selectedPosition === "all"}
              onClick={() => setSelectedPosition("all")}
              label={t.teamPage.allPositions}
              count={positionCounts.all}
            />
            <PositionTabButton
              active={selectedPosition === "goalkeeper"}
              onClick={() => setSelectedPosition("goalkeeper")}
              label={t.teamPage.roleGkAbbr}
              count={positionCounts.goalkeeper}
              color="amber"
            />
            <PositionTabButton
              active={selectedPosition === "defender"}
              onClick={() => setSelectedPosition("defender")}
              label={t.teamPage.roleDefAbbr}
              count={positionCounts.defender}
              color="blue"
            />
            <PositionTabButton
              active={selectedPosition === "midfielder"}
              onClick={() => setSelectedPosition("midfielder")}
              label={t.teamPage.roleMidAbbr}
              count={positionCounts.midfielder}
              color="emerald"
            />
            <PositionTabButton
              active={selectedPosition === "forward"}
              onClick={() => setSelectedPosition("forward")}
              label={t.teamPage.roleFwdAbbr}
              count={positionCounts.forward}
              color="rose"
            />
          </div>

          {/* Controles de Lado Direito: Ordenação e Toggle View */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Seletor de Ordenação (Mesmo padrão Radix DropdownMenu e Liquid Glass dos seletores de Liga e Idioma) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold",
                    "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 hover:border-white/20",
                    "active:scale-[0.97] transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
                  )}
                  aria-label={`${t.teamPage.sortBy}: ${activeSortLabel}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[170px] text-zinc-100">
                    {activeSortLabel}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="liquid-glass-menu w-64 max-h-[85vh] overflow-y-auto rounded-2xl p-1.5 shadow-2xl"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{t.teamPage.sortBy}</span>
                  </span>
                  <SlidersHorizontal className="w-3 h-3 text-[var(--team-primary)]" />
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 my-1" />

                {sortGroups.map((group, groupIdx) => (
                  <div key={group.id} className="mb-2 last:mb-0">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1">
                      {group.label}
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {group.options.map((option) => {
                        const isSelected = sortColumn === option.col && sortDirection === option.dir
                        const OptionIcon = option.icon

                        return (
                          <DropdownMenuItem
                            key={`${option.col}_${option.dir}`}
                            className={cn(
                              "cursor-pointer flex items-center justify-between py-2 px-2.5 rounded-xl transition-all duration-150 text-xs",
                              "focus:bg-white/[0.08] focus:text-white data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white",
                              isSelected
                                ? "bg-amber-400/10 text-white font-semibold border border-amber-400/25 shadow-sm"
                                : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                            )}
                            onClick={() => {
                              setSortColumn(option.col)
                              setSortDirection(option.dir)
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <OptionIcon
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0",
                                  isSelected ? "text-amber-400" : "text-zinc-400"
                                )}
                              />
                              <span className="truncate">{option.label}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                            )}
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                    {groupIdx < sortGroups.length - 1 && (
                      <DropdownMenuSeparator className="bg-white/5 my-1.5" />
                    )}
                  </div>
                ))}

                {/* Fallback para ordenação customizada originada de clique em coluna da tabela */}
                {!currentSortItem && (
                  <>
                    <DropdownMenuSeparator className="bg-white/5 my-1.5" />
                    <div className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider px-2.5 py-1">
                      Personalizada da Tabela
                    </div>
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center justify-between py-2 px-2.5 rounded-xl text-xs bg-amber-400/10 text-white font-semibold border border-amber-400/25 shadow-sm"
                      onClick={() => {}}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{activeSortLabel}</span>
                      </div>
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Switcher Modo de Visualização: Cards vs Tabela */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-[0.97]",
                  viewMode === "cards"
                    ? "bg-white/[0.12] text-white border border-white/15 shadow-sm"
                    : "text-zinc-400 hover:text-white border border-transparent"
                )}
                title={t.teamPage.cardsView}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.teamPage.cardsView}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-[0.97]",
                  viewMode === "table"
                    ? "bg-white/[0.12] text-white border border-white/15 shadow-sm"
                    : "text-zinc-400 hover:text-white border border-transparent"
                )}
                title={t.teamPage.tableView}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.teamPage.tableView}</span>
              </button>
            </div>

            {/* Reset Filter Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all duration-150 active:scale-[0.97] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                title={t.ui.clear}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Pílulas de Categoria & Rating Tier */}
        <div className="relative z-10 pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
          <FilterPill
            active={selectedRatingFilter === "all"}
            onClick={() => setSelectedRatingFilter("all")}
            label={t.teamPage.filterAll}
            count={tierCounts.all}
            tier="all"
          />
          <FilterPill
            active={selectedRatingFilter === "wildcard"}
            onClick={() => setSelectedRatingFilter("wildcard")}
            label={t.teamPage.wildCardsCount}
            count={tierCounts.wildcard}
            tier="wildcard"
            icon={<Sparkles className="w-3 h-3 text-amber-400" />}
          />
          <FilterPill
            active={selectedRatingFilter === "elite"}
            onClick={() => setSelectedRatingFilter("elite")}
            label={`${t.teamPage.tierElite} 78+`}
            count={tierCounts.elite}
            tier="elite"
            dotColor="bg-sky-400"
          />
          <FilterPill
            active={selectedRatingFilter === "rare"}
            onClick={() => setSelectedRatingFilter("rare")}
            label={`${t.teamPage.tierRare} 74-77`}
            count={tierCounts.rare}
            tier="rare"
            dotColor="bg-purple-400"
          />
          <FilterPill
            active={selectedRatingFilter === "common"}
            onClick={() => setSelectedRatingFilter("common")}
            label={`${t.teamPage.tierCommon} 70-73`}
            count={tierCounts.common}
            tier="common"
            dotColor="bg-emerald-400"
          />
          <FilterPill
            active={selectedRatingFilter === "basic"}
            onClick={() => setSelectedRatingFilter("basic")}
            label={`${t.teamPage.tierBasic} < 70`}
            count={tierCounts.basic}
            tier="basic"
            dotColor="bg-zinc-400"
          />
          <FilterPill
            active={selectedRatingFilter === "injured"}
            onClick={() => setSelectedRatingFilter("injured")}
            label={t.teamPage.filterInjured}
            count={tierCounts.injured}
            tier="injured"
            icon={<AlertTriangle className="w-3 h-3 text-rose-400" />}
          />
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL: MODO CARDS (SEPARADO POR POSIÇÃO) OU MODO TABELA SOFASCORE */}
      {viewMode === "cards" ? (
        <div className="space-y-8 sm:space-y-10">
          {POSITION_SECTIONS.map((sec) => {
            const posPlayers = filteredAndSortedPlayers.filter((p) => p.role === sec.role)
            if (posPlayers.length === 0) return null

            const Icon = sec.icon
            const title = (t.teamPage as any)[sec.titleKey] || sec.fallbackTitle
            const desc = (t.teamPage as any)[sec.descKey] || sec.fallbackDesc

            const colorStyles = {
              amber: {
                iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
              },
              blue: {
                iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
                pill: "bg-blue-500/15 text-blue-300 border-blue-500/30",
              },
              emerald: {
                iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              },
              rose: {
                iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
                pill: "bg-rose-500/15 text-rose-300 border-rose-500/30",
              },
            }

            const currentStyle = colorStyles[sec.color]

            return (
              <section key={sec.role} className="space-y-4">
                {/* Header de Seção por Posição com Design System Emil */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner shrink-0",
                        currentStyle.iconBg
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                          {title}
                        </h3>
                        <span
                          className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider",
                            currentStyle.pill
                          )}
                        >
                          {sec.abbr}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        {desc}
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                    {posPlayers.length}{" "}
                    {posPlayers.length === 1 ? t.teamPage.athlete : t.teamPage.athletes}
                  </span>
                </div>

                {/* Grid Fluido de Cards EA FC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {posPlayers.map((player) => (
                    <div key={player.id} className="h-full">
                      <PlayerCard player={player} teamColor={teamColor} />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        /* MODO TABELA PROFISSIONAL SOFASCORE COM ORDENAÇÃO DINÂMICA DE TODAS AS COLUNAS */
        <div className="rounded-3xl border border-zinc-800 overflow-hidden bg-black/40 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <SortableTh
                    column="jersey"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="left"
                    ariaLabel="Ordenar por número da camisa"
                  >
                    #
                  </SortableTh>
                  <SortableTh
                    column="name"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="left"
                    ariaLabel="Ordenar por atleta"
                  >
                    {t.teamPage.athlete}
                  </SortableTh>
                  <SortableTh
                    column="role"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por posição tática"
                  >
                    POS
                  </SortableTh>
                  <SortableTh
                    column="ovr"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por overall"
                  >
                    OVR
                  </SortableTh>
                  <SortableTh
                    column="age"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por idade"
                  >
                    {t.teamPage.birthDateLabel}
                  </SortableTh>
                  <SortableTh
                    column="height"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por altura"
                  >
                    {t.teamPage.heightLabel}
                  </SortableTh>
                  <SortableTh
                    column="matches"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por partidas"
                  >
                    {t.teamPage.statMatches}
                  </SortableTh>
                  <SortableTh
                    column="goals"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por gols"
                  >
                    {t.teamPage.statGoals}
                  </SortableTh>
                  <SortableTh
                    column="assists"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por assistências"
                  >
                    {t.teamPage.statAssists}
                  </SortableTh>
                  <SortableTh
                    column="mvp"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por MVPs"
                  >
                    {t.teamPage.statMvp}
                  </SortableTh>
                  <SortableTh
                    column="status"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleColumnSort}
                    align="center"
                    ariaLabel="Ordenar por status físico"
                  >
                    {t.teamPage.playerStatus}
                  </SortableTh>
                  <th className="py-3 px-4 text-right" aria-hidden="true"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-xs">
                {filteredAndSortedPlayers.map((player) => {
                  const ovr = getPlayerOverall(player)
                  const age = player.birthDate ? calculateAge(player.birthDate) : null
                  const isWildcard = isWildcardPlayer(player)
                  const isInjured = isInjuredPlayer(player)

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayerForModal(player)}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Número da camisa */}
                      <td
                        className={cn(
                          "py-3 px-4 font-mono font-bold transition-colors",
                          sortColumn === "jersey"
                            ? "text-amber-300 bg-amber-500/[0.04]"
                            : "text-zinc-400"
                        )}
                      >
                        {player.jersey || player.metaInformation?.jerseyNumber || "-"}
                      </td>

                      {/* Foto e Nome */}
                      <td
                        className={cn(
                          "py-3 px-4 transition-colors",
                          sortColumn === "name" ? "bg-amber-500/[0.04]" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-black/40 border border-zinc-800 shrink-0">
                            <img
                              src={getPlayerPhotoUrl(player.image?.url)}
                              alt={player.shortName}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                              {player.metaInformation?.fantasyName || player.shortName}
                            </p>
                            {isWildcard && (
                              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Wild Card
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Posição */}
                      <td
                        className={cn(
                          "py-3 px-3 text-center transition-colors",
                          sortColumn === "role" ? "bg-amber-500/[0.04]" : ""
                        )}
                      >
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {player.role.substring(0, 3).toUpperCase()}
                        </span>
                      </td>

                      {/* OVR Pill */}
                      <td
                        className={cn(
                          "py-3 px-3 text-center transition-colors",
                          sortColumn === "ovr" ? "bg-amber-500/[0.04]" : ""
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-black tabular-nums px-2 py-0.5 rounded border inline-block",
                            ovr >= 78
                              ? "bg-sky-500/20 text-sky-300 border-sky-400/30"
                              : ovr >= 74
                              ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                              : ovr >= 70
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                              : "bg-zinc-900 text-zinc-300 border-zinc-800"
                          )}
                        >
                          {ovr}
                        </span>
                      </td>

                      {/* Idade */}
                      <td
                        className={cn(
                          "py-3 px-3 text-center font-medium transition-colors",
                          sortColumn === "age"
                            ? "text-amber-300 bg-amber-500/[0.04]"
                            : "text-zinc-300"
                        )}
                      >
                        {age ? `${age}a` : "-"}
                      </td>

                      {/* Altura */}
                      <td
                        className={cn(
                          "py-3 px-3 text-center transition-colors",
                          sortColumn === "height"
                            ? "text-amber-300 bg-amber-500/[0.04]"
                            : "text-zinc-400"
                        )}
                      >
                        {player.height ? `${player.height}cm` : "-"}
                      </td>

                      {/* Stats do torneio */}
                      <td
                        className={cn(
                          "py-3 px-3 text-center font-bold transition-colors",
                          sortColumn === "matches"
                            ? "text-amber-300 bg-amber-500/[0.04]"
                            : "text-zinc-300"
                        )}
                      >
                        {player.stats?.matchesPlayed || 0}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-3 text-center font-black transition-colors",
                          sortColumn === "goals"
                            ? "text-emerald-300 bg-emerald-500/[0.08]"
                            : "text-emerald-400"
                        )}
                      >
                        {player.stats?.goalsScored || 0}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-3 text-center font-bold transition-colors",
                          sortColumn === "assists"
                            ? "text-sky-200 bg-sky-500/[0.08]"
                            : "text-sky-300"
                        )}
                      >
                        {player.stats?.assists || 0}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-3 text-center font-bold transition-colors",
                          sortColumn === "mvp"
                            ? "text-amber-300 bg-amber-500/[0.08]"
                            : "text-amber-400"
                        )}
                      >
                        {player.stats?.mvps || 0}
                      </td>

                      {/* Status */}
                      <td
                        className={cn(
                          "py-3 px-4 text-center transition-colors",
                          sortColumn === "status" ? "bg-amber-500/[0.04]" : ""
                        )}
                      >
                        {isInjured ? (
                          <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 inline-flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> DM
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                            Apto
                          </span>
                        )}
                      </td>

                      {/* Ação */}
                      <td className="py-3 px-4 text-right">
                        <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-colors ml-auto">
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESTADO VAZIO CASO O FILTRO NÃO RETORNE NINGUÉM */}
      {filteredAndSortedPlayers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl bg-zinc-950/70 border border-zinc-800 text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-white mb-1">{t.ui.noPlayers}</p>
            <p className="text-xs text-zinc-400 max-w-sm">{t.teamPage.noPlayersFiltered}</p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors btn-press"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {t.ui.reset} {t.ui.roster}
            </span>
          </button>
        </div>
      )}

      {/* Modal aberto a partir do clique em uma linha da tabela */}
      <PlayerModal
        player={selectedPlayerForModal}
        isOpen={Boolean(selectedPlayerForModal)}
        onClose={() => setSelectedPlayerForModal(null)}
        teamColor={teamColor}
      />
    </div>
  )
}

interface PositionTabButtonProps {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color?: "amber" | "blue" | "emerald" | "rose"
}

function PositionTabButton({ active, onClick, label, count, color }: PositionTabButtonProps) {
  const activeColorStyles = {
    amber: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    blue: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    rose: "bg-rose-500/20 text-rose-300 border-rose-400/40",
  }

  const activeStyle = color
    ? activeColorStyles[color]
    : "bg-zinc-800 text-white border-zinc-700"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 btn-press border",
        active
          ? `${activeStyle} shadow-sm`
          : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "px-1.5 py-0.2 rounded-full text-[9px] font-mono",
          active ? "bg-white/15 text-white" : "bg-zinc-800/80 text-zinc-400"
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface FilterPillProps {
  active: boolean
  onClick: () => void
  label: string
  count: number
  tier: RatingFilter
  icon?: React.ReactNode
  dotColor?: string
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  tier,
  icon,
  dotColor,
}: FilterPillProps) {
  const activeStyles: Record<RatingFilter, string> = {
    all: "bg-zinc-800 text-white border-zinc-700 shadow-sm",
    wildcard:
      "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    elite:
      "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
    rare:
      "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(192,132,252,0.2)]",
    common:
      "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]",
    basic:
      "bg-zinc-700/40 text-zinc-200 border-zinc-500/40",
    injured:
      "bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
  }

  const currentActiveStyle = activeStyles[tier] || activeStyles.all

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors btn-press",
        active
          ? currentActiveStyle
          : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!icon && dotColor && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor,
            active ? "ring-2 ring-white/30" : ""
          )}
        />
      )}
      <span>{label}</span>
      <span
        className={cn(
          "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ml-0.5",
          active ? "bg-white/15 text-white" : "bg-zinc-800/80 text-zinc-400"
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface SortableThProps {
  column: TableSortColumn
  currentColumn: TableSortColumn
  currentDirection: SortDirection
  onSort: (column: TableSortColumn) => void
  children: React.ReactNode
  align?: "left" | "center" | "right"
  className?: string
  ariaLabel?: string
}

function SortableTh({
  column,
  currentColumn,
  currentDirection,
  onSort,
  children,
  align = "center",
  className,
  ariaLabel,
}: SortableThProps) {
  const isActive = currentColumn === column
  const alignClasses = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  }

  return (
    <th
      scope="col"
      aria-sort={
        isActive
          ? currentDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className={cn(
        "py-2.5 select-none transition-colors",
        align === "left" ? "px-4" : align === "right" ? "px-4" : "px-3",
        isActive ? "bg-amber-500/[0.06]" : "",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={ariaLabel}
        className={cn(
          "w-full inline-flex items-center gap-1 font-black uppercase tracking-wider text-[10px] transition-colors group btn-press py-1 px-1.5 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
          alignClasses[align],
          isActive ? "text-amber-300" : "text-zinc-400 hover:text-white"
        )}
      >
        <span>{children}</span>
        <span
          className={cn(
            "w-3.5 h-3.5 inline-flex items-center justify-center shrink-0 transition-transform",
            isActive ? "text-amber-400" : "text-zinc-600 group-hover:text-zinc-300"
          )}
        >
          {isActive ? (
            currentDirection === "asc" ? (
              <ArrowUp className="w-3 h-3 text-amber-400" />
            ) : (
              <ArrowDown className="w-3 h-3 text-amber-400" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-35 group-hover:opacity-100" />
          )}
        </span>
      </button>
    </th>
  )
}

export function TeamRosterSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="liquid-metric-card p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-8 w-16 bg-white/15 rounded animate-pulse" />
              </div>
              <div className="h-2 w-28 bg-white/5 rounded animate-pulse mt-2" />
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <PlayerCardSkeleton key={i} />
          ))}
      </div>
    </div>
  )
}