"use client"

import { Team } from "@/types/kings-league"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { X } from "lucide-react"
import { getProxyImageUrl } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"

interface TeamDraggableProps {
  team: Team
  isDragging?: boolean
  isSelected?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export function TeamDraggable({
  team,
  isDragging = false,
  isSelected = false,
  onClick,
  onRemove,
}: TeamDraggableProps) {
  const { t } = useLocale()
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: team.id,
  })

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    touchAction: 'none' as const,
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.remove-team-btn')) {
      return
    }
    if (onClick) {
      onClick()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        group relative flex flex-col items-center justify-between p-1.5
        w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]
        rounded-xl cursor-grab active:cursor-grabbing select-none
        border transition-all duration-150 btn-press
        bg-[#111116] hover:bg-[#161620]
        ${isDragging ? 'opacity-40 scale-95 shadow-2xl z-50' : 'shadow-sm'}
        ${isSelected
          ? 'border-[var(--team-primary,#F4AF23)] ring-2 ring-[var(--team-primary,#F4AF23)] shadow-[0_0_15px_rgba(244,175,35,0.35)] scale-105 z-20 bg-[#1a1a24]'
          : 'border-white/[0.08] hover:border-white/25 hover:scale-[1.03]'
        }
      `}
      title={team.name}
    >
      {/* Botão de remoção rápida (aparece em hover nos times já colocados) */}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          title={t.tier.removeTeam}
          className="remove-team-btn capture-hide absolute -top-1.5 -right-1.5 z-30 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
        </button>
      )}

      {/* Escudo do time em tamanho grande e de alto impacto */}
      <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
        {team.logo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getProxyImageUrl(team.logo.url)}
            alt={team.name}
            crossOrigin="anonymous"
            draggable={false}
            className="w-full h-full object-contain filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)] pointer-events-none transition-transform duration-150 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs font-black text-white">{team.shortName}</span>
        )}
      </div>

      {/* Sigla oficial de 3 letras do time (ex: FUR, CAP, G3X, FLX) */}
      <div className="w-full text-center px-0.5 mt-0.5">
        <span className="block text-[10px] font-black text-zinc-300 leading-none uppercase whitespace-nowrap overflow-visible select-none">
          {team.shortName || team.name.slice(0, 3)}
        </span>
      </div>
    </div>
  )
}
