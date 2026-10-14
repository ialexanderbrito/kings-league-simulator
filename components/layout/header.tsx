"use client"

import { useState, useEffect, useMemo } from "react"
import { Menu, X, Trophy, Home, Sparkles, Users, ChevronRight, ListOrdered, Image } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team, TeamStanding } from "@/types/kings-league"
import { useToast } from "@/hooks/use-toast"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { useLeague } from "@/contexts/league-context"
import { LeagueSelector } from "./league-selector"
import { LanguageSelector } from "./language-selector"
import { useLocale } from "@/contexts/locale-context"

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

  const { selectedLeague, selectedSeasonId } = useLeague()
  const { t } = useLocale()

  // Pré-aquecimento das rotas principais para transição instantânea mesmo no 3G
  useEffect(() => {
    const routes = selectedLeague.id === "brazil"
      ? ["/simulator", "/standings", "/12a0", "/teams", "/tier-list"]
      : ["/simulator", "/standings", "/teams", "/tier-list"]
    routes.forEach((route) => {
      try {
        router.prefetch(route)
      } catch {}
    })
  }, [router, selectedLeague.id])

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

  const navItems = useMemo(() => {
    const items: Array<{ href: string; label: string; icon: React.ElementType }> = [
      { href: "/simulator", label: t.nav.simulator, icon: Home },
      { href: "/standings", label: t.nav.standings, icon: Trophy },
      { href: "/teams", label: t.nav.teams, icon: Users },
      { href: "/tier-list", label: t.nav.tierList, icon: ListOrdered },
    ]
    if (selectedLeague.id === "brazil") {
      items.splice(2, 0, { href: "/12a0", label: t.nav.special, icon: Sparkles })
    }
    return items
  }, [selectedLeague.id, t])

  // Fallback: se o app não passou `teams` ou `standings`, buscar da API interna via cache
  const [fetchedTeamsMap, setFetchedTeamsMap] = useState<Record<string, Team> | null>(null)
  const [fetchedStandings, setFetchedStandings] = useState<TeamStanding[] | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadTeams() {
      try {
        const leagueData = await fetchLeagueData({
          seasonId: selectedSeasonId,
          competitionId: selectedLeague.competitionId,
        })
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
  }, [selectedSeasonId, selectedLeague.competitionId])

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
                    aria-label={t.accessibility.openMenu}
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
                    aria-label={t.accessibility.home}
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
                        {t.nav.simulator}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Centro: Navegação Flutuante Minimalista (Sem bordas aninhadas) */}
                <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label={t.accessibility.mainNav}>
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
                    <LeagueSelector />
                    <LanguageSelector />
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
          aria-label={t.accessibility.sidebar}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              onClick={handleLogoClick}
              aria-label={t.accessibility.home}
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <KingsLeagueLogo size={26} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-1">
                  <span className="text-[var(--team-primary)]">Kings</span>
                  <span>League</span>
                </h1>
                <p className="text-[10px] text-zinc-500 font-medium">{t.common.officialSimulator}</p>
              </div>
            </Link>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.97] transition-[background-color,color,transform] duration-150"
              onClick={() => setIsSidebarOpen(false)}
              aria-label={t.accessibility.closeMenu}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto scrollbar-minimal p-4 space-y-6">
            {/* Seletor de Liga no Mobile */}
            <div>
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 px-2">
                {t.league.active}
              </h2>
              <div className="px-2">
                <LeagueSelector />
                <div className="mt-2">
                  <LanguageSelector />
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div>
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 px-2">
                {t.accessibility.mainNav}
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
                <span>{t.teams.league}</span>
                <span className="text-zinc-600 font-normal">{standingsToUse.length} {t.teams.count}</span>
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
              <span className="text-xs text-zinc-400">{selectedLeague.name} • {t.nav.simulator}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
