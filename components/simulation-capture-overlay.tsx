"use client"

import { ReactNode } from "react"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationCaptureOverlayProps {
  children: ReactNode
  visible?: boolean
  title?: string
  subtitle?: string
  className?: string
}

/**
 * Overlay que aparece ao fazer captura da simulação
 * Adiciona branding e informações úteis à imagem compartilhada
 */
export function SimulationCaptureOverlay({
  children,
  visible = false,
  title = "Minha Simulação Kings League",
  subtitle = "kings-league-simulator.vercel.app",
  className
}: SimulationCaptureOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Header que aparece apenas na captura */}
      {visible && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-xs text-gray-400">{subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Simulador Oficial</p>
              <p className="text-xs font-semibold text-orange-400">Kings League Brasil</p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className={cn(visible && "pt-20")}>
        {children}
      </div>

      {/* Footer que aparece apenas na captura */}
      {visible && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent px-6 py-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <p className="text-gray-500">
              🔥 Simule você também em <span className="text-orange-400 font-semibold">kings-league-simulator.vercel.app</span>
            </p>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
