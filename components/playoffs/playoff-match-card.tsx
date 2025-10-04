import React from "react";
import { PlayoffMatch, Team } from "@/types/kings-league";
import { cn } from "@/lib/utils";
import { MatchScoreInput } from "@/components/matches/match-score-input";
import { MatchScoreDisplay } from "@/components/matches/match-score-display";
import { ShootoutSelector } from "@/components/matches/shootout-selector";
import { TeamDisplay } from "@/components/matches/team-display";
import { Badge } from "@/components/ui/badge";
import { Youtube } from "lucide-react";

interface PlayoffMatchCardProps {
  match: PlayoffMatch;
  teams: Record<string, Team>;
  onScoreChange: (
    matchId: string,
    team: "home" | "away",
    value: string,
    isBackspace?: boolean
  ) => void;
  onShootoutWinnerSelect: (
    matchId: string,
    winner: "home" | "away" | null
  ) => void;
  currentScores: {
    home: string;
    away: string;
    shootoutWinner: "home" | "away" | null;
  };
  showShootout: boolean;
  stage: "quarterfinal" | "semifinal" | "final";
  favoriteTeam?: Team | null;
  isLive?: boolean;
  youtubeUrl?: string; // URL para assistir a partida no YouTube
}

export function PlayoffMatchCard({
  match,
  teams,
  onScoreChange,
  onShootoutWinnerSelect,
  currentScores,
  showShootout,
  stage,
  favoriteTeam,
  isLive = false,
  youtubeUrl
}: PlayoffMatchCardProps) {
  const homeTeam = match.homeTeamId ? teams[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? teams[match.awayTeamId] : null;

  // Verificar se algum dos times da partida é o time favorito
  const isFavoriteTeamMatch = favoriteTeam && (
    (homeTeam && favoriteTeam.id === homeTeam.id) ||
    (awayTeam && favoriteTeam.id === awayTeam.id)
  );

  // Determinar qual lado é o time favorito (para destacar o lado)
  const isHomeFavorite: boolean | undefined = favoriteTeam && homeTeam ? favoriteTeam.id === homeTeam.id : undefined;
  const isAwayFavorite: boolean | undefined = favoriteTeam && awayTeam ? favoriteTeam.id === awayTeam.id : undefined;

  // Determinar vencedor da partida
  let winner: 'home' | 'away' | null = null;
  if (match.homeScore !== null && match.awayScore !== null) {
    if (match.homeScore > match.awayScore) {
      winner = 'home';
    } else if (match.awayScore > match.homeScore) {
      winner = 'away';
    } else if (match.homeScoreP !== null && match.awayScoreP !== null) {
      winner = match.homeScoreP > match.awayScoreP ? 'home' : 'away';
    }
  }

  // Verificar se o jogo já foi encerrado (tem vencedor definido)
  const isFinished = match.winnerId !== null;

  return (
    <article
      className={cn(
        "rounded-xl p-4 border transition-all duration-200",
        "hover:shadow-md",
        isFavoriteTeamMatch
          ? "bg-[var(--team-primary)]/5 border-[var(--team-primary)]/30 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/10"
          : "bg-card border-border hover:border-border/80",
        isFinished && "opacity-60"
      )}
      aria-label={homeTeam && awayTeam ? `Partida: ${homeTeam.name} vs ${awayTeam.name}` : "Partida dos playoffs"}
    >
      <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Time da casa */}
        {homeTeam ? (
          <TeamDisplay
            team={homeTeam}
            isWinner={winner === 'home'}
            position="left"
            showShootout={showShootout}
            isFavorite={isHomeFavorite}
          />
        ) : (
          <div className="flex items-center gap-2 justify-end">
            <div className="flex-1 text-right">
              <p className="font-medium text-muted-foreground text-xs sm:text-sm truncate">A definir</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground flex-shrink-0">
              ?
            </div>
          </div>
        )}

        <div className="flex flex-col items-center px-2 sm:px-3 min-w-[80px] sm:min-w-[100px]">
          {/* Badge de Ao Vivo */}
          {isLive && (
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

          {/* Placa: Fase do playoff */}
          <div className="text-xs text-muted-foreground mb-2 text-center font-medium">
            {stage === 'quarterfinal' ? 'Quartas de Final' :
              stage === 'semifinal' ? 'Semifinal' : 'Final'}
          </div>

          {/* Área de placar */}
          {isFinished ? (
            <MatchScoreDisplay
              homeScore={match.homeScore}
              awayScore={match.awayScore}
              homeScorePenalty={match.homeScoreP}
              awayScorePenalty={match.awayScoreP}
              winner={winner}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <div className={cn(
                  "rounded-lg",
                  winner === 'home' && "ring-2 ring-green-500 ring-offset-1 ring-offset-background"
                )}>
                  <MatchScoreInput
                    value={currentScores.home}
                    onScoreChange={(value, isBackspace) => {
                      onScoreChange(match.id, "home", value, isBackspace);
                    }}
                    currentValue={currentScores.home}
                    teamName={homeTeam?.name || "Time da casa"}
                  />
                </div>
                <span className="text-gray-400">:</span>
                <div className={cn(
                  "rounded-lg",
                  winner === 'away' && "ring-2 ring-green-500 ring-offset-1 ring-offset-background"
                )}>
                  <MatchScoreInput
                    value={currentScores.away}
                    onScoreChange={(value, isBackspace) => {
                      onScoreChange(match.id, "away", value, isBackspace);
                    }}
                    currentValue={currentScores.away}
                    teamName={awayTeam?.name || "Time visitante"}
                  />
                </div>
              </div>

              {currentScores.home === currentScores.away &&
                currentScores.home !== "" &&
                currentScores.away !== "" &&
                showShootout && (
                  <ShootoutSelector
                    homeTeamShortName={homeTeam?.shortName || "Casa"}
                    awayTeamShortName={awayTeam?.shortName || "Visitante"}
                    selectedWinner={currentScores.shootoutWinner}
                    onWinnerSelect={(winner) => {
                      onShootoutWinnerSelect(match.id, winner);
                    }}
                  />
                )}
            </div>
          )}

          {/* Link do YouTube */}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={homeTeam && awayTeam ? `Assistir partida no YouTube: ${homeTeam.name} vs ${awayTeam.name}` : "Assistir partida no YouTube"}
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
        {awayTeam ? (
          <TeamDisplay
            team={awayTeam}
            isWinner={winner === 'away'}
            position="right"
            showShootout={showShootout}
            isFavorite={isAwayFavorite}
          />
        ) : (
          <div className="flex items-center gap-2 justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground flex-shrink-0">
              ?
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-medium text-muted-foreground text-xs sm:text-sm truncate">A definir</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}