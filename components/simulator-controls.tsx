"use client"

import { 
  RotateCcw, 
  Swords, 
  Share2, 
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"

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
  const { t } = useLocale()
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Alternador de Visualização: Jogos vs Playoffs (Mata-mata) */}
      {canShowPlayoffs && (
        <button
          type="button"
          onClick={onTogglePlayoffs}
          className={cn(
            "h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold btn-press inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 active:scale-[0.97] border",
            showPlayoffs
              ? "bg-[var(--team-primary,#F4AF23)] text-black border-[var(--team-primary,#F4AF23)] hover:bg-[#ffc13b] hover:text-black hover:brightness-105 shadow-sm shadow-[var(--team-primary,#F4AF23)]/25 font-black"
              : "bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 hover:border-[var(--team-primary,#F4AF23)]/60 text-zinc-200 hover:text-[var(--team-primary,#F4AF23)] hover:shadow-[0_0_12px_rgba(244,175,35,0.12)]"
          )}
          title={`${t.ui.matchesView} / ${t.ui.bracket}`}
        >
          {showPlayoffs ? (
            <>
              <Calendar className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-black" />
              <span className="hidden sm:inline">{t.ui.matchesView}</span>
              <span className="sm:hidden">{t.ui.matches}</span>
            </>
          ) : (
            <>
              <Swords className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-[var(--team-primary,#F4AF23)]" />
              <span className="hidden sm:inline">{t.ui.bracket}</span>
              <span className="sm:hidden">{t.ui.playoff}</span>
            </>
          )}
        </button>
      )}

      {/* Limpar / Restaurar dados oficiais */}
      <button
        type="button"
        onClick={onReset}
        className={cn(
          "h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium btn-press inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 active:scale-[0.97] border",
          hasModifications
            ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-white"
            : "bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white"
        )}
        title={t.ui.resetTitle}
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
        <span className="hidden sm:inline">{t.ui.reset}</span>
        <span className="sm:hidden">{t.ui.reset}</span>
      </button>

      {/* Compartilhar */}
      <button
        type="button"
        onClick={onShare}
        className="h-8 px-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-medium btn-press inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 active:scale-[0.97]"
        title={t.simulator.copyLinkTitle}
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

