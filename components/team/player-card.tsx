"use client"

import { useState } from "react"
import type { Player } from "@/types/kings-league"
import { calculateAge, cn, getProxyImageUrl, getPlayerOverall } from "@/lib/utils"
import {
  Shield,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  User,
  AlertTriangle,
  Youtube,
  ExternalLink,
} from "lucide-react"

interface PlayerCardProps {
  player: Player
}

interface AttributeItem {
  key: string
  label: string
  value: number
}

function parseAttr(val: string | undefined | null, fallback = 70): number {
  const parsed = Number.parseInt(val || `${fallback}`, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isWildcard =
    player.category === "wildcard" || player?.metaInformation?.status === "Wildcard"
  const isInjured =
    String(player?.metaInformation?.injury || "").toLowerCase() === "true"

  const roleMap: Record<Player["role"], string> = {
    goalkeeper: "Goleiro",
    defender: "Defensor",
    midfielder: "Meio-campo",
    forward: "Atacante",
  }

  const roleAbbr: Record<Player["role"], string> = {
    goalkeeper: "GOL",
    defender: "DEF",
    midfielder: "MEI",
    forward: "ATA",
  }

  const roleStyles: Record<Player["role"], { bg: string; text: string; border: string }> = {
    goalkeeper: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
    defender: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40" },
    midfielder: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" },
    forward: { bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" },
  }

  const roleStyle = roleStyles[player.role] || roleStyles.forward
  const age = player.birthDate ? calculateAge(player.birthDate) : null

  // Cálculo de Overall Rating unificado e realista
  const ovr = getPlayerOverall(player)

  // Atributos centrais estilo card FIFA (6 principais)
  const getFifaStats = (): AttributeItem[] => {
    const meta = player.metaInformation
    if (!meta) return []

    if (player.role === "goalkeeper") {
      return [
        { key: "DIV", label: "SAL", value: parseAttr(meta.diving) },
        { key: "HAN", label: "MÃO", value: parseAttr(meta.handling) },
        { key: "REF", label: "REF", value: parseAttr(meta.reflexes) },
        { key: "POS", label: "POS", value: parseAttr(meta.anticipation) },
        { key: "PAS", label: "PAS", value: parseAttr(meta.goalkeeperPassing || meta.passing, 68) },
        { key: "DUE", label: "DUE", value: parseAttr(meta.duels, 70) },
      ]
    }

    return [
      { key: "FIN", label: "FIN", value: parseAttr(meta.shooting) },
      { key: "PAS", label: "PAS", value: parseAttr(meta.passing) },
      { key: "TEC", label: "TEC", value: parseAttr(meta.skills) },
      { key: "DEF", label: "DEF", value: parseAttr(meta.defence) },
      { key: "FIS", label: "FÍS", value: parseAttr(meta.physical) },
      { key: "DUE", label: "DUE", value: parseAttr(meta.duels) },
    ]
  }

  const fifaStats = getFifaStats()
  const hasDetailedStats = fifaStats.length > 0

  // Estilo do Card baseado no Tier / Categoria EA FC
  const getCardTier = () => {
    if (isWildcard) {
      return {
        border: "border-amber-400/35 hover:border-amber-400/60",
        glow: "shadow-[0_8px_30px_-8px_rgba(245,158,11,0.22)]",
        accent: "text-amber-300",
        ratingBg: "bg-amber-500/15 border-amber-400/40 text-amber-300",
        gradient: "from-amber-500/[0.12] via-amber-600/[0.04] to-transparent",
        tierName: "Wild Card",
        tierBadgeBg: "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black",
      }
    }

    if (ovr >= 78) {
      return {
        border: "border-sky-400/35 hover:border-sky-400/60",
        glow: "shadow-[0_8px_30px_-8px_rgba(56,189,248,0.2)]",
        accent: "text-sky-300",
        ratingBg: "bg-sky-500/15 border-sky-400/40 text-sky-300",
        gradient: "from-sky-500/[0.12] via-blue-600/[0.04] to-transparent",
        tierName: "Elite",
        tierBadgeBg: "bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold",
      }
    }

    if (ovr >= 74) {
      return {
        border: "border-purple-400/35 hover:border-purple-400/60",
        glow: "shadow-[0_8px_30px_-8px_rgba(192,132,252,0.2)]",
        accent: "text-purple-300",
        ratingBg: "bg-purple-500/15 border-purple-400/40 text-purple-300",
        gradient: "from-purple-500/[0.12] via-violet-600/[0.04] to-transparent",
        tierName: "Raro",
        tierBadgeBg: "bg-gradient-to-r from-purple-400 to-violet-600 text-white font-bold",
      }
    }

    if (ovr >= 70) {
      return {
        border: "border-emerald-400/30 hover:border-emerald-400/55",
        glow: "shadow-[0_8px_30px_-8px_rgba(52,211,153,0.18)]",
        accent: "text-emerald-300",
        ratingBg: "bg-emerald-500/15 border-emerald-400/35 text-emerald-300",
        gradient: "from-emerald-500/[0.10] via-emerald-600/[0.03] to-transparent",
        tierName: "Comum",
        tierBadgeBg: "bg-gradient-to-r from-emerald-400 to-teal-600 text-white font-bold",
      }
    }

    return {
      border: "border-zinc-700/50 hover:border-zinc-500/60",
      glow: "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]",
      accent: "text-zinc-300",
      ratingBg: "bg-white/5 border-white/10 text-zinc-300",
      gradient: "from-zinc-700/[0.10] via-zinc-800/[0.03] to-transparent",
      tierName: "Draft",
      tierBadgeBg: "bg-zinc-700 text-zinc-200 font-bold",
    }
  }

  const cardTier = getCardTier()

  const displayName =
    player.metaInformation?.fantasyName || player.shortName || "Atleta"
  const jerseyNum =
    player.jersey || player.metaInformation?.jerseyNumber || undefined

  const hasPhoto = Boolean(player.image?.url) && !imageError

  const games = player.stats?.matchesPlayed || 0
  const goals = player.stats?.goalsScored || 0
  const assists = player.stats?.assists || 0
  const mvps = player.stats?.mvps || 0
  const hasGameStats = games > 0 || goals > 0 || assists > 0 || mvps > 0

  const matchLink = player.metaInformation?.matchLink
  const videoLink = player.metaInformation?.videoLink

  return (
    <article
      className="group relative w-full h-full flex flex-col select-none"
      aria-label={`Card do jogador ${displayName}`}
    >
      <div
        className={cn(
          "liquid-fifa-card rounded-2xl relative flex flex-col h-full overflow-hidden",
          cardTier.border,
          cardTier.glow
        )}
      >
        {/* Ambient Gradient Glow */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none transition-opacity duration-200",
            cardTier.gradient
          )}
        />

        {/* Shimmer Elegante para Wild Card */}
        {isWildcard && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
          </div>
        )}

        {/* HEADER EA FC: Overall (OVR) + Posição + Número + Tier Badge */}
        <div className="relative z-10 px-3.5 pt-3.5 pb-1 flex items-start justify-between">
          {/* Cluster Esquerdo: OVR & Role */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
              {ovr}
            </span>
            <span
              className={cn(
                "mt-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                roleStyle.bg,
                roleStyle.text,
                roleStyle.border
              )}
            >
              {roleAbbr[player.role]}
            </span>
          </div>

          {/* Cluster Direito: Badges & Jersey */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              {jerseyNum && (
                <span className="text-xs font-mono font-black text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                  #{jerseyNum}
                </span>
              )}
              <span
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded uppercase tracking-wider",
                  cardTier.tierBadgeBg
                )}
              >
                {isWildcard && <Sparkles className="w-2.5 h-2.5 inline mr-1" />}
                {cardTier.tierName}
              </span>
            </div>

            {isInjured && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                DM
              </span>
            )}
          </div>
        </div>

        {/* FOTO DO JOGADOR ESTILO CUTOUT FIFA */}
        <div className="relative h-40 sm:h-44 flex items-end justify-center overflow-hidden my-0.5">
          {/* Gradiente de Fusão na Base para Transição Suave com o Nome */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-[#0d0e14]/50 to-transparent z-10 pointer-events-none" />

          {hasPhoto ? (
            <img
              src={getProxyImageUrl(player.image!.url)}
              alt={displayName}
              className="relative z-0 h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              crossOrigin="anonymous"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative z-0 w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-1">
                <User className="w-8 h-8" />
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                {roleMap[player.role]}
              </span>
            </div>
          )}
        </div>

        {/* NOME DO JOGADOR & SUBTITLE METADADOS */}
        <div className="relative z-10 px-3 pb-2 text-center">
          <h3 className="font-black text-white text-base sm:text-lg tracking-tight uppercase truncate leading-tight">
            {displayName}
          </h3>
          <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mt-0.5">
            {age ? `${age} anos` : ""}
            {age && player.height ? " • " : ""}
            {player.height ? `${player.height}cm` : ""}
            {(age || player.height) ? " • " : ""}
            {roleMap[player.role]}
          </p>
        </div>

        {/* GRID DOS 6 ATRIBUTOS OFICIAIS EA FC (FIN, PAS, TEC, DEF, FIS, DUE) */}
        {hasDetailedStats ? (
          <div className="relative z-10 px-3 py-2 border-t border-white/5 bg-white/[0.02]">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {fifaStats.map((st) => {
                const isHigh = st.value >= 80
                const isMid = st.value >= 74
                return (
                  <div
                    key={st.key}
                    className="flex items-center justify-center gap-1 py-1 rounded bg-white/[0.02] border border-white/5"
                  >
                    <span
                      className={cn(
                        "text-xs font-black tabular-nums",
                        isHigh ? "text-emerald-400" : isMid ? "text-sky-400" : "text-zinc-300"
                      )}
                    >
                      {st.value}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      {st.key}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="relative z-10 px-3 py-2.5 border-t border-white/5 bg-amber-500/[0.03] text-center">
            <span className="text-[10px] font-bold text-amber-300 inline-flex items-center gap-1.5 uppercase tracking-wider">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              Atleta Estrela Convidado
            </span>
          </div>
        )}

        {/* MINI STATS DO CAMPEONATO (SOFASCORE STYLE) */}
        {hasGameStats && (
          <div className="relative z-10 px-3 py-1.5 border-t border-white/5 bg-white/[0.01]">
            <div className="grid grid-cols-4 gap-1 text-center">
              <div>
                <p className="text-xs font-black text-white tabular-nums">{games}</p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">JOG</p>
              </div>
              <div>
                <p className={cn("text-xs font-black tabular-nums", goals > 0 ? "text-emerald-400" : "text-zinc-400")}>
                  {goals}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">GOLS</p>
              </div>
              <div>
                <p className={cn("text-xs font-black tabular-nums", assists > 0 ? "text-sky-400" : "text-zinc-400")}>
                  {assists}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">ASS</p>
              </div>
              <div>
                <p className={cn("text-xs font-black tabular-nums", mvps > 0 ? "text-amber-400" : "text-zinc-400")}>
                  {mvps}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">MVP</p>
              </div>
            </div>
          </div>
        )}

        {/* ACCORDION EXPANSÍVEL (BARRAS DETALHADAS & VÍDEOS) */}
        <div className="mt-auto border-t border-white/5">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors btn-press focus-visible:outline-none"
            aria-expanded={showDetails}
          >
            <span className="font-semibold text-[10px] uppercase tracking-wider">
              {showDetails ? "Recolher Atributos" : "Ver Detalhes & Mídia"}
            </span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {showDetails && (
            <div className="px-3 pb-3 pt-2 border-t border-white/5 bg-black/30 space-y-2.5">
              {/* Barras de Atributos */}
              {hasDetailedStats && (
                <div className="space-y-1.5">
                  {fifaStats.map((st) => (
                    <div key={st.key} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-400 font-semibold uppercase">{st.label} ({st.key})</span>
                        <span className="font-black text-white tabular-nums">{st.value}</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-300",
                            st.value >= 80 ? "bg-emerald-400" : st.value >= 74 ? "bg-sky-400" : "bg-zinc-400"
                          )}
                          style={{ width: `${Math.min(100, Math.max(10, st.value))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Links de Mídia Oficiais (Highlights e Jogos) */}
              {(matchLink || videoLink) && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                    Vídeos & Highlights
                  </p>
                  <div className="flex flex-col gap-1">
                    {matchLink && (
                      <a
                        href={matchLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-rose-500" />
                          <span>Partida Completa</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    )}
                    {videoLink && (
                      <a
                        href={videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-rose-500" />
                          <span>Melhores Momentos</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}