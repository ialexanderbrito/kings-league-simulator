"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trophy, ArrowRight, Users, Table, ChevronRight, PieChart, GitMerge, Zap, Star, Play, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import { Team, TeamStanding } from "@/types/kings-league"

export default function HomePage() {
  const [animateHero, setAnimateHero] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsRecord, setTeamsRecord] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
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
    <main className="min-h-screen bg-[#121212] text-white overflow-hidden">
      <Header
        loading={loading}
        selectedTeam={null}
        teams={teamsRecord}
        standings={standings}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      {/* Hero Section com animações avançadas */}
      <section
        ref={heroRef}
        className="relative overflow-hidden mb-8 sm:mb-12 lg:mb-16 min-h-[90vh] flex items-center"
        aria-labelledby="hero-heading"
      >
        {/* Fundo dinâmico com efeitos visuais */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('/bg-card-president.jpg')] bg-cover bg-center opacity-20"></div>

        {/* Efeito de partículas para dar mais dinamismo (apenas visual) */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[var(--team-primary)] animate-pulse"></div>
          <div className="absolute top-3/4 left-1/3 w-3 h-3 rounded-full bg-[var(--team-primary)] animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-[var(--team-primary)] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-4 h-4 rounded-full bg-[var(--team-primary)] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className={`flex-1 transition-all duration-1000 transform ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative overflow-hidden rounded-md group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--team-primary)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                  <KingsLeagueLogo
                    width={56}
                    height={78}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h1 id="hero-heading" className="text-2xl font-bold text-white">
                    <span className="text-[var(--team-primary)] animate-pulse">Kings</span> League
                  </h1>
                  <p className="text-sm text-gray-400 -mt-0.5">Simulador 2025</p>
                </div>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                <span className="inline-block relative">
                  Simule
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-[var(--team-primary)]"></span>
                </span> a <span className="text-[var(--team-primary)] relative">
                  Kings League
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-[var(--team-primary)]"></span>
                </span> <br className="md:hidden" />e preveja o <span className="text-[var(--team-primary)]">campeão</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Experimente o simulador de partidas mais completo da Kings League:
                simule resultados, acompanhe estatísticas em tempo real e descubra o caminho
                do seu time até o título.
              </p>

              {/* Estatísticas animadas para criar urgência */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-[var(--team-primary)]/20">
                  <div className="text-3xl font-bold text-[var(--team-primary)]">
                    {loading ? <div className="w-6 h-6 animate-pulse bg-gray-700 rounded-full"></div> : '+1000'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Simulações realizadas
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-[var(--team-primary)]/20">
                  <div className="text-3xl font-bold text-[var(--team-primary)]">10</div>
                  <div className="text-sm text-gray-400">Times da liga</div>
                </div>
                <div className="hidden sm:block bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-[var(--team-primary)]/20">
                  <div className="text-3xl font-bold text-[var(--team-primary)]">100%</div>
                  <div className="text-sm text-gray-400">Gratuito</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold group relative overflow-hidden transition-all duration-300 shadow-lg shadow-[var(--team-primary)]/20"
                >
                  <Link href="/simulator">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    <span>Começar a Simular Agora</span>
                  </Link>
                </Button>
              </div>

            </div>
            <div className={`hidden lg:block flex-1 transition-all duration-1000 delay-300 transform ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative w-full max-w-md mx-auto">
                <div className="w-full h-[400px] relative rounded-2xl overflow-hidden border-2 border-[var(--team-primary)]/30 shadow-xl hover:shadow-2xl hover:shadow-[var(--team-primary)]/20 transition-all duration-300 transform hover:scale-[1.02] group">
                  <Image
                    src="/og-image.png"
                    alt="Kings League Simulador Preview"
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                  {/* Botão de play para indicar demo/video */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-[var(--team-primary)]/90 p-4 rounded-full pulse-animation">
                      <Play className="w-8 h-8 text-black" fill="black" />
                    </div>
                  </div>
                </div>

                {/* Emblema/selo de qualidade */}
                <div className="absolute -bottom-5 -right-5 bg-[#1a1a1a] border border-[#333] rounded-full p-3 shadow-lg transform rotate-6 hover:rotate-12 transition-all duration-300">
                  <Trophy className="w-10 h-10 text-[var(--team-primary)]" />
                </div>

                {/* Tag flutuante para criar senso de exclusividade */}
                <div className="absolute top-4 left-4 bg-[var(--team-primary)] text-black text-xs font-bold py-1 px-3 rounded-full shadow-lg">
                  VERSÃO 2025
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marcador de ondas na parte inferior com animação suave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
            <path
              fill="#121212"
              fillOpacity="1"
              d="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,58.7C1120,64,1280,64,1360,64L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,58.7C1120,64,1280,64,1360,64L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z;
                       M0,64L80,69C160,74,320,84,480,80C640,76,800,58,960,53.3C1120,48,1280,58,1360,63.3L1440,69L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z;
                       M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,58.7C1120,64,1280,64,1360,64L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
              />
            </path>
          </svg>
        </div>
      </section>

      {/* Seção Recursos */}
      <section ref={featuresRef} className="py-12 bg-[#121212]" id="recursos">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 transform ${visibleSections.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="inline-block px-4 py-1 bg-[var(--team-primary)]/10 text-[var(--team-primary)] text-sm font-medium rounded-full mb-4">FUNCIONALIDADES EXCLUSIVAS</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recursos <span className="text-[var(--team-primary)]">Exclusivos</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore todas as funcionalidades do Kings League Simulator para ter a melhor experiência
              acompanhando e prevendo os resultados da liga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Simulador de Partidas */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <Zap className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Simulador de Partidas</h3>
                <p className="text-gray-400 mb-4">
                  Simule os resultados de todas as partidas da temporada e veja como o seu time favorito se sai.
                </p>
                <Link
                  href="/simulator"
                  className="text-[var(--team-primary)] inline-flex items-center text-sm hover:underline group/link"
                  aria-label="Experimentar o Simulador de Partidas"
                >
                  Experimentar
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Tabela de Classificação */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <Table className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tabela Completa</h3>
                <p className="text-gray-400 mb-4">
                  Acompanhe a classificação completa da liga com estatísticas detalhadas de cada time.
                </p>
                <Link
                  href="/standings"
                  className="text-[var(--team-primary)] inline-flex items-center text-sm hover:underline group/link"
                  aria-label="Ver a tabela de classificação completa"
                >
                  Ver classificação
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Chaveamento de Playoffs */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <GitMerge className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Chaveamento Playoffs</h3>
                <p className="text-gray-400 mb-4">
                  Visualize o chaveamento dos playoffs e simule os confrontos eliminatórios até a grande final.
                </p>
                <Link
                  href="/playoffs"
                  className="text-[var(--team-primary)] inline-flex items-center text-sm hover:underline group/link"
                  aria-label="Ver o chaveamento dos playoffs"
                >
                  Ver playoffs
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Estatísticas de Times */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <PieChart className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Estatísticas Detalhadas</h3>
                <p className="text-gray-400 mb-4">
                  Analise estatísticas detalhadas de cada time, incluindo gols, vitórias, derrotas e muito mais.
                </p>
                <Link
                  href="/teams"
                  className="text-[var(--team-primary)] inline-flex items-center text-sm hover:underline group/link"
                  aria-label="Ver estatísticas detalhadas dos times"
                >
                  Ver times
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Tema do Time */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '500ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <Users className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Time do Coração</h3>
                <p className="text-gray-400 mb-4">
                  Escolha seu time favorito e personalize a interface do simulador com as cores do seu time.
                </p>
                <Link
                  href="/simulator"
                  className="text-[var(--team-primary)] inline-flex items-center text-sm hover:underline group/link"
                  aria-label="Escolher seu time do coração"
                >
                  Escolher time
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Compartilhamento */}
            <Card className={`bg-[#1a1a1a] border-[#333] hover:border-[var(--team-primary)]/50 transition-all hover:shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.01] ${visibleSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms', transitionDuration: '500ms' }}>
              <div className="h-2 bg-gradient-to-r from-[var(--team-primary)] to-[#333]"></div>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-4 group-hover:bg-[var(--team-primary)]/20 transition-colors duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-[var(--team-primary)] group-hover:scale-110 transition-transform duration-300"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Compartilhamento</h3>
                <p className="text-gray-400 mb-4">
                  Compartilhe suas simulações e previsões com amigos nas redes sociais com apenas um clique.
                </p>
                <div className="flex gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#252525] hover:bg-[#333] transition-colors transform hover:scale-110"
                    aria-label="Compartilhar no Twitter/X"
                  >
                    <XLogo weight="fill" className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#252525] hover:bg-[#333] transition-colors transform hover:scale-110"
                    aria-label="Compartilhar no Facebook"
                  >
                    <FacebookLogo weight="fill" className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#252525] hover:bg-[#333] transition-colors transform hover:scale-110"
                    aria-label="Compartilhar no WhatsApp"
                  >
                    <WhatsappLogo weight="fill" className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de times */}
      <section ref={teamsRef} className="py-20 bg-[#0a0a0a] relative">
        {/* Fundo com efeito de gradiente avançado */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-[#0c0c0c] to-[#0a0a0a]"></div>
        <div className="absolute inset-0 bg-[url('/bg-card-president.jpg')] opacity-[0.03] bg-fixed"></div>

        {/* Efeitos visuais mais sofisticados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-1 h-1 rounded-full bg-[var(--team-primary)]/70 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-40 right-20 w-1 h-1 rounded-full bg-[var(--team-primary)]/70 animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-[var(--team-primary)]/70 animate-ping" style={{ animationDuration: '5s' }}></div>

          {/* Linhas decorativas */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--team-primary)]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--team-primary)]/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 transform ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="inline-block px-4 py-1 bg-[var(--team-primary)]/10 text-[var(--team-primary)] text-sm font-medium rounded-full mb-4">OS MELHORES TIMES</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">A Elite da <span className="text-[var(--team-primary)]">Kings League</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore os 12 times que competem pelo título da Kings League e descubra estatísticas,
              jogadores e estratégias de cada um deles.
            </p>
          </div>

          {loading ? (
            // Estado de carregamento aprimorado com animação de pulso
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] bg-[#1a1a1a] rounded-xl border border-[#333] flex flex-col items-center justify-center p-4 animate-pulse relative overflow-hidden"
                >
                  <div className="w-20 h-20 rounded-full bg-[#252525] mb-4"></div>
                  <div className="h-4 bg-[#252525] w-3/4 mx-auto rounded mb-2"></div>
                  <div className="h-3 bg-[#252525] w-1/2 mx-auto rounded"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#252525]/20 to-transparent"></div>
                </div>
              ))}
            </div>
          ) : (
            // Container principal com grid responsivo e layout aprimorado - 5 times por linha
            <div className="relative">
              {/* Cartões de time com design avançado e interativo - 5 times por linha para 10 times no total */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {teams.slice(0, 10).map((team, index) => (
                  <Link
                    key={team.id}
                    href={`/team/${team.id}`}
                    className={`team-card aspect-[4/5] bg-[#141414] rounded-xl border border-[#333] flex flex-col items-center justify-between p-0 hover:scale-[1.03] transition-all duration-500 hover:shadow-xl hover:shadow-[var(--team-primary)]/10 hover:border-[var(--team-primary)]/50 group relative overflow-hidden ${visibleSections.teams ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{
                      background: `linear-gradient(165deg, ${team.firstColorHEX}10, #141414 70%)`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                    aria-label={`Ver detalhes do time ${team.name}`}
                  >
                    {/* Efeito de brilho ao passar o mouse */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-transparent via-white/5 to-transparent group-hover:translate-x-full -translate-x-full transform transition-transform duration-1500"></div>

                    {/* Borda superior decorativa */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--team-primary)]/30 to-transparent"></div>

                    {/* Conteúdo principal do card */}
                    <div className="flex flex-col items-center pt-6 md:pt-8 pb-4 w-full relative z-10">
                      {/* Logo e imagem do time */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#0a0a0a]/90 flex items-center justify-center p-2 overflow-hidden border-2 border-transparent group-hover:border-[var(--team-primary)]/30 transition-all duration-300 mb-4 relative">
                        {/* Efeito de brilho circular */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--team-primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {team.logo?.url ? (
                          <Image
                            src={team.logo.url}
                            alt={team.name}
                            width={72}
                            height={72}
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-white/50">
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Nome e informações do time */}
                      <div className="text-center px-2">
                        <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:text-[var(--team-primary)] transition-colors duration-300 line-clamp-1">{team.name}</h3>
                        <p className="text-xs text-gray-500 max-w-[90%] mx-auto line-clamp-1">
                          {team.coach || 'Kings League Pro Team'}
                        </p>
                      </div>
                    </div>

                    {/* Rodapé com estatísticas e informações adicionais */}
                    <div className="w-full bg-black/40 backdrop-blur-sm p-2 px-3 transition-all duration-300 group-hover:bg-[var(--team-primary)]/10 border-t border-[#333] group-hover:border-[var(--team-primary)]/30">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center mr-1">
                            <Trophy className="w-3 h-3 text-[var(--team-primary)]" />
                          </div>
                          <span className="text-xs font-medium">{team.titles || 0} Títulos</span>
                        </div>
                        <span className="text-xs text-[var(--team-primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                          Ver
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </span>
                      </div>
                    </div>

                    {/* Indicador de posição na classificação se disponível */}
                    {standings.findIndex(s => s.teamId === team.id) >= 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-xs font-bold py-1 px-2 rounded-full shadow-lg flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)]"></span>
                        <span>{`#${standings.findIndex(s => s.teamId === team.id) + 1}`}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Botão de "Ver todos os times" aprimorado */}
          <div className={`mt-12 text-center transition-all duration-700 transform ${visibleSections.teams ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[var(--team-primary)]/30 hover:bg-[var(--team-primary)]/10 transition-all duration-300 group relative overflow-hidden py-6 px-8"
            >
              <Link href="/teams" className="flex items-center">
                <span className="relative z-10 flex items-center">
                  Explorar todos os times e estatísticas
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[var(--team-primary)]/5 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              </Link>
            </Button>
          </div>

          {/* Marcador visual para melhorar a estrutura da seção */}
          <div className={`mt-16 w-full h-px bg-gradient-to-r from-transparent via-[var(--team-primary)]/20 to-transparent transition-opacity duration-700 ${visibleSections.teams ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '800ms' }}></div>
        </div>
      </section>

      {/* Seção CTA */}
      <section ref={ctaRef} className="py-24 bg-[#121212] relative overflow-hidden">
        {/* Fundo com efeito dinâmico */}
        <div className="absolute inset-0 bg-[url('/bg-card-president.jpg')] opacity-5 bg-cover bg-center"></div>

        {/* Efeito de partículas e linhas */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--team-primary)]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--team-primary)]/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 transform ${visibleSections.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Card flutuante para o CTA principal */}
            <div className="bg-[#0f0f0f]/80 backdrop-blur-lg rounded-xl border border-[var(--team-primary)]/20 p-8 md:p-12 shadow-xl relative overflow-hidden">

              {/* Efeito de gradiente animado no fundo */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-[var(--team-primary)]/0 via-[var(--team-primary)]/20 to-[var(--team-primary)]/0 blur-xl opacity-50 animate-pulse" style={{ animationDuration: '3s' }}></div>

              <div className="text-center relative z-10">
                {/* Badge de destaque */}
                <div className="inline-block px-4 py-1 bg-[var(--team-primary)]/10 text-[var(--team-primary)] text-sm font-medium rounded-full mb-6 backdrop-blur-sm">
                  TEMPORADA 2025
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                  Pronto para se tornar o <span className="text-[var(--team-primary)] relative inline-block">
                    estrategista
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-[var(--team-primary)]"></span>
                  </span> da Kings League?
                </h2>

                <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  Simule resultados, descubra caminhos para o título e compartilhe suas
                  previsões com outros fãs da Liga. Leve seu time do coração ao topo!
                </p>

                {/* Características em destaque */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-sm">
                  <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[var(--team-primary)]" />
                    </div>
                    <span>Totalmente gratuito</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-[var(--team-primary)]" />
                    </div>
                    <span>Dados atualizados</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-black/30 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--team-primary)]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[var(--team-primary)]" />
                    </div>
                    <span>Interface personalizada</span>
                  </div>
                </div>

                {/* CTA Principal */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-black font-bold text-lg py-6 px-8 group relative overflow-hidden transition-all duration-300 shadow-lg shadow-[var(--team-primary)]/20 w-full sm:w-auto"
                  >
                    <Link href="/simulator">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                      <span className="flex items-center justify-center">
                        Simular Agora
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-[var(--team-primary)]/40 hover:bg-[var(--team-primary)]/10 transition-all duration-300 backdrop-blur-sm text-lg py-6 px-8 w-full sm:w-auto"
                  >
                    <Link href="/teams" className="flex items-center justify-center">
                      <span>Explorar Times</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adicionar CSS para animações personalizadas e corrigir problemas */}
      <style jsx global>{`
        @keyframes pulse-animation {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--team-primary-rgb), 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(var(--team-primary-rgb), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--team-primary-rgb), 0);
          }
        }
        
        .pulse-animation {
          animation: pulse-animation 2s infinite;
        }
        
        .team-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform, opacity;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        /* Otimizações para animações mais suaves */
        [class*="translate"], 
        [class*="scale"],
        [class*="rotate"],
        [class*="opacity"] {
          will-change: transform, opacity;
        }
        
        /* Melhorar performance de animações em dispositivos móveis */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        
        /* Garantir que animações sejam mais suaves em todos os navegadores */
        html {
          scroll-behavior: smooth;
        }
        
        /* Melhorar a experiência de transições */
        .duration-300 { transition-duration: 300ms; }
        .duration-500 { transition-duration: 500ms; }
        .duration-700 { transition-duration: 700ms; }
        .duration-1000 { transition-duration: 1000ms; }
        
        /* Melhorar visualização de animações */
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>

      <Footer />
    </main>
  )
}
