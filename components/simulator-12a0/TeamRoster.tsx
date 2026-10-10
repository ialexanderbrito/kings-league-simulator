import React from "react"
import { Player } from "@/types/kings-league"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPlayerOverall, getProxyImageUrl, cn } from "@/lib/utils"
import { Crown, Sparkles, Check, Ban } from "lucide-react"

interface TeamRosterProps {
  validPlayers: Player[]
  onPlayerSelect: (player: Player) => void
  disabled?: boolean
  activePlayerId?: string
  showOverall?: boolean
  selectedPlayerIds?: string[]
  fullRoles?: string[]
}

export function TeamRoster({
  validPlayers,
  onPlayerSelect,
  disabled,
  activePlayerId,
  showOverall = true,
  selectedPlayerIds = [],
  fullRoles = [],
}: TeamRosterProps) {
  if (validPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-2">
          <Sparkles className="w-5 h-5 text-white/30" />
        </div>
        <p className="text-zinc-400 text-xs font-medium">Nenhum jogador encontrado para este time.</p>
      </div>
    )
  }

  const roleOrder: Record<string, number> = {
    goalkeeper: 1,
    defender: 2,
    midfielder: 3,
    forward: 4,
  }

  const roleLabels: Record<string, { label: string; style: string }> = {
    goalkeeper: { label: "GOL", style: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
    defender: { label: "ZAG", style: "text-blue-300 bg-blue-400/10 border-blue-400/20" },
    midfielder: { label: "MEI", style: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" },
    forward: { label: "ATA", style: "text-rose-300 bg-rose-400/10 border-rose-400/20" },
  }

  // Ordenar por função e depois por overall decrescente
  const sortedPlayers = [...validPlayers].sort((a, b) => {
    const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)
    if (roleDiff !== 0) return roleDiff
    return getPlayerOverall(b) - getPlayerOverall(a)
  })

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <ScrollArea className="h-full pr-1.5 scrollbar-minimal">
        <div className="space-y-1.5 p-1.5">
          {sortedPlayers.map((player) => {
            const playerIdStr = String(player.id)
            const isActive = activePlayerId === playerIdStr
            const isAlreadySelected = selectedPlayerIds.includes(playerIdStr)
            const isRoleFull = fullRoles.includes(player.role) && !isAlreadySelected
            const overall = getPlayerOverall(player)

            const isWildcard =
              player.category === "wildcard" ||
              (player.metaInformation as any)?.category === "president" ||
              (player.metaInformation as any)?.category === "wildcard" ||
              player.metaInformation?.status?.toLowerCase().includes("wildcard") ||
              player.metaInformation?.status?.toLowerCase().includes("jogador 11") ||
              player.metaInformation?.status?.toLowerCase().includes("jogador 12") ||
              player.metaInformation?.status?.toLowerCase().includes("jogador 13")

            const isSuperstar = overall >= 90
            const roleBadge = roleLabels[player.role] || { label: "JOG", style: "text-zinc-300 bg-white/5 border-white/10" }

            const isDisabled = disabled || isAlreadySelected || isRoleFull

            return (
              <button
                key={player.id}
                onClick={() => !isDisabled && onPlayerSelect(player)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 relative overflow-hidden group select-none active:scale-[0.98]",
                  isActive
                    ? "bg-amber-400/15 border-amber-400/60 shadow-[0_0_16px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/40"
                    : isSuperstar && !isDisabled
                    ? "bg-amber-400/[0.06] border-amber-400/25 hover:border-amber-400/50 hover:bg-amber-400/[0.1]"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]",
                  isDisabled && "opacity-40 bg-black/20 cursor-not-allowed hover:bg-black/20 hover:border-white/[0.04]"
                )}
              >
                {/* Indicador de jogador selecionado no card */}
                {isActive && (
                  <div className="absolute left-0 inset-y-0 w-1 bg-amber-400 rounded-r shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Foto do Jogador / Avatar */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10 shadow-sm">
                    {player.image?.url ? (
                      <img
                        src={getProxyImageUrl(player.image.url)}
                        alt={player.shortName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/50">
                        {roleBadge.label}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "font-bold text-xs truncate leading-snug",
                        isActive ? "text-amber-300" : isSuperstar ? "text-amber-100" : "text-zinc-100"
                      )}>
                        {player.shortName}
                      </span>
                      {isWildcard && (
                        <span title="Wild Card / Estrela" className="inline-flex text-amber-400">
                          <Crown className="w-3 h-3 fill-amber-400" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded border", roleBadge.style)}>
                        {roleBadge.label}
                      </span>
                      {isAlreadySelected && (
                        <span className="text-[9px] font-medium text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Escalado
                        </span>
                      )}
                      {isRoleFull && !isAlreadySelected && (
                        <span className="text-[9px] font-medium text-zinc-500 flex items-center gap-0.5">
                          <Ban className="w-2.5 h-2.5" /> Posição cheia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Rating Badge */}
                <div className="shrink-0 pl-2">
                  {showOverall ? (
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-full font-black text-xs min-w-[28px] text-center border shadow-sm",
                        isSuperstar
                          ? "bg-amber-400 text-black border-amber-300 shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                          : overall >= 80
                          ? "bg-zinc-800 text-white border-white/15"
                          : "bg-zinc-900 text-zinc-400 border-white/5"
                      )}
                    >
                      {overall}
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-full font-bold text-xs bg-zinc-800/80 text-zinc-500 border border-white/5">
                      ?
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
