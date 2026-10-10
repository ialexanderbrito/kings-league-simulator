"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col">
      <Header loading={true} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[var(--team-primary,#F4AF23)] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <KingsLeagueLogo width={18} height={22} className="drop-shadow-[0_0_8px_rgba(244,175,35,0.5)]" />
          </div>
        </div>
        <p className="text-xs text-zinc-500 font-medium animate-pulse">Carregando...</p>
      </div>
      <Footer />
    </main>
  )
}
