"use client"

import { useEffect, useState } from "react"
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
  X,
  Sparkles,
  AlertTriangle,
  Youtube,
  ExternalLink,
  Activity,
  CheckCircle2,
  Calendar,
  Ruler,
  Award,
} from "lucide-react"
import { useLocale } from "@/contexts/locale-context"

interface PlayerModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  teamColor?: string
}

function parseAttr(val: string | undefined | null, fallback = 70): number {
  const parsed = Number.parseInt(val || `${fallback}`, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function PlayerModal({ player, isOpen, onClose, teamColor }: PlayerModalProps) {
  const { t } = useLocale()
  const [imgSrc, setImgSrc] = useState<string>("")

  // Atualiza a URL da foto quando o jogador mudar
  useEffect(() => {
    if (player) {
      setImgSrc(getPlayerPhotoUrl(player.image?.url))
    }
  }, [player])

  // Fecha com a tecla Escape e trava scroll do body
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen || !player) return null

  const ovr = getPlayerOverall(player)
  const isWildcard = isWildcardPlayer(player)
  const isInjured = isInjuredPlayer(player)
  const isSilhouette =
    !player.image?.url ||
    imgSrc.includes("default-player") ||
    imgSrc.includes("425256146")

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
  const displayName =
    player.metaInformation?.fantasyName || player.shortName || t.teamPage.athlete
  const jerseyNum =
    player.jersey || player.metaInformation?.jerseyNumber || undefined

  // Atributos centrais
  const getFifaStats = () => {
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
  const games = player.stats?.matchesPlayed || 0
  const goals = player.stats?.goalsScored || 0
  const assists = player.stats?.assists || 0
  const mvps = player.stats?.mvps || 0
  const matchLink = player.metaInformation?.matchLink
  const videoLink = player.metaInformation?.videoLink

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${t.teamPage.playerProfile} - ${displayName}`}
    >
      {/* Backdrop Glass com Blur Profundo */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteúdo do Modal (Animação Emil: escala de 0.95 e opacidade 0 para 1 em 180ms) */}
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden",
          "bg-[#0d0d13] border border-zinc-800 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)]",
          "animate-in fade-in zoom-in-95 duration-180 ease-out flex flex-col max-h-[90vh]"
        )}
      >
        {/* Ambient Halo no Topo com Cor do Time ou Categoria */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: teamColor || (isWildcard ? "#f59e0b" : "#38bdf8") }}
          aria-hidden="true"
        />

        {/* Top Header Bar do Modal */}
        <div className="relative z-10 px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              {t.teamPage.playerProfile}
            </span>
            {isWildcard && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t.teamPage.tierWildcard}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors btn-press"
            aria-label={t.teamPage.closeModal}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Hero Section: Foto Cutout + Identidade Principal do Atleta */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Cutout Hero com Spotlight e OVR Badge */}
            <div className="relative w-44 sm:w-48 h-56 sm:h-60 shrink-0 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-end justify-center overflow-hidden group">
              {/* Radial Spotlight atrás da foto */}
              <div
                className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* OVR + Role Overlay Badge */}
              <div className="absolute top-2.5 left-2.5 z-20 flex flex-col items-center px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 shadow-md">
                <span className="text-2xl font-black text-white leading-none tabular-nums">
                  {ovr}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded mt-0.5 bg-zinc-900 text-zinc-300 flex items-center gap-1">
                  <span className={cn("w-1 h-1 rounded-full", roleStyle.dot)} />
                  {roleAbbr[player.role]}
                </span>
              </div>

              {/* Jersey Number Badge */}
              {jerseyNum && (
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-xs font-mono font-black text-zinc-300 shadow-md">
                  #{jerseyNum}
                </div>
              )}

              {/* Imagem do Atleta: Enquadramento natural centralizado, 100% contido sem cortes no topo */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <img
                  src={imgSrc || DEFAULT_PLAYER_PHOTO_FALLBACK}
                  alt={displayName}
                  className="h-full w-auto max-w-full object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                  loading="eager"
                  onError={() => {
                    if (imgSrc !== DEFAULT_PLAYER_PHOTO_FALLBACK) {
                      setImgSrc(DEFAULT_PLAYER_PHOTO_FALLBACK)
                    }
                  }}
                />
              </div>

              {/* Vinheta suave na base para transição limpa */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0d0d13] via-[#0d0d13]/60 to-transparent z-20 pointer-events-none" />
            </div>

            {/* Informações Centrais e Biografia */}
            <div className="flex-1 space-y-3.5 text-center sm:text-left min-w-0 w-full">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight">
                    {displayName}
                  </h2>
                  {player.shortName && player.shortName !== displayName && (
                    <span className="text-sm font-semibold text-zinc-400">
                      ({player.shortName})
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-amber-400">{roleMap[player.role]}</span>
                  {player.category ? (
                    <>
                      <span>•</span>
                      <span>{player.category.toUpperCase()}</span>
                    </>
                  ) : null}
                </p>
              </div>

              {/* Grid de Pílulas de Metadados (Idade, Altura, Status) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                    <Calendar className="w-2.5 h-2.5 text-zinc-400" /> {t.teamPage.birthDateLabel}
                  </span>
                  <p className="text-xs font-bold text-white">
                    {age ? `${age} ${t.teamPage.yearsOld}` : t.common.toDefine}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                    <Ruler className="w-2.5 h-2.5 text-zinc-400" /> {t.teamPage.heightLabel}
                  </span>
                  <p className="text-xs font-bold text-white">
                    {player.height ? `${player.height} cm` : "-"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                    <Activity className="w-2.5 h-2.5 text-zinc-400" /> {t.teamPage.playerStatus}
                  </span>
                  <p className="text-xs font-bold flex items-center gap-1 justify-center sm:justify-start">
                    {isInjured ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span className="text-rose-400">{t.teamPage.inRecovery}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{t.teamPage.availablePlayer}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Estatísticas no Campeonato (Sofascore Pill Strip) */}
              <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 text-center sm:text-left">
                  {t.teamPage.statsSummary}
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-base font-black text-white tabular-nums block leading-tight">{games}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{t.teamPage.statMatches}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-base font-black text-emerald-400 tabular-nums block leading-tight">{goals}</span>
                    <span className="text-[9px] font-bold text-emerald-300 uppercase">{t.teamPage.statGoals}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <span className="text-base font-black text-sky-400 tabular-nums block leading-tight">{assists}</span>
                    <span className="text-[9px] font-bold text-sky-300 uppercase">{t.teamPage.statAssists}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-base font-black text-amber-400 tabular-nums block leading-tight">{mvps}</span>
                    <span className="text-[9px] font-bold text-amber-300 uppercase">{t.teamPage.statMvp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Atributos Oficiais EA FC (Barras com bordas limpas) */}
          {fifaStats.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {t.teamPage.officialAttributes}
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Rating: <strong className="text-white">{ovr}</strong> / 100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {fifaStats.map((st) => {
                  const isHigh = st.value >= 80
                  const isMid = st.value >= 74
                  const colorBar = isHigh ? "bg-emerald-400" : isMid ? "bg-sky-400" : "bg-zinc-300"
                  const colorText = isHigh ? "text-emerald-400" : isMid ? "text-sky-300" : "text-zinc-200"

                  return (
                    <div
                      key={st.key}
                      className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-semibold uppercase text-[11px]">
                          {st.label} ({st.key})
                        </span>
                        <span className={cn("font-black tabular-nums text-sm", colorText)}>
                          {st.value}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-300 ease-out", colorBar)}
                          style={{ width: `${Math.min(100, Math.max(10, st.value))}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Links de Mídia & YouTube Oficiais */}
          {(matchLink || videoLink) && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                {t.teamPage.videosAndHighlights}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchLink && (
                  <a
                    href={matchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300 hover:text-white transition-colors btn-press group"
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold">{t.teamPage.fullMatch}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </a>
                )}
                {videoLink && (
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300 hover:text-white transition-colors btn-press group"
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold">{t.teamPage.highlights}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-colors btn-press"
          >
            {t.teamPage.closeModal}
          </button>
        </div>
      </div>
    </div>
  )
}
