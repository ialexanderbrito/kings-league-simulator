import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Info, TableIcon } from "lucide-react"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import TeamInfo from "@/components/team-info"
import { Team, Round, TeamStanding } from "@/types/kings-league"
import { useRouter } from "next/navigation"

interface MainContentProps {
  rounds: Round[]
  teams: Record<string, Team>
  standings: TeamStanding[]
  previousStandings: TeamStanding[]
  selectedTeam: string | null
  onTeamSelect: (teamId: string) => void
  onScoreUpdate: (roundId: number, matchId: number, homeScore: number | null, awayScore: number | null, homeShootoutScore?: number, awayShootoutScore?: number) => void
  activeTab: 'matches' | 'team'
  setActiveTab: (tab: 'matches' | 'team') => void
}

export function MainContent({
  rounds,
  teams,
  standings,
  previousStandings,
  selectedTeam,
  onTeamSelect,
  onScoreUpdate,
  activeTab = "matches",
  setActiveTab
}: MainContentProps) {
  const router = useRouter()

  useEffect(() => {
    if (selectedTeam) {
      setActiveTab("team")
    }
  }, [selectedTeam, setActiveTab])

  const handleTeamSelect = (teamId: string) => {
    // Apenas redirecione para a página do time sem alterar a aba
    // O componente da página específica lidará com a exibição correta
    router.push(`/team/${teamId}`)

    // Chamamos onTeamSelect depois porque pode ser usado para outras finalidades
    // como rastreamento ou outras ações necessárias
    onTeamSelect(teamId)
  }

  return (
    <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'matches' | 'team')} className="w-full">
      <TabsContent value="matches" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,420px] gap-4 lg:gap-6">
          <MatchesTable rounds={rounds} teams={teams} onScoreUpdate={onScoreUpdate} />

          <div className="space-y-6">
            <Card className="bg-card border-border shadow-lg overflow-hidden lg:sticky lg:top-6">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2.5 text-foreground">
                  <div className="p-1.5 rounded-md bg-[var(--team-primary)]/10">
                    <TableIcon className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
                  </div>
                  <span className="font-bold">Classificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <StandingsTable
                  standings={standings}
                  onTeamSelect={handleTeamSelect}
                  previousStandings={previousStandings}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>


    </Tabs>
  )
}