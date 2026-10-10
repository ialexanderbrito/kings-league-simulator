"use client"

import type { TeamStanding, Round } from "@/types/kings-league"
import { cn, getProxyImageUrl } from "@/lib/utils"
import { ChevronUp, ChevronDown, Crown } from "lucide-react"
import { useMemo } from "react"
import { determineChallengerAdvantage } from "@/lib/generate-playoff-bracket"

interface GroupedStandings {
  groupName: string;
  standings: TeamStanding[];
}

interface StandingsTableProps {
  groupedStandings: GroupedStandings[];
  onTeamSelect: (teamId: string) => void;
  previousStandings?: TeamStanding[];
  rounds?: Round[];
}


export default function StandingsTable(props: StandingsTableProps) {
  const { groupedStandings, onTeamSelect, previousStandings, rounds } = props;

  const hasTwoGroups = groupedStandings.some(g => g.groupName === 'A') && groupedStandings.some(g => g.groupName === 'B');

  const allStandings = useMemo(() => groupedStandings.flatMap(g => g.standings), [groupedStandings]);

  // Identifica a vantagem do Challenger (SC) na Kings Cup
  const challengerInfo = useMemo(() => {
    if (!hasTwoGroups) return null;
    return determineChallengerAdvantage(rounds, allStandings);
  }, [hasTwoGroups, rounds, allStandings]);

  const advantageGroup = challengerInfo?.advantageGroup || 'A';


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

  // Retorna o estilo visual conforme as regras da Kings Cup:
  // - Grupo com Vantagem SC:
  //   1º -> Semifinal Direta (verde esmeralda)
  //   2º ao 4º -> Playoffs / Quartas (dourado/âmbar)
  //   5º -> Eliminado (vermelho/rosa)
  // - Outro Grupo:
  //   1º ao 3º -> Playoffs / Quartas (dourado/âmbar)
  //   4º e 5º -> Eliminados (vermelho/rosa)
  const getPositionStyle = (groupName: string, positionInGroup: number) => {
    if (hasTwoGroups) {
      const isAdvantageGroup = groupName === advantageGroup;

      if (isAdvantageGroup) {
        if (positionInGroup === 1) {
          return { 
            badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-black',
            border: 'border-l-2 border-emerald-400'
          };
        }
        if (positionInGroup >= 2 && positionInGroup <= 4) {
          return { 
            badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black',
            border: 'border-l-2 border-amber-400'
          };
        }
        if (positionInGroup >= 5) {
          return { 
            badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
            border: 'border-l-2 border-rose-500/40'
          };
        }
      } else {
        if (positionInGroup >= 1 && positionInGroup <= 3) {
          return { 
            badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black',
            border: 'border-l-2 border-amber-400'
          };
        }
        if (positionInGroup >= 4) {
          return { 
            badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
            border: 'border-l-2 border-rose-500/40'
          };
        }
      }
    }

    // Fallback: formato de tabela única (sem grupos)
    if (positionInGroup === 1) {
      return { 
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-black',
        border: 'border-l-2 border-emerald-400'
      };
    }
    if (positionInGroup >= 2 && positionInGroup <= 7) {
      return { 
        badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/15 font-black',
        border: 'border-l-2 border-amber-400'
      };
    }
    if (positionInGroup >= 8) {
      return { 
        badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
        border: 'border-l-2 border-rose-500/40'
      };
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {groupedStandings.map((group) => {
        const isChallenger = group.groupName === 'Challenger';
        const isAdvantageGroup = hasTwoGroups && group.groupName === advantageGroup;

        return (
          <div key={group.groupName} className="space-y-1">
            {groupedStandings.length > 1 && hasTwoGroups && (
              <div className={cn(
                "flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/60",
                isAdvantageGroup && "bg-[#34d399]/[0.04]"
              )}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Grupo {group.groupName}
                  </span>
                  {hasTwoGroups && (
                    isAdvantageGroup ? (
                      <span className="text-[9px] font-black text-[#34d399] bg-[#34d399]/15 px-2 py-0.5 rounded-full border border-[#34d399] flex items-center gap-1 select-none shadow-sm shadow-[#34d399]/25">
                        <Crown className="w-2.5 h-2.5 text-[#34d399]" />
                        <span>Vantagem SC</span>
                        {challengerInfo && (
                          <span className="font-mono opacity-80">({group.groupName === 'A' ? challengerInfo.groupAWins : challengerInfo.groupBWins}V)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-full select-none">
                        3 vagas playoffs
                      </span>
                    )
                  )}
                </div>

                {hasTwoGroups && (
                  <span className="text-[9px] text-zinc-500 font-medium hidden sm:inline">
                    {isAdvantageGroup ? "1º na Semi • 2º-4º nas Quartas" : "1º-3º nas Quartas"}
                  </span>
                )}
              </div>
            )}

            {/* Table */}
            <div className="overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-[28px_1fr_48px_34px_38px] sm:grid-cols-[32px_1fr_54px_38px_42px] gap-1 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-800/80">
                <div className="text-center">#</div>
                <div>Clube</div>
                <div className="text-center">V-D</div>
                <div className="text-center">SG</div>
                <div className="text-center font-bold text-zinc-400">PTS</div>
              </div>

              {/* Team Rows */}
              <div className="divide-y divide-zinc-800/50">
                {group.standings.map((team, index) => {
                  const positionInGroup = index + 1;
                  const positionChange = getPositionChange(team, index, previousStandings, group.groupName);
                  const posStyle = getPositionStyle(group.groupName, positionInGroup);
                  const points = team.points ?? ((team.won ?? 0) * 3);
                  const gd = team.goalDifference ?? ((team.goalsFor ?? 0) - (team.goalsAgainst ?? 0));

                  return (
                    <div
                      key={team.id}
                      onClick={() => onTeamSelect(team.id)}
                      className={cn(
                        "grid grid-cols-[28px_1fr_48px_34px_38px] sm:grid-cols-[32px_1fr_54px_38px_42px] gap-1 px-2.5 sm:px-2.5 py-1.5 sm:py-2 items-center",
                        "cursor-pointer transition-[background-color,border-color] duration-150 group",
                        "hover:bg-white/[0.04] active:bg-white/[0.07]",
                        posStyle?.border
                      )}
                      title={`Ver página do time ${team.name}`}
                    >
                      {/* Position */}
                      <div className="flex items-center justify-center">
                        {posStyle ? (
                          <div className={cn(
                            "w-5 h-5 rounded-lg flex items-center justify-center text-[10px]",
                            posStyle.badge
                          )}>
                            {positionInGroup}
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-bold">{positionInGroup}</span>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        {team.logo && (
                          <img
                            src={getProxyImageUrl(typeof team.logo === 'string' ? team.logo : team.logo.url)}
                            alt=""
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0 drop-shadow-sm"
                            crossOrigin="anonymous"
                          />
                        )}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-sm font-bold truncate text-zinc-200 group-hover:text-white transition-colors">
                            {team.name}
                          </span>
                          {positionChange && (
                            <span className={cn(
                              "flex items-center text-[10px] font-bold flex-shrink-0",
                              positionChange.direction === "up" ? "text-emerald-400" : "text-rose-400"
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

                      {/* Wins - Losses */}
                      <div className="text-center font-mono">
                        <span className="text-xs font-bold text-[var(--team-primary,#F4AF23)] whitespace-nowrap">
                          {`${team.won ?? 0}-${team.lost ?? 0}`}
                        </span>
                      </div>

                      {/* Goal Difference */}
                      <div className="text-center font-mono">
                        <span className={cn(
                          "text-xs font-semibold",
                          gd > 0
                            ? "text-emerald-400"
                            : gd < 0
                              ? "text-rose-400"
                              : "text-zinc-500"
                        )}>
                          {gd > 0 ? `+${gd}` : gd}
                        </span>
                      </div>

                      {/* Points */}
                      <div className="text-center font-mono">
                        <span className="text-xs sm:text-sm font-black text-white">
                          {points}
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

      {/* Legend - Minimalista */}
      <div className="px-3 py-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-3.5 text-[10px] sm:text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-zinc-300 font-semibold">1º Semifinal Direta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          <span className="text-zinc-300 font-semibold">{hasTwoGroups ? "Quartas de Final" : "2º ao 7º Playoffs"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="text-zinc-400 font-medium">Eliminados</span>
        </div>
      </div>
    </div>
  );
}

