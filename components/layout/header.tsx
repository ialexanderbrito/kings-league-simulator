import { useState } from "react"
import { Share2, Trophy } from "lucide-react"
import { Link as LinkIcon } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Team, TeamStanding } from "@/types/kings-league"

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

  const handleLogoClick = () => {
    if (selectedTeam) {
      setActiveTab("matches")
      onTeamSelect("");
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
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F4AF23]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                <span className="text-[#F4AF23]">Kings</span> League
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
              />
              <MobileTeamButton
                selectedTeam={selectedTeam}
                teams={teams}
                standings={standings}
                onTeamSelect={onTeamSelect}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
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
          <Share2 className="h-4 w-4 text-gray-300 group-hover:text-[#F4AF23]" />
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
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5">
              {item.icon === "facebook" && <FacebookLogo className="h-3.5 w-3.5 text-blue-400" />}
              {item.icon === "twitter" && <XLogo className="h-3.5 w-3.5 text-white" />}
              {item.icon === "whatsapp" && <WhatsappLogo className="h-3.5 w-3.5 text-green-400" />}
              {item.icon === "link" && <LinkIcon className="h-3.5 w-3.5 text-gray-400" />}
            </div>
            <span className="truncate">{item.name}</span>
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200 h-8 px-3 text-sm"
        >
          {selectedTeam ? (
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
              <Trophy className="w-3.5 h-3.5 text-[#F4AF23]" />
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
                "cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5",
                selectedTeam === team.id && "bg-white/5 font-medium"
              )}
              onClick={() => onTeamSelect(team.id)}
            >
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
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface MobileTeamButtonProps extends TeamSelectorProps {
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
}

function MobileTeamButton({ selectedTeam, teams, standings, onTeamSelect, isMenuOpen, setIsMenuOpen }: MobileTeamButtonProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {selectedTeam ? (
          <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/10 bg-black/50">
            <Image
              src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
              alt={teams[selectedTeam].name}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        ) : (
          <Trophy className="h-4 w-4 text-[#F4AF23]" />
        )}
      </Button>

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
            <div className="max-h-[70vh] overflow-y-auto">
              {standings.map((team) => (
                <button
                  key={team.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors",
                    selectedTeam === team.id ? "bg-white/5" : "hover:bg-white/5"
                  )}
                  onClick={() => {
                    onTeamSelect(team.id)
                    setIsMenuOpen(false)
                  }}
                >
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
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}