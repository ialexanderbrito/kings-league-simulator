"use client"

import { useState, useRef, useEffect } from "react"
import { Team, TierItem } from "@/types/kings-league"
import { useDroppable } from "@dnd-kit/core"
import { TeamDraggable } from "./team-draggable"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronUp, ChevronDown } from "lucide-react"

interface TierRowProps {
  tier: TierItem
  teams: Team[]
  onUpdateName: (tierId: string, newName: string) => void
  onUpdateColor: (tierId: string, newColor: string) => void
  onRemove: (tierId: string) => void
  onMoveUp: (tierId: string) => void
  onMoveDown: (tierId: string) => void
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

export function TierRow({
  tier,
  teams,
  onUpdateName,
  onUpdateColor,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
  canMoveUp,
  canMoveDown
}: TierRowProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(tier.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  })

  // Focar input quando começa a editar
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  const handleNameClick = () => {
    setIsEditingName(true)
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
    if (editedName.trim() && editedName !== tier.name) {
      onUpdateName(tier.id, editedName.trim())
    } else {
      setEditedName(tier.name)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur()
    } else if (e.key === 'Escape') {
      setEditedName(tier.name)
      setIsEditingName(false)
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateColor(tier.id, e.target.value)
  }

  return (
    <Card
      ref={setNodeRef}
      className={`overflow-hidden transition-all duration-200 bg-[#1a1a1a]/50 border-white/10 ${isOver ? 'ring-2 ring-[var(--team-primary,#F4AF23)] ring-opacity-50 scale-[1.01] border-[var(--team-primary,#F4AF23)]/30' : 'hover:border-white/20'
        }`}
    >
      {/* Barra de cor da tier */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: tier.color }}
      />

      <div className="p-4">
        {/* Header da Tier */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Color Picker - escondido na captura, substituído pelo div de cor */}
            <div className="relative group shrink-0 flex items-center justify-center">
              <input
                type="color"
                value={tier.color}
                onChange={handleColorChange}
                className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/10 hover:border-white/30 transition-colors bg-transparent absolute inset-0 z-10 opacity-0"
                title="Escolher cor"
              />
              {/* Div de cor visível - funciona bem com html2canvas */}
              <div
                className="w-8 h-8 rounded-lg border-2 border-white/10"
                style={{ backgroundColor: tier.color }}
              />
            </div>

            {/* Nome da Tier */}
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="text-lg sm:text-xl font-bold bg-white/5 text-white px-3 py-1.5 rounded-lg border border-white/20 focus:border-[var(--team-primary,#F4AF23)] outline-none min-w-0 flex-1 transition-colors m-0"
                maxLength={30}
              />
            ) : (
              <h3
                onClick={handleNameClick}
                className="text-lg sm:text-xl font-bold text-white cursor-pointer hover:text-[var(--team-primary,#F4AF23)] transition-colors px-2 py-1 rounded-lg hover:bg-white/5 m-0 flex items-center"
                title="Clique para editar"
                style={{ margin: 0, paddingBlock: 0, lineHeight: '2rem' }}
              >
                {tier.name}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-2 capture-hide">
            {/* Botões de mover */}
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(tier.id)}
                disabled={!canMoveUp}
                className="text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all h-6 w-6 p-0 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(tier.id)}
                disabled={!canMoveDown}
                className="text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all h-6 w-6 p-0 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Contador de times */}
            <span className="text-gray-400 text-xs sm:text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              {teams.length} {teams.length === 1 ? 'time' : 'times'}
            </span>

            {/* Botão remover */}
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(tier.id)}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                title="Remover tier"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Grid de times */}
        <div className="min-h-[100px] flex flex-wrap gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 justify-center sm:justify-start">
          {teams.length === 0 ? (
            <div className="w-full flex items-center justify-center text-gray-500 text-sm py-6">
              <span className="bg-white/5 px-4 py-2 rounded-lg border border-dashed border-white/10">
                Arraste times para cá
              </span>
            </div>
          ) : (
            teams.map((team) => (
              <TeamDraggable key={team.id} team={team} />
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
