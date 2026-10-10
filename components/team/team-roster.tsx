"use client"

import { useMemo, useState } from "react"
import { PlayerCard } from "@/components/team/player-card"
import { PlayerCardSkeleton } from "@/components/skeletons/player-card-skeleton"
import type { Player } from "@/types/kings-league"
import {
  Users,
  Sparkles,
  Star,
  AlertTriangle,
  SlidersHorizontal,
  Goal,
  ShieldCheck,
  Zap,
  Target,
  Search,
  X,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamRosterProps {
  players: Player[]
  loading: boolean
}

type RatingFilter = "all" | "wildcard" | "elite" | "rare" | "common" | "basic" | "injured"

function getAttrValue(attr: string | undefined): number {
  const value = Number.parseInt(attr || "70", 10)
  return Number.isNaN(value) ? 70 : value
}

function getPlayerRatingTier(player: Player): Exclude<RatingFilter, "all"> {
  const isWildcard = player.category === "wildcard" || player?.metaInformation?.status === "Wildcard"
  if (isWildcard) return "wildcard"

  const meta = player.metaInformation
  if (!meta) return "common"

  if (meta.average) {
    const avg = Number.parseInt(meta.average, 10)
    if (!Number.isNaN(avg) && avg > 0) {
      if (avg >= 78) return "elite"
      if (avg >= 74) return "rare"
      if (avg >= 70) return "common"
      return "basic"
    }
  }

  const values =
    player.role === "goalkeeper"
      ? [
          getAttrValue(meta.diving),
          getAttrValue(meta.handling),
          getAttrValue(meta.reflexes),
          getAttrValue(meta.anticipation),
        ]
      : [
          getAttrValue(meta.passing),
          getAttrValue(meta.shooting),
          getAttrValue(meta.defence),
          getAttrValue(meta.physical),
          getAttrValue(meta.duels),
          getAttrValue(meta.skills),
        ]

  const rating = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)

  if (rating >= 78) return "elite"
  if (rating >= 74) return "rare"
  if (rating >= 70) return "common"
  return "basic"
}

