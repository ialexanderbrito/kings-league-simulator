"use client"

import type { TeamStanding } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { ChevronUp, ChevronDown, Star } from "lucide-react"

interface GroupedStandings {
  groupName: string;
  standings: TeamStanding[];
}

interface StandingsTableProps {
  groupedStandings: GroupedStandings[];
  onTeamSelect: (teamId: string) => void;
  previousStandings?: TeamStanding[];
}


export default function StandingsTable(props: StandingsTableProps) {
  const { groupedStandings, onTeamSelect, previousStandings } = props;
  const { favoriteTeam } = useTeamTheme();

  // Identifica o vencedor do grupo 'Challenger' e encontra em qual grupo esse time aparece
  const challengerWinnerId = groupedStandings.find(g => g.groupName === 'Challenger')?.standings?.[0]?.id
  const challengerWinnerIdStr = challengerWinnerId !== undefined && challengerWinnerId !== null ? String(challengerWinnerId) : undefined
  const winnerGroupName = challengerWinnerIdStr
    ? groupedStandings.find(g => g.groupName !== 'Challenger' && g.standings.some(s => String((s as any).id) === challengerWinnerIdStr))?.groupName
    : undefined


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

  // Retorna a cor para a posição com base nas regras
  // 1º -> Semifinal (verde)
  // 2º ao 7º -> Quartas (amarelo)
  // 4º -> manter destaque laranja quando aplicável
  const getPositionStyle = (groupName: string, positionInGroup: number) => {
    if (positionInGroup === 1) {
      return { bg: 'bg-emerald-500', text: 'text-white' }
    }
    if (positionInGroup >= 2 && positionInGroup <= 7) {
      return { bg: 'bg-[#F4AF23]', text: 'text-black' }
    }
    if (positionInGroup === 4) {
      return { bg: 'bg-orange-500', text: 'text-white' }
    }
    return null
  }


  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeam?.id === teamId;
  };

  return (
    <div className="space-y-4">
      {groupedStandings.map((group) => {
        const isChallenger = group.groupName === 'Challenger';

        return (
          <div key={group.groupName} className="space-y-2">
            {/* Group Header */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2",
              isChallenger && "border-l-2 border-emerald-500"
            )}>
              <span className="text-sm font-semibold text-white">
                Grupo {group.groupName}
              </span>
              {isChallenger && (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Challenger
                </span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-[32px_1fr_40px_32px_32px] sm:grid-cols-[40px_1fr_48px_40px_40px] gap-1 px-3 py-2 text-[10px] sm:text-xs text-gray-500 font-medium border-b border-white/5">
                <div className="text-center">#</div>
                <div>Time</div>
                <div className="text-center">Pts</div>
                <div className="text-center hidden xs:block">J</div>
                <div className="text-center hidden xs:block">SG</div>
              </div>

              {/* Team Rows */}
              <div className="divide-y divide-white/5">
                {group.standings.map((team, index) => {
                  const positionInGroup = index + 1;
                  const positionChange = getPositionChange(team, index, previousStandings, group.groupName);
                  const posStyle = getPositionStyle(group.groupName, positionInGroup);
                  const isFavorite = isFavoriteTeam(team.id);

                  return (
                    <div
                      key={team.id}
                      onClick={() => onTeamSelect(team.id)}
                      className={cn(
                        "grid grid-cols-[32px_1fr_40px_32px_32px] sm:grid-cols-[40px_1fr_48px_40px_40px] gap-1 px-3 py-2.5 items-center",
                        "cursor-pointer transition-all duration-200",
                        "hover:bg-white/5",
                        isFavorite && "bg-[var(--team-primary)]/5 border-l-2 border-[var(--team-primary)]"
                      )}
                    >
                      {/* Position */}
                      <div className="flex items-center justify-center">
                        {posStyle ? (
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            posStyle.bg, posStyle.text
                          )}>
                            {positionInGroup}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">{positionInGroup}</span>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="flex items-center gap-2 min-w-0">
                        {team.logo && (
                          <img
                            src={getProxyImageUrl(typeof team.logo === 'string' ? team.logo : team.logo.url)}
                            alt={team.name}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-contain flex-shrink-0 bg-white/5"
                            crossOrigin="anonymous"
                          />
                        )}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={cn(
                            "text-xs sm:text-sm font-medium truncate",
                            isFavorite ? "text-[var(--team-primary)]" : "text-white"
                          )}>
                            {team.name}
                          </span>
                          {isFavorite && (
                            <Star className="w-3 h-3 text-[#F4AF23] fill-[#F4AF23] flex-shrink-0" />
                          )}
                          {positionChange && (
                            <span className={cn(
                              "flex items-center text-[10px] font-semibold flex-shrink-0",
                              positionChange.direction === "up" ? "text-emerald-400" : "text-red-400"
                            )}>
                              {positionChange.direction === "up" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                              {positionChange.value}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-center">
                        <span className="text-sm sm:text-base font-bold text-[#F4AF23]">
                          {team.points}
                        </span>
                      </div>

                      {/* Games Played */}
                      <div className="text-center hidden xs:block">
                        <span className="text-xs text-gray-400">
                          {team.played ?? 0}
                        </span>
                      </div>

                      {/* Goal Difference */}
                      <div className="text-center hidden xs:block">
                        <span className={cn(
                          "text-xs font-medium",
                          (team.goalDifference ?? (team.goalsFor - team.goalsAgainst)) > 0
                            ? "text-emerald-400"
                            : (team.goalDifference ?? (team.goalsFor - team.goalsAgainst)) < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        )}>
                          {(team.goalDifference ?? (team.goalsFor - team.goalsAgainst)) > 0 ? '+' : ''}
                          {team.goalDifference ?? (team.goalsFor - team.goalsAgainst)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Legend - Simplified */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Semi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F4AF23]"></span>
            <span>Quartas</span>
          </div>

        </div>
      </div>
    </div>
  );
}
