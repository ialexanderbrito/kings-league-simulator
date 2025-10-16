import { FC } from "react";
import { Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { Round, Team } from "@/types/kings-league";
import { TeamDisplay } from "./team-display";
import { MatchScoreDisplay } from "./match-score-display";
import { MatchScoreInput } from "./match-score-input";
import { ShootoutSelector } from "./shootout-selector";
import { Badge } from "@/components/ui/badge";

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
  const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

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

  // Normalizar e determinar o grupo da partida
  const rawGroupName = (match as any).groupName ?? (match as any).group ?? null;
  const groupName = rawGroupName !== undefined && rawGroupName !== null ? String(rawGroupName) : null;
  const isChallengerMatch = groupName?.toLowerCase() === 'challenger';

  let winner: 'home' | 'away' | null = null;
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
    <article
      className={cn(
        "rounded-xl p-4 border transition-all duration-200",
        "hover:shadow-md",
        isFavoriteTeamMatch
          ? "bg-[var(--team-primary)]/5 border-[var(--team-primary)]/30 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/10"
          : "bg-card border-border hover:border-border/80",
        // destaque visual para partidas do Challenger
        isChallengerMatch && "border-green-300/40 hover:border-green-300/60",
        isMatchEnded && "opacity-60"
      )}
      aria-label={`Partida: ${homeTeam.name} vs ${awayTeam.name}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)]  gap-3 sm:gap-4 md:gap-6 w-full items-end">
        {/* Time da casa */}
        <TeamDisplay
          team={homeTeam}
          isWinner={winner === 'home'}
          position="left"
          showShootout={showShootout}
          isFavorite={isHomeFavorite}
        />

        {/* Placar */}
        <div className="flex flex-col items-center px-2 sm:px-3 min-w-[80px] sm:min-w-[100px]">
          {isLiveMatch && (
            <Badge
              className="mb-1.5 bg-red-600 text-white text-[10px] sm:text-xs py-1 px-2 h-auto flex items-center gap-1.5 hover:bg-red-600 shadow-md shadow-red-600/20"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-semibold">AO VIVO</span>
            </Badge>
          )}
          {/* Badge especial para partidas Challenger */}
          {isChallengerMatch && (
            <Badge className="mb-1.5 bg-green-100 text-green-800 text-[10px] sm:text-xs py-1 px-2 h-auto flex items-center gap-1.5 shadow-sm">
              <span className="font-semibold">CHALLENGER</span>
            </Badge>
          )}


          {groupName && (() => {
            // Normalizar nome do grupo para checar apenas A ou B
            const normalized = String(groupName).trim().toUpperCase().replace(/^GRUPO\s*/i, '');
            if (normalized === 'A' || normalized === 'B') {
              return (
                <div className="mb-1">
                  <p className={cn(
                    "text-[10px] sm:text-xs py-1 px-2 h-auto flex items-center gap-1.5 bg-[var(--team-primary)]/10 text-[var(--team-primary)]",
                  )}>
                    <span className="font-medium">{`Grupo ${normalized}`}</span>
                  </p>
                </div>
              );
            }
            return null;
          })()}
          <time
            className="text-xs text-muted-foreground mb-2 text-center font-medium"
            dateTime={match.date}
          >
            {formatDate(match.date)}
          </time>

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
              aria-label={`Assistir partida no YouTube: ${homeTeam.name} vs ${awayTeam.name}`}
              className={cn(
                "inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full",
                "text-xs font-medium transition-all duration-200",
                "bg-red-600/10 text-red-600 hover:bg-red-600/20 hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-background"
              )}
            >
              <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
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
    </article>
  );
};