export function TeamRoster({ players, loading }: TeamRosterProps) {
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<RatingFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Contagem dinâmica por tier para exibir nas pílulas
  const tierCounts = useMemo(() => {
    const counts = {
      all: players.length,
      wildcard: 0,
      elite: 0,
      rare: 0,
      common: 0,
      basic: 0,
      injured: 0,
    }

    players.forEach((p) => {
      if (String(p?.metaInformation?.injury || "").toLowerCase() === "true") {
        counts.injured += 1
      }
      const tier = getPlayerRatingTier(p)
      if (tier in counts) {
        counts[tier] += 1
      }
    })

    return counts
  }, [players])

  const filteredPlayers = useMemo(() => {
    let result = players

    // Filtro por texto (nome do atleta ou fantasyName)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const name = (p.shortName || "").toLowerCase()
        const fantasy = (p.metaInformation?.fantasyName || "").toLowerCase()
        return name.includes(q) || fantasy.includes(q)
      })
    }

    if (selectedRatingFilter === "all") return result
    if (selectedRatingFilter === "injured") {
      return result.filter((player) => String(player?.metaInformation?.injury || "").toLowerCase() === "true")
    }
    return result.filter((player) => getPlayerRatingTier(player) === selectedRatingFilter)
  }, [players, selectedRatingFilter, searchQuery])

  const goalkeepers = filteredPlayers.filter((p) => p.role === "goalkeeper")
  const defenders = filteredPlayers.filter((p) => p.role === "defender")
  const midfielders = filteredPlayers.filter((p) => p.role === "midfielder")
  const forwards = filteredPlayers.filter((p) => p.role === "forward")

  // Estatísticas gerais
  const totalPlayers = players.length
  const wildcardCount = tierCounts.wildcard
  const draftedCount = players.filter((p) => p.category === "draft" || p?.metaInformation?.status === "Draft").length
  const injuredCount = tierCounts.injured

  const isFilterActive = selectedRatingFilter !== "all" || searchQuery.trim() !== ""

  const handleResetFilters = () => {
    setSelectedRatingFilter("all")
    setSearchQuery("")
  }

  if (loading) {
    return <TeamRosterSkeleton />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Resumo do Elenco: 4 Métricas em Liquid Glass Autêntico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <RosterMetricCard
          icon={Users}
          value={totalPlayers}
          label="Total de Atletas"
          sublabel="Plantel Oficial"
          accentColor="zinc"
        />
        <RosterMetricCard
          icon={Star}
          value={draftedCount}
          label="Draftados Oficial"
          sublabel={totalPlayers > 0 ? `${Math.round((draftedCount / totalPlayers) * 100)}% do elenco` : "Draft da liga"}
          accentColor="sky"
        />
        <RosterMetricCard
          icon={Sparkles}
          value={wildcardCount}
          label="Wild Cards Ativos"
          sublabel={wildcardCount > 0 ? "Estrelas convidadas" : "Nenhum ativo"}
          accentColor="amber"
        />
        <RosterMetricCard
          icon={AlertTriangle}
          value={injuredCount}
          label="Em Recuperação"
          sublabel={injuredCount === 0 ? "100% plantel apto" : `${injuredCount} no dep. médico`}
          accentColor={injuredCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* PAINEL DE FILTROS LIQUID GLASS (Design Master / Emil Kowalski) */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)] space-y-3.5 overflow-hidden bg-gradient-to-b from-[#13131c]/90 via-[#0d0d14]/90 to-[#0a0a0f]/95 backdrop-blur-2xl">
        {/* Specular Top Rim Highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        {/* Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-64 h-32 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Header do Painel com Título, Busca e Reset */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Filtrar Elenco
                </h3>
                <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded">
                  {filteredPlayers.length} / {totalPlayers}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Filtre por categoria, faixa de rating EA FC ou busque por atleta
              </p>
            </div>
          </div>

          {/* Barra de Ações: Busca Rápida + Limpar Filtros */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jogador..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-colors flex items-center gap-1.5 btn-press shrink-0"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Track de Pílulas em Liquid Glass */}
        <div className="relative z-10 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl liquid-filter-track flex flex-wrap items-center gap-1.5">
          <FilterPill
            active={selectedRatingFilter === "all"}
            onClick={() => setSelectedRatingFilter("all")}
            label="Todos"
            count={tierCounts.all}
            tier="all"
          />
          <FilterPill
            active={selectedRatingFilter === "wildcard"}
            onClick={() => setSelectedRatingFilter("wildcard")}
            label="Wild Cards"
            count={tierCounts.wildcard}
            tier="wildcard"
            icon={<Sparkles className="w-3 h-3" />}
          />
          <FilterPill
            active={selectedRatingFilter === "elite"}
            onClick={() => setSelectedRatingFilter("elite")}
            label="Elite 78+"
            count={tierCounts.elite}
            tier="elite"
            dotColor="bg-sky-400"
          />
          <FilterPill
            active={selectedRatingFilter === "rare"}
            onClick={() => setSelectedRatingFilter("rare")}
            label="Raro 74-77"
            count={tierCounts.rare}
            tier="rare"
            dotColor="bg-purple-400"
          />
          <FilterPill
            active={selectedRatingFilter === "common"}
            onClick={() => setSelectedRatingFilter("common")}
            label="Comum 70-73"
            count={tierCounts.common}
            tier="common"
            dotColor="bg-emerald-400"
          />
          <FilterPill
            active={selectedRatingFilter === "basic"}
            onClick={() => setSelectedRatingFilter("basic")}
            label="Básico < 70"
            count={tierCounts.basic}
            tier="basic"
            dotColor="bg-zinc-400"
          />
          <FilterPill
            active={selectedRatingFilter === "injured"}
            onClick={() => setSelectedRatingFilter("injured")}
            label="Machucados"
            count={tierCounts.injured}
            tier="injured"
            icon={<AlertTriangle className="w-3 h-3 text-rose-400" />}
          />
        </div>
      </div>

      {/* Seções por Posição em Grid Fluido de Cards EA FC */}
      {goalkeepers.length > 0 && (
        <PositionSection
          title="Goleiros"
          abbr="GOL"
          players={goalkeepers}
          icon={Goal}
          color="amber"
          description="Segurança na meta, saída rápida e reposição de bola"
        />
      )}

      {defenders.length > 0 && (
        <PositionSection
          title="Defensores"
          abbr="DEF"
          players={defenders}
          icon={ShieldCheck}
          color="blue"
          description="Solidez na marcação, duelos e cobertura defensiva"
        />
      )}

      {midfielders.length > 0 && (
        <PositionSection
          title="Meio-campistas"
          abbr="MEI"
          players={midfielders}
          icon={Zap}
          color="emerald"
          description="Criação de jogadas, ritmo, passe e transição ofensiva"
        />
      )}

      {forwards.length > 0 && (
        <PositionSection
          title="Atacantes"
          abbr="ATA"
          players={forwards}
          icon={Target}
          color="rose"
          description="Poder de finalização, drible 1v1 e presença de área"
        />
      )}

      {filteredPlayers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl liquid-glass-panel border border-white/8 text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-white mb-1">Nenhum jogador encontrado</p>
            <p className="text-xs text-zinc-400 max-w-sm">
              Não encontramos atletas para o filtro ou busca selecionada. Tente alternar o filtro ou limpar os termos de busca.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="liquid-pill-btn px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Elenco Completo</span>
          </button>
        </div>
      )}
    </div>
  )
}

interface RosterMetricCardProps {
  icon: any
  value: number
  label: string
  sublabel: string
  accentColor: "zinc" | "sky" | "amber" | "rose" | "emerald"
}

