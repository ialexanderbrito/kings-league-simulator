"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Trophy, ArrowRight, Users, Table, ChevronRight, PieChart, GitMerge, Zap, TrendingUp, Star, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Team, TeamStanding } from "@/types/kings-league"
import TextType from "@/components/text-type"
import CurvedLoop from "@/components/curved-loop"
import CountUp from "@/components/count-up"

export default function HomePage() {
  const [animateHero, setAnimateHero] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsRecord, setTeamsRecord] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [simulationsCount, setSimulationsCount] = useState(Math.floor(Math.random() * 40000) + 10000)
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    hero: false,
    features: false,
    teams: false,
    cta: false,
  })

  // Refs para cada seção para animações de scroll
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
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
      setSimulationsCount(prev => prev + Math.floor(Math.random() * 10) + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Efeito para animações baseadas em scroll com comportamento aprimorado
  useEffect(() => {
    const handleScroll = () => {
      setVisibleSections({
        hero: isElementInView(heroRef.current, 0),
        features: isElementInView(featuresRef.current),
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
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212]">
      <Header
        loading={loading}
        selectedTeam={null}
        teams={teamsRecord}
        standings={standings}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      {/* Hero Section - Redesenhado */}
      <section
        ref={heroRef}
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--team-primary)]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--team-primary)]/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-[#1a1a1a] border border-[var(--team-primary)]/20 rounded-full">
              <KingsLeagueLogo width={32} height={44} />
              <div className="text-left">
                <p className="text-sm font-bold text-white">Kings League</p>
                <p className="text-xs text-gray-400">Simulador 2025</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white">
                Simule o Futuro
              </span>
              <br />
              <TextType
                text={["Do Seu Time", "Da Kings League", "Da Temporada"]}
                typingSpeed={100}
                deletingSpeed={50}
                pauseDuration={2000}
                className="text-[var(--team-primary)] drop-shadow-[0_0_30px_var(--team-primary)]"
                cursorCharacter="_"
                cursorClassName="text-[var(--team-primary)]"
                showCursor={true}
              />
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Descubra quem será o campeão da Kings League.
              Simule partidas, acompanhe estatísticas em tempo real e
              compartilhe suas previsões com a comunidade.
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 mb-10 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-white">+</span>
                <CountUp
                  to={simulationsCount}
                  duration={1.5}
                  separator=","
                  className="font-bold text-white"
                />
                <span>simulações</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[var(--team-primary)]" />
                <span>100% Gratuito</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold text-base px-8 h-12 rounded-full shadow-lg shadow-[var(--team-primary)]/20 hover:shadow-xl hover:shadow-[var(--team-primary)]/30 transition-all duration-300"
              >
                <Link href="/simulator" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Começar Simulação
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-gray-700 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/5 text-white h-12 px-8 rounded-full transition-all duration-300"
              >
                <Link href="/standings" className="flex items-center gap-2">
                  Ver Classificação
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#1a1a1a]/50 border border-gray-800">
                <Trophy className="w-6 h-6 text-[var(--team-primary)] mb-2" />
                <p className="text-2xl font-bold text-white">10</p>
                <p className="text-xs text-gray-400">Times</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#1a1a1a]/50 border border-gray-800">
                <TrendingUp className="w-6 h-6 text-[var(--team-primary)] mb-2" />
                <p className="text-2xl font-bold text-white">Real</p>
                <p className="text-xs text-gray-400">Estatísticas</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-[#1a1a1a]/50 border border-gray-800">
                <Sparkles className="w-6 h-6 text-[var(--team-primary)] mb-2" />
                <p className="text-2xl font-bold text-white">Live</p>
                <p className="text-xs text-gray-400">Atualizações</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 1 */}
      <div className="relative overflow-hidden">
        <CurvedLoop
          marqueeText="KINGS LEAGUE ✦ SIMULADOR 2025 ✦ "
          speed={2}
          curveAmount={0}
          direction="right"
          className="fill-var(--team-primary)]"
          interactive={false}
        />
      </div>

      {/* Seção Recursos - Redesenhada */}
      <section ref={featuresRef} className="py-4 md:py-8" id="recursos">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${visibleSections.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="inline-block px-4 py-1.5 bg-[var(--team-primary)]/10 text-[var(--team-primary)] text-sm font-semibold rounded-full mb-4 border border-[var(--team-primary)]/20">
              FUNCIONALIDADES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para
              <span className="block text-[var(--team-primary)]">simular a temporada</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ferramentas completas para acompanhar cada detalhe da Kings League
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Simulador */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Zap className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Simulador Completo</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Simule todas as partidas da temporada com algoritmo realista baseado em estatísticas reais
                </p>
                <Link
                  href="/simulator"
                  className="text-[var(--team-primary)] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Simular agora <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Classificação */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Table className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Classificação Live</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Acompanhe a tabela em tempo real com vitórias, derrotas, gols e saldo
                </p>
                <Link
                  href="/standings"
                  className="text-[var(--team-primary)] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver tabela <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Playoffs */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <GitMerge className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Chaveamento</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Visualize e simule os playoffs até descobrir o grande campeão
                </p>
                <Link
                  href="/playoffs"
                  className="text-[var(--team-primary)] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ver playoffs <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <PieChart className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Stats Detalhadas</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Analise jogadores, gols, assistências e desempenho de cada time
                </p>
                <Link
                  href="/teams"
                  className="text-[var(--team-primary)] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Explorar stats <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Personalização */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '500ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Users className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tema Personalizado</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Escolha seu time favorito e personalize as cores da interface
                </p>
                <Link
                  href="/simulator"
                  className="text-[var(--team-primary)] text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Personalizar <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* Compartilhamento */}
            <Card className={`group bg-[#1a1a1a]/50 border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] transition-all duration-300 ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--team-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-[var(--team-primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Compartilhe</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Compartilhe suas simulações e previsões com a comunidade
                </p>
                <div className="flex items-center gap-2 text-[var(--team-primary)] text-sm font-medium">
                  <span>Redes sociais</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)] animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)] animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 2 */}
      <div className="relative overflow-hidde">
        <CurvedLoop
          marqueeText="CONHEÇA OS TIMES ✦ ESCOLHA SEU FAVORITO ✦ "
          speed={2}
          curveAmount={0}
          direction="left"
          className="fill-var(--team-primary)]"
          interactive={false}
        />
      </div>

      {/* Seção de Times - Redesenhada */}
      <section ref={teamsRef} className="py-4 md:py-8 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--team-primary)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="inline-block px-4 py-1.5 bg-[var(--team-primary)]/10 text-[var(--team-primary)] text-sm font-semibold rounded-full mb-4 border border-[var(--team-primary)]/20">
              TIMES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Conheça os
              <span className="block text-[var(--team-primary)]">Competidores</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              10 times lutando pelo título da Kings League. Escolha o seu favorito.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-[#1a1a1a]/50 rounded-2xl border border-gray-800 flex flex-col items-center justify-center p-4 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-[#252525] mb-3"></div>
                  <div className="h-3 bg-[#252525] w-3/4 mx-auto rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {teams.slice(0, 10).map((team, index) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className={`group aspect-square bg-[#1a1a1a]/50 rounded-2xl border border-gray-800 hover:border-[var(--team-primary)]/50 hover:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${visibleSections.teams ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  aria-label={`Ver detalhes do time ${team.name}`}
                >
                  <div className="relative">
                    {team.logo?.url ? (
                      <img
                        src={team.logo.url}
                        alt={team.name}
                        width={64}
                        height={64}
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center text-xl font-bold">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-center line-clamp-2 group-hover:text-[var(--team-primary)] transition-colors">
                    {team.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          <div className={`mt-10 text-center transition-all duration-700 ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-700 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/5 rounded-full px-8 h-12 transition-all duration-300"
            >
              <Link href="/teams" className="flex items-center gap-2">
                Ver Todos os Times
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divisória Curved Loop 3 */}
      <div className="relative overflow-hidden">
        <CurvedLoop
          marqueeText="SEJA O CAMPEÃO ✦ SIMULE AGORA ✦ "
          speed={2}
          curveAmount={0}
          direction="right"
          className="fill-var(--team-primary)"
          interactive={false}
        />
      </div>

      {/* CTA Final - Redesenhado */}
      <section ref={ctaRef} className="py-4 md:py-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--team-primary)]/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${visibleSections.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20 mb-6">
              <Trophy className="w-8 h-8 text-[var(--team-primary)]" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Seu time pode ser
              <span className="block bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-primary)]/60 bg-clip-text text-transparent">
                o próximo campeão
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Simule a temporada completa, acompanhe cada partida e descubra
              se o seu time tem o que é preciso para conquistar o título da Kings League 2025.
            </p>

            {/* Benefícios */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--team-primary)]" />
                <span>Simulações ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--team-primary)]" />
                <span>Estatísticas em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--team-primary)]" />
                <span>100% gratuito</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold text-base px-10 h-14 rounded-full shadow-lg shadow-[var(--team-primary)]/20 hover:shadow-xl hover:shadow-[var(--team-primary)]/30 transition-all duration-300"
              >
                <Link href="/simulator" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Começar Agora
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Junte-se a <span className="font-bold text-[var(--team-primary)]">+</span>
              <CountUp
                to={simulationsCount}
                duration={1.5}
                separator=","
                className="font-bold text-[var(--team-primary)]"
              /> fãs que já simularam
            </p>
          </div>
        </div>
      </section>

      {/* CSS customizado */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
