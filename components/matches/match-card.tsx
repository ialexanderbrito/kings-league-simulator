import { FC } from "react";
import { Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { Round, Team } from "@/types/kings-league";
import { TeamDisplay } from "./team-display";
import { MatchScoreDisplay } from "./match-score-display";
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
    value: string,
    isBackspace?: boolean
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

  const homeScore = match.scores.homeScore;
  const awayScore = match.scores.awayScore;
  const shootoutWinner = currentScores.shootoutWinner;

  // Verificar se algum dos times da partida é o time favorito
  const isFavoriteTeamMatch = favoriteTeam && (
    favoriteTeam.id === homeTeam.id ||
    favoriteTeam.id === awayTeam.id
  );

  // Determinar qual lado é o time favorito (para destacar o lado)
  const isHomeFavorite = favoriteTeam?.id === homeTeam.id;
  const isAwayFavorite = favoriteTeam?.id === awayTeam.id;

  let winner = null;
  if (homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) {
      winner = 'home';
    } else if (awayScore > homeScore) {
      winner = 'away';
    } else if (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) {
      winner = match.scores.homeScoreP > match.scores.awayScoreP ? 'home' : 'away';
    }
  }

  return (
    <div className={cn(
      "rounded-md p-3 border transition-colors",
      isFavoriteTeamMatch
        ? "bg-[var(--team-primary)]/10 border-[var(--team-primary)] hover:border-[var(--team-primary)]"
        : "bg-[#252525] border-[#333] hover:border-[#444]"
    )}>
      <div className="grid grid-cols-[minmax(0,1.2fr),auto,minmax(0,1.2fr)] sm:grid-cols-[minmax(0,1.5fr),auto,minmax(0,1.5fr)] items-center gap-2 md:gap-4 w-full">
        {/* Time da casa */}
        <TeamDisplay
          team={homeTeam}
          isWinner={winner === 'home'}
          position="left"
          showShootout={showShootout}
          isFavorite={isHomeFavorite}
        />

        {/* Placar */}
        <div className="flex flex-col items-center px-1 sm:px-2">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-1 text-center flex items-center gap-1">
            {formatDate(match.date)}
          </div>

          {isMatchEnded ? (
            <MatchScoreDisplay
              homeScore={homeScore}
              awayScore={awayScore}
              homeScorePenalty={match.scores.homeScoreP}
              awayScorePenalty={match.scores.awayScoreP}
              winner={winner}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <MatchScoreInput
                  value={currentScores.home}
                  onScoreChange={(value, isBackspace) => {
                    onScoreChange(round.id, match.id, "home", value, isBackspace);
                  }}
                  currentValue={currentScores.home}
                  teamName={homeTeam.name}
                />
                <span className="text-gray-400">:</span>
                <MatchScoreInput
                  value={currentScores.away}
                  onScoreChange={(value, isBackspace) => {
                    onScoreChange(round.id, match.id, "away", value, isBackspace);
                  }}
                  currentValue={currentScores.away}
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
            </div>
          )}

          {/* Link do YouTube */}
          {match.metaInformation?.youtube_url && (
            <a
              href={match.metaInformation.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#F4AF23] hover:underline text-[10px] sm:text-xs mt-1"
            >
              <Youtube className="w-3 h-3" />
              <span>Assistir</span>
            </a>
          )}
        </div>

        {/* Time visitante */}
        <TeamDisplay
          team={awayTeam}
          isWinner={winner === 'away'}
          position="right"
          showShootout={showShootout}
          isFavorite={isAwayFavorite}
        />
      </div>
    </div>
  );
};