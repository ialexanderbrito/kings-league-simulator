import { FC } from "react";
import { Radio, Star, Trophy } from "lucide-react";
import { cn, getProxyImageUrl } from "@/lib/utils";
import { Round, Team } from "@/types/kings-league";
import { MatchScoreInput } from "./match-score-input";
import { ShootoutSelector } from "./shootout-selector";

interface MatchCardProps {
  match: Round["matches"][0];
  round: Round;
  teams: Record<string, Team>;
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
  favoriteTeam?: Team | null;
}

export const MatchCard: FC<MatchCardProps> = ({
  match,
  round,
  teams,
  formatDate,
  currentScores,
  showShootout,
  onScoreChange,
  onShootoutWinnerSelect,
  favoriteTeam
}) => {
  const homeTeam = teams[match.participants.homeTeamId];
  const awayTeam = teams[match.participants.awayTeamId];
  const isMatchEnded = match.status === "ended";
  const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

  const homeScore = match.scores.homeScore;
  const awayScore = match.scores.awayScore;
  const shootoutWinner = currentScores.shootoutWinner;

  const isFavoriteTeamMatch = favoriteTeam && (
    favoriteTeam.id === homeTeam.id || favoriteTeam.id === awayTeam.id
  );
  const isHomeFavorite = favoriteTeam?.id === homeTeam.id;
  const isAwayFavorite = favoriteTeam?.id === awayTeam.id;

  // Determinar vencedor para destacar
  let winner: 'home' | 'away' | null = null;
  if (homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = 'home';
    else if (awayScore > homeScore) winner = 'away';
    else if (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) {
      winner = match.scores.homeScoreP > match.scores.awayScoreP ? 'home' : 'away';
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border overflow-hidden transition-all duration-300 group",
        isFavoriteTeamMatch
          ? "bg-gradient-to-b from-[var(--team-primary)]/10 to-[#0a0a0a] border-[var(--team-primary)]/30"
          : "bg-gradient-to-b from-[#151515] to-[#0a0a0a] border-white/5 hover:border-white/10",
        isMatchEnded && "opacity-60"
      )}
    >
      {/* Header com data e badges */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <time className="text-[11px] text-gray-500 font-medium">
          {formatDate(match.date)}
        </time>

        <div className="flex items-center gap-2">
          {isLiveMatch && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
              <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-red-400">AO VIVO</span>
            </span>
          )}
          {isMatchEnded && (
            <span className="text-[10px] text-gray-600 font-medium">ENCERRADO</span>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-4">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">

          {/* Time da Casa */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-2 transition-all duration-300",
                winner === 'home'
                  ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.1)] ring-2 ring-[rgba(var(--team-primary-rgb,244,175,35),0.3)]"
                  : "bg-white/5 group-hover:bg-white/[0.07]"
              )}>
                <img
                  src={getProxyImageUrl(homeTeam.logo?.url)}
                  alt={homeTeam.name}
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              {isHomeFavorite && (
                <Star className="absolute -top-1 -right-1 w-4 h-4 text-[var(--team-primary,#F4AF23)] fill-[var(--team-primary,#F4AF23)]" />
              )}
              {winner === 'home' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Trophy className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-semibold text-center transition-colors",
              winner === 'home' ? "text-[var(--team-primary,#F4AF23)]" : "text-white"
            )}>
              {homeTeam.shortName}
            </span>
          </div>

          {/* Placar Central */}
          <div className="flex flex-col items-center gap-2">
            {isMatchEnded ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-lg sm:text-xl font-bold transition-all",
                    winner === 'home'
                      ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.2)] text-[var(--team-primary,#F4AF23)]"
                      : "bg-white/5 text-white"
                  )}>
                    {homeScore}
                  </span>
                  <span className="text-gray-600 font-medium">×</span>
                  <span className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-lg sm:text-xl font-bold transition-all",
                    winner === 'away'
                      ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.2)] text-[var(--team-primary,#F4AF23)]"
                      : "bg-white/5 text-white"
                  )}>
                    {awayScore}
                  </span>
                </div>
                {match.scores.homeScoreP !== null && match.scores.awayScoreP !== null && (
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    SO: {match.scores.homeScoreP} - {match.scores.awayScoreP}
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <MatchScoreInput
                    value={currentScores.home}
                    onScoreChange={(value) => {
                      onScoreChange(round.id, match.id, "home", value);
                    }}
                    teamName={homeTeam.name}
                  />
                  <span className="text-gray-600 font-medium">×</span>
                  <MatchScoreInput
                    value={currentScores.away}
                    onScoreChange={(value) => {
                      onScoreChange(round.id, match.id, "away", value);
                    }}
                    teamName={awayTeam.name}
                  />
                </div>

                {currentScores.home === currentScores.away && showShootout && (
                  <ShootoutSelector
                    homeTeamShortName={homeTeam.shortName}
                    awayTeamShortName={awayTeam.shortName}
                    selectedWinner={shootoutWinner as "home" | "away" | null}
                    onWinnerSelect={(winner) =>
                      onShootoutWinnerSelect(round.id, match.id, winner)
                    }
                  />
                )}
              </>
            )}
          </div>

          {/* Time Visitante */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-2 transition-all duration-300",
                winner === 'away'
                  ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.1)] ring-2 ring-[rgba(var(--team-primary-rgb,244,175,35),0.3)]"
                  : "bg-white/5 group-hover:bg-white/[0.07]"
              )}>
                <img
                  src={getProxyImageUrl(awayTeam.logo?.url)}
                  alt={awayTeam.name}
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              {isAwayFavorite && (
                <Star className="absolute -top-1 -right-1 w-4 h-4 text-[var(--team-primary,#F4AF23)] fill-[var(--team-primary,#F4AF23)]" />
              )}
              {winner === 'away' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Trophy className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-semibold text-center transition-colors",
              winner === 'away' ? "text-[var(--team-primary,#F4AF23)]" : "text-white"
            )}>
              {awayTeam.shortName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

