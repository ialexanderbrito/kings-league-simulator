import Link from "next/link"
import { Home, Trophy, Compass } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Página não encontrada | Kings League Simulador",
  description: "A página que você está procurando não foi encontrada. Retorne para o Kings League Simulador.",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient Liquid Specular Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(244,175,35,0.08)_0%,rgba(244,175,35,0.02)_40%,transparent_70%)] blur-[120px]" />
      </div>

      {/* Central Liquid Glass Panel */}
      <div className="liquid-glass-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary)]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary,#F4AF23)]" />
          Erro 404 • Fora de Campo
        </div>

        {/* Minimal Liquid Icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl liquid-glass flex items-center justify-center border border-white/10 shadow-lg group">
          <Compass className="w-6 h-6 text-[var(--team-primary,#F4AF23)] transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
        </div>

        {/* Typography */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          Página não encontrada
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto mb-6">
          O link acessado não existe, foi alterado ou não está mais disponível.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
          <Button
            asChild
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-[var(--team-primary,#F4AF23)] to-amber-500 hover:from-amber-400 hover:to-[var(--team-primary,#F4AF23)] text-zinc-950 font-bold shadow-lg shadow-amber-500/10 transition-transform duration-150 btn-press"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Página Inicial</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="glass"
            className="w-full sm:w-auto h-11 px-5 rounded-xl btn-press"
          >
            <Link href="/simulator" className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" aria-hidden="true" />
              <span>Simulador</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Subtle Brand Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity duration-200">
        <KingsLeagueLogo width={24} height={31} aria-label="Kings League Brasil" />
        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Kings League Simulator</span>
      </div>
    </div>
  )
}
