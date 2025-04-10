import { useState } from "react"
import { Share2, Trophy, Link } from "lucide-react"
import { XLogo, FacebookLogo, WhatsappLogo } from '@phosphor-icons/react'
import Image from "next/image"
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
}

export function Header({ loading, selectedTeam, teams, standings, onTeamSelect }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-black/90 via-black/85 to-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#222]/30 shadow-sm transition-all duration-300">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-md">
              <KingsLeagueLogo
                width={42}
                height={60}
                className="transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F4AF23]/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F4AF23] to-[#F7D380] bg-clip-text text-transparent">
                Kings League
              </h1>
              <p className="text-xs text-gray-400 -mt-1">Simulador</p>
            </div>
          </div>

          {!loading && (
            <div className="flex items-center gap-2">
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
          className="bg-black/50 border border-[#333]/60 hover:bg-[#252525] transition-colors rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Compartilhar site"
        >
          <Share2 className="h-4 w-4 text-[#F4AF23]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-[#1a1a1a] border-[#333] text-white" align="end">
        <DropdownMenuLabel className="text-xs font-normal text-gray-400 uppercase tracking-wider">Compartilhar</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#333]" />
        {[
          { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "facebook" },
          { name: "Twitter", href: `https://twitter.com/intent/tweet?text=🔥 Simule os resultados da Kings League Brasil! Teste suas previsões e veja como fica a tabela de classificação 🏆⚽ &url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "twitter" },
          { name: "WhatsApp", href: `https://wa.me/?text=🏆 *Simulador Kings League Brasil!* Acabei de testar este simulador de resultados da liga! Confira: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app')}`, icon: "whatsapp" },
          { name: "Copiar link", action: "copy", icon: "link" }
        ].map((item) => (
          <DropdownMenuItem
            key={item.name}
            className="cursor-pointer flex items-center gap-2 hover:bg-[#252525] focus:bg-[#252525]"
            onClick={() => {
              if (item.action === "copy") {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : 'https://kings-league-simulator.vercel.app');
              } else if (item.href) {
                window.open(item.href, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#252525]">
              {item.icon === "facebook" && <FacebookLogo className="h-3.5 w-3.5 text-blue-400" />}
              {item.icon === "twitter" && <XLogo className="h-3.5 w-3.5 text-white" />}
              {item.icon === "whatsapp" && <WhatsappLogo className="h-3.5 w-3.5 text-green-400" />}
              {item.icon === "link" && <Link className="h-3.5 w-3.5 text-gray-400" />}
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
        <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-black/50 border-[#333] hover:bg-[#252525] hover:border-[#444] transition-all duration-200">
          {selectedTeam ? (
            <>
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#333] bg-black/30">
                <Image
                  src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                  alt={teams[selectedTeam].name}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="truncate max-w-[120px]">{teams[selectedTeam].name}</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#F4AF23]" />
              Selecionar Time
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-[#333] text-white" align="end">
        <DropdownMenuLabel className="text-xs font-normal text-gray-400 uppercase tracking-wider">Times</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#333]" />
        <div className="max-h-[60vh] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          {standings.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className={cn(
                "cursor-pointer flex items-center gap-2 hover:bg-[#252525] focus:bg-[#252525]",
                selectedTeam === team.id && "bg-[#252525] font-medium"
              )}
              onClick={() => onTeamSelect(team.id)}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/30 ring-1 ring-[#333]">
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
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-[#252525] transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {selectedTeam ? (
          <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-[#333] bg-black/30">
            <Image
              src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
              alt={teams[selectedTeam].name}
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
        ) : (
          <Trophy className="h-5 w-5 text-[#F4AF23]" />
        )}
      </Button>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-16 right-4 w-64 bg-gradient-to-b from-[#1a1a1a] to-[#151515] border border-[#333] rounded-lg shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#333] bg-black/30">
              Times
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {standings.map((team) => (
                <button
                  key={team.id}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors",
                    selectedTeam === team.id ? "bg-[#252525]" : "hover:bg-[#252525]/70"
                  )}
                  onClick={() => {
                    onTeamSelect(team.id)
                    setIsMenuOpen(false)
                  }}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#333] bg-black/30">
                    <Image
                      src={team.logo?.url || "/placeholder-logo.svg"}
                      alt={team.name}
                      width={24}
                      height={24}
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