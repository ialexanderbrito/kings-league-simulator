"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  RotateCcw,
  Download,
  Share2,
  RefreshCw,
  Loader2,
  LayoutGrid,
  Check,
} from "lucide-react"
import { getPresetLists, PresetTemplate } from "@/lib/tier-list-manager"
import { useLocale } from "@/contexts/locale-context"
import { useMemo } from "react"

interface TierControlsProps {
  onAddTier: () => void
  onApplyPreset?: (preset: PresetTemplate) => void
  onResetPositions?: () => void
  onReset: () => void
  onDownload: () => void
  onShare: () => void
  isDownloading?: boolean
}

export function TierControls({
  onAddTier,
  onApplyPreset,
  onResetPositions,
  onReset,
  onDownload,
  onShare,
  isDownloading = false,
}: TierControlsProps) {
  const { t, locale } = useLocale()
  const presets = useMemo(() => getPresetLists(locale), [locale])

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] p-2.5 sm:p-3 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
      {/* Ações de Edição e Criação */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Adicionar Nova Linha no final */}
        <Button
          type="button"
          onClick={onAddTier}
          size="sm"
          className="h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-white text-xs font-semibold btn-press"
          title={t.tier.addRowBelow}
        >
          <Plus className="w-3.5 h-3.5 mr-1 text-[var(--team-primary,#F4AF23)]" />
          {t.tier.newTier}
        </Button>

        {/* Modelos / Presets prontos */}
        {onApplyPreset && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium btn-press"
                title={t.tier.presetsTitle}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1 text-sky-400" />
                {t.tier.presets}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-72 bg-[#121218] border-white/10 text-white p-3 rounded-xl shadow-2xl z-50 space-y-2"
            >
              <div className="pb-2 border-b border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {t.tier.presetsTitle}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {t.tier.presetsSubtitle}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/15 transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-[var(--team-primary,#F4AF23)] transition-colors">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {preset.description} ({t.tier.tiersCount.replace("{count}", String(preset.tiers.length))})
                    </div>
                    {/* Mini visualização das cores do preset */}
                    <div className="flex gap-1 mt-1.5">
                      {preset.tiers.map((t, idx) => (
                        <div
                          key={idx}
                          className="h-2 flex-1 rounded-sm"
                          style={{ backgroundColor: t.color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Limpar Posições */}
        {onResetPositions && (
          <Button
            type="button"
            onClick={onResetPositions}
            variant="ghost"
            size="sm"
            className="h-8 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 text-zinc-300 hover:text-white text-xs font-medium btn-press"
            title={t.tier.clearPositions}
          >
            <RotateCcw className="w-3 h-3 mr-1 text-amber-400" />
            {t.tier.clearPositions}
          </Button>
        )}

        {/* Resetar Padrão */}
        <Button
          type="button"
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 rounded-xl border border-white/[0.06] hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 text-xs font-medium btn-press"
          title={t.tier.resetDefault}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          <span className="hidden xs:inline">{t.tier.resetDefault}</span>
        </Button>
      </div>

      {/* Ações de Exportação */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          size="sm"
          className="h-8 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white text-xs font-semibold btn-press disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              {t.tier.downloading}
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-1.5 text-emerald-400" />
              {t.tier.downloadImage}
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onShare}
          size="sm"
          className="h-8 px-3.5 rounded-xl bg-[var(--team-primary,#F4AF23)] hover:brightness-110 text-black text-xs font-bold btn-press shadow-sm shadow-[var(--team-primary,#F4AF23)]/20"
        >
          <Share2 className="w-3 h-3 mr-1.5 stroke-[2.5]" />
          {t.tier.share}
        </Button>
      </div>
    </div>
  )
}
