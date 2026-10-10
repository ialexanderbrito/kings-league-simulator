"use client"

import { Team, TierItem } from "@/types/kings-league"
import { useDroppable } from "@dnd-kit/core"
import { TeamDraggable } from "./team-draggable"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ChevronUp,
  ChevronDown,
  Settings,
  Trash2,
  Check,
  PlusCircle,
  RotateCcw,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react"

interface TierRowProps {
  tier: TierItem
  teams: Team[]
  onUpdateName: (tierId: string, newName: string) => void
  onUpdateColor: (tierId: string, newColor: string) => void
  onRemove: (tierId: string) => void
  onAddAbove: (tierId: string) => void
  onAddBelow: (tierId: string) => void
  onClearTier?: (tierId: string) => void
  onMoveUp: (tierId: string) => void
  onMoveDown: (tierId: string) => void
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  selectedPoolTeamId?: string | null
  onQuickAssign?: (tierId: string) => void
  onRemoveTeam?: (teamId: string) => void
}

// Cores sólidas clássicas do TierMaker + Kings League
const PRESET_TIER_COLORS = [
  "#FF7F7F", // S Vermelho Claro
  "#FFBF7F", // A Laranja
  "#FFDF7F", // B Amarelo
  "#FFFF7F", // C Limão
  "#BFFF7F", // D Verde Claro
  "#7FFFFF", // E Ciano
  "#7FBFFF", // F Azul
  "#FFD700", // Ouro Kings League
  "#C0C0C0", // Prata
  "#CD7F32", // Bronze
  "#10B981", // Esmeralda
  "#EF4444", // Vermelho Intenso
  "#8B5CF6", // Roxo
  "#3B82F6", // Azul Real
  "#374151", // Grafite
]

// Calcula contraste para garantir legibilidade perfeita do nome (preto ou branco)
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

