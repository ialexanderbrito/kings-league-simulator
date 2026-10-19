"use client"

import React, { useState, useMemo } from "react"
import type { TeamStanding, Team, TeamDetails, Round } from "@/types/kings-league"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Trophy, ChevronUp, ChevronDown, ArrowUpRight, Shield, Info, HelpCircle, Crown } from "lucide-react"
import { determineChallengerAdvantage } from "@/lib/generate-playoff-bracket"
import { useLocale } from "@/contexts/locale-context"

export interface MatchFormItem {
  type: "V" | "D"
  label: "V" | "D"
  score: string
  oppName: string
  oppLogo?: string
  roundName: string
  isHome: boolean
  isShootout?: boolean
}

export interface PositionChange {
  value: number
  direction: "up" | "down" | "same"
}

export interface DisplayStanding extends TeamStanding {
  penaltyWins?: number
  penaltyLosses?: number
  regularWins?: number
}

export interface GroupedStandings {
  groupName: string
  standings: DisplayStanding[]
}

export interface FullStandingsTableProps {
  groupedStandings: GroupedStandings[]
  teams?: Record<string, Team>
  teamDetails?: Record<string, TeamDetails>
  teamFormMap?: Map<string, MatchFormItem[]>
  positionChangesMap?: Map<string, PositionChange>
  onTeamSelect: (teamId: string) => void
  winnerGroupName?: string
  winsByGroup?: Record<string, number>
  rounds?: Round[]
  qualification?: {
    playoffEnd: number
    playInStart?: number
    playInEnd?: number
    groupFormat?: "brazil" | "lastChance"
  }
  hasLiveMatches?: boolean
}

