"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RotateCcw, Download, Share2, Lightbulb } from "lucide-react"

interface TierControlsProps {
  onAddTier: () => void
  onReset: () => void
  onDownload: () => void
  onShare: () => void
}

export function TierControls({
  onAddTier,
  onReset,
  onDownload,
  onShare,
}: TierControlsProps) {
  return (
    <Card className="bg-[#1a1a1a]/50 border-white/10 mb-6">
      <CardContent className="p-4">
        {/* Botões de ação - Grid para mobile, flex para desktop */}
        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:justify-start"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Adicionar Tier */}
          <Button
            type="button"
            onPointerUp={onAddTier}
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200 w-full sm:w-auto touch-none select-none"
            size="default"
          >
            <Plus className="w-4 h-4 mr-2 pointer-events-none" />
            <span className="pointer-events-none">Tier</span>
          </Button>

          {/* Resetar */}
          <Button
            type="button"
            onPointerUp={onReset}
            variant="ghost"
            className="border border-white/10 hover:bg-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all duration-200 w-full sm:w-auto touch-none select-none"
            size="default"
          >
            <RotateCcw className="w-4 h-4 mr-2 pointer-events-none" />
            <span className="pointer-events-none">Resetar</span>
          </Button>

          {/* Baixar Imagem */}
          <Button
            type="button"
            onPointerUp={onDownload}
            className="bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-600 hover:to-green-700 border border-green-500/30 text-white transition-all duration-200 w-full sm:w-auto touch-none select-none"
            size="default"
          >
            <Download className="w-4 h-4 mr-2 pointer-events-none" />
            <span className="pointer-events-none">Imagem</span>
          </Button>

          {/* Compartilhar */}
          <Button
            type="button"
            onPointerUp={onShare}
            className="bg-gradient-to-r from-[var(--team-primary,#F4AF23)]/80 to-orange-600/80 hover:from-[var(--team-primary,#F4AF23)] hover:to-orange-600 border border-orange-500/30 text-white transition-all duration-200 w-full sm:w-auto touch-none select-none"
            size="default"
          >
            <Share2 className="w-4 h-4 mr-2 pointer-events-none" />
            <span className="pointer-events-none">Compartilhar</span>
          </Button>
        </div>

        {/* Dicas - apenas desktop */}
        <div className="hidden sm:block mt-4 pt-4 border-t border-white/5">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <Lightbulb className="w-4 h-4 text-[var(--team-primary,#F4AF23)] flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Clique no nome para editar</span>
              <span>•</span>
              <span>Clique na cor para customizar</span>
              <span>•</span>
              <span>Arraste os times</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
