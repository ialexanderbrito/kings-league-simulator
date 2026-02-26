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
          "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg font-bold text-base sm:text-lg",
          "bg-white/5 border border-white/10 text-white",
          "transition-colors duration-200",
          winner === 'home' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}
          aria-label={`Placar casa: ${homeScore}`}
        >
          {homeScore}
        </div>
        <span className="text-gray-600 font-bold text-lg" aria-hidden="true">×</span>
        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg font-bold text-base sm:text-lg",
          "bg-white/5 border border-white/10 text-white",
          "transition-colors duration-200",
          winner === 'away' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}
          aria-label={`Placar visitante: ${awayScore}`}
        >
          {awayScore}
        </div>
      </div>

      {homeScorePenalty !== null && awayScorePenalty !== null && (
        <div
          className="flex items-center mt-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10"
          aria-label="Resultado dos pênaltis"
        >
          <span className="text-xs text-gray-500 font-medium mr-1.5">Pên:</span>
          <span className={cn(
            "text-xs font-semibold",
            homeScorePenalty > awayScorePenalty ? "text-emerald-400" : "text-gray-500"
          )}>
            {homeScorePenalty}
          </span>
          <span className="text-gray-600 mx-1 text-xs">×</span>
          <span className={cn(
            "text-xs font-semibold",
            awayScorePenalty > homeScorePenalty ? "text-emerald-400" : "text-gray-500"
          )}>
            {awayScorePenalty}
          </span>
        </div>
      )}
    </div>
  );
};