function RosterMetricCard({
  icon: Icon,
  value,
  label,
  sublabel,
  accentColor,
}: RosterMetricCardProps) {
  const accentStyles = {
    zinc: {
      text: "text-zinc-100",
      iconBg: "bg-white/[0.08] text-zinc-100 border-white/15 shadow-[0_0_16px_-4px_rgba(255,255,255,0.15)]",
      glow: "from-white/[0.06] via-white/[0.01] to-transparent",
    },
    sky: {
      text: "text-sky-300",
      iconBg: "bg-sky-500/15 text-sky-400 border-sky-400/30 shadow-[0_0_16px_-4px_rgba(56,189,248,0.3)]",
      glow: "from-sky-500/[0.08] via-sky-500/[0.02] to-transparent",
    },
    amber: {
      text: "text-amber-300",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-400/30 shadow-[0_0_16px_-4px_rgba(245,158,11,0.3)]",
      glow: "from-amber-500/[0.08] via-amber-500/[0.02] to-transparent",
    },
    rose: {
      text: "text-rose-300",
      iconBg: "bg-rose-500/15 text-rose-400 border-rose-400/30 shadow-[0_0_16px_-4px_rgba(244,63,94,0.3)]",
      glow: "from-rose-500/[0.08] via-rose-500/[0.02] to-transparent",
    },
    emerald: {
      text: "text-emerald-300",
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-400/30 shadow-[0_0_16px_-4px_rgba(52,211,153,0.3)]",
      glow: "from-emerald-500/[0.08] via-emerald-500/[0.02] to-transparent",
    },
  }

  const current = accentStyles[accentColor] || accentStyles.zinc

  return (
    <div className="relative rounded-2xl p-4 sm:p-4.5 liquid-metric-card overflow-hidden group select-none">
      {/* Specular Top Rim Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Ambient Radial Glow */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300",
          current.glow
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Número e Labels */}
        <div className="space-y-1 min-w-0">
          <p className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tighter leading-none">
            {value}
          </p>
          <div className="pt-1 min-w-0">
            <p className="text-xs font-bold text-white uppercase tracking-wider leading-tight truncate">
              {label}
            </p>
            <p className="text-[10px] font-medium text-zinc-400 tracking-wide mt-0.5 truncate">
              {sublabel}
            </p>
          </div>
        </div>

        {/* Ícone em Caixilho de Vidro Iluminado */}
        <div
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105",
            current.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
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
  // Cores personalizadas de Liquid Glass por Tier quando ativo
  const activeStyles: Record<RatingFilter, string> = {
    all: "bg-white/15 text-white border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_4px_12px_-2px_rgba(0,0,0,0.5)]",
    wildcard:
      "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.35),0_4px_16px_-2px_rgba(245,158,11,0.3)]",
    elite:
      "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.35),0_4px_16px_-2px_rgba(14,165,233,0.3)]",
    rare:
      "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[inset_0_1px_0_0_rgba(192,132,252,0.35),0_4px_16px_-2px_rgba(168,85,247,0.3)]",
    common:
      "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[inset_0_1px_0_0_rgba(52,211,153,0.35),0_4px_16px_-2px_rgba(16,185,129,0.3)]",
    basic:
      "bg-zinc-700/40 text-zinc-200 border-zinc-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(0,0,0,0.5)]",
    injured:
      "bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.35),0_4px_16px_-2px_rgba(225,29,72,0.3)]",
  }

  const currentActiveStyle = activeStyles[tier] || activeStyles.all

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "liquid-filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border focus-visible:outline-none",
        active
          ? currentActiveStyle
          : "bg-white/[0.03] text-zinc-400 border-transparent hover:bg-white/[0.08] hover:text-white hover:border-white/10"
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
          active ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface PositionSectionProps {
  title: string
  abbr: string
  players: Player[]
  icon: any
  color: "amber" | "blue" | "emerald" | "rose"
  description: string
}

function PositionSection({ title, abbr, players, icon: Icon, color, description }: PositionSectionProps) {
  const colorStyles = {
    amber: {
      bg: "bg-amber-500/15 text-amber-400",
      border: "border-amber-500/30",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    blue: {
      bg: "bg-blue-500/15 text-blue-400",
      border: "border-blue-500/30",
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    emerald: {
      bg: "bg-emerald-500/15 text-emerald-400",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    rose: {
      bg: "bg-rose-500/15 text-rose-400",
      border: "border-rose-500/30",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    },
  }

  const currentStyle = colorStyles[color]

  return (
    <div className="space-y-4">
      {/* Header da Seção de Posição Estilo Futebol Moderno */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", currentStyle.bg)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">{title}</h3>
              <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded border uppercase", currentStyle.badge)}>
                {abbr}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{description}</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-zinc-300">
          {players.length} {players.length === 1 ? "atleta" : "atletas"}
        </span>
      </div>

      {/* Grid Fluido e Responsivo de Cards FIFA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {players.map((player) => (
          <div key={player.id} className="h-full">
            <PlayerCard player={player} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TeamRosterSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="liquid-metric-card p-4 sm:p-4.5 rounded-2xl relative overflow-hidden flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-8 w-14 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-3.5 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/10 animate-pulse shrink-0" />
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