"use client"

import { Button } from "@/components/ui/button"
import { 
  RotateCcw, 
  Swords, 
  Share2, 
  Calendar,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulatorControlsProps {
  onReset: () => void
  onSimulateRemaining?: () => void
  showPlayoffs: boolean
  onTogglePlayoffs: () => void
  onDownload?: () => void
  onShare: () => void
  isDownloading?: boolean
  hasModifications?: boolean
  canShowPlayoffs?: boolean
}

export function SimulatorControls({
  onReset,
  showPlayoffs,
  onTogglePlayoffs,
  onShare,
  hasModifications = false,
  canShowPlayoffs = true,
}: SimulatorControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Alternador de Visualização: Jogos vs Playoffs */}
      {canShowPlayoffs && (
        <Button
          type="button"
          onClick={onTogglePlayoffs}
          size="sm"
          className={cn(
            "h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold btn-press transition-[background-color,color,transform] duration-150 active:scale-[0.97]",
            showPlayoffs
              ? "bg-[var(--team-primary,#F4AF23)] text-black hover:brightness-110 shadow-sm shadow-[var(--team-primary,#F4AF23)]/25 font-black"
              : "bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white"
          )}
          title="Alternar entre a Tabela de Jogos e o Chaveamento de Mata-Mata"
        >
          {showPlayoffs ? (
            <>
              <Calendar className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Ver Partidas</span>
              <span className="sm:hidden">Partidas</span>
            </>
          ) : (
            <>
              <Swords className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-[var(--team-primary,#F4AF23)]" />
              <span className="hidden sm:inline">Mata-Mata</span>
              <span className="sm:hidden">Playoffs</span>
            </>
          )}
        </Button>
      )}

      {/* Limpar / Restaurar dados oficiais */}
      <Button
        type="button"
        onClick={onReset}
        size="sm"
        className={cn(
          "h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium btn-press transition-[background-color,color,transform] duration-150 active:scale-[0.97]",
          hasModifications
            ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white"
            : "bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white"
        )}
        title="Restaura os resultados e classificação oficiais"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
        <span className="hidden sm:inline">Restaurar</span>
        <span className="sm:hidden">Reset</span>
      </Button>

      {/* Compartilhar */}
      <Button
        type="button"
        onClick={onShare}
        size="sm"
        className="h-8 px-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-medium btn-press transition-[background-color,color,transform] duration-150 active:scale-[0.97]"
        title="Copiar link da simulação"
      >
        <Share2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