export function TierRow({
  tier,
  teams,
  onUpdateName,
  onUpdateColor,
  onRemove,
  onAddAbove,
  onAddBelow,
  onClearTier,
  onMoveUp,
  onMoveDown,
  canRemove,
  canMoveUp,
  canMoveDown,
  selectedPoolTeamId,
  onQuickAssign,
  onRemoveTeam,
}: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  })

  const textColor = getContrastTextColor(tier.color)

  const handleRowClick = () => {
    if (selectedPoolTeamId && onQuickAssign) {
      onQuickAssign(tier.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleRowClick}
      className={`
        group relative flex items-stretch border-b border-white/[0.08] last:border-b-0
        transition-all duration-150
        ${isOver
          ? "bg-[var(--team-primary,#F4AF23)]/5 ring-1 ring-[var(--team-primary,#F4AF23)]/40"
          : selectedPoolTeamId
          ? "cursor-pointer hover:bg-white/[0.02]"
          : "bg-[#09090d]"
        }
      `}
    >
      {/* Rótulo Clássico TierMaker (Sólido, sem scrollbars, com largura generosa) */}
      <div
        className="relative flex items-center justify-center w-28 xs:w-32 sm:w-44 md:w-48 min-h-[64px] sm:min-h-[84px] p-1.5 sm:p-2.5 text-center shrink-0 select-none overflow-hidden"
        style={{ backgroundColor: tier.color }}
      >
        <textarea
          value={tier.name}
          onChange={(e) => onUpdateName(tier.id, e.target.value)}
          rows={2}
          maxLength={30}
          title="Clique para editar o nome diretamente"
          placeholder="Nome"
          style={{ color: textColor, wordBreak: 'keep-all', overflowWrap: 'normal' }}
          className={`tier-label-input w-full bg-transparent text-center font-black uppercase tracking-tight resize-none overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-none outline-none focus:ring-0 select-text leading-tight cursor-text placeholder:opacity-40 break-keep hyphens-none ${
            tier.name.length > 15 ? 'text-[11px] sm:text-xs leading-snug' : 'text-xs sm:text-sm leading-tight'
          }`}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Texto estático ultra-nítido exclusivo para a imagem exportada */}
        <div
          className={`capture-text-display hidden font-black uppercase tracking-tight text-center leading-tight break-keep hyphens-none px-1 select-none ${
            tier.name.length > 15 ? 'text-[11px] sm:text-xs leading-snug' : 'text-xs sm:text-sm leading-tight'
          }`}
          style={{ color: textColor, wordBreak: 'keep-all', overflowWrap: 'normal' }}
        >
          {tier.name}
        </div>
      </div>

      {/* Área dos Times da Linha */}
      <div className="flex-1 flex flex-wrap items-center content-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 min-h-[72px] sm:min-h-[84px] bg-[#0c0c11]">
        {teams.length === 0 ? (
          <div className="w-full flex items-center justify-center py-2 text-zinc-600 text-xs font-medium capture-hide">
            {selectedPoolTeamId ? (
              <span className="text-[var(--team-primary,#F4AF23)] font-semibold text-[11px] animate-pulse flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                Toque aqui para posicionar
              </span>
            ) : (
              <span className="opacity-40 text-[11px]">Arraste times aqui</span>
            )}
          </div>
        ) : (
          teams.map((team) => (
            <TeamDraggable
              key={team.id}
              team={team}
              onRemove={onRemoveTeam ? () => onRemoveTeam(team.id) : undefined}
            />
          ))
        )}
      </div>

      {/* Controles da Linha: Configurar + Mover + Excluir Direto */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="capture-hide flex flex-col justify-center items-center gap-1 p-1 sm:p-1.5 bg-[#08080b] border-l border-white/[0.06] shrink-0"
      >
        {/* Popover de Configuração Completa de Linha */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md btn-press"
              title="Opções da linha (cor, adicionar acima/abaixo, limpar)"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="left"
            className="w-64 bg-[#121218] border-white/10 text-white p-3 rounded-xl shadow-2xl z-50 space-y-3"
          >
            {/* Escolha de Cor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Cor da Linha
                </span>
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={tier.color}
                    onChange={(e) => onUpdateColor(tier.id, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-5 h-5"
                    title="Cor personalizada"
                  />
                  <div
                    className="w-5 h-5 rounded border border-white/20"
                    style={{ backgroundColor: tier.color }}
                  />
                </label>
              </div>

              {/* Grade de Cores Clássicas */}
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_TIER_COLORS.map((hex) => {
                  const isSelected = tier.color.toLowerCase() === hex.toLowerCase()
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdateColor(tier.id, hex)}
                      className={`h-7 rounded-md border flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? "border-white ring-1 ring-white" : "border-white/10"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {isSelected && (
                        <Check
                          className="w-3.5 h-3.5"
                          style={{ color: getContrastTextColor(hex) }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Ações de Estrutura da Linha (Adicionar opções que o usuário pediu) */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAddAbove(tier.id)}
                className="w-full justify-start h-7 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded px-2"
              >
                <ArrowUpToLine className="w-3.5 h-3.5 mr-2 text-[var(--team-primary,#F4AF23)]" />
                Adicionar linha acima
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAddBelow(tier.id)}
                className="w-full justify-start h-7 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded px-2"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 mr-2 text-[var(--team-primary,#F4AF23)]" />
                Adicionar linha abaixo
              </Button>

              {onClearTier && teams.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearTier(tier.id)}
                  className="w-full justify-start h-7 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Esvaziar times desta linha
                </Button>
              )}

              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(tier.id)}
                  className="w-full justify-start h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded px-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Excluir esta linha
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Mover para cima */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveUp(tier.id)}
          disabled={!canMoveUp}
          className="h-6 w-6 p-0 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-20 btn-press"
          title="Mover para cima"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </Button>

        {/* Mover para baixo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMoveDown(tier.id)}
          disabled={!canMoveDown}
          className="h-6 w-6 p-0 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-20 btn-press"
          title="Mover para baixo"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>

        {/* Botão DIRETO e VISÍVEL de Exclusão da Linha (conforme solicitado pelo usuário) */}
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(tier.id)}
            className="h-6 w-6 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15 rounded-md btn-press transition-colors"
            title="Excluir esta categoria (times voltam para o banco)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
