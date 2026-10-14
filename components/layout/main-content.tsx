import { TableIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import { Team, Round, TeamStanding } from "@/types/kings-league"
import { useRouter } from "next/navigation"
import type { LeagueQualification } from "@/lib/league-format"
import { useLocale } from "@/contexts/locale-context"

interface MainContentProps {
  rounds: Round[]
  teams: Record<string, Team>
  dataKey?: string
  standings?: TeamStanding[]
  groupedStandings: Array<{ groupName: string; standings: TeamStanding[] }>
  previousStandings: TeamStanding[]
  selectedTeam?: string | null
  onTeamSelect?: (teamId: string) => void
  onScoreUpdate: (roundId: number, matchId: number, homeScore: string | number | null, awayScore: string | number | null, homeShootoutScore?: number, awayShootoutScore?: number) => void
  activeTab?: 'matches' | 'team'
  setActiveTab?: (tab: 'matches' | 'team') => void
  showPlayoffs?: boolean
  onTogglePlayoffs?: () => void
  playoffs?: any[]
  playInRounds?: Round[]
  qualification?: LeagueQualification
  leagueId?: string
}

export function MainContent({
  rounds,
  teams,
  dataKey,
  standings,
  groupedStandings,
  previousStandings,
  selectedTeam,
  onTeamSelect,
  onScoreUpdate,
  activeTab = "matches",
  setActiveTab,
  showPlayoffs,
  onTogglePlayoffs,
  playoffs,
  playInRounds,
  qualification,
  leagueId,
}: MainContentProps) {
  const router = useRouter()
  const { t } = useLocale()
  const hasLiveMatches = rounds.some((round) => round.matches.some((match) => {
    const status = String(match.status || "").toLowerCase()
    return status.includes("inplay") || status.includes("live") || status.includes("in_progress")
  }))
  const hasStandings = groupedStandings.some((group) => group.standings.length > 0)

  const handleTeamSelect = (teamId: string) => {
    router.push(`/team/${teamId}`)
    onTeamSelect?.(teamId)
  }

  return (
    <div className="w-full">
        <div
          id="simulation-content"
          className={cn(
            "grid grid-cols-1 gap-4 sm:gap-6 items-start",
            showPlayoffs
              ? "xl:grid-cols-1"
              : "lg:grid-cols-[1fr,390px] xl:grid-cols-[1fr,440px]"
          )}
        >
          {/* Matches Section */}
          <div
            id="matches-section"
            className={cn(
              "relative rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#09090d]/90 backdrop-blur-md shadow-2xl p-2.5 sm:p-4",
              showPlayoffs && "w-full"
            )}
          >
            {/* Linha de acento dourada sutil no topo do card */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />
            <MatchesTable 
              rounds={rounds} 
              teams={teams} 
              dataKey={dataKey}
              standings={standings}
              onScoreUpdate={onScoreUpdate} 
              showPlayoffs={showPlayoffs}
              onTogglePlayoffs={onTogglePlayoffs}
              playoffs={playoffs}
              playInRounds={playInRounds}
              leagueId={leagueId}
            />
          </div>

          {/* Standings Section */}
          {!showPlayoffs ? (
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="relative rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#09090d] shadow-2xl divide-y divide-zinc-800/60">
              {/* Linha de acento dourada sutil no topo do card */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />

              {/* Header com estilo oficial de transmissão */}
              <div className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 bg-[#07070b] border-b border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 shadow-sm shadow-[var(--team-primary,#F4AF23)]/10">
                    <TableIcon className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">{t.nav.standings}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800">{t.common.regularPhase}</span>
                  </div>
                </div>

                {/* Badge Ao Vivo */}
                {hasLiveMatches && <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{t.common.live}</span>
                </div>}
              </div>

              {/* Content */}
              <div className="p-0">
                {hasStandings ? (
                  <StandingsTable
                    groupedStandings={groupedStandings}
                    onTeamSelect={handleTeamSelect}
                    previousStandings={previousStandings}
                    rounds={rounds}
                    qualification={qualification}
                  />
                ) : (
                  <div className="px-5 py-9 text-center sm:py-12">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                      <TableIcon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                    </div>
                    <p className="mx-auto max-w-xs text-xs leading-5 text-zinc-400">
                      {t.ui.standingsWaiting}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          ) : null}
          </div>
        </div>
  )
}
