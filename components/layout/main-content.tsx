import { useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { TableIcon } from "lucide-react"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import { SimulationCaptureOverlay } from "@/components/simulation-capture-overlay"
import { Team, Round, TeamStanding } from "@/types/kings-league"
import { useRouter } from "next/navigation"
import { useSimulationCapture } from "@/hooks/use-simulation-capture"

interface MainContentProps {
  rounds: Round[]
  teams: Record<string, Team>
  groupedStandings: Array<{ groupName: string; standings: TeamStanding[] }>
  previousStandings: TeamStanding[]
  selectedTeam: string | null
  onTeamSelect: (teamId: string) => void
  onScoreUpdate: (roundId: number, matchId: number, homeScore: string | number | null, awayScore: string | number | null, homeShootoutScore?: number, awayShootoutScore?: number) => void
  activeTab: 'matches' | 'team'
  setActiveTab: (tab: 'matches' | 'team') => void
}

export function MainContent({
  rounds,
  teams,
  groupedStandings,
  previousStandings,
  selectedTeam,
  onTeamSelect,
  onScoreUpdate,
  activeTab = "matches",
  setActiveTab
}: MainContentProps) {
  const router = useRouter()
  const { showCaptureOverlay } = useSimulationCapture()

  useEffect(() => {
    if (selectedTeam) {
      setActiveTab("team")
    }
  }, [selectedTeam, setActiveTab])

  const handleTeamSelect = (teamId: string) => {
    router.push(`/team/${teamId}`)
    onTeamSelect(teamId)
  }


  return (
    <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'matches' | 'team')} className="w-full">
      <TabsContent value="matches" className="mt-0">
        <SimulationCaptureOverlay visible={showCaptureOverlay}>
          <div id="simulation-content" className="grid grid-cols-1 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,500px] gap-6">
            {/* Matches Section */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#111111] border border-white/5">
              <MatchesTable rounds={rounds} teams={teams} onScoreUpdate={onScoreUpdate} />
            </div>

            {/* Standings Section */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="rounded-2xl bg-[#111111] border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#F4AF23]/10 border border-[#F4AF23]/20">
                      <TableIcon className="w-4 h-4 text-[#F4AF23]" aria-hidden="true" />
                    </div>
                    <span className="text-base font-semibold text-white">Classificação</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-0">
                  <StandingsTable
                    groupedStandings={groupedStandings}
                    onTeamSelect={handleTeamSelect}
                    previousStandings={previousStandings}
                  />
                </div>
              </div>
            </div>
          </div>
        </SimulationCaptureOverlay>
      </TabsContent>
    </Tabs>
  )
}