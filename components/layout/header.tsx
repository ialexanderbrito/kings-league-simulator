"use client"

import { useState, useEffect } from "react"
import { Menu, X, Share2, Trophy, ChevronDown, Home, Shield, Sparkles, Users, ChevronRight, ListOrdered, Image } from "lucide-react"
import { Link as LinkIcon } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team, TeamStanding } from "@/types/kings-league"
import { useToast } from "@/hooks/use-toast"
import { fetchLeagueData } from "@/lib/fetch-league-data"

interface HeaderProps {
  loading?: boolean
  selectedTeam?: string | null
  onTeamSelect?: (teamId: string) => void
  setActiveTab?: (tab: "matches" | "team") => void
}

export function Header({
  loading = false,
  selectedTeam = null,
  onTeamSelect,
  setActiveTab,
}: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
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

  // Pré-aquecimento das rotas principais para transição instantânea mesmo no 3G
  useEffect(() => {
    const routes = ["/simulator", "/standings", "/12a0", "/teams", "/tier-list"]
    routes.forEach((route) => {
      try {
        router.prefetch(route)
      } catch {}
    })
  }, [router])

  const handleTeamSelect = (teamId: string) => {
    onTeamSelect?.(teamId)
    router.push(`/team/${teamId}`)
    setIsSidebarOpen(false)
  }

  const handleLogoClick = () => {
    if (selectedTeam) {
      setActiveTab?.("matches")
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

  // Fecha a sidebar e reseta estado quando a rota mudar
  useEffect(() => {
    setIsSidebarOpen(false)
    setNavigatingTo(null)
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
    { href: "/12a0", label: "12a0", icon: Sparkles },
    { href: "/standings", label: "Classificação", icon: Trophy },
    { href: "/teams", label: "Times", icon: Users },
    { href: "/tier-list", label: "Tier List", icon: ListOrdered },
  ]

  // Fallback: se o app não passou `teams` ou `standings`, buscar da API interna via cache
  const [fetchedTeamsMap, setFetchedTeamsMap] = useState<Record<string, Team> | null>(null)
  const [fetchedStandings, setFetchedStandings] = useState<TeamStanding[] | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadTeams() {
      try {
        const leagueData = await fetchLeagueData()
        if (!mounted || !leagueData?.teams) return

        const map: Record<string, Team> = {}
        leagueData.teams.forEach((t) => (map[t.id] = t))

        setFetchedTeamsMap(map)
        setFetchedStandings(leagueData.standings || [])
      } catch (err) {
        // silencioso: falha em buscar não deve quebrar o header
        console.error('Falha ao buscar dados no Header', err)
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
      {/* Header Flutuante Liquid Glass */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-[padding] duration-200",
        isScrolled ? "pt-2 sm:pt-2.5" : "pt-3 sm:pt-4"
      )}>
        <div className="w-full max-w-5xl px-3 sm:px-4 pointer-events-auto">
          <div className={cn(
            "relative overflow-hidden rounded-2xl md:rounded-full transition-[background-color,border-color,box-shadow,padding] duration-200",
            isScrolled ? "liquid-nav-shell-scrolled py-2" : "liquid-nav-shell py-2 sm:py-2.5",
            "px-3 sm:px-4"
          )}>
            {/* Efeito Liquid Glass: Refração sutil de topo e Aura da Cor do Time */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-2xl md:rounded-t-full" />
            <div
              className="pointer-events-none absolute left-1/2 -top-10 -translate-x-1/2 w-80 h-16 rounded-full bg-[var(--team-primary)]/15 blur-2xl transition-opacity duration-300"
              style={{ opacity: isScrolled ? 0.35 : 0.2 }}
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Lado Esquerdo: Logo & Marca */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Botão Menu Mobile */}
                  <button
                    id="menu-button"
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full text-zinc-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.97] transition-[background-color,color,transform] duration-150"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Abrir menu"
                    aria-expanded={isSidebarOpen}
                    aria-controls="mobile-sidebar"
                  >
                    <Menu className="h-4 w-4" />
                  </button>

                  {/* Logo Kings League */}
                  <Link
                    href="/"
                    className="group flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-95"
                    onClick={handleLogoClick}
                    aria-label="Ir para página inicial"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 bg-[var(--team-primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <KingsLeagueLogo
                          size={26}
                          className="transition-transform duration-200 ease-out group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white tracking-tight leading-none flex items-center gap-1">
                        <span className="text-[var(--team-primary)]">Kings</span>
                        <span>League</span>
                      </span>
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase bg-white/[0.04] text-zinc-400">
                        Simulador
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Centro: Navegação Flutuante Minimalista (Sem bordas aninhadas) */}
                <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Navegação principal">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-[background-color,color,transform,box-shadow] duration-150 active:scale-[0.97]",
                          isActive
                            ? "bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className={cn(
                          "w-3.5 h-3.5 transition-colors duration-150",
                          isActive ? "text-[var(--team-primary)]" : "text-zinc-500"
                        )} />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)] shadow-[0_0_6px_var(--team-primary)] ml-0.5 animate-pulse" />
                        )}
                      </Link>
                    )
                  })}
                </nav>

                {/* Lado Direito: Ações / Botões em Liquid Glass Minimalista */}
                {!loading && (
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <ShareButton />
                    <TeamSelector
                      selectedTeam={selectedTeam}
                      teams={teamsToUse}
                      standings={standingsToUse}
                      onTeamSelect={handleTeamSelect}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar o header fixo com respiro generoso */}
      <div className={cn("transition-[height] duration-200", isScrolled ? "h-16 sm:h-20" : "h-20 sm:h-24")} />

      {/* Mobile Sidebar com Liquid Glass */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-md z-50 md:hidden transition-opacity duration-200",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      >
        <aside
          id="mobile-sidebar"
          className={cn(
            "fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0a0a0f]/95 backdrop-blur-2xl border-r border-white/10 overflow-hidden flex flex-col shadow-2xl transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ transitionTimingFunction: "var(--ease-drawer)" }}
          onClick={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Menu lateral"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              onClick={handleLogoClick}
              aria-label="Ir para página inicial"
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <KingsLeagueLogo size={26} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-1">
                  <span className="text-[var(--team-primary)]">Kings</span>
                  <span>League</span>
                </h1>
                <p className="text-[10px] text-zinc-500 font-medium">Simulador Oficial</p>
              </div>
            </Link>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.97] transition-[background-color,color,transform] duration-150"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto scrollbar-minimal p-4 space-y-6">
            {/* Nav Links */}
            <div>
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 px-2">
                Navegação
              </h2>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isPending = navigatingTo === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-[background-color,color,transform] duration-150 text-sm font-medium active:scale-[0.98]",
                        isActive || isPending
                          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] font-semibold"
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      )}
                      onClick={() => {
                        setNavigatingTo(item.href)
                        setTimeout(() => setIsSidebarOpen(false), 100)
                      }}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        isActive || isPending ? "bg-[var(--team-primary)]/20 text-[var(--team-primary)]" : "bg-white/5 text-zinc-400"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {isPending ? (
                        <span className="w-2 h-2 rounded-full bg-[var(--team-primary)] animate-ping" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-[var(--team-primary)] shadow-[0_0_8px_var(--team-primary)]" />
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Teams Section */}
            <div>
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 px-2 flex items-center justify-between">
                <span>Times da Liga</span>
                <span className="text-zinc-600 font-normal">{standingsToUse.length}</span>
              </h2>
              <div className="space-y-1 max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-minimal pr-1">
                {standingsToUse.map((team) => {
                  const isSelected = selectedTeam === team.id
                  return (
                    <Link
                      key={team.id}
                      href={`/team/${team.id}`}
                      prefetch={true}
                      className={cn(
                        "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-[background-color,color,transform] duration-150 group active:scale-[0.98]",
                        isSelected
                          ? "bg-white/[0.1] text-white"
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      )}
                      onClick={() => {
                        onTeamSelect?.(team.id)
                        setIsSidebarOpen(false)
                      }}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                        <img
                          src={getProxyImageUrl(team.logo?.url)}
                          alt=""
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <span className="text-xs font-semibold truncate flex-1 text-left">{team.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--team-primary)]" />
              <span className="text-xs text-zinc-400">Kings League Brasil • Simulador</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function ShareButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-8 sm:w-8.5 h-8 sm:h-8.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.97] transition-[background-color,color,transform] duration-150"
          aria-label="Compartilhar site"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="liquid-glass-menu w-56 rounded-2xl p-1.5 shadow-2xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5 py-1.5">
          Compartilhar
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 my-1" />
        {[
          {
            name: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "facebook",
            color: "hover:bg-blue-500/10 hover:text-blue-400"
          },
          {
            name: "Twitter / X",
            href: `https://twitter.com/intent/tweet?text=🔥 Simule os resultados da Kings League Brasil! Teste suas previsões e veja como fica a tabela de classificação 🏆⚽ &url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "twitter",
            color: "hover:bg-zinc-500/10 hover:text-zinc-200"
          },
          {
            name: "WhatsApp",
            href: `https://wa.me/?text=🏆 *Simulador Kings League Brasil!* Acabei de testar este simulador de resultados da liga! Confira: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "whatsapp",
            color: "hover:bg-emerald-500/10 hover:text-emerald-400"
          },
          {
            name: "Copiar link",
            action: "copy",
            icon: "link",
            color: "hover:bg-[var(--team-primary)]/10 hover:text-[var(--team-primary)]"
          }
        ].map((item) => (
          <DropdownMenuItem
            key={item.name}
            className={cn(
              "cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-[background-color,color,transform] duration-150 text-zinc-400 text-xs active:scale-[0.98]",
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
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              {item.icon === "facebook" && <FacebookLogo weight="fill" className="w-3.5 h-3.5" />}
              {item.icon === "twitter" && <XLogo weight="fill" className="w-3.5 h-3.5" />}
              {item.icon === "whatsapp" && <WhatsappLogo weight="fill" className="w-3.5 h-3.5" />}
              {item.icon === "link" && <LinkIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="font-medium">{item.name}</span>
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
}

function TeamSelector({ selectedTeam, teams, standings, onTeamSelect }: TeamSelectorProps) {
  const router = useRouter();

  const handleTeamSelect = (teamId: string) => {
    onTeamSelect(teamId);
    router.push(`/team/${teamId}`);
  };

  const selectedTeamObj = selectedTeam ? teams[selectedTeam] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-8 sm:h-8.5 rounded-full active:scale-[0.97] transition-[background-color,color,transform,box-shadow] duration-150",
            selectedTeamObj
              ? "bg-white/[0.07] text-white hover:bg-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
              : "text-zinc-300 hover:text-white hover:bg-white/[0.06]"
          )}
          aria-label={selectedTeamObj ? `Time selecionado: ${selectedTeamObj.name}` : "Selecionar time"}
        >
          {selectedTeamObj ? (
            <>
              <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                <img
                  src={getProxyImageUrl(selectedTeamObj.logo?.url)}
                  alt=""
                  className="w-4 h-4 object-contain"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="text-xs font-semibold text-white hidden sm:inline max-w-[75px] truncate">
                {selectedTeamObj.shortName || selectedTeamObj.name}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 text-[var(--team-primary)]" />
              <span className="text-xs text-zinc-300 hidden sm:inline font-medium">Times</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="liquid-glass-menu w-72 max-w-[90vw] rounded-2xl p-2 shadow-2xl max-h-[75vh] overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5 py-1.5 flex items-center justify-between">
          <span>Times da Liga</span>
          <span className="text-[10px] font-normal text-zinc-600">
            {standings.length} times
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 my-1" />
        <div className="py-1 max-h-[50vh] overflow-y-auto scrollbar-minimal space-y-0.5">
          {standings.map((team) => {
            const isSelected = selectedTeam === team.id
            const teamObj = teams[team.id]

            return (
              <DropdownMenuItem
                key={team.id}
                className={cn(
                  "cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-[background-color,color,transform] duration-150 group active:scale-[0.98]",
                  isSelected && "bg-white/[0.08]"
                )}
                onClick={() => handleTeamSelect(team.id)}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                  <img
                    src={getProxyImageUrl(teamObj?.logo?.url)}
                    alt=""
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-zinc-200 group-hover:text-white">
                    {teamObj?.name || team.name}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}