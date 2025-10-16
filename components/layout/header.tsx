import { useState, useEffect } from "react"
import { Menu, X, Share2, Trophy, Heart, ChevronDown, Home, Shield } from "lucide-react"
import { Link as LinkIcon } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team, TeamStanding } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { useToast } from "@/hooks/use-toast"
import { FavoriteTeamModal } from "@/components/favorite-team-modal"
import { RemoveFavoriteTeamModal } from "@/components/remove-favorite-team-modal"

interface HeaderProps {
  loading: boolean
  selectedTeam: string | null
  teams: Record<string, Team>
  standings: TeamStanding[]
  onTeamSelect: (teamId: string) => void
  setActiveTab: (tab: "matches" | "team") => void
}

export function Header({ loading, selectedTeam, teams, standings, onTeamSelect, setActiveTab }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { favoriteTeam, setFavoriteTeam } = useTeamTheme()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Menu para mobile */}
              <Button
                id="menu-button"
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 h-10 w-10 rounded-lg hover:bg-muted"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Abrir menu"
                aria-expanded={isSidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo */}
              <Link
                href="/"
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0"
                onClick={handleLogoClick}
                aria-label="Ir para página inicial"
              >
                <div className="relative overflow-hidden rounded-md">
                  <KingsLeagueLogo
                    width={36}
                    height={52}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--team-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    <span className="text-[var(--team-primary)]">Kings</span> League
                  </h1>
                  <p className="text-xs text-muted-foreground">Simulador</p>
                </div>
              </Link>

              {/* Navegação desktop */}
              {!loading && (
                <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Navegação principal">
                  <Link
                    href="/simulator"
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted",
                      pathname === "/simulator"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={pathname === "/simulator" ? "page" : undefined}
                  >
                    <Home className="w-4 h-4" />
                    <span>Simulador</span>
                  </Link>
                  <Link
                    href="/standings"
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted",
                      pathname === "/standings"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={pathname === "/standings" ? "page" : undefined}
                  >
                    <Trophy className="w-4 h-4 text-[var(--team-primary)]" />
                    <span>Classificação</span>
                  </Link>
                  <Link
                    href="/teams"
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted",
                      pathname === "/teams"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={pathname === "/teams" ? "page" : undefined}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Times</span>
                  </Link>
                  {/* <Link
                    href="/playoffs"
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted",
                      pathname === "/playoffs"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={pathname === "/playoffs" ? "page" : undefined}
                  >
                    <svg className="w-4 h-4 text-[var(--team-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span>Playoffs</span>
                  </Link> */}
                </nav>
              )}
            </div>

            {!loading && (
              <div className="flex items-center gap-2 shrink-0">
                <ShareButton />
                <TeamSelector
                  selectedTeam={selectedTeam}
                  teams={teams}
                  standings={standings}
                  onTeamSelect={handleTeamSelect}
                  favoriteTeam={favoriteTeam}
                  setFavoriteTeam={setFavoriteTeam}
                  showToast={toast}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar mobile - Overlay com backdrop blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      >
        <aside
          id="mobile-sidebar"
          className={cn(
            "fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl overflow-y-auto transition-transform duration-300 ease-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Menu lateral"
        >
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              onClick={handleLogoClick}
              aria-label="Ir para página inicial"
            >
              <div className="relative overflow-hidden rounded-md">
                <KingsLeagueLogo
                  width={32}
                  height={46}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  <span className="text-[var(--team-primary)]">Kings</span> League
                </h1>
                <p className="text-xs text-muted-foreground">Simulador</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-9 w-9 hover:bg-muted"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navegação */}
          <div className="p-4 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-2">
                Navegação
              </h2>
              <div className="space-y-1">
                <Link
                  href="/simulator"
                  className={cn(
                    "w-full py-2.5 px-3 flex items-center gap-3 text-sm rounded-lg transition-colors font-medium",
                    pathname === "/simulator"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={pathname === "/simulator" ? "page" : undefined}
                >
                  <Home className="w-5 h-5 shrink-0" />
                  <span>Simulador</span>
                </Link>

                <Link
                  href="/standings"
                  className={cn(
                    "w-full py-2.5 px-3 flex items-center gap-3 text-sm rounded-lg transition-colors font-medium",
                    pathname === "/standings"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={pathname === "/standings" ? "page" : undefined}
                >
                  <Trophy className="w-5 h-5 shrink-0 text-[var(--team-primary)]" />
                  <span>Classificação</span>
                </Link>

                <Link
                  href="/teams"
                  className={cn(
                    "w-full py-2.5 px-3 flex items-center gap-3 text-sm rounded-lg transition-colors font-medium",
                    pathname === "/teams"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={pathname === "/teams" ? "page" : undefined}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Times</span>
                </Link>

                {/* <Link
                  href="/playoffs"
                  className={cn(
                    "w-full py-2.5 px-3 flex items-center gap-3 text-sm rounded-lg transition-colors font-medium",
                    pathname === "/playoffs"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={pathname === "/playoffs" ? "page" : undefined}
                >
                  <svg className="w-5 h-5 shrink-0 text-[var(--team-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Playoffs</span>
                </Link> */}
              </div>
            </div>

            {/* Times */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-2">
                Times
              </h2>
              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
                {standings.map((team) => (
                  <button
                    key={team.id}
                    className={cn(
                      "w-full py-2.5 px-3 text-sm flex items-center gap-2.5 transition-colors justify-between rounded-lg group",
                      selectedTeam === team.id
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => handleTeamSelect(team.id)}
                    aria-current={selectedTeam === team.id ? "true" : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-border bg-background">
                        <img
                          src={team.logo?.url || "/placeholder-logo.svg"}
                          alt=""
                          width={28}
                          height={28}
                          className="object-contain w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <span className="truncate">{team.name}</span>
                    </div>

                    {favoriteTeam?.id === team.id && (
                      <Heart
                        className="h-4 w-4 text-[var(--team-primary)] shrink-0"
                        fill="currentColor"
                        aria-label="Time favorito"
                      />
                    )}
                  </button>
                ))}
              </div>
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
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted transition-colors rounded-lg h-10 w-10"
          aria-label="Compartilhar site"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 bg-card border-border shadow-xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Compartilhar
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {[
          {
            name: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "facebook"
          },
          {
            name: "Twitter",
            href: `https://twitter.com/intent/tweet?text=🔥 Simule os resultados da Kings League Brasil! Teste suas previsões e veja como fica a tabela de classificação 🏆⚽ &url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "twitter"
          },
          {
            name: "WhatsApp",
            href: `https://wa.me/?text=🏆 *Simulador Kings League Brasil!* Acabei de testar este simulador de resultados da liga! Confira: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`,
            icon: "whatsapp"
          },
          {
            name: "Copiar link",
            action: "copy",
            icon: "link"
          }
        ].map((item) => (
          <DropdownMenuItem
            key={item.name}
            className="cursor-pointer flex items-center gap-2.5 hover:bg-muted focus:bg-muted py-2.5"
            onClick={() => {
              if (item.action === "copy") {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app');
              } else if (item.href) {
                window.open(item.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {item.icon === "facebook" && <FacebookLogo weight="fill" className="w-4 h-4" />}
            {item.icon === "twitter" && <XLogo weight="fill" className="w-4 h-4" />}
            {item.icon === "whatsapp" && <WhatsappLogo weight="fill" className="w-4 h-4" />}
            {item.icon === "link" && <LinkIcon className="w-4 h-4" />}
            <span className="text-sm">{item.name}</span>
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
      // Remover time favorito, abrir modal de confirmação
      setRemoveModalOpen(true);
      return;
    }

    // Adicionar ou trocar o time favorito
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
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-card border-border hover:bg-muted transition-all duration-200 h-10 px-3 text-sm shadow-sm"
            aria-label={favoriteTeam ? `Time selecionado: ${favoriteTeam.name}` : selectedTeam ? `Time selecionado: ${teams[selectedTeam].name}` : "Selecionar time"}
          >
            {favoriteTeam ? (
              <>
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-background ring-1 ring-[#F4AF23]/50 shadow-sm">
                  <img
                    src={favoriteTeam.logo?.url || "/placeholder-logo.svg"}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain w-full h-full p-0.5"
                    loading="lazy"
                  />
                </div>
                <span className="truncate max-w-[100px] text-foreground hidden sm:inline font-medium">
                  {favoriteTeam.name}
                </span>
                <Heart className="w-3.5 h-3.5 text-[#F4AF23] shrink-0" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              </>
            ) : selectedTeam ? (
              <>
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-background ring-1 ring-border">
                  <img
                    src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain w-full h-full p-0.5"
                    loading="lazy"
                  />
                </div>
                <span className="truncate max-w-[100px] text-foreground hidden sm:inline">
                  {teams[selectedTeam].name}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-[#F4AF23] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline text-muted-foreground">Times</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 bg-card border-border shadow-xl" align="end" sideOffset={8}>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center justify-between">
            <span>Escolha seu time</span>
            <span className="text-[10px] font-normal normal-case text-muted-foreground/60">
              {standings.length} times
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <div className="h-[62vh]  py-1">
            {standings.map((team) => {
              const isFavorite = favoriteTeam?.id === team.id
              const isSelected = selectedTeam === team.id

              return (
                <DropdownMenuItem
                  key={team.id}
                  className={cn(
                    "cursor-pointer flex items-center gap-3 hover:bg-muted focus:bg-muted justify-between py-2.5 px-3 mx-1 rounded-md transition-colors group",
                    isSelected && "bg-muted/50",
                    isFavorite && "bg-[#F4AF23]/5 hover:bg-[#F4AF23]/10"
                  )}
                  onClick={() => handleTeamSelect(team.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-background ring-1 transition-all",
                      isFavorite ? "ring-[#F4AF23]/50 shadow-sm shadow-[#F4AF23]/20" : "ring-border"
                    )}>
                      <img
                        src={teams[team.id].logo?.url || "/placeholder-logo.svg"}
                        alt=""
                        width={36}
                        height={36}
                        className="object-contain w-full h-full p-1"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "truncate text-sm font-medium",
                        isFavorite && "text-[#F4AF23]"
                      )}>
                        {teams[team.id].name}
                      </p>
                      {isFavorite && (
                        <p className="text-[10px] text-muted-foreground">Seu favorito</p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 p-0 rounded-lg hover:bg-background/80 shrink-0 transition-all",
                      isFavorite && "text-[#F4AF23] hover:text-[#F4AF23]/80"
                    )}
                    onClick={(e) => handleFavoriteButtonClick(teams[team.id], e)}
                    aria-label={isFavorite ? `Remover ${teams[team.id].name} dos favoritos` : `Adicionar ${teams[team.id].name} aos favoritos`}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-all",
                        isFavorite && "scale-110"
                      )}
                      fill={isFavorite ? "currentColor" : "none"}
                      strokeWidth={isFavorite ? 0 : 2}
                    />
                  </Button>
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