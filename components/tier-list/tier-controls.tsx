"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RotateCcw, Download, Share2, Lightbulb } from "lucide-react"

interface TierControlsProps {
  onAddTier: () => void
  onReset: () => void
  onDownload: () => void
  onShare: () => void
  canShare: boolean
}

export function TierControls({
  onAddTier,
  onReset,
  onDownload,
  onShare,
  canShare
}: TierControlsProps) {
  return (
    <Card className="bg-[#1a1a1a]/50 border-white/10 mb-6">
      <CardContent className="p-4 sm:p-6">
        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
          {/* Adicionar Tier */}
          <Button
            onClick={onAddTier}
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200"
            size="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Adicionar</span> Tier
          </Button>

          {/* Resetar */}
          <Button
            onClick={onReset}
            variant="ghost"
            className="border border-white/10 hover:bg-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all duration-200"
            size="default"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>

          <div className="hidden sm:block w-px h-8 bg-white/10 self-center" />

          {/* Baixar Imagem */}
          <Button
            onClick={onDownload}
            className="bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-600 hover:to-green-700 border border-green-500/30 text-white transition-all duration-200"
            size="default"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Baixar</span> Imagem
          </Button>

          {/* Compartilhar */}
          {canShare && (
            <Button
              onClick={onShare}
              className="bg-gradient-to-r from-[var(--team-primary,#F4AF23)]/80 to-orange-600/80 hover:from-[var(--team-primary,#F4AF23)] hover:to-orange-600 border border-orange-500/30 text-white transition-all duration-200"
              size="default"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          )}
        </div>

        {/* Dicas */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <Lightbulb className="w-4 h-4 text-[var(--team-primary,#F4AF23)] flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Clique no nome para editar</span>
              <span className="hidden sm:inline">•</span>
              <span>Clique na cor para customizar</span>
              <span className="hidden sm:inline">•</span>
              <span>Arraste os times</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
