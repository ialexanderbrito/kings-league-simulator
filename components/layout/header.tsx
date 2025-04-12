import { useState } from "react"
import { Share2, Trophy, Heart } from "lucide-react"
import { Link as LinkIcon } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Image from "next/image"
import Link from "next/link"
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { favoriteTeam, setFavoriteTeam } = useTeamTheme()
  const { toast } = useToast()

  const handleLogoClick = () => {
    if (selectedTeam) {
      setActiveTab("matches")
    }
  }

  return (
    <header className="backdrop-blur-md sticky top-0 z-50 border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto py-2.5 px-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            onClick={handleLogoClick}
          >
            <div className="relative overflow-hidden rounded-md">
              <KingsLeagueLogo
                width={36}
                height={52}
                className="transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--team-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                <span className="text-[var(--team-primary)]">Kings</span> League
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">Simulador</p>
            </div>
          </Link>

          {!loading && (
            <div className="flex items-center gap-3">
              <ShareButton />
              <TeamSelector
                selectedTeam={selectedTeam}
                teams={teams}
                standings={standings}
                onTeamSelect={onTeamSelect}
                favoriteTeam={favoriteTeam}
                setFavoriteTeam={setFavoriteTeam}
                showToast={toast}
              />
              <MobileTeamButton
                selectedTeam={selectedTeam}
                teams={teams}
                standings={standings}
                onTeamSelect={onTeamSelect}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                favoriteTeam={favoriteTeam}
                setFavoriteTeam={setFavoriteTeam}
                showToast={toast}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function ShareButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/5 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Compartilhar site"
        >
          <Share2 className="h-4 w-4 text-gray-300 group-hover:text-[var(--team-primary)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-[#0a0a0a] border-white/10 text-white shadow-xl" align="end">
        <DropdownMenuLabel className="text-xs font-normal text-gray-400">Compartilhar</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {[
          { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "facebook" },
          { name: "Twitter", href: `https://twitter.com/intent/tweet?text=🔥 Simule os resultados da Kings League Brasil! Teste suas previsões e veja como fica a tabela de classificação 🏆⚽ &url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "twitter" },
          { name: "WhatsApp", href: `https://wa.me/?text=🏆 *Simulador Kings League Brasil!* Acabei de testar este simulador de resultados da liga! Confira: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "whatsapp" },
          { name: "Copiar link", action: "copy", icon: "link" }
        ].map((item) => (
          <DropdownMenuItem
            key={item.name}
            className="cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5"
            onClick={() => {
              if (item.action === "copy") {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app');
              } else if (item.href) {
                window.open(item.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {item.icon === "facebook" && <FacebookLogo weight="fill" className="w-3.5 h-3.5" />}
            {item.icon === "twitter" && <XLogo weight="fill" className="w-3.5 h-3.5" />}
            {item.icon === "whatsapp" && <WhatsappLogo weight="fill" className="w-3.5 h-3.5" />}
            {item.icon === "link" && <LinkIcon className="w-3.5 h-3.5" />}
            {item.name}
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="hidden sm:flex items-center gap-2 bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200 h-8 px-3 text-sm"
          >
            {favoriteTeam ? (
              <>
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10">
                  <Image
                    src={favoriteTeam.logo?.url || "/placeholder-logo.svg"}
                    alt={favoriteTeam.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="truncate max-w-[120px] text-white">{favoriteTeam.name}</span>
              </>
            ) : selectedTeam ? (

              <>
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10">
                  <Image
                    src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                    alt={teams[selectedTeam].name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="truncate max-w-[120px] text-white">{teams[selectedTeam].name}</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-300">
                <Trophy className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                Selecionar Time
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 text-white shadow-xl" align="end">
          <DropdownMenuLabel className="text-xs font-normal text-gray-400">Times</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="max-h-[60vh] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {standings.map((team) => (
              <DropdownMenuItem
                key={team.id}
                className={cn(
                  "cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5 justify-between",
                  selectedTeam === team.id && "bg-white/5 font-medium"
                )}
                onClick={() => onTeamSelect(team.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10">
                    <Image
                      src={team.logo?.url || "/placeholder-logo.svg"}
                      alt={team.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="truncate">{team.name}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 p-0.5 rounded-full",
                    favoriteTeam?.id === team.id && "text-[var(--team-primary)]"
                  )}
                  onClick={(e) => handleFavoriteButtonClick(teams[team.id], e)}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={favoriteTeam?.id === team.id ? "currentColor" : "none"}
                  />
                </Button>
              </DropdownMenuItem>
            ))}
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

interface MobileTeamButtonProps {
  selectedTeam: string | null
  teams: Record<string, Team>
  standings: TeamStanding[]
  onTeamSelect: (teamId: string) => void
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  favoriteTeam: Team | null
  setFavoriteTeam: (team: Team | null) => void
  showToast: any
}

function MobileTeamButton({ selectedTeam, teams, standings, onTeamSelect, isMenuOpen, setIsMenuOpen, favoriteTeam, setFavoriteTeam, showToast }: MobileTeamButtonProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [pendingTeam, setPendingTeam] = useState<Team | null>(null);

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

  return (
    <>
      <Button
        variant="outline"
        className="sm:hidden flex items-center gap-2 bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200 h-8 px-3 text-sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {favoriteTeam ? (
          <>
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10">
              <Image
                src={favoriteTeam.logo?.url || "/placeholder-logo.svg"}
                alt={favoriteTeam.name}
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="truncate max-w-[120px] text-white">{favoriteTeam.name}</span>
          </>
        ) : selectedTeam ? (
          <>
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10">
              <Image
                src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                alt={teams[selectedTeam].name}
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="truncate max-w-[120px] text-white">{teams[selectedTeam].name}</span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-gray-300">
            <Trophy className="w-3.5 h-3.5 text-[var(--team-primary)]" />
            Selecionar Time
          </span>
        )}
      </Button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-14 right-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
              Times
            </div>
            <div className="max-h-[70vh] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {standings.map((team) => (
                <button
                  key={team.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors justify-between",
                    selectedTeam === team.id ? "bg-white/5 font-medium" : "hover:bg-white/5 focus:bg-white/5"
                  )}
                  onClick={() => {
                    onTeamSelect(team.id)
                    setIsMenuOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10 bg-black/50">
                      <Image
                        src={team.logo?.url || "/placeholder-logo.svg"}
                        alt={team.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="truncate">{team.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 p-0.5 rounded-full",
                      favoriteTeam?.id === team.id && "text-[var(--team-primary)]"
                    )}
                    onClick={(e) => handleFavoriteButtonClick(teams[team.id], e)}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={favoriteTeam?.id === team.id ? "currentColor" : "none"}
                    />
                  </Button>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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