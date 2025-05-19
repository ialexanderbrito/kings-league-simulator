import React from "react";
import { PlayoffMatch, Team } from "@/types/kings-league";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MatchScoreInput } from "@/components/matches/match-score-input";
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
  let winner = null;
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
    <Card className={cn(
      "w-full bg-[#252525] border-[#333] hover:border-[#444] transition-colors",
      isFavoriteTeamMatch && "bg-[var(--team-primary)]/10 border-[var(--team-primary)]/30"
    )}>
      <CardContent className={`p-4 ${isFinished ? 'opacity-50' : ''}`}>
        <div className="grid grid-cols-[minmax(0,1.2fr),auto,minmax(0,1.2fr)] sm:grid-cols-[minmax(0,1.5fr),auto,minmax(0,1.5fr)] items-center gap-2 md:gap-4 w-full">
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
            <div className="flex items-center gap-2 justify-end mt-4">
              <div className="flex-1 text-right">
                <p className="font-medium text-gray-400 text-xs sm:text-sm truncate">A definir</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#333] rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                ?
              </div>
            </div>
          )}

          <div className="flex flex-col items-center px-1 sm:px-2">
            {/* Placa: Fase do playoff */}
            <div className="text-[10px] sm:text-xs text-gray-400 mb-1 text-center">
              {stage === 'quarterfinal' ? 'Quartas de Final' :
                stage === 'semifinal' ? 'Semifinal' : 'Final'}
            </div>

            {isLive && (
              <Badge className="mb-2 bg-red-600 text-white hover:bg-red-700 animate-pulse">
                Ao Vivo
              </Badge>
            )}

            {/* Área de placar com opacidade reduzida se o jogo estiver encerrado */}
            <div className={`flex flex-col items-center gap-2 ${isFinished ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-1">
                <MatchScoreInput
                  value={currentScores.home}
                  onScoreChange={(value, isBackspace) => {
                    if (!isFinished) {
                      onScoreChange(match.id, "home", value, isBackspace);
                    }
                  }}
                  currentValue={currentScores.home}
                  teamName={homeTeam?.name || "Time da casa"}
                  disabled={isFinished}
                />
                <span className="text-gray-400">:</span>
                <MatchScoreInput
                  value={currentScores.away}
                  onScoreChange={(value, isBackspace) => {
                    if (!isFinished) {
                      onScoreChange(match.id, "away", value, isBackspace);
                    }
                  }}
                  currentValue={currentScores.away}
                  teamName={awayTeam?.name || "Time visitante"}
                  disabled={isFinished}
                />
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
                      if (!isFinished) {
                        onShootoutWinnerSelect(match.id, winner);
                      }
                    }}
                    disabled={isFinished}
                  />
                )}
            </div>
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
            <div className="flex items-center gap-2 justify-start mt-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#333] rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                ?
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-medium text-gray-400 text-xs sm:text-sm truncate">A definir</p>
              </div>
            </div>
          )}
        </div>

        {/* Link do YouTube na parte inferior do card, seguindo o padrão do sistema */}
        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 py-2 flex items-center justify-center gap-2 text-[var(--team-primary)] text-xs rounded-b-md"
          >
            <Youtube className="w-3 h-3" />
            <span>Assistir</span>
          </a>
        )}
      </CardContent>
    </Card>
  );
}