"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TeamStanding } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn } from "@/lib/utils"

interface DisplayStanding extends TeamStanding {
  penaltyWins?: number
  penaltyLosses?: number
  regularWins?: number
  scPoints?: number // pontos ganhos contra times de outro grupo (desafio)
  scWins?: number
  scLosses?: number
  scPending?: number
}

interface GroupedStandings {
  groupName: string;
  standings: DisplayStanding[];
}

interface StandingsTableProps {
  groupedStandings: GroupedStandings[];
  onTeamSelect: (teamId: string) => void;
  previousStandings?: TeamStanding[];
  winnerGroupName?: string | undefined;
  winsByGroup?: Record<string, number>;
}

export default function FullStandingsTable(props: StandingsTableProps) {
  const { groupedStandings, onTeamSelect, previousStandings, winsByGroup, winnerGroupName } = props;
  const { favoriteTeam } = useTeamTheme();

  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeam?.id === teamId;
  };

  const getPositionChange = (
    team: TeamStanding,
    currentIndex: number,
    previousStandings?: TeamStanding[],
    groupName?: string
  ) => {
    if (!previousStandings || previousStandings.length === 0) return null;

    const prevGroups: Record<string, TeamStanding[]> = {};
    previousStandings.forEach((t) => {
      const g = (t as any).groupName || (t as any).group || "A";
      if (!prevGroups[g]) prevGroups[g] = [];
      prevGroups[g].push(t);
    });

    const gName = groupName || (team as any).groupName || (team as any).group || "A";
    const prevGroup = prevGroups[gName] || [];

    const previousIndex = prevGroup.findIndex((t) => t.id === team.id);
    if (previousIndex === -1) return null;

    const change = previousIndex - currentIndex;
    if (change === 0) return null;

    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : "down",
    };
  };

  // Mantém a mesma lógica visual do outro componente de standings (padronização)
  const getPositionBadge = (groupName: string, positionInGroup: number) => {
    if (positionInGroup === 1) {
      return { label: 'Semifinal', bg: '#22c55e', color: 'white' }
    }
    if (positionInGroup === 2 || positionInGroup === 3) {
      return { label: 'Quartas', bg: '#F4AF23', color: '#000' }
    }
    if (positionInGroup === 4) {
      if (groupName === winnerGroupName) return { label: 'Quartas', bg: '#fb923c', color: 'white' }
      return { label: '4º Lugar', bg: '#fb923c', color: 'white' }
    }
    return null
  }

  return (
    <div className="space-y-8">
      {groupedStandings.map((group) => {
        return (
          <div key={group.groupName}>
            <div className="flex items-center justify-between mb-2 px-4">
              <span className="text-lg font-bold text-[var(--team-primary)]">
                Grupo {group.groupName}
              </span>

            </div>
            <div className={`bg-card rounded-lg ${group.groupName === 'Challenger' ? 'border-2 border-green-500' : ''}`}>
              <div className="w-full overflow-x-hidden">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-border bg-transparent">
                      <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal py-3">P</TableHead>
                      <TableHead className="w-8 px-0"></TableHead>
                      <TableHead className="text-xs text-muted-foreground font-normal py-3">TIME</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-16 py-3">PTS</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">J</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3">V</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3 hidden sm:table-cell">VP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3 hidden sm:table-cell">DP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3">D</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GC</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">SG</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3">SC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.standings.map((team, index) => {
                      const positionInGroup = index + 1;
                      const positionChange = getPositionChange(team, index, previousStandings, group.groupName);

                      return (
                        <TableRow
                          key={team.id}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-muted/50 border-b border-border",
                            isFavoriteTeam(team.id) && "bg-[var(--team-primary)]/10"
                          )}
                          onClick={() => onTeamSelect(team.id)}
                        >
                          <TableCell className="text-center font-medium py-2 w-12">
                            {(() => {
                              const badge = getPositionBadge(group.groupName, positionInGroup)
                              return (
                                badge ? (
                                  <div
                                    style={{ backgroundColor: badge.bg, color: badge.color }}
                                    className="mx-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                  >
                                    {positionInGroup}
                                  </div>
                                ) : (
                                  <span className="mx-auto text-xs">{positionInGroup}</span>
                                )
                              )
                            })()}
                          </TableCell>

                          <TableCell className="w-8 px-0">
                            {isFavoriteTeam(team.id) && (
                              <span title="Favorito" className="text-yellow-400">★</span>
                            )}
                            {positionChange && (
                              <span
                                className={positionChange.direction === "up" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 20,
                                  height: 20,
                                  borderRadius: 9999,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {positionChange.direction === "up" ? '▲' : '▼'}{positionChange.value}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="py-2">
                            <div className="flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-full">
                              {team.logo && (
                                <img src={typeof team.logo === 'string' ? team.logo : team.logo.url} alt={team.name} className="h-6 w-6 rounded-full flex-shrink-0 team-logo" />
                              )}
                              <div className="truncate team-container">
                                <span>{team.name}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-[#F4AF23] text-sm py-2 w-16">{team.points}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">{team.played ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 w-10">{team.regularWins ?? (team.won - (team.penaltyWins ?? 0))}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-10">{team.penaltyWins ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-10">{team.penaltyLosses ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 w-10">{team.lost ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalsFor ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalsAgainst ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalDifference ?? (team.goalsFor - team.goalsAgainst)}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 w-12">
                            {(() => {
                              const scWins = (team as any).scWins ?? 0
                              const scLosses = (team as any).scLosses ?? 0
                              const scPending = (team as any).scPending ?? 0

                              const label = `SC: ${scWins}V / ${scLosses}D${scPending ? ` / ${scPending} Pendente` : ''}`

                              if (scPending > 0 && scWins === scLosses) {
                                return <span title={label} className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-xs">Pendente</span>
                              }
                              if (scWins > scLosses) {
                                return <span title={label} className="px-2 py-0.5 rounded-full bg-green-600 text-white text-xs">Vitória</span>
                              }
                              if (scLosses > scWins) {
                                return <span title={label} className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs">Derrota</span>
                              }
                              return <span title={label} className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-xs">—</span>
                            })()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between gap-4 px-2 py-2">
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#22c55e" }}></span>
            <span>1º — Semifinal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#F4AF23" }}></span>
            <span>2º e 3º — Quartas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#fb923c" }}></span>
            <span>4º — Quartas (se o grupo for o vencedor do Challenger), caso contrário 4º Lugar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
