import { FC } from "react";
import { Radio } from "lucide-react";
import { cn, getProxyImageUrl } from "@/lib/utils";
import { Round, Team } from "@/types/kings-league";
import { MatchScoreInput } from "./match-score-input";
import { ShootoutSelector } from "./shootout-selector";

interface MatchCardProps {
  match: Round["matches"][0];
  round: Round;
  teams: Record<string, Team>;
  teamGroupMap?: Record<string, string>;
  formatDate: (date: string) => string;
  currentScores: {
    home: string;
    away: string;
    shootoutWinner: string | null;
  };
  showShootout: boolean;
  onScoreChange: (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string
  ) => void;
  onShootoutWinnerSelect: (
    roundId: number,
    matchId: number,
    winner: "home" | "away" | null
  ) => void;
}

export const MatchCard: FC<MatchCardProps> = ({
  match,
  round,
  teams,
  teamGroupMap,
  formatDate,
  currentScores,
  showShootout,
  onScoreChange,
  onShootoutWinnerSelect,
}) => {
  const homeTeam = teams[match.participants.homeTeamId];
  const awayTeam = teams[match.participants.awayTeamId];
  const isMatchEnded = match.status === "ended";
  const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

  const homeScore = match.scores.homeScore;
  const awayScore = match.scores.awayScore;
  const shootoutWinner = currentScores?.shootoutWinner ?? null;

  // Determinar grupos dos times e se é partida Challenger (SC)
  const homeGroup = teamGroupMap?.[match.participants.homeTeamId] || (match.groupName === "A" || match.groupName === "B" ? match.groupName : undefined);
  const awayGroup = teamGroupMap?.[match.participants.awayTeamId] || (match.groupName === "A" || match.groupName === "B" ? match.groupName : undefined);

  const hasTwoGroups = Boolean(
    teamGroupMap && Object.values(teamGroupMap).includes("A") && Object.values(teamGroupMap).includes("B")
  );

  const isChallenger =
    hasTwoGroups && (
      match.groupName?.toLowerCase() === "challenger" ||
      match.groupName?.toLowerCase().includes("challenger") ||
      Boolean(homeGroup && awayGroup && homeGroup !== awayGroup && (homeGroup === "A" || homeGroup === "B") && (awayGroup === "A" || awayGroup === "B"))
    );

  const matchGroup = isChallenger
    ? "Challenger"
    : (match.groupName === "A" || match.groupName === "B" ? match.groupName : (hasTwoGroups && homeGroup && homeGroup === awayGroup ? homeGroup : undefined));

  // Determinar vencedor em tempo real com base no placar digitado ou oficial
  const currentHome = currentScores?.home !== "" && currentScores?.home !== undefined ? Number(currentScores.home) : homeScore;
  const currentAway = currentScores?.away !== "" && currentScores?.away !== undefined ? Number(currentScores.away) : awayScore;

  let winner: 'home' | 'away' | null = null;
  if (currentHome !== null && currentAway !== null && !isNaN(currentHome) && !isNaN(currentAway)) {
    if (currentHome > currentAway) winner = 'home';
    else if (currentAway > currentHome) winner = 'away';
    else if (shootoutWinner) {
      winner = shootoutWinner as 'home' | 'away';
    } else if (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) {
      winner = match.scores.homeScoreP > match.scores.awayScoreP ? 'home' : 'away';
    }
  }

  const isTied = currentScores?.home !== "" && 
    currentScores?.away !== "" && 
    currentScores?.home !== undefined && 
    currentScores?.away !== undefined && 
    currentScores.home === currentScores.away;

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-[border-color,box-shadow,background-color] duration-150 group px-2 sm:px-3 py-1.5 sm:py-2",
        isChallenger
          ? "border-2 border-[#34d399] bg-gradient-to-r from-[rgba(52,211,153,0.10)] via-[#0a0a10]/95 to-[rgba(52,211,153,0.10)] shadow-[0_0_22px_rgba(52,211,153,0.28)] ring-1 ring-[#34d399]"
          : winner
            ? "bg-[#0c0c12]/95 backdrop-blur-md border border-zinc-800 shadow-md hover:border-zinc-700"
            : "bg-[#08080c]/80 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700"
      )}
    >
      {/* Header do Card: Identificação do Grupo / Challenger e Status */}
      <div className={cn(
        "flex items-center justify-between gap-1.5 pb-1 mb-1 text-[9px] border-b",
        isChallenger ? "border-[#34d399]/30 text-emerald-400" : "border-zinc-800/60 text-zinc-500"
      )}>
        {isChallenger ? (
          <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[#34d399] bg-[#34d399]/15 border border-[#34d399] text-[8px] sm:text-[9px] animate-pulse">
            Challenger
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/60 border border-zinc-800 text-[8px] sm:text-[9px]">
            {matchGroup === "Playoffs" ? "Playoffs" : (matchGroup === "A" || matchGroup === "B") ? `Grupo ${matchGroup}` : "Fase Regular"}
          </span>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isLiveMatch ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25">
              <Radio className="w-2 h-2 text-red-500 animate-pulse" />
              <span className="text-[8px] font-black tracking-wider text-red-400 uppercase">AO VIVO</span>
            </span>
          ) : isMatchEnded ? (
            <span className={cn(
              "text-[8px] font-mono font-bold uppercase tracking-wider",
              isChallenger ? "text-[#34d399]" : "text-zinc-500"
            )}>
              FIM
            </span>
          ) : (
            <time className={cn(
              "text-[9px] font-mono font-semibold",
              isChallenger ? "text-[#34d399]/90" : "text-zinc-500"
            )}>
              {formatDate(match.date)}
            </time>
          )}
        </div>
      </div>

      {/* Grid Principal: Times e Placar */}
      <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-1.5 sm:gap-3">
        {/* Time da Casa */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-0">
          <div className="flex flex-col items-end min-w-0">
            <span
              className={cn(
                "font-bold text-xs sm:text-sm truncate text-right transition-colors leading-tight",
                winner === "home"
                  ? "text-[var(--team-primary,#F4AF23)] font-black"
                  : "text-zinc-200 group-hover:text-white"
              )}
              title={homeTeam?.name}
            >
              {homeTeam?.name || "Casa"}
            </span>
            {homeGroup && (
              <span className={cn(
                "text-[8px] sm:text-[9px] font-mono font-bold uppercase",
                isChallenger ? "text-[#34d399]" : "text-zinc-500"
              )}>
                Gr. {homeGroup}
              </span>
            )}
          </div>
          <div
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-1 flex-shrink-0 flex items-center justify-center transition-transform duration-150 group-hover:scale-105",
              winner === "home"
                ? "ring-1.5 ring-[var(--team-primary,#F4AF23)]/80 bg-[rgba(var(--team-primary-rgb,244,175,35),0.14)] shadow-[0_0_10px_rgba(244,175,35,0.25)]"
                : isChallenger
                  ? "bg-zinc-900/80 border border-[#34d399]/40"
                  : "bg-zinc-900/60 border border-zinc-800/80"
            )}
          >
            <img
              src={getProxyImageUrl(homeTeam?.logo?.url)}
              alt={homeTeam?.name || ""}
              className="w-full h-full object-contain drop-shadow-sm"
              loading="lazy"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Placar Central com Inputs */}
        <div className="flex flex-col items-center flex-shrink-0 px-0.5 sm:px-1">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <MatchScoreInput
              value={currentScores?.home !== undefined ? currentScores.home : (homeScore !== null ? String(homeScore) : "")}
              onScoreChange={(value) => onScoreChange(round.id, match.id, "home", value)}
              teamName={homeTeam?.name || "Casa"}
            />
            <span className="text-zinc-600 text-xs font-black select-none px-0.5">×</span>
            <MatchScoreInput
              value={currentScores?.away !== undefined ? currentScores.away : (awayScore !== null ? String(awayScore) : "")}
              onScoreChange={(value) => onScoreChange(round.id, match.id, "away", value)}
              teamName={awayTeam?.name || "Fora"}
            />
          </div>
        </div>

        {/* Time Visitante */}
        <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-0">
          <div
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-1 flex-shrink-0 flex items-center justify-center transition-transform duration-150 group-hover:scale-105",
              winner === "away"
                ? "ring-1.5 ring-[var(--team-primary,#F4AF23)]/80 bg-[rgba(var(--team-primary-rgb,244,175,35),0.14)] shadow-[0_0_10px_rgba(244,175,35,0.25)]"
                : isChallenger
                  ? "bg-zinc-900/80 border border-[#34d399]/40"
                  : "bg-zinc-900/60 border border-zinc-800/80"
            )}
          >
            <img
              src={getProxyImageUrl(awayTeam?.logo?.url)}
              alt={awayTeam?.name || ""}
              className="w-full h-full object-contain drop-shadow-sm"
              loading="lazy"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span
              className={cn(
                "font-bold text-xs sm:text-sm truncate text-left transition-colors leading-tight",
                winner === "away"
                  ? "text-[var(--team-primary,#F4AF23)] font-black"
                  : "text-zinc-200 group-hover:text-white"
              )}
              title={awayTeam?.name}
            >
              {awayTeam?.name || "Fora"}
            </span>
            {awayGroup && (
              <span className={cn(
                "text-[8px] sm:text-[9px] font-mono font-bold uppercase",
                isChallenger ? "text-[#34d399]" : "text-zinc-500"
              )}>
                Gr. {awayGroup}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Linha retrátil de Shootout caso placares empatem */}
      {(isTied || showShootout) && (
        <div className={cn(
          "mt-1.5 pt-1 border-t flex items-center justify-center animate-in fade-in zoom-in-95 duration-150",
          isChallenger ? "border-[#34d399]/25" : "border-zinc-800/60"
        )}>
          <ShootoutSelector
            homeTeamShortName={homeTeam?.shortName || homeTeam?.name || "1"}
            awayTeamShortName={awayTeam?.shortName || awayTeam?.name || "2"}
            selectedWinner={shootoutWinner as "home" | "away" | null}
            onWinnerSelect={(w) => onShootoutWinnerSelect(round.id, match.id, w)}
          />
        </div>
      )}
    </div>
  );
};

