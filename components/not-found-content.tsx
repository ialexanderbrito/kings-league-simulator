"use client"

import Link from "next/link"
import { Home, Trophy, Compass } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/contexts/locale-context"

export function NotFoundContent() {
  const { t } = useLocale()
  const copy = t.page.legal

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(244,175,35,0.08)_0%,rgba(244,175,35,0.02)_40%,transparent_70%)] blur-[120px]" />
      </div>
      <div className="liquid-glass-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary)]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary,#F4AF23)]" />{copy.notFoundBadge}
        </div>
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl liquid-glass flex items-center justify-center border border-white/10 shadow-lg">
          <Compass className="w-6 h-6 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">{copy.notFoundTitle}</h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto mb-6">{copy.notFoundDescription}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
          <Button asChild className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[var(--team-primary,#F4AF23)] text-zinc-950 font-bold">
            <Link href="/" className="flex items-center justify-center gap-2"><Home className="w-4 h-4" aria-hidden="true" /><span>{copy.home}</span></Link>
          </Button>
          <Button asChild variant="glass" className="w-full sm:w-auto h-11 px-5 rounded-xl">
            <Link href="/simulator" className="flex items-center justify-center gap-2"><Trophy className="w-4 h-4" aria-hidden="true" /><span>{copy.simulator}</span></Link>
          </Button>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
        <KingsLeagueLogo width={24} height={31} aria-label="Kings League" />
        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Kings League Simulator</span>
      </div>
    </div>
  )
}
