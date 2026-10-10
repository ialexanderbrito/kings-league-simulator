"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TeamLoading } from "@/components/team/team-loading"

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#060608] text-white selection:bg-[var(--team-primary)] selection:text-black relative overflow-x-hidden">
      {/* Iluminação Ambiente Suave */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[140px] opacity-15"
          style={{
            background: "radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 60%, transparent 80%)",
          }}
        />
      </div>

      <Header loading={true} />

      <div className="container mx-auto px-4 py-3 sm:py-5 max-w-7xl relative z-10">
        <TeamLoading />
      </div>

      <Footer />
    </main>
  )
}
