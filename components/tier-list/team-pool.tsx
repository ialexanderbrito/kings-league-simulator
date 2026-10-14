"use client"

import { Team, TierItem } from "@/types/kings-league"
import { useDroppable } from "@dnd-kit/core"
import { TeamDraggable } from "./team-draggable"
import { RotateCcw, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/contexts/locale-context"

interface TeamPoolProps {
  teams: Team[]
  allTiers?: TierItem[]
  selectedTeamId?: string | null
  onSelectTeam?: (teamId: string | null) => void
  onQuickAssign?: (teamId: string, tierId: string) => void
  onRecallAll?: () => void
  totalTeamsCount?: number
}

// Calcula contraste para texto preto ou branco
function getContrastTextColor(hexColor: string): string {
  try {
    const cleanHex = hexColor.replace("#", "")
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split("")
            .map((c) => c + c)
            .join("")
        : cleanHex
    const r = parseInt(fullHex.substring(0, 2), 16) || 0
    const g = parseInt(fullHex.substring(2, 4), 16) || 0
    const b = parseInt(fullHex.substring(4, 6), 16) || 0
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.55 ? "#000000" : "#ffffff"
  } catch {
    return "#000000"
  }
}

export function TeamPool({
  teams,
  allTiers = [],
  selectedTeamId = null,
  onSelectTeam,
  onQuickAssign,
  onRecallAll,
  totalTeamsCount = 10,
}: TeamPoolProps) {
  const { t } = useLocale()
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned",
  })

  const isEmpty = teams.length === 0
  const selectedTeam = teams.find((t) => t.id === selectedTeamId)
  const rankedCount = Math.max(0, totalTeamsCount - teams.length)

  // Quando todos os times estão alocados
  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.ui.tierPlaced}</span>
        </div>

        {onRecallAll && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRecallAll}
            className="text-xs text-zinc-400 hover:text-white h-7 px-2.5 rounded-lg border border-white/5 bg-white/[0.03] btn-press"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            {t.ui.reset}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] shadow-lg transition-all duration-150">
      {/* Header do Banco de Times */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {t.teams.league}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400">
            {teams.length} {t.tier.remaining}
          </span>
        </div>

        {onRecallAll && rankedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRecallAll}
            className="text-xs text-zinc-400 hover:text-white h-7 px-2 rounded-lg border border-white/5 bg-white/[0.02] btn-press"
            title={t.tier.recallTooltip}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">{t.tier.recallAll}</span>
          </Button>
        )}
      </div>

      {/* Barra Rápida de Atribuição (Quick-Link) */}
      {selectedTeam && onQuickAssign && allTiers.length > 0 && (
        <div className="px-3 py-2 bg-white/[0.03] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 text-[11px]">{t.tier.link}</span>
            <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10 text-[11px]">
              {selectedTeam.name}
            </span>
            <span className="text-zinc-400 text-[11px]">{t.tier.to}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {allTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => onQuickAssign(selectedTeam.id, tier.id)}
                className="text-[10px] font-black px-2 py-1 rounded shadow-sm transition-transform hover:scale-105 active:scale-95 uppercase tracking-tight btn-press"
                style={{
                  backgroundColor: tier.color,
                  color: getContrastTextColor(tier.color),
                }}
              >
                {tier.name}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onSelectTeam && onSelectTeam(null)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 ml-1"
              title={t.tier.cancelSelection}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid de Escudos no Banco */}
      <div className="p-3">
        <div
          ref={setNodeRef}
          className={`
            min-h-[84px] p-2 rounded-xl border border-dashed transition-all duration-150
            flex flex-wrap items-center gap-1.5 sm:gap-2
            ${isOver
              ? "border-[var(--team-primary,#F4AF23)] bg-[var(--team-primary,#F4AF23)]/5"
              : "border-white/[0.08] bg-[#060608]"
            }
          `}
        >
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id
            return (
              <TeamDraggable
                key={team.id}
                team={team}
                isSelected={isSelected}
                onClick={() => {
                  if (onSelectTeam) {
                    onSelectTeam(isSelected ? null : team.id)
                  }
                }}
              />
            )
          })}
        </div>

        <div className="mt-2 text-[10px] text-zinc-500 px-1">
          {t.tier.dragInstructions}
        </div>
      </div>
    </div>
  )
}