export default function FullStandingsTable({
  groupedStandings,
  teams = {},
  teamDetails = {},
  teamFormMap = new Map(),
  positionChangesMap = new Map(),
  onTeamSelect,
  rounds,
  qualification = { playoffEnd: 7 },
  hasLiveMatches = false,
}: FullStandingsTableProps) {
  const { t } = useLocale()
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0)
  const [showRules, setShowRules] = useState(false)

  // Kings Cup / Two Groups Advantage Calculation (idêntico ao Simulador)
  const hasTwoGroups =
    groupedStandings.some((g) => g.groupName === "A") &&
    groupedStandings.some((g) => g.groupName === "B")

  const allStandings = useMemo(
    () => groupedStandings.flatMap((g) => g.standings),
    [groupedStandings]
  )

  // Identifica a vantagem do Challenger (SC) na Kings Cup
  const challengerInfo = useMemo(() => {
    if (!hasTwoGroups) return null
    return determineChallengerAdvantage(rounds, allStandings)
  }, [hasTwoGroups, rounds, allStandings])

  const advantageGroup = challengerInfo?.advantageGroup || "A"

  // Se houver mais de um grupo, permite filtrar por abas
  const hasMultipleGroups = groupedStandings.length > 1 && hasTwoGroups
  const displayedGroups = hasMultipleGroups
    ? [groupedStandings[selectedGroupIndex] || groupedStandings[0]]
    : groupedStandings

  // Retorna o estilo visual conforme as regras da Kings Cup (100% alinhado com o simulador):
  // - Grupo com Vantagem SC:
  //   1º -> Semifinal Direta (verde esmeralda)
  //   2º ao 4º -> Playoffs / Quartas (dourado/âmbar)
  //   5º -> Eliminado (vermelho/rosa)
  // - Outro Grupo:
  //   1º ao 3º -> Playoffs / Quartas (dourado/âmbar)
  //   4º e 5º -> Eliminados (vermelho/rosa)
  const getPositionStyle = (groupName: string, positionInGroup: number) => {
    const playInStart = qualification.playInStart
    const playInEnd = qualification.playInEnd

    if (hasTwoGroups && qualification.groupFormat === "lastChance") {
      if (positionInGroup === 1) {
        return {
          badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black",
          bar: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
          border: "border-l-2 border-emerald-400",
        }
      }
      if (positionInGroup === 2) {
        return {
          badge: "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black",
          bar: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
          border: "border-l-2 border-amber-400",
        }
      }
      if (positionInGroup <= 4) {
        return {
          badge: "bg-orange-500/20 text-orange-300 border border-orange-500/40 font-black",
          bar: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]",
          border: "border-l-2 border-orange-400",
        }
      }
      return {
        badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold",
        bar: "bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]",
        border: "border-l-2 border-rose-500/40",
      }
    }

    if (hasTwoGroups && qualification.groupFormat === "brazil") {
      const isAdv = groupName === advantageGroup
      if (isAdv) {
        if (positionInGroup === 1) {
          return {
            badge:
              "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-black",
            bar: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
            border: "border-l-2 border-emerald-400",
          }
        }
        if (positionInGroup >= 2 && positionInGroup <= 4) {
          return {
            badge:
              "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black",
            bar: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
            border: "border-l-2 border-amber-400",
          }
        }
        return {
          badge:
            "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold",
          bar: "bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]",
          border: "border-l-2 border-rose-500/40",
        }
      } else {
        if (positionInGroup >= 1 && positionInGroup <= 3) {
          return {
            badge:
              "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black",
            bar: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
            border: "border-l-2 border-amber-400",
          }
        }
        return {
          badge:
            "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold",
          bar: "bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]",
          border: "border-l-2 border-rose-500/40",
        }
      }
    }

    // Fallback: formato de tabela única (sem grupos)
    if (positionInGroup === 1) {
      return {
        badge:
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-black",
        bar: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
        border: "border-l-2 border-emerald-400",
      }
    }
    if (
      positionInGroup >= 2 &&
      positionInGroup <= qualification.playoffEnd &&
      !(playInStart !== undefined && playInEnd !== undefined && positionInGroup >= playInStart && positionInGroup <= playInEnd)
    ) {
      return {
        badge:
          "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black",
        bar: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
        border: "border-l-2 border-amber-400",
      }
    }
    if (
      playInStart !== undefined &&
      playInEnd !== undefined &&
      positionInGroup >= playInStart &&
      positionInGroup <= playInEnd
    ) {
      return {
        badge:
          "bg-sky-400/20 text-sky-300 border border-sky-400/40 shadow-sm shadow-sky-400/15 font-black",
        bar: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
        border: "border-l-2 border-sky-400",
      }
    }
    if (positionInGroup >= 8) {
      return {
        badge:
          "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold",
        bar: "bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]",
        border: "border-l-2 border-rose-500/40",
      }
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Grupo Minimalista Liquid Glass (quando houver múltiplos grupos) */}
      {hasMultipleGroups && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex p-1 rounded-full liquid-nav-shell border border-white/[0.08]">
            {groupedStandings.map((group, idx) => {
              const isActive = selectedGroupIndex === idx
              return (
                <button
                  key={group.groupName}
                  onClick={() => setSelectedGroupIndex(idx)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ease-out",
                    isActive
                      ? "bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {t.matches.group} {group.groupName}
                </button>
              )
            })}
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            {t.standings.showingGroup} {groupedStandings[selectedGroupIndex]?.groupName}
          </span>
        </div>
      )}

      {/* Renderização das Tabelas */}
      {displayedGroups.map((group) => {
        const isAdvantageGroup = hasTwoGroups && qualification.groupFormat !== "lastChance" && group.groupName === advantageGroup

        return (
          <div
            key={group.groupName}
            className="liquid-glass-card group relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] bg-[#0d0d12]/80 backdrop-blur-2xl"
          >
            {/* Filete de Brilho Especular Superior com a cor tema */}
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] opacity-75"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)",
              }}
            />

            {/* Cabeçalho do Card da Tabela */}
            <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-white/[0.06] bg-white/[0.015] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-[var(--team-primary)] shadow-sm shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {!hasTwoGroups || group.groupName === "Regular" || (group.groupName === "A" && groupedStandings.length === 1)
                        ? t.standings.officialTable
                        : `${t.matches.group} ${group.groupName}`}
                    </h2>
                    {hasTwoGroups && (
                      qualification.groupFormat === "lastChance" ? (
                        <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full select-none">
                          {t.standings.fourPlayoffSpots || "4 vagas playoffs"}
                        </span>
                      ) : isAdvantageGroup ? (
                        <span className="text-[10px] font-black text-[#34d399] bg-[#34d399]/15 px-2.5 py-0.5 rounded-full border border-[#34d399]/40 flex items-center gap-1 select-none shadow-sm shadow-[#34d399]/25">
                          <Crown className="w-3 h-3 text-[#34d399]" />
                          <span>{t.standings.scAdvantage}</span>
                          {challengerInfo && (
                            <span className="font-mono opacity-80">
                              ({group.groupName === "A" ? challengerInfo.groupAWins : challengerInfo.groupBWins}V)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded-full select-none">
                          {t.standings.threePlayoffSpots}
                        </span>
                      )
                    )}
                    {hasLiveMatches && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t.standings.live}
                    </span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {t.standings.titleDesc}
                    </p>
                    {hasTwoGroups && (
                      <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                        • {qualification.groupFormat === "lastChance"
                          ? t.standings.lastChanceSubtext
                          : isAdvantageGroup
                            ? t.standings.advantageSubtext
                            : t.standings.noAdvantageSubtext}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges de Apoio */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-zinc-300 bg-white/[0.03] border border-white/[0.06]">
                  <Shield className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                  <strong className="text-white">{group.standings.length}</strong> {t.standings.teamsCount}
                </span>
              </div>
            </div>

            {/* Conteúdo da Tabela Responsiva */}
            <div className="w-full overflow-x-auto select-none">
              <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-[760px] lg:min-w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[11px] font-black tracking-wider uppercase text-zinc-400">
                    <th scope="col" className="py-3.5 pl-5 pr-2 w-14 text-center font-bold">
                      {t.standings.pos}
                    </th>
                    <th scope="col" className="py-3.5 px-3 min-w-[190px] sm:min-w-[230px] font-bold">
                      {t.standings.team}
                    </th>
                    <th scope="col" className="py-3.5 px-2.5 w-24 text-center font-black text-white" title={t.standings.winLossTooltip}>
                      {t.standings.wl}
                    </th>
                    <th scope="col" className="py-3.5 px-2 w-12 text-center font-bold" title={t.standings.playedTooltip}>
                      {t.standings.playedAbbr}
                    </th>
                    <th scope="col" className="py-3.5 px-2 w-12 text-center font-bold hidden sm:table-cell" title={t.standings.wonTooltip}>
                      {t.standings.wonAbbr}
                    </th>
                    <th scope="col" className="py-3.5 px-2 w-12 text-center font-bold hidden sm:table-cell" title={t.standings.lostTooltip}>
                      {t.standings.lostAbbr}
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-2 w-12 text-center font-bold hidden lg:table-cell"
                      title={t.standings.gfTooltip}
                    >
                      {t.standings.gfAbbr}
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-2 w-12 text-center font-bold hidden lg:table-cell"
                      title={t.standings.gaTooltip}
                    >
                      {t.standings.gaAbbr}
                    </th>
                    <th scope="col" className="py-3.5 px-2.5 w-14 text-center font-bold" title={t.standings.gdTooltip}>
                      {t.standings.gdAbbr}
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-3 w-36 text-center font-bold hidden md:table-cell"
                      title={t.standings.recentMatchesTooltip}
                    >
                      {t.standings.form}
                    </th>
                    <th scope="col" className="py-3.5 pr-5 pl-1 w-10 text-center">
                      <span className="sr-only">{t.standings.actions}</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.04]">
                  {group.standings.map((team, index) => {
                    const position = index + 1
                    const teamId = String(team.id)
                    const change = positionChangesMap.get(teamId)
                    const formItems = teamFormMap.get(teamId) || []
                    const details = teamDetails[teamId]
                    const president = details?.staff?.find((s) => s.role === "president")
                    const presidentName = president
                      ? president.shortName || `${president.firstName} ${president.lastName}`
                      : undefined

                    const posStyle = getPositionStyle(group.groupName, position)

                    const won = team.won ?? 0
                    const lost = team.lost ?? 0
                    const played = team.played ?? won + lost
                    const sg = team.goalDifference ?? (team.goalsFor || 0) - (team.goalsAgainst || 0)

                    return (
                      <tr
                        key={team.id}
                        onClick={() => onTeamSelect(teamId)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${t.standings.viewTeam} ${team.name}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            onTeamSelect(teamId)
                          }
                        }}
                        className="group relative cursor-pointer hover:bg-white/[0.035] active:scale-[0.999] transition-[background-color,transform] duration-150 ease-out"
                      >
                        {/* Posição com Indicador Lateral de Zona */}
                        <td className="py-3 pl-5 pr-2 text-center relative">
                          {/* Filete vertical de zona */}
                          {posStyle?.bar && (
                            <div
                              className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                posStyle.bar
                              )}
                            />
                          )}

                          <div className="flex flex-col items-center justify-center">
                            {/* Badge de Posição */}
                            <div
                              className={cn(
                                "w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition-transform duration-150",
                                posStyle
                                  ? posStyle.badge
                                  : "bg-white/[0.04] border border-white/[0.07] text-zinc-400"
                              )}
                            >
                              {position}
                            </div>

                            {/* Variação de Posição */}
                            {change && (
                              <div className="mt-0.5 flex items-center justify-center">
                                {change.direction === "up" ? (
                                  <span className="inline-flex items-center text-[9px] font-black text-emerald-400 leading-none">
                                    <ChevronUp className="w-2.5 h-2.5 stroke-[3]" />
                                    {change.value}
                                  </span>
                                ) : change.direction === "down" ? (
                                  <span className="inline-flex items-center text-[9px] font-black text-rose-400 leading-none">
                                    <ChevronDown className="w-2.5 h-2.5 stroke-[3]" />
                                    {change.value}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-600 leading-none font-bold">
                                    —
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Clube (Escudo, Nome, Tag, Presidente) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Escudo em micro-redoma de vidro */}
                            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-1 bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-150 ease-out">
                              <img
                                src={getProxyImageUrl(
                                  typeof team.logo === "string" ? team.logo : team.logo?.url
                                )}
                                alt={`${t.playoffs.officialShield} ${team.name}`}
                                className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                                loading="lazy"
                                crossOrigin="anonymous"
                              />
                            </div>

                            {/* Nome e Tags */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[var(--team-primary,#F4AF23)] transition-colors duration-150 truncate leading-snug">
                                  {team.name}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 shrink-0">
                                  {team.shortName}
                                </span>
                              </div>

                              {presidentName && (
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium hidden sm:block">
                                  {t.teamPage.presAbbr}: <span className="text-zinc-300">{presidentName}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* V - D (Hero Metric Principal da Kings League) */}
                        <td className="py-3 px-2.5 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-xs">
                            <span className="font-black text-xs sm:text-sm text-emerald-400 tabular-nums">
                              {won}
                            </span>
                            <span className="text-zinc-600 font-bold text-xs">-</span>
                            <span className="font-bold text-xs sm:text-sm text-zinc-400 tabular-nums">
                              {lost}
                            </span>
                          </div>
                        </td>

                        {/* Jogos Disputados (J) */}
                        <td className="py-3 px-2 text-center tabular-nums text-xs sm:text-sm font-semibold text-zinc-300">
                          {played}
                        </td>

                        {/* Vitórias (V) */}
                        <td className="py-3 px-2 text-center tabular-nums text-xs sm:text-sm font-semibold text-emerald-400 hidden sm:table-cell">
                          {won}
                        </td>

                        {/* Derrotas (D) */}
                        <td className="py-3 px-2 text-center tabular-nums text-xs sm:text-sm font-medium text-zinc-400 hidden sm:table-cell">
                          {lost}
                        </td>

                        {/* Gols Pró (GP) */}
                        <td className="py-3 px-2 text-center tabular-nums text-xs sm:text-sm font-medium text-zinc-400 hidden lg:table-cell">
                          {team.goalsFor ?? 0}
                        </td>

                        {/* Gols Contra (GC) */}
                        <td className="py-3 px-2 text-center tabular-nums text-xs sm:text-sm font-medium text-zinc-400 hidden lg:table-cell">
                          {team.goalsAgainst ?? 0}
                        </td>

                        {/* Saldo de Gols (SG) */}
                        <td className="py-3 px-2.5 text-center">
                          <span
                            className={cn(
                              "tabular-nums text-xs sm:text-sm font-bold",
                              sg > 0
                                ? "text-emerald-400"
                                : sg < 0
                                ? "text-rose-400"
                                : "text-zinc-400"
                            )}
                          >
                            {sg > 0 ? `+${sg}` : sg}
                          </span>
                        </td>

                        {/* Forma Recente (Últimos Jogos: V e D) */}
                        <td className="py-3 px-3 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            {formItems.length === 0 ? (
                              <span className="text-[11px] text-zinc-500">—</span>
                            ) : (
                              formItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  title={`${item.label === "V" ? t.standings.victory : t.standings.defeat} • ${item.score} vs ${item.oppName} (${item.roundName})${item.isShootout ? " [Shootout]" : ""}`}
                                  className={cn(
                                    "w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center transition-transform hover:scale-115 shadow-xs cursor-help select-none",
                                    item.type === "V"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                  )}
                                >
                                  {item.label}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Botão de Navegação / Ação */}
                        <td className="py-3 pr-5 pl-1 text-center">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-white/10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 mx-auto">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé do Card: Legenda Oficial e Critérios (idêntico ao Simulador) */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-white/[0.06] bg-white/[0.01] flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* Zonas de Classificação */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-zinc-300 font-semibold">{t.standings.directSemi}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  <span className="text-zinc-300 font-semibold">
                    {hasTwoGroups
                      ? qualification.groupFormat === "lastChance"
                        ? (t.standings.quarterfinalsSecond || "2º Quartas de Final")
                        : t.standings.quarterfinals
                      : t.standings.singleTableQuarters.replace("{end}", String(qualification.playoffEnd))}
                  </span>
                </div>
                {qualification.groupFormat === "lastChance" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
                    <span className="text-zinc-300 font-semibold">
                      {t.standings.lastChanceLegend || "3º e 4º Last Chance"}
                    </span>
                  </div>
                ) : qualification.playInStart !== undefined && !hasTwoGroups ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                    <span className="text-zinc-300 font-semibold">
                      {t.standings.playIn.replace("{start}", String(qualification.playInStart)).replace("{end}", String(qualification.playInEnd))}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                  <span className="text-zinc-400 font-medium">{t.standings.eliminated}</span>
                </div>
              </div>

              {/* Botão de Toggle das Regras Oficiais */}
              <button
                type="button"
                onClick={() => setShowRules(!showRules)}
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-150 text-[11px] font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showRules ? t.standings.hideRules : t.standings.showRules}
              </button>
            </div>

            {/* Painel Expansível de Regras Oficiais da Kings League */}
            {showRules && (
              <div className="px-5 py-4 sm:px-6 sm:py-5 border-t border-white/[0.06] bg-black/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                  <span>{t.standings.officialRegulations}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {t.standings.noDrawsTitle}
                    </span>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {t.standings.noDrawsDesc}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      {t.standings.tiebreakerTitle}
                    </span>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {t.standings.tiebreakerDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>V - D:</strong> {t.ui.wins} / {t.ui.losses}</span>
                  <span><strong>J:</strong> {t.ui.matches}</span>
                  <span><strong>V:</strong> {t.ui.wins}</span>
                  <span><strong>D:</strong> {t.ui.losses}</span>
                  <span><strong>GP:</strong> {t.ui.scored}</span>
                  <span><strong>GC:</strong> {t.ui.conceded}</span>
                  <span><strong>SG:</strong> {t.ui.difference}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
