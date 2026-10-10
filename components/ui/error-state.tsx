"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, Home, Bug } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  error?: string
  debugInfo?: string | null
  onRetry?: () => void
  homeHref?: string
}

export function ErrorState({
  title,
  error,
  debugInfo,
  onRetry,
  homeHref = "/",
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const isNotFound = typeof error === "string" && error.toLowerCase().includes("não encontrado")
  const displayTitle = title || (isNotFound ? "Item não encontrado" : "Falha ao carregar dados")
  const displayMessage = error || "Não foi possível carregar as informações necessárias no momento."

  const handleRetry = () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      onRetry()
    } finally {
      setTimeout(() => setIsRetrying(false), 800)
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient Liquid Specular Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(244,175,35,0.06)_0%,rgba(244,63,94,0.03)_50%,transparent_70%)] blur-[120px]" />
      </div>

      {/* Central Liquid Glass Panel */}
      <div className="liquid-glass-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-6 text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 border border-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {isNotFound ? "Consulta Indisponível" : "Instabilidade Temporária"}
        </div>

        {/* Minimal Liquid Icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl liquid-glass flex items-center justify-center border border-white/10 shadow-lg relative group">
          <AlertCircle className="w-6 h-6 text-amber-400 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
        </div>

        {/* Typography */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          {displayTitle}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto mb-6">
          {displayMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-[var(--team-primary,#F4AF23)] to-amber-500 hover:from-amber-400 hover:to-[var(--team-primary,#F4AF23)] text-zinc-950 font-bold shadow-lg shadow-amber-500/10 transition-transform duration-150 btn-press disabled:opacity-70"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")} aria-hidden="true" />
              {isRetrying ? "Recarregando..." : "Tentar novamente"}
            </Button>
          )}

          <Button
            asChild
            variant="glass"
            className="w-full sm:w-auto h-11 px-5 rounded-xl btn-press"
          >
            <Link href={homeHref} className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Início</span>
            </Link>
          </Button>
        </div>

        {/* Minimalist Debug Info Collapsible */}
        {debugInfo && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <details className="group text-left">
              <summary className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors duration-150 select-none">
                <Bug className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Detalhes técnicos</span>
              </summary>
              <div className="mt-2.5 relative">
                <pre className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400 overflow-x-auto scrollbar-minimal max-h-28 text-left leading-normal whitespace-pre-wrap break-all">
                  {debugInfo}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Subtle Brand Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity duration-200">
        <KingsLeagueLogo width={24} height={31} aria-label="Kings League Brasil" />
        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Kings League Simulator</span>
      </div>
    </div>
  )
}