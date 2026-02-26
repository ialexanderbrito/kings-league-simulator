"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Trophy, ArrowRight, Users, Table, ChevronRight, PieChart, GitMerge, Zap, TrendingUp, Star, Sparkles, CheckCircle2, Play, Crown, Target, Activity, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Team, TeamStanding } from "@/types/kings-league"
import { TypingAnimation } from "@/components/text-type"
import CurvedLoop from "@/components/curved-loop"
import CountUp from "@/components/count-up"

// Posições determinísticas para partículas flutuantes (evita hydration mismatch)
const PARTICLE_POSITIONS = [
  { left: '5%', top: '12%', delay: '0s', duration: '7s' },
  { left: '15%', top: '45%', delay: '1.2s', duration: '9s' },
  { left: '25%', top: '78%', delay: '2.1s', duration: '6s' },
  { left: '35%', top: '23%', delay: '0.8s', duration: '11s' },
  { left: '45%', top: '56%', delay: '3.5s', duration: '8s' },
  { left: '55%', top: '89%', delay: '1.7s', duration: '10s' },
  { left: '65%', top: '34%', delay: '4.2s', duration: '7s' },
  { left: '75%', top: '67%', delay: '2.9s', duration: '12s' },
  { left: '85%', top: '8%', delay: '0.3s', duration: '9s' },
  { left: '95%', top: '41%', delay: '3.8s', duration: '6s' },
  { left: '10%', top: '73%', delay: '1.5s', duration: '11s' },
  { left: '20%', top: '18%', delay: '4.7s', duration: '8s' },
  { left: '30%', top: '52%', delay: '2.4s', duration: '13s' },
  { left: '40%', top: '85%', delay: '0.6s', duration: '7s' },
  { left: '50%', top: '29%', delay: '3.1s', duration: '10s' },
  { left: '60%', top: '62%', delay: '1.9s', duration: '9s' },
  { left: '70%', top: '95%', delay: '4.4s', duration: '6s' },
  { left: '80%', top: '38%', delay: '2.6s', duration: '12s' },
  { left: '90%', top: '71%', delay: '0.9s', duration: '8s' },
  { left: '3%', top: '47%', delay: '3.3s', duration: '11s' },
]

// Valor inicial fixo para o contador de simulações
const INITIAL_SIMULATIONS_COUNT = 98547

