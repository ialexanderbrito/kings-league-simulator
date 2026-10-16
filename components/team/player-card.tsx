"use client"

import { useState } from "react"
import type { Player } from "@/types/kings-league"
import {
  calculateAge,
  cn,
  getPlayerOverall,
  getPlayerPhotoUrl,
  isWildcardPlayer,
  isInjuredPlayer,
  DEFAULT_PLAYER_PHOTO_FALLBACK,
} from "@/lib/utils"
import {
  Sparkles,
  Star,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { useLocale } from "@/contexts/locale-context"
import { PlayerModal } from "@/components/team/player-modal"

interface PlayerCardProps {
  player: Player
  teamColor?: string
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

export function PlayerCard({ player, teamColor }: PlayerCardProps) {
  const { t } = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [photoSrc, setPhotoSrc] = useState<string>(() =>
    getPlayerPhotoUrl(player.image?.url)
  )

  const isWildcard = isWildcardPlayer(player)
  const isInjured = isInjuredPlayer(player)
  const isSilhouette =
    !player.image?.url ||
    photoSrc.includes("default-player") ||
    photoSrc.includes("425256146")

  const roleMap: Record<Player["role"], string> = {
    goalkeeper: t.teamPage.roleGK,
    defender: t.teamPage.roleDEF,
    midfielder: t.teamPage.roleMID,
    forward: t.teamPage.roleFWD,
  }

  const roleAbbr: Record<Player["role"], string> = {
    goalkeeper: t.teamPage.roleGkAbbr,
    defender: t.teamPage.roleDefAbbr,
    midfielder: t.teamPage.roleMidAbbr,
    forward: t.teamPage.roleFwdAbbr,
  }

  const roleStyles: Record<Player["role"], { dot: string; text: string }> = {
    goalkeeper: { dot: "bg-amber-400", text: "text-amber-300" },
    defender: { dot: "bg-blue-400", text: "text-blue-300" },
    midfielder: { dot: "bg-emerald-400", text: "text-emerald-300" },
    forward: { dot: "bg-rose-400", text: "text-rose-300" },
  }

  const roleStyle = roleStyles[player.role] || roleStyles.forward
  const age = player.birthDate ? calculateAge(player.birthDate) : null
  const ovr = getPlayerOverall(player)

  // 6 Atributos principais EA FC
  const getFifaStats = (): AttributeItem[] => {
    const meta = player.metaInformation
    if (!meta) return []

    if (player.role === "goalkeeper") {
      return [
        { key: "DIV", label: t.teamPage.attrDiving, value: parseAttr(meta.diving) },
        { key: "HAN", label: t.teamPage.attrHandling, value: parseAttr(meta.handling) },
        { key: "REF", label: t.teamPage.attrReflexes, value: parseAttr(meta.reflexes) },
        { key: "POS", label: t.teamPage.attrAnticipation, value: parseAttr(meta.anticipation) },
        { key: "PAS", label: t.teamPage.attrPassing, value: parseAttr(meta.goalkeeperPassing || meta.passing, 68) },
        { key: "DUE", label: t.teamPage.attrDuels, value: parseAttr(meta.duels, 70) },
      ]
    }

    return [
      { key: "FIN", label: t.teamPage.attrShooting, value: parseAttr(meta.shooting) },
      { key: "PAS", label: t.teamPage.attrPassing, value: parseAttr(meta.passing) },
      { key: "TEC", label: t.teamPage.attrSkills, value: parseAttr(meta.skills) },
      { key: "DEF", label: t.teamPage.attrDefence, value: parseAttr(meta.defence) },
      { key: "FIS", label: t.teamPage.attrPhysical, value: parseAttr(meta.physical) },
      { key: "DUE", label: t.teamPage.attrDuels, value: parseAttr(meta.duels) },
    ]
  }

  const fifaStats = getFifaStats()
  const hasDetailedStats = fifaStats.length > 0

  // Tier e acabamento do Card em harmonia escura com o projeto Kings League
  const getCardTier = () => {
    if (isWildcard) {
      return {
        cardBorder: "border-amber-500/30 hover:border-amber-500/60 shadow-[0_10px_32px_-10px_rgba(245,158,11,0.22)]",
        ratingText: "text-amber-300",
        ambientGlow: "from-amber-500/12 via-amber-600/4 to-transparent",
        spotlight: "rgba(245, 158, 11, 0.16)",
        tierName: t.teamPage.tierWildcard,
        tierBadgeBg: "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold",
      }
    }

    if (ovr >= 78) {
      return {
        cardBorder: "border-sky-500/25 hover:border-sky-500/50 shadow-[0_10px_32px_-10px_rgba(56,189,248,0.2)]",
        ratingText: "text-sky-300",
        ambientGlow: "from-sky-500/12 via-blue-600/4 to-transparent",
        spotlight: "rgba(56, 189, 248, 0.14)",
        tierName: t.teamPage.tierElite,
        tierBadgeBg: "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold",
      }
    }

    if (ovr >= 74) {
      return {
        cardBorder: "border-purple-500/25 hover:border-purple-500/50 shadow-[0_10px_32px_-10px_rgba(192,132,252,0.18)]",
        ratingText: "text-purple-300",
        ambientGlow: "from-purple-500/12 via-violet-600/4 to-transparent",
        spotlight: "rgba(192, 132, 252, 0.12)",
        tierName: t.teamPage.tierRare,
        tierBadgeBg: "bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold",
      }
    }

    if (ovr >= 70) {
      return {
        cardBorder: "border-zinc-800/80 hover:border-zinc-700 shadow-md",
        ratingText: "text-white",
        ambientGlow: "from-emerald-500/8 via-transparent to-transparent",
        spotlight: "rgba(52, 211, 153, 0.10)",
        tierName: t.teamPage.tierCommon,
        tierBadgeBg: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-semibold",
      }
    }

    return {
      cardBorder: "border-zinc-800/80 hover:border-zinc-700 shadow-md",
      ratingText: "text-zinc-300",
      ambientGlow: "from-zinc-700/8 via-transparent to-transparent",
      spotlight: "rgba(255, 255, 255, 0.05)",
      tierName: t.teamPage.tierBasic,
      tierBadgeBg: "bg-zinc-900 text-zinc-400 border border-zinc-800 font-semibold",
    }
  }

  const cardTier = getCardTier()
  const athleteFallback = t.teamPage.athlete
    ? t.teamPage.athlete.charAt(0).toUpperCase() + t.teamPage.athlete.slice(1)
    : "Atleta"
  const displayName =
    player.metaInformation?.fantasyName || player.shortName || athleteFallback
  const jerseyNum =
    player.jersey || player.metaInformation?.jerseyNumber || undefined

  const games = player.stats?.matchesPlayed || 0
  const goals = player.stats?.goalsScored || 0
  const assists = player.stats?.assists || 0
  const mvps = player.stats?.mvps || 0
  const hasGameStats = games > 0 || goals > 0 || assists > 0 || mvps > 0

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        className="group relative w-full h-full flex flex-col select-none cursor-pointer"
        aria-label={`${t.teamPage.playerCardAria.replace("{name}", displayName)}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsModalOpen(true)
          }
        }}
      >
        <div
          className={cn(
            "liquid-fifa-card rounded-2xl relative flex flex-col h-full overflow-hidden transition-[transform,border-color,box-shadow,background-color] duration-180 ease-out",
            cardTier.cardBorder
          )}
        >
          {/* Ambient Spotlight Background Sutil */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100",
              cardTier.ambientGlow
            )}
            aria-hidden="true"
          />

          {/* Holographic Shimmer Diagonale para Wild Card */}
          {isWildcard && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </div>
          )}

          {/* HEADER EA FC: Overall (OVR) + Posição + Número + Tier Badge */}
          <div className="relative z-20 px-3.5 pt-3.5 pb-1 flex items-start justify-between">
            {/* Cluster Esquerdo: OVR & Role */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "text-3xl sm:text-4xl font-black tracking-tighter tabular-nums leading-none drop-shadow-md",
                  cardTier.ratingText
                )}
              >
                {ovr}
              </span>
              <span className="mt-1 px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", roleStyle.dot)} />
                {roleAbbr[player.role]}
              </span>
            </div>

            {/* Cluster Direito: Badges & Jersey */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                {jerseyNum && (
                  <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded">
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
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  {t.teamPage.injuredBadge}
                </span>
              )}
            </div>
          </div>

          {/* FOTO DO JOGADOR ESTILO OFICIAL KINGS LEAGUE:
              Enquadramento natural de retrato (sem zoom artificial e sem cortar a cabeça).
              Exibe a cabeça com folga superior (headroom), ombros e uniforme oficial do time. */}
          <div className="relative h-48 sm:h-52 flex items-center justify-center overflow-hidden my-0">
            {/* Spotlight Volumétrico atrás do atleta */}
            <div
              className="absolute w-40 h-40 rounded-full blur-2xl pointer-events-none -translate-y-4"
              style={{ background: cardTier.spotlight }}
              aria-hidden="true"
            />

            {/* Container da Imagem: Enquadramento natural centralizado, 100% contido sem cortar topo */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src={photoSrc}
                alt={displayName}
                className="h-full w-auto max-w-full object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
                onError={() => {
                  if (photoSrc !== DEFAULT_PLAYER_PHOTO_FALLBACK) {
                    setPhotoSrc(DEFAULT_PLAYER_PHOTO_FALLBACK)
                  }
                }}
              />
            </div>

            {/* Vinheta suave na base para transição sutil com a seção do nome do atleta */}
            <div
              className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/60 to-transparent z-20 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* NOME DO JOGADOR & METADADOS INLINE */}
          <div className="relative z-20 px-3.5 pb-2 text-center -mt-2">
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight uppercase truncate leading-tight group-hover:text-amber-300 transition-colors duration-150">
              {displayName}
            </h3>
            <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mt-0.5">
              {age ? `${age} ${t.teamPage.yearsOld}` : ""}
              {age && player.height ? " • " : ""}
              {player.height ? `${player.height}cm` : ""}
              {(age || player.height) ? " • " : ""}
              {roleMap[player.role]}
            </p>
          </div>

          {/* GRID DOS 6 ATRIBUTOS OFICIAIS EA FC (FIN, PAS, TEC, DEF, FIS, DUE) COM BORDAS DISCRETAS ZINC */}
          {hasDetailedStats ? (
            <div className="relative z-20 px-3 py-2 border-t border-zinc-800 bg-black/40">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-center">
                {/* Coluna 1: 3 Atributos */}
                <div className="space-y-1">
                  {fifaStats.slice(0, 3).map((st) => {
                    const isHigh = st.value >= 80
                    const isMid = st.value >= 74
                    return (
                      <div
                        key={st.key}
                        className="flex items-center justify-between px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800"
                      >
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {st.key}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-black tabular-nums",
                            isHigh
                              ? "text-emerald-400"
                              : isMid
                              ? "text-sky-300"
                              : "text-zinc-200"
                          )}
                        >
                          {st.value}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Coluna 2: 3 Atributos */}
                <div className="space-y-1">
                  {fifaStats.slice(3, 6).map((st) => {
                    const isHigh = st.value >= 80
                    const isMid = st.value >= 74
                    return (
                      <div
                        key={st.key}
                        className="flex items-center justify-between px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800"
                      >
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {st.key}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-black tabular-nums",
                            isHigh
                              ? "text-emerald-400"
                              : isMid
                              ? "text-sky-300"
                              : "text-zinc-200"
                          )}
                        >
                          {st.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-20 px-3 py-2 border-t border-zinc-800 bg-amber-500/[0.03] text-center">
              <span className="text-[10px] font-bold text-amber-300 inline-flex items-center gap-1.5 uppercase tracking-wider">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {t.teamPage.guestStarAthlete}
              </span>
            </div>
          )}

          {/* MINI STATS DO CAMPEONATO (SOFASCORE STYLE) */}
          {hasGameStats && (
            <div className="relative z-20 px-3 py-1.5 border-t border-zinc-800 bg-black/20">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div>
                  <p className="text-xs font-black text-white tabular-nums leading-none">
                    {games}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {t.teamPage.statMatches}
                  </p>
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-black tabular-nums leading-none",
                      goals > 0 ? "text-emerald-400" : "text-zinc-400"
                    )}
                  >
                    {goals}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {t.teamPage.statGoals}
                  </p>
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-black tabular-nums leading-none",
                      assists > 0 ? "text-sky-300" : "text-zinc-400"
                    )}
                  >
                    {assists}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {t.teamPage.statAssists}
                  </p>
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-black tabular-nums leading-none",
                      mvps > 0 ? "text-amber-400" : "text-zinc-400"
                    )}
                  >
                    {mvps}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {t.teamPage.statMvp}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CARD ACTION FOOTER COM BOTÃO ELEGANTE E BORDA SUAVE */}
          <div className="mt-auto border-t border-zinc-800 px-3.5 py-2.5 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors duration-150">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
              {t.teamPage.playerProfile}
            </span>
            <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-colors">
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150 text-zinc-400 group-hover:text-white" />
            </div>
          </div>
        </div>
      </article>

      {/* Modal Interativo de Detalhes do Jogador */}
      <PlayerModal
        player={player}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teamColor={teamColor}
      />
    </>
  )
}