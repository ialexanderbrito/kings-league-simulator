import React from "react";
import { PlayoffMatch, Team } from "@/types/kings-league";
import { cn } from "@/lib/utils";
import { TeamDisplay } from "@/components/matches/team-display";
import { Badge } from "@/components/ui/badge";
import { Youtube, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayoffMatchCardProps {
  match: PlayoffMatch;
  teams: Record<string, Team>;
  onWinnerSelect: (
    matchId: string,
    winner: "home" | "away" | null
  ) => void;
  selectedWinner: "home" | "away" | null;
  stage: "quarterfinal" | "semifinal" | "final";
  favoriteTeam?: Team | null;
  isLive?: boolean;
  youtubeUrl?: string;
}

export function PlayoffMatchCard({
  match,
  teams,
  onWinnerSelect,
  selectedWinner,
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

  // Determinar qual lado é o time favorito
  const isHomeFavorite: boolean | undefined = favoriteTeam && homeTeam ? favoriteTeam.id === homeTeam.id : undefined;
  const isAwayFavorite: boolean | undefined = favoriteTeam && awayTeam ? favoriteTeam.id === awayTeam.id : undefined;

  // Verificar se tem vencedor definido
  const hasWinner = selectedWinner !== null;
  const isHomeWinner = selectedWinner === "home";
  const isAwayWinner = selectedWinner === "away";

  return (
    <article
      className={cn(
        "rounded-xl p-3 sm:p-4 border transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        isFavoriteTeamMatch
          ? "bg-[var(--team-primary)]/5 border-[var(--team-primary)]/30 hover:border-[var(--team-primary)]/50 hover:bg-[var(--team-primary)]/10 shadow-md"
          : "bg-card border-border hover:border-border/80",
        hasWinner && "ring-2 ring-green-500/20"
      )}
      aria-label={homeTeam && awayTeam ? `Partida: ${homeTeam.name} vs ${awayTeam.name}` : "Partida dos playoffs"}
    >
      <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Time da casa */}
        {homeTeam ? (
          <div className="flex items-center gap-2 justify-end">
            <TeamDisplay
              team={homeTeam}
              isWinner={isHomeWinner}
              position="left"
              showShootout={false}
              isFavorite={isHomeFavorite}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end mt-4">
            <div className="flex-1 text-right overflow-hidden">
              <p className="font-semibold text-xs sm:text-sm md:text-base truncate max-w-full text-muted-foreground" title="A definir">
                A definir
              </p>
              <p className="text-xs text-muted-foreground hidden md:block truncate mt-0.5">
                TBD
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0 rounded-lg bg-muted/30 p-1.5 border border-border/50 flex items-center justify-center">
              <span className="text-muted-foreground text-lg font-bold">?</span>
            </div>
          </div>
        )}

        {/* Área central - Seletor de vencedor */}
        <div className="flex flex-col items-center px-1 sm:px-2 min-w-[100px] sm:min-w-[120px]">
          {/* Badge de Ao Vivo */}
          {isLive && (
            <Badge
              className="mb-2 bg-red-600 text-white text-[9px] sm:text-xs py-0.5 px-2 h-auto flex items-center gap-1 hover:bg-red-600 shadow-lg shadow-red-600/30 animate-pulse"
              aria-live="polite"
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="font-bold uppercase">Ao Vivo</span>
            </Badge>
          )}

          {/* Placa: Fase do playoff */}
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 text-center font-medium uppercase tracking-wide">
            {stage === 'quarterfinal' ? 'Quartas' :
              stage === 'semifinal' ? 'Semifinal' : 'Final'}
          </div>

          {/* Seletores circulares de vencedor */}
          {homeTeam && awayTeam ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botão Time da Casa */}
              <Button
                onClick={() => onWinnerSelect(match.id, selectedWinner === "home" ? null : "home")}
                variant="outline"
                size="icon"
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 border-2 flex-shrink-0",
                  isHomeWinner
                    ? "bg-green-500 border-green-600 hover:bg-green-600 text-white shadow-lg shadow-green-500/40 scale-110"
                    : "border-border hover:border-[var(--team-primary)] hover:bg-accent hover:scale-105"
                )}
                aria-label={`Selecionar ${homeTeam.name} como vencedor`}
              >
                {isHomeWinner && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" strokeWidth={3} />}
              </Button>

              <span className="text-xs sm:text-sm text-muted-foreground font-bold">VS</span>

              {/* Botão Time Visitante */}
              <Button
                onClick={() => onWinnerSelect(match.id, selectedWinner === "away" ? null : "away")}
                variant="outline"
                size="icon"
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 border-2 flex-shrink-0",
                  isAwayWinner
                    ? "bg-green-500 border-green-600 hover:bg-green-600 text-white shadow-lg shadow-green-500/40 scale-110"
                    : "border-border hover:border-[var(--team-primary)] hover:bg-accent hover:scale-105"
                )}
                aria-label={`Selecionar ${awayTeam.name} como vencedor`}
              >
                {isAwayWinner && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" strokeWidth={3} />}
              </Button>
            </div>
          ) : (
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-medium">
              Aguardando
            </p>
          )}

          {/* Link do YouTube */}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={homeTeam && awayTeam ? `Assistir partida no YouTube: ${homeTeam.name} vs ${awayTeam.name}` : "Assistir partida no YouTube"}
              className={cn(
                "inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full",
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
          <div className="flex items-center gap-2 justify-start">
            <TeamDisplay
              team={awayTeam}
              isWinner={isAwayWinner}
              position="right"
              showShootout={false}
              isFavorite={isAwayFavorite}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-start mt-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0 rounded-lg bg-muted/30 p-1.5 border border-border/50 flex items-center justify-center">
              <span className="text-muted-foreground text-lg font-bold">?</span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="font-semibold text-xs sm:text-sm md:text-base truncate max-w-full text-muted-foreground" title="A definir">
                A definir
              </p>
              <p className="text-xs text-muted-foreground hidden md:block truncate mt-0.5">
                TBD
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
