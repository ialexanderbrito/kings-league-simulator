"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Table, 
  Sparkles, 
  Crown, 
  ChevronRight,
  Layers,
  Play,
  Trophy,
  Dices
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Team } from "@/types/kings-league"
import { MicroSimulator } from "@/components/micro-simulator"
import { getProxyImageUrl } from "@/lib/utils"
import { fetchLeagueData } from "@/lib/fetch-league-data"

// Valor inicial fixo para o contador de simulações
const INITIAL_SIMULATIONS_COUNT = 98547

// 4 Ferramentas essenciais curadas de acesso direto (sem links duplicados)
const ESSENTIAL_TOOLS = [
  {
    title: "Simulador de Rodadas",
    subtitle: "Projete todos os jogos e cruze os Playoffs",
    href: "/simulator",
    icon: Play,
    badge: "Principal",
    accent: "text-amber-400"
  },
  {
    title: "Tabela & Classificação",
    subtitle: "Pontos, vitórias e saldo em tempo real",
    href: "/standings",
    icon: Table,
    badge: "Ao Vivo",
    accent: "text-yellow-400"
  },
  {
    title: "Tier List dos Times",
    subtitle: "Ranqueie os clubes da liga e compartilhe",
    href: "/tier-list",
    icon: Trophy,
    badge: "Comunidade",
    accent: "text-amber-300"
  },
  {
    title: "12a0",
    subtitle: "Campanha, cartas especiais e desafios",
    href: "/12a0",
    icon: Dices,
    badge: "Modo",
    accent: "text-orange-400"
  }
]

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [simulationsCount, setSimulationsCount] = useState(INITIAL_SIMULATIONS_COUNT)
  const [hoveredClub, setHoveredClub] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Incremento suave das simulações a cada 3s
    const interval = setInterval(() => {
      setSimulationsCount(prev => prev + Math.floor(Math.random() * 5) + 2)
    }, 3000)

    // Buscar dados oficiais dos times
    const fetchTeams = async () => {
      try {
        const data = await fetchLeagueData()
        if (data?.teams && Array.isArray(data.teams)) {
          setTeams(data.teams)
        }
      } catch (error) {
        console.error("Erro ao carregar dados da Kings League:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col overflow-x-hidden selection:bg-[var(--team-primary)] selection:text-black">
      <Header
        loading={loading}
        selectedTeam={null}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      {/* Hero Canvas Ultra-Compacto (100% focado em simular e usar as ferramentas) */}
      <div className="relative pt-[76px] pb-6 sm:pt-[84px] sm:pb-8 flex-1 flex flex-col items-center justify-start overflow-hidden">
        
        {/* Iluminação Ambiente Líquida Suave de Fundo */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, var(--team-primary) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 70%)'
            }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10 flex flex-col items-center">
          
          {/* Status Badge Minimalista & Prova Social Acima da Dobra (RCD: Credibilidade Imediata) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full liquid-glass-pill transition-transform duration-150 hover:scale-[1.02]">
              <KingsLeagueLogo width={16} height={20} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
              <span className="text-[11px] font-black tracking-wider uppercase text-white">
                Kings League Brasil
              </span>
              <div className="h-2.5 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                  Temporada Oficial
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-subtle text-[11px] text-gray-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span>+</span>
              <strong className="text-white font-mono font-bold" suppressHydrationWarning>
                {mounted ? simulationsCount.toLocaleString('pt-BR') : INITIAL_SIMULATIONS_COUNT.toLocaleString('pt-BR')}
              </strong>
              <span>simulações</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400 font-semibold">100% Grátis</span>
            </div>
          </div>

          {/* Headline de Alto Impacto (Foco na dor & transformação do torcedor) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center tracking-tight leading-tight mb-2 max-w-2xl">
            <span className="text-white">Descubra o Futuro do seu Time na </span>
            <span className="bg-gradient-to-r from-[var(--team-primary)] via-amber-300 to-[var(--team-primary)] bg-clip-text text-transparent">
              Kings League
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 text-center max-w-lg mb-6 font-normal leading-relaxed">
            Simule os placares de cada rodada, veja a tabela mudar em tempo real e descubra as chances reais de classificação para os <span className="text-white font-medium">Playoffs</span> e a <span className="text-white font-medium">Final Four</span>.
          </p>

          {/* 1. Micro-Simulador Instantâneo */}
          <div className="w-full max-w-md mb-8">
            <MicroSimulator teams={teams} />
          </div>

          {/* 2. Dock de 4 Ferramentas Rápidas Curadas */}
          <div className="w-full max-w-4xl mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Ferramentas Rápidas
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Acesso direto sem enrolação</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ESSENTIAL_TOOLS.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    prefetch={true}
                    className="btn-press group relative liquid-glass-card rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${tool.accent} group-hover:scale-105 transition-transform duration-200 shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400">
                          {tool.badge}
                        </span>
                      </div>

                      <h2 className="text-xs sm:text-sm font-bold text-white mb-1 group-hover:text-[var(--team-primary)] transition-colors line-clamp-1">
                        {tool.title}
                      </h2>
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                        {tool.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center text-[10px] font-bold text-[var(--team-primary)] gap-1 group-hover:gap-1.5 transition-all">
                      <span>Abrir</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 3. Dock Horizontal dos 10 Clubes Oficiais */}
          <div className="w-full max-w-2xl mb-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Os 10 Times
                </span>
              </div>
              <Link 
                href="/teams" 
                prefetch={true}
                className="text-xs font-bold text-[var(--team-primary)] hover:underline inline-flex items-center gap-1"
              >
                <span>Ver elencos</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 p-2 rounded-2xl liquid-glass-subtle justify-items-center">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-11 h-11 rounded-xl bg-white/5 animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 p-2 rounded-2xl liquid-glass border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] justify-items-center">
                {teams.slice(0, 10).map((team) => {
                  const teamColor = team.firstColorHEX || "#F4AF23"
                  const isHovered = hoveredClub === team.id

                  return (
                    <Link
                      key={team.id}
                      href={`/team/${team.id}`}
                      prefetch={true}
                      className="btn-press group relative rounded-xl flex items-center justify-center p-1 transition-all duration-150 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 shrink-0 overflow-hidden"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderColor: isHovered ? `${teamColor}99` : undefined,
                        boxShadow: isHovered ? `0 0 10px -2px ${teamColor}55` : undefined
                      }}
                      title={team.name}
                      onMouseEnter={() => setHoveredClub(team.id)}
                      onMouseLeave={() => setHoveredClub(null)}
                    >
                      {/* Aura líquida sutil no hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${teamColor}33 0%, transparent 80%)`
                        }}
                      />

                      <div className="relative z-10 w-7 h-7 flex items-center justify-center">
                        {team.logo?.url ? (
                          <img
                            src={getProxyImageUrl(team.logo.url)}
                            alt={team.name}
                            width={28}
                            height={28}
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-150 group-hover:scale-110"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border"
                            style={{
                              background: `linear-gradient(135deg, ${teamColor}30, transparent)`,
                              borderColor: `${teamColor}60`
                            }}
                          >
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}
