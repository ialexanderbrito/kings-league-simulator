"use client"

import { useState, useEffect } from "react"
import { Menu, X, Share2, Trophy, Heart, ChevronDown, Home, Shield, Sparkles, Users, ChevronRight, ListOrdered, Download, Image } from "lucide-react"
import { Link as LinkIcon } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team, TeamStanding } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { useToast } from "@/hooks/use-toast"
import { FavoriteTeamModal } from "@/components/favorite-team-modal"
import { RemoveFavoriteTeamModal } from "@/components/remove-favorite-team-modal"
import { useSimulationCapture } from "@/hooks/use-simulation-capture"

interface HeaderProps {
  loading: boolean
  selectedTeam: string | null
  onTeamSelect: (teamId: string) => void
  setActiveTab: (tab: "matches" | "team") => void
}

export function Header({ loading, selectedTeam, onTeamSelect, setActiveTab }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { favoriteTeam, setFavoriteTeam } = useTeamTheme()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  // Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTeamSelect = (teamId: string) => {
    onTeamSelect(teamId)
    router.push(`/team/${teamId}`)
    setIsSidebarOpen(false)
  }

  const handleLogoClick = () => {
    if (selectedTeam) {
      setActiveTab("matches")
    }
    setIsSidebarOpen(false)
  }

  // Fecha a sidebar quando o usuário clicar em qualquer lugar fora dela
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const menuButton = document.getElementById('menu-button')

      if (sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node) &&
        isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarOpen])

  // Fecha a sidebar quando a rota mudar
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Impede o scroll do body quando o sidebar estiver aberto
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  const navItems = [
    { href: "/simulator", label: "Simulador", icon: Home },
    { href: "/standings", label: "Classificação", icon: Trophy },
    { href: "/teams", label: "Times", icon: Users },
    { href: "/tier-list", label: "Tier List", icon: ListOrdered },
  ]

  // Fallback: se o app não passou `teams` ou `standings`, buscar da rota /api/teams
  const [fetchedTeamsMap, setFetchedTeamsMap] = useState<Record<string, Team> | null>(null)
  const [fetchedStandings, setFetchedStandings] = useState<TeamStanding[] | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadTeams() {
      try {
        const res = await fetch('/api/teams')
        if (!res.ok) return
        const data: Team[] = await res.json()

        if (!mounted) return

        const map: Record<string, Team> = {}
        data.forEach((t) => (map[t.id] = t))

        setFetchedTeamsMap(map)

        // Criar uma versão simplificada de standings a partir dos times (valores numéricos default)
        const derivedStandings: TeamStanding[] = data.map((t, index) => ({
          id: t.id,
          name: t.name,
          shortName: t.shortName,
          logo: t.logo,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          rank: index + 1,
        }))

        setFetchedStandings(derivedStandings)
      } catch (err) {
        // silencioso: falha em buscar não deve quebrar o header
        // eslint-disable-next-line no-console
        console.error('Falha ao buscar /api/teams', err)
      }
    }

    loadTeams()

    return () => {
      mounted = false
    }
  }, [])

  // Usar os dados passados via props quando disponíveis, caso contrário usar os buscados
  const teamsToUse: Record<string, Team> = fetchedTeamsMap ?? {}
  const standingsToUse: TeamStanding[] = fetchedStandings ?? []

  return (
    <>
      {/* Header Flutuante */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "py-2" : "py-3"
      )}>
        <div className="container mx-auto px-4">
          <div className={cn(
            "relative overflow-hidden rounded-2xl border transition-all duration-300",
            isScrolled
              ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20"
              : "bg-[#0a0a0a]/80 backdrop-blur-md border-white/5"
          )}>
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Menu Mobile */}
                  <button
                    id="menu-button"
                    className={cn(
                      "md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                      "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                    )}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Abrir menu"
                    aria-expanded={isSidebarOpen}
                    aria-controls="mobile-sidebar"
                  >
                    <Menu className="h-5 w-5 text-gray-300" />
                  </button>

                  {/* Logo */}
                  <Link
                    href="/"
                    className="group flex items-center gap-3 transition-all duration-200 hover:opacity-90"
                    onClick={handleLogoClick}
                    aria-label="Ir para página inicial"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <KingsLeagueLogo
                          width={32}
                          height={46}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-base font-bold text-white leading-tight flex items-center gap-1">
                        <span className="text-orange-400">Kings</span>
                        <span>League</span>
                      </h1>
                      <p className="text-[10px] text-gray-500 font-medium">Simulador 2026</p>
                    </div>
                  </Link>

                  {/* Navigation Desktop */}
                  <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Navegação principal">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                              ? "text-white bg-white/10"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-orange-400" : "text-gray-500"
                          )} />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                {/* Right Section */}
                {!loading && (
                  <div className="flex items-center gap-2">
                    <DownloadSimulationButton />
                    <ShareButton />
                    <TeamSelector
                      selectedTeam={selectedTeam}
                      teams={teamsToUse}
                      standings={standingsToUse}
                      onTeamSelect={handleTeamSelect}
                      favoriteTeam={favoriteTeam}
                      setFavoriteTeam={setFavoriteTeam}
                      showToast={toast}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar header fixo */}
      <div className={cn("transition-all duration-300", isScrolled ? "h-20" : "h-24")} />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      >
        <aside
          id="mobile-sidebar"
          className={cn(
            "fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0a0a0a] border-r border-white/10 overflow-hidden transition-transform duration-300 ease-out flex flex-col",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Menu lateral"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <Link
              href="/"
              className="group flex items-center gap-3"
              onClick={handleLogoClick}
              aria-label="Ir para página inicial"
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <KingsLeagueLogo width={28} height={40} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-1">
                  <span className="text-orange-400">Kings</span>
                  <span>League</span>
                </h1>
                <p className="text-[10px] text-gray-500">Simulador 2026</p>
              </div>
            </Link>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Nav Links */}
              <div>
                <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  Menu
                </h2>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isActive ? "bg-orange-500/20" : "bg-white/5"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            isActive ? "text-orange-400" : "text-gray-500"
                          )} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Teams Section */}
              <div>
                <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
                  <span>Times</span>
                  <span className="text-gray-600">{standingsToUse.length}</span>
                </h2>
                <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-minimal">
                  {standingsToUse.map((team) => {
                    const isFavorite = favoriteTeam?.id === team.id
                    const isSelected = selectedTeam === team.id
                    return (
                      <button
                        key={team.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                          isSelected
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => handleTeamSelect(team.id)}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0",
                          isFavorite && "ring-2 ring-orange-500/50"
                        )}>
                          <img
                            src={getProxyImageUrl(team.logo?.url)}
                            alt=""
                            className="w-6 h-6 object-contain"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <span className="text-sm font-medium truncate flex-1 text-left">{team.name}</span>
                        {isFavorite && (
                          <Heart className="w-4 h-4 text-orange-400 flex-shrink-0" fill="currentColor" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Feito por fãs, para fãs</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function DownloadSimulationButton() {
  const { captureAndDownload, isCapturing } = useSimulationCapture()
  const { toast } = useToast()
  const pathname = usePathname()

  // Mostrar apenas na rota /simulator
  if (pathname !== '/simulator') {
    return null
  }

  const handleDownloadSimulation = async () => {
    const success = await captureAndDownload('simulation-content', {
      filename: `kings-league-simulacao-${new Date().toISOString().split('T')[0]}.png`,
      quality: 1,
      format: 'png'
    })

    if (success) {
      toast({
        title: "Simulação salva! 🎉",
        description: "Sua simulação foi baixada com sucesso. Compartilhe com seus amigos!",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a simulação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <button
      onClick={handleDownloadSimulation}
      disabled={isCapturing}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl transition-all duration-200",
        "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
        "text-gray-300 hover:text-white font-medium text-sm",
        isCapturing && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Baixar simulação como imagem"
    >
      {isCapturing ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">Gerando...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Baixar simulação</span>
        </>
      )}
    </button>
  )
}

function ShareButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
            "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
          )}
          aria-label="Compartilhar site"
        >
          <Share2 className="h-4 w-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#0a0a0a] border-white/10 shadow-2xl rounded-xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
          Compartilhar
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        {[
          {
            name: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "facebook",
            color: "hover:bg-blue-500/10 hover:text-blue-400"
          },
          {
            name: "Twitter",
            href: `https://twitter.com/intent/tweet?text=🔥 Simule os resultados da Kings League Brasil! Teste suas previsões e veja como fica a tabela de classificação 🏆⚽ &url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "twitter",
            color: "hover:bg-gray-500/10 hover:text-gray-300"
          },
          {
            name: "WhatsApp",
            href: `https://wa.me/?text=🏆 *Simulador Kings League Brasil!* Acabei de testar este simulador de resultados da liga! Confira: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "whatsapp",
            color: "hover:bg-green-500/10 hover:text-green-400"
          },
          {
            name: "Copiar link",
            action: "copy",
            icon: "link",
            color: "hover:bg-orange-500/10 hover:text-orange-400"
          }
        ].map((item) => (
          <DropdownMenuItem
            key={item.name}
            className={cn(
              "cursor-pointer flex items-center gap-3 py-2.5 px-3 mx-1 my-0.5 rounded-lg transition-all text-gray-400",
              item.color
            )}
            onClick={() => {
              if (item.action === "copy") {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app');
              } else if (item.href) {
                window.open(item.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              {item.icon === "facebook" && <FacebookLogo weight="fill" className="w-4 h-4" />}
              {item.icon === "twitter" && <XLogo weight="fill" className="w-4 h-4" />}
              {item.icon === "whatsapp" && <WhatsappLogo weight="fill" className="w-4 h-4" />}
              {item.icon === "link" && <LinkIcon className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium">{item.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TeamSelectorProps {
  selectedTeam: string | null
  teams: Record<string, Team>
  standings: TeamStanding[]
  onTeamSelect: (teamId: string) => void
  favoriteTeam: Team | null
  setFavoriteTeam: (team: Team | null) => void
  showToast: any
}

function TeamSelector({ selectedTeam, teams, standings, onTeamSelect, favoriteTeam, setFavoriteTeam, showToast }: TeamSelectorProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [pendingTeam, setPendingTeam] = useState<Team | null>(null);
  const router = useRouter();

  const handleFavoriteButtonClick = (team: Team, e: React.MouseEvent) => {
    e.stopPropagation();

    if (favoriteTeam && favoriteTeam.id === team.id) {
      setRemoveModalOpen(true);
      return;
    }

    setPendingTeam(team);
    setConfirmModalOpen(true);
  };

  const handleConfirmFavorite = () => {
    if (!pendingTeam) return;

    setFavoriteTeam(pendingTeam);
    showToast({
      title: "Time definido como favorito",
      description: `${pendingTeam.name} agora é seu time do coração! As cores do site foram atualizadas.`,
      variant: "default",
    });

    setConfirmModalOpen(false);
    setPendingTeam(null);
  };

  const handleCancelFavorite = () => {
    setConfirmModalOpen(false);
    setPendingTeam(null);
  };

  const handleRemoveFavorite = () => {
    if (!favoriteTeam) return;

    setFavoriteTeam(null);
    showToast({
      title: "Time removido dos favoritos",
      description: `${favoriteTeam.name} não é mais seu time do coração!`,
      variant: "default",
    });

    setRemoveModalOpen(false);
  };

  const handleCancelRemove = () => {
    setRemoveModalOpen(false);
  };

  const handleTeamSelect = (teamId: string) => {
    onTeamSelect(teamId);
    router.push(`/team/${teamId}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 h-10 rounded-xl transition-all duration-200",
              "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
              favoriteTeam && "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
            )}
            aria-label={favoriteTeam ? `Time selecionado: ${favoriteTeam.name}` : selectedTeam ? `Time selecionado: ${teams[selectedTeam]?.name ?? 'Selecionar time'}` : "Selecionar time"}
          >
            {favoriteTeam ? (
              <>
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    src={getProxyImageUrl(favoriteTeam.logo?.url)}
                    alt=""
                    className="w-5 h-5 object-contain"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <span className="text-sm font-medium text-white hidden sm:inline max-w-[80px] truncate">
                  {favoriteTeam.shortName || favoriteTeam.name}
                </span>
                <Heart className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="currentColor" />
              </>
            ) : selectedTeam ? (
              <>
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    src={getProxyImageUrl(teams[selectedTeam]?.logo?.url)}
                    alt=""
                    className="w-5 h-5 object-contain"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <span className="text-sm font-medium text-gray-300 hidden sm:inline max-w-[80px] truncate">
                  {teams[selectedTeam]?.shortName || teams[selectedTeam]?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400 hidden sm:inline">Times</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 max-w-[90vw] bg-[#0a0a0a] border-white/10 shadow-2xl rounded-xl max-h-[70vh] overflow-hidden"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 flex items-center justify-between">
            <span>Escolha seu time</span>
            <span className="text-[10px] font-normal text-gray-600">
              {standings.length} times
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <div className="py-1 max-h-[50vh] overflow-y-auto scrollbar-minimal">
            {standings.map((team) => {
              const isFavorite = favoriteTeam?.id === team.id
              const isSelected = selectedTeam === team.id
              const teamObj = teams[team.id]

              return (
                <DropdownMenuItem
                  key={team.id}
                  className={cn(
                    "cursor-pointer flex items-center gap-3 py-2.5 px-3 mx-1 my-0.5 rounded-xl transition-all group",
                    isSelected && "bg-white/5",
                    isFavorite && "bg-orange-500/5"
                  )}
                  onClick={() => handleTeamSelect(team.id)}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0 transition-all",
                    isFavorite && "ring-2 ring-orange-500/50"
                  )}>
                    <img
                      src={getProxyImageUrl(teamObj?.logo?.url)}
                      alt=""
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isFavorite ? "text-orange-400" : "text-gray-300"
                    )}>
                      {teamObj?.name || team.name}
                    </p>
                    {isFavorite && (
                      <p className="text-[10px] text-gray-500">Seu favorito</p>
                    )}
                  </div>

                  <button
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                      "hover:bg-white/10",
                      isFavorite ? "text-orange-400" : "text-gray-600 hover:text-gray-400"
                    )}
                    onClick={(e) => {
                      if (!teamObj) return
                      handleFavoriteButtonClick(teamObj, e)
                    }}
                    aria-label={isFavorite ? `Remover ${teamObj?.name || team.name} dos favoritos` : `Adicionar ${teamObj?.name || team.name} aos favoritos`}
                  >
                    <Heart
                      className="w-4 h-4 transition-transform hover:scale-110"
                      fill={isFavorite ? "currentColor" : "none"}
                      strokeWidth={isFavorite ? 0 : 2}
                    />
                  </button>
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmação */}
      {pendingTeam && (
        <FavoriteTeamModal
          open={confirmModalOpen}
          onOpenChange={setConfirmModalOpen}
          onConfirm={handleConfirmFavorite}
          onCancel={handleCancelFavorite}
          currentTeam={favoriteTeam}
          newTeam={pendingTeam}
          isSwitching={!!favoriteTeam}
        />
      )}

      {/* Modal de remoção */}
      {favoriteTeam && (
        <RemoveFavoriteTeamModal
          open={removeModalOpen}
          onOpenChange={setRemoveModalOpen}
          onConfirm={handleRemoveFavorite}
          onCancel={handleCancelRemove}
          team={favoriteTeam}
        />
      )}
    </>
  )
}