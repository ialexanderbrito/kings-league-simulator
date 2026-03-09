"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TeamStanding } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { Heart } from "lucide-react"

interface DisplayStanding extends TeamStanding {
  penaltyWins?: number
  penaltyLosses?: number
  regularWins?: number
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
    return String(favoriteTeam?.id) === String(teamId);
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
    // Positions 2 through 7 -> Quartas
    if (positionInGroup >= 2 && positionInGroup <= 7) {
      return { label: 'Quartas', bg: 'var(--team-primary)', color: '#000' }
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
                      <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal py-3" title="Posição">P</TableHead>
                      <TableHead className="w-8 px-0"></TableHead>
                      <TableHead className="text-xs text-muted-foreground font-normal py-3">TIME</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-16 py-3" title="Pontos">PTS</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell" title="Partidas Jogadas">PJ</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3" title="Vitórias no Match Ball (tempo regulamentar)">VMB</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3 hidden sm:table-cell" title="Vitórias no Shootout (empate no tempo regulamentar)">VSO</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3" title="Derrotas">D</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell" title="Gols Pró (marcados)">GP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell" title="Gols Contra (sofridos)">GC</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell" title="Saldo de Gols">SG</TableHead>
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
                              <Heart className="w-4 h-4 text-[var(--team-primary)]" fill="currentColor" />
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
                                <img src={getProxyImageUrl(typeof team.logo === 'string' ? team.logo : team.logo.url)} alt={team.name} className="h-6 w-6 rounded-full flex-shrink-0 team-logo" crossOrigin="anonymous" />
                              )}
                              <div className="truncate team-container">
                                <span>{team.name}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-[var(--team-primary,var(--team-primary))] text-sm py-2 w-16">{team.points}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">{team.played ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 w-10">{team.regularWins ?? (team.won - (team.penaltyWins ?? 0))}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-10">{team.penaltyWins ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 w-10">{team.lost ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalsFor ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalsAgainst ?? 0}</TableCell>
                          <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">{team.goalDifference ?? (team.goalsFor - team.goalsAgainst)}</TableCell>
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
            <span>Semi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "var(--team-primary)" }}></span>
            <span>Quartas</span>
          </div>

          {favoriteTeam && (
            <div className="flex items-center gap-1.5">
              <Heart className="w-2.5 h-2.5 text-[var(--team-primary)] flex-shrink-0" fill="currentColor" />
              <span>Seu time do coração</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda da Tabela</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span><strong className="text-foreground">PTS</strong> – Pontos</span>
          <span><strong className="text-foreground">PJ</strong> – Partidas Jogadas</span>
          <span><strong className="text-foreground">VMB</strong> – Vitórias no Match Ball</span>
          <span><strong className="text-foreground">VSO</strong> – Vitórias no Shootout</span>
          <span><strong className="text-foreground">D</strong> – Derrotas</span>
          <span><strong className="text-foreground">GP</strong> – Gols Pró</span>
          <span><strong className="text-foreground">GC</strong> – Gols Contra</span>
          <span><strong className="text-foreground">SG</strong> – Saldo de Gols</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
          <p><strong className="text-foreground">Match Ball</strong> – Vitória no tempo regulamentar (3 pontos)</p>
          <p><strong className="text-foreground">Shootout</strong> – Quando o jogo empata, o vencedor do Shootout ganha 1 ponto</p>
        </div>
      </div>
    </div>
  );
}

