import React from "react"
import { cn, getPlayerOverall, getProxyImageUrl } from "@/lib/utils"
import { FormationSlot } from "@/lib/data/7a0-formations"
import { Player } from "@/types/kings-league"

interface SlotProps {
  slot: FormationSlot
  player?: Player | null
  isSelected?: boolean
  isHighlighted?: boolean
  onClick?: () => void
  onSwap?: (sourceId: string, targetId: string) => void
  showOverall?: boolean
}

export function Slot({
  slot,
  player,
  isSelected,
  isHighlighted,
  onClick,
  onSwap,
  showOverall = true,
}: SlotProps) {
  const overall = player ? getPlayerOverall(player) : null
  const isSuperstar = overall !== null && overall >= 90
  const isSolid = overall !== null && overall >= 80

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-200 ease-out transform -translate-x-1/2 -translate-y-1/2 active:scale-[0.97]",
        isSelected ? "scale-110 z-30" : "hover:scale-105 z-10"
      )}
      style={{
        left: `${slot.x}%`,
        top: `${100 - slot.y}%`,
      }}
      onClick={onClick}
      draggable={!!player}
      onDragStart={(e) => {
        if (player) {
          e.dataTransfer.setData("slotId", slot.id)
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        const sourceId = e.dataTransfer.getData("slotId")
        if (sourceId && onSwap) {
          onSwap(sourceId, slot.id)
        }
      }}
    >
      {/* Círculo do slot com Liquid Glass */}
      <div
        className={cn(
          "w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center relative transition-all duration-200",
          player
            ? isSuperstar
              ? "border-2 border-amber-400 bg-zinc-900/90 shadow-[0_0_20px_rgba(251,191,36,0.45)] ring-1 ring-amber-300/40"
              : isSolid
              ? "border border-white/60 bg-zinc-900/90 shadow-[0_8px_24px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
              : "border border-white/30 bg-zinc-900/90 shadow-md ring-1 ring-white/5"
            : "border border-dashed border-white/25 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
          isSelected && "border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.6)]",
          isHighlighted && !player && "border-amber-400 border-solid animate-pulse ring-4 ring-amber-400/40 bg-amber-400/20 shadow-[0_0_25px_rgba(251,191,36,0.5)] cursor-pointer",
          !isHighlighted && !player && !isSelected && "opacity-60 hover:opacity-90"
        )}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {player ? (
            <>
              {player.image?.url ? (
                <img
                  src={getProxyImageUrl(player.image.url)}
                  alt={player.shortName}
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-[10px] text-white/60 font-black tracking-wider">{slot.position}</span>
                </div>
              )}
              {/* Subtle glass bottom vignette */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/20">
              <span className="text-white/70 font-black text-[11px] md:text-xs tracking-wider">
                {slot.position}
              </span>
            </div>
          )}
        </div>

        {/* Overall Badge Bottom Center */}
        {player && showOverall && overall !== null && (
          <div
            className={cn(
              "absolute -bottom-1.5 right-1/2 translate-x-1/2 text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-md leading-none tracking-tight border",
              isSuperstar
                ? "bg-amber-400 text-black border-amber-300 shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
                : isSolid
                ? "bg-zinc-900/95 text-white border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.7)] backdrop-blur-md"
                : "bg-zinc-900/90 text-zinc-300 border-white/10"
            )}
          >
            {overall}
          </div>
        )}
      </div>

      {/* Nome do Jogador com Liquid Glass Pill (apenas quando escalado) */}
      {player && (
        <div className="mt-1 flex items-center flex-col pointer-events-none">
          <span className="bg-zinc-950/90 backdrop-blur-md text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full truncate max-w-[88px] md:max-w-[102px] border border-white/10 shadow-lg text-center">
            {player.shortName}
          </span>
        </div>
      )}
    </div>
  )
}
