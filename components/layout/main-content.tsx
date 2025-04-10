import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Info, TableIcon } from "lucide-react"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import TeamInfo from "@/components/team-info"
import { Team, Round, TeamStanding } from "@/types/kings-league"

interface MainContentProps {
  rounds: Round[]
  teams: Record<string, Team>
  standings: TeamStanding[]
  previousStandings: TeamStanding[]
  selectedTeam: string | null
  onTeamSelect: (teamId: string) => void
  onScoreUpdate: (roundId: number, matchId: number, homeScore: number | null, awayScore: number | null, homeShootoutScore?: number, awayShootoutScore?: number) => void
}

export function MainContent({
  rounds,
  teams,
  standings,
  previousStandings,
  selectedTeam,
  onTeamSelect,
  onScoreUpdate
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedTeam ? "team" : "matches")

  useEffect(() => {
    if (selectedTeam) {
      setActiveTab("team")
    }
  }, [selectedTeam])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#1a1a1a]">
        <TabsTrigger
          value="matches"
          className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
        >
          <Calendar className="w-4 h-4" />
          <span>Partidas</span>
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
          disabled={!selectedTeam}
        >
          <Info className="w-4 h-4" />
          <span>Time</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matches" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
          <MatchesTable rounds={rounds} teams={teams} onScoreUpdate={onScoreUpdate} />

          <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden lg:sticky lg:top-6">
              <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                  <TableIcon className="w-4 h-4 text-[#F4AF23]" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <StandingsTable
                  standings={standings}
                  onTeamSelect={onTeamSelect}
                  previousStandings={previousStandings}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="team" className="mt-0">
        {selectedTeam && <TeamInfo team={teams[selectedTeam]} rounds={rounds} teams={teams} />}
      </TabsContent>
    </Tabs>
  )
}