export default function HomePage() {
  const [animateHero, setAnimateHero] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsRecord, setTeamsRecord] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [simulationsCount, setSimulationsCount] = useState(INITIAL_SIMULATIONS_COUNT)
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    hero: false,
    features: false,
    stats: false,
    teams: false,
    cta: false,
  })

  // Refs para cada seção para animações de scroll
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const teamsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Função para verificar se um elemento está visível na tela
  const isElementInView = (el: HTMLElement | null, offset = 100) => {
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return (
      rect.top + offset <= window.innerHeight &&
      rect.bottom >= 0
    )
  }

  // Efeito para incrementar as simulações a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationsCount(prev => prev + Math.floor(Math.random() * 15) + 5)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Efeito para animações baseadas em scroll com comportamento aprimorado
  useEffect(() => {
    const handleScroll = () => {
      setVisibleSections({
        hero: isElementInView(heroRef.current, 0),
        features: isElementInView(featuresRef.current),
        stats: isElementInView(statsRef.current),
        teams: isElementInView(teamsRef.current),
        cta: isElementInView(ctaRef.current),
      })
    }

    // Verifica inicialmente e adiciona o listener de scroll
    handleScroll()
    window.addEventListener('scroll', handleScroll)

    // Forçar recálculo após um breve atraso para garantir que as animações funcionem
    const timer = setTimeout(() => {
      handleScroll()
    }, 300)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Ativa a animação após o carregamento da página
    setAnimateHero(true)

    // Buscar dados dos times
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/league-data')
        if (response.ok) {
          const data = await response.json()

          if (data.teams && Array.isArray(data.teams)) {
            // Salvar o array de times
            setTeams(data.teams)

            // Converter array de times para objeto Record
            const teamsObj: Record<string, Team> = {}
            data.teams.forEach((team: Team) => {
              teamsObj[team.id] = team
            })
            setTeamsRecord(teamsObj)

            // Definir standings se disponíveis
            if (data.standings && Array.isArray(data.standings)) {
              setStandings(data.standings)
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar times:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  return (
    <main className="min-h-screen bg-[#030303] overflow-x-hidden">
      <Header
        loading={loading}
        selectedTeam={null}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      {/* Hero Section - Redesenhado 2026 */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center pt-16 pb-8 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background Effects - Mais dinâmicos */}
        <div className="absolute inset-0">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--team-primary)]/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[var(--team-primary)]/5 via-transparent to-transparent" />

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--team-primary)]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--team-primary)]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--team-primary)]/3 rounded-full blur-[150px]" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          {/* Floating particles - posições fixas para evitar hydration mismatch */}
          <div className="absolute inset-0 overflow-hidden">
            {PARTICLE_POSITIONS.map((particle, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[var(--team-primary)]/30 rounded-full animate-float"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Badge da temporada - Novo design */}
            <div className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 bg-gradient-to-r from-[#1a1a1a]/80 to-[#1a1a1a]/60 backdrop-blur-xl border border-[var(--team-primary)]/30 rounded-full shadow-lg shadow-[var(--team-primary)]/10">
              <div className="relative">
                <KingsLeagueLogo width={28} height={38} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-[var(--team-primary)]/50 to-transparent" />
              <div className="text-left">
                <p className="text-sm font-bold text-white tracking-wide">Kings League Brasil</p>
                <p className="text-xs text-[var(--team-primary)] font-medium">Temporada 2026</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-[var(--team-primary)]/10 rounded-full">
                <Flame className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                <span className="text-xs font-bold text-[var(--team-primary)]">NOVA</span>
              </div>
            </div>

            {/* Main Headline - Mais impactante */}
            <h1 id="hero-heading" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight">
              <span className="block text-white/90 mb-2">
                Simule o
              </span>
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--team-primary)] via-[var(--team-primary)] to-yellow-400 bg-clip-text text-transparent">
                  Futuro
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-[var(--team-primary)]/20 to-yellow-400/20 blur-2xl" />
              </span>
              <br />
              <TypingAnimation
                words={["Do Seu Time", "Da Temporada", "Do Campeão"]}
                typeSpeed={80}
                deleteSpeed={40}
                pauseDelay={2500}
                loop={true}
                startOnView={false}
                className="text-[var(--team-primary)] drop-shadow-[0_0_40px_var(--team-primary)]"
                showCursor={true}
                blinkCursor={true}
                cursorStyle="line"
              />
            </h1>

            {/* Subtitle - Mais clean */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              A temporada 2026 está chegando. Simule partidas, analise estatísticas
              e descubra quem será o <span className="text-white font-medium">próximo campeão</span>.
            </p>

            {/* CTA Buttons - Redesenhados */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="group w-full sm:w-auto relative bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold text-base px-8 h-14 rounded-2xl shadow-2xl shadow-[var(--team-primary)]/30 hover:shadow-[var(--team-primary)]/50 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                <Link href="/simulator" className="flex items-center gap-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Play className="w-5 h-5 fill-current" />
                  <span>Começar Simulação</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-gray-700/50 bg-white/5 backdrop-blur-sm hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/10 text-white h-14 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <Link href="/standings" className="flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  Ver Classificação
                </Link>
              </Button>
            </div>

            {/* Stats rápidas com animação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto mb-10">
              <div className="group flex flex-col items-center p-4 md:p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[var(--team-primary)]" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">10</p>
                <p className="text-xs text-gray-500 font-medium">Times</p>
              </div>
              <div className="group flex flex-col items-center p-4 md:p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-[var(--team-primary)]" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">Live</p>
                <p className="text-xs text-gray-500 font-medium">Dados</p>
              </div>
              <div className="group flex flex-col items-center p-4 md:p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-[var(--team-primary)]" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">100%</p>
                <p className="text-xs text-gray-500 font-medium">Preciso</p>
              </div>
              <div className="group flex flex-col items-center p-4 md:p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-[var(--team-primary)]" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">Free</p>
                <p className="text-xs text-gray-500 font-medium">Gratuito</p>
              </div>
            </div>

            {/* Social Proof - Redesenhado */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <div className="relative flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </div>
                <span className="font-bold text-white">+</span>
                <CountUp
                  to={simulationsCount}
                  duration={1.5}
                  separator="."
                  className="font-bold text-white"
                />
                <span>simulações</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <Crown className="w-4 h-4 text-[var(--team-primary)]" />
                <span>Feito por Fãs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 1 */}
      <div className="relative overflow-hidden bg-[#030303]">
        <CurvedLoop
          marqueeText="KINGS LEAGUE 2026 ✦ NOVA TEMPORADA ✦ SIMULADOR OFICIAL ✦ "
          speed={1.2}
          curveAmount={0}
          direction="right"
          className="fill-var(--team-primary)]"
          interactive={false}
        />
      </div>

      {/* Seção Recursos - Redesenhada 2026 */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-[#030303] relative" id="recursos">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--team-primary)]/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--team-primary)]/3 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${visibleSections.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[var(--team-primary)]" />
              <span className="text-sm font-semibold text-[var(--team-primary)] uppercase tracking-wider">Funcionalidades</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">Tudo para</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--team-primary)] to-yellow-400 bg-clip-text text-transparent">
                dominar a temporada
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Ferramentas completas para você viver cada momento da Kings League 2026
            </p>
          </div>

          {/* Features Grid - Bento style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">

            {/* Feature Principal - Simulador */}
            <Card className={`group md:col-span-2 lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-500 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--team-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--team-primary)]/10 rounded-full mb-4">
                      <Flame className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                      <span className="text-xs font-bold text-[var(--team-primary)] uppercase">Destaque</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white group-hover:text-[var(--team-primary)] transition-colors">
                      Simulador Inteligente
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      Simule todas as partidas com nosso algoritmo avançado baseado em estatísticas reais.
                      Preveja resultados, analise cenários e descubra quem será o campeão.
                    </p>
                    <Button asChild className="bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold rounded-xl">
                      <Link href="/simulator" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Simular Agora
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 border border-[var(--team-primary)]/20">
                    <Zap className="w-16 h-16 text-[var(--team-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classificação */}
            <Card className={`group relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-500 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--team-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Table className="w-7 h-7 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Classificação Live</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-1">
                  Tabela em tempo real com todos os detalhes: pontos, vitórias, saldo de gols e muito mais.
                </p>
                <Link
                  href="/standings"
                  className="inline-flex items-center gap-2 text-[var(--team-primary)] text-sm font-medium hover:gap-3 transition-all group/link"
                >
                  Ver tabela
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>

            {/* Playoffs */}
            <Card className={`group relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-500 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--team-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GitMerge className="w-7 h-7 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Playoffs Bracket</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-1">
                  Visualize o chaveamento completo e simule cada fase até a grande final.
                </p>
                <Link
                  href="/playoffs"
                  className="inline-flex items-center gap-2 text-[var(--team-primary)] text-sm font-medium hover:gap-3 transition-all group/link"
                >
                  Ver playoffs
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className={`group relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-500 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--team-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="w-7 h-7 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Stats Completas</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-1">
                  Análise detalhada de jogadores, gols, assistências e desempenho de cada time.
                </p>
                <Link
                  href="/teams"
                  className="inline-flex items-center gap-2 text-[var(--team-primary)] text-sm font-medium hover:gap-3 transition-all group/link"
                >
                  Explorar stats
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>

            {/* Personalização */}
            <Card className={`group relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border-white/5 hover:border-[var(--team-primary)]/30 transition-all duration-500 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '500ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--team-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Tema Dinâmico</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-1">
                  Escolha seu time favorito e a interface se adapta com as cores do seu coração.
                </p>
                <Link
                  href="/teams"
                  className="inline-flex items-center gap-2 text-[var(--team-primary)] text-sm font-medium hover:gap-3 transition-all group/link"
                >
                  Personalizar
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 2 */}
      <div className="relative overflow-hidden bg-[#030303]">
        <CurvedLoop
          marqueeText="CONHEÇA OS TIMES ✦ ESCOLHA SEU FAVORITO ✦ TEMPORADA 2026 ✦ "
          speed={1.2}
          curveAmount={0}
          direction="left"
          className="fill-var(--team-primary)]"
          interactive={false}
        />
      </div>

      {/* Seção de Times - Redesenhada 2026 */}
      <section ref={teamsRef} className="py-16 md:py-24 bg-[#030303] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[var(--team-primary)]/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--team-primary)]/3 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20 rounded-full mb-6">
              <Crown className="w-4 h-4 text-[var(--team-primary)]" />
              <span className="text-sm font-semibold text-[var(--team-primary)] uppercase tracking-wider">Times 2026</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">Os Competidores</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--team-primary)] to-yellow-400 bg-clip-text text-transparent">
                dessa temporada
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              10 times disputando o título. Qual será o seu favorito?
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 flex flex-col items-center justify-center p-4 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 mb-3"></div>
                  <div className="h-3 bg-white/5 w-3/4 mx-auto rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {teams.slice(0, 10).map((team, index) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className={`group relative aspect-square bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 hover:border-[var(--team-primary)]/40 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:scale-105 hover:bg-white/5 ${visibleSections.teams ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  aria-label={`Ver detalhes do time ${team.name}`}
                  onMouseEnter={() => setHoveredTeam(team.id)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-[var(--team-primary)]/10 blur-xl transition-opacity duration-300 ${hoveredTeam === team.id ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="relative z-10">
                    {team.logo?.url ? (
                      <img
                        src={team.logo.url}
                        alt={team.name}
                        width={72}
                        height={72}
                        className="object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-lg"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 flex items-center justify-center text-xl font-bold border border-[var(--team-primary)]/20">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-center line-clamp-2 group-hover:text-[var(--team-primary)] transition-colors relative z-10">
                    {team.name}
                  </h3>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-3 h-3 text-[var(--team-primary)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className={`mt-12 text-center transition-all duration-700 ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
            <Button
              asChild
              size="lg"
              className="bg-white/5 border border-white/10 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/10 text-white rounded-2xl px-8 h-14 transition-all duration-300 hover:scale-105"
            >
              <Link href="/teams" className="flex items-center gap-3 text-white">
                <Users className="w-5 h-5" />
                Ver Todos os Times
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 3 */}
      <div className="relative overflow-hidden bg-[#030303]">
        <CurvedLoop
          marqueeText="SEJA O CAMPEÃO ✦ SIMULE AGORA ✦ KINGS LEAGUE 2026 ✦ "
          speed={1.2}
          curveAmount={0}
          direction="right"
          className="fill-var(--team-primary)"
          interactive={false}
        />
      </div>

      {/* CTA Final - Redesenhado 2026 */}
      <section ref={ctaRef} className="py-20 md:py-32 relative overflow-hidden bg-[#030303]">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-[var(--team-primary)]/10 via-[var(--team-primary)]/5 to-[var(--team-primary)]/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${visibleSections.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Card container */}
            <div className="relative p-8 md:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 backdrop-blur-sm overflow-hidden">

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--team-primary)]/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--team-primary)]/10 rounded-full blur-[60px]" />

              <div className="relative z-10 text-center">
                {/* Trophy badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--team-primary)]/20 to-[var(--team-primary)]/5 border border-[var(--team-primary)]/30 mb-8 shadow-2xl shadow-[var(--team-primary)]/20">
                  <Trophy className="w-10 h-10 text-[var(--team-primary)]" />
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  <span className="text-white">Pronto para</span>
                  <br />
                  <span className="bg-gradient-to-r from-[var(--team-primary)] via-yellow-400 to-[var(--team-primary)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    conquistar o título?
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
                  Simule a temporada completa, acompanhe cada partida e descubra
                  se o seu time tem o que é preciso para ser <span className="text-white font-medium">campeão da Kings League 2026</span>.
                </p>

                {/* Benefícios */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-12">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">Simulações ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">Dados em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">100% gratuito</span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="group relative bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold text-lg px-12 h-16 rounded-2xl shadow-2xl shadow-[var(--team-primary)]/30 hover:shadow-[var(--team-primary)]/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <Link href="/simulator" className="flex items-center gap-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <Play className="w-6 h-6 fill-current" />
                    <span>Começar Agora</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                {/* Counter */}
                <p className="mt-8 text-sm text-gray-500">
                  Junte-se a{" "}
                  <span className="font-bold text-[var(--team-primary)]">+</span>
                  <CountUp
                    to={simulationsCount}
                    duration={1.5}
                    separator="."
                    className="font-bold text-[var(--team-primary)]"
                  />{" "}
                  fãs que já simularam a temporada
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS customizado */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <Footer />
    </main>
  )
}
