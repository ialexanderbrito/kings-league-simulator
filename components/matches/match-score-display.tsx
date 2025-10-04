import { FC } from "react";
import { cn } from "@/lib/utils";

interface MatchScoreDisplayProps {
  homeScore: number | null;
  awayScore: number | null;
  homeScorePenalty: number | null;
  awayScorePenalty: number | null;
  winner: 'home' | 'away' | null;
}

export const MatchScoreDisplay: FC<MatchScoreDisplayProps> = ({
  homeScore,
  awayScore,
  homeScorePenalty,
  awayScorePenalty,
  winner,
}) => {
  return (
    <div className="flex flex-col items-center" role="status" aria-live="polite">
      <div className="flex items-center justify-center gap-2">
        <div className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-bold text-base sm:text-lg",
          "bg-muted border-2 border-border text-foreground",
          "transition-colors duration-200",
          winner === 'home' && "bg-green-600/20 border-green-500 text-green-500"
        )}
          aria-label={`Placar casa: ${homeScore}`}
        >
          {homeScore}
        </div>
        <span className="text-muted-foreground font-bold text-lg" aria-hidden="true">×</span>
        <div className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-bold text-base sm:text-lg",
          "bg-muted border-2 border-border text-foreground",
          "transition-colors duration-200",
          winner === 'away' && "bg-green-600/20 border-green-500 text-green-500"
        )}
          aria-label={`Placar visitante: ${awayScore}`}
        >
          {awayScore}
        </div>
      </div>

      {homeScorePenalty !== null && awayScorePenalty !== null && (
        <div
          className="flex items-center mt-2 px-2 py-1 rounded-md bg-muted/50 border border-border/50"
          aria-label="Resultado dos pênaltis"
        >
          <span className="text-xs text-muted-foreground font-medium mr-1">Pên:</span>
          <span className={cn(
            "text-xs font-semibold",
            homeScorePenalty > awayScorePenalty ? "text-green-500" : "text-muted-foreground"
          )}>
            {homeScorePenalty}
          </span>
          <span className="text-muted-foreground mx-1 text-xs">×</span>
          <span className={cn(
            "text-xs font-semibold",
            awayScorePenalty > homeScorePenalty ? "text-green-500" : "text-muted-foreground"
          )}>
            {awayScorePenalty}
          </span>
        </div>
      )}
    </div>
  );
};