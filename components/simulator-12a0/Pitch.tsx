import React from "react"
import { Formation } from "@/lib/data/7a0-formations"
import { Slot } from "./Slot"
import { Player } from "@/types/kings-league"

interface PitchProps {
  formation: Formation
  selectedPlayers: Record<string, Player | null>
  activeSlotId: string | null
  activePlayerToPlace: Player | null
  onSlotClick: (slotId: string) => void
  onSwapSlots?: (sourceId: string, targetId: string) => void
  showOverall: boolean
  playStyle?: "Defensivo" | "Equilibrado" | "Ofensivo"
}

export function Pitch({
  formation,
  selectedPlayers,
  activeSlotId,
  activePlayerToPlace,
  onSlotClick,
  onSwapSlots,
  showOverall,
  playStyle,
}: PitchProps) {
  return (
    <div className="relative w-full max-w-[420px] aspect-[2/3] mx-auto bg-[#07070b] rounded-3xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)] border border-white/[0.08] ring-1 ring-white/[0.05] select-none">
      {/* Padrão Tático do Gramado (Listras Horizontais Ultra-Subtis Obsidian) */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundSize: "100% 10%",
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.015) 50%, transparent 50%)",
        }}
      />

      {/* Iluminação de Estádio / Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_65%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none z-0" />

      {/* Linhas Demarcatórias da Kings League (7v7) */}
      <div className="absolute inset-6 sm:inset-7 border border-white/[0.14] rounded-2xl pointer-events-none z-0">
        {/* Linha de Meio Campo */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-white/[0.16]" />

        {/* Círculo Central */}
        <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full border border-white/[0.16] transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

        {/* Área Defesa (Inferior) */}
        <div className="absolute bottom-0 left-1/2 w-[140px] h-[75px] border border-b-0 border-white/[0.16] rounded-t-lg transform -translate-x-1/2" />
        {/* Meia-lua Defesa */}
        <div className="absolute bottom-[75px] left-1/2 w-14 h-7 border border-b-0 border-white/[0.16] rounded-t-full transform -translate-x-1/2" />
        <div className="absolute bottom-[40px] left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full transform -translate-x-1/2" />

        {/* Área Ataque (Superior) */}
        <div className="absolute top-0 left-1/2 w-[140px] h-[75px] border border-t-0 border-white/[0.16] rounded-b-lg transform -translate-x-1/2" />
        {/* Meia-lua Ataque */}
        <div className="absolute top-[75px] left-1/2 w-14 h-7 border border-t-0 border-white/[0.16] rounded-b-full transform -translate-x-1/2" />
        <div className="absolute top-[40px] left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full transform -translate-x-1/2" />

        {/* Escanteios */}
        <div className="absolute top-0 left-0 w-4 h-4 border-r border-b border-white/[0.16] rounded-br-full" />
        <div className="absolute top-0 right-0 w-4 h-4 border-l border-b border-white/[0.16] rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-r border-t border-white/[0.16] rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-l border-t border-white/[0.16] rounded-tl-full" />
      </div>

      {/* Slots dos Jogadores */}
      <div className="absolute inset-6 sm:inset-7 z-10">
        {formation.slots.map((slot) => {
          let isHighlighted = false
          if (activePlayerToPlace && !selectedPlayers[slot.id]) {
            if (slot.role === "goalkeeper" && activePlayerToPlace.role === "goalkeeper") isHighlighted = true
            else if (slot.role === "defender" && activePlayerToPlace.role === "defender") isHighlighted = true
            else if (slot.role === "midfielder" && activePlayerToPlace.role === "midfielder") isHighlighted = true
            else if (slot.role === "forward" && activePlayerToPlace.role === "forward") isHighlighted = true
          }

          const adjustedSlot = { ...slot }
          if (adjustedSlot.position !== "GOL" && playStyle) {
            if (playStyle === "Ofensivo") {
              adjustedSlot.y = Math.min(88, adjustedSlot.y + 6)
            } else if (playStyle === "Defensivo") {
              adjustedSlot.y = Math.max(22, adjustedSlot.y - 6)
            }
          }

          return (
            <Slot
              key={slot.id}
              slot={adjustedSlot}
              player={selectedPlayers[slot.id]}
              isSelected={activeSlotId === slot.id}
              isHighlighted={isHighlighted}
              onClick={() => onSlotClick(slot.id)}
              onSwap={onSwapSlots}
              showOverall={showOverall}
            />
          )
        })}
      </div>
    </div>
  )
}
