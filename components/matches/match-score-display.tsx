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
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <div className={cn(
          "w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded bg-[#333] font-semibold text-sm sm:text-base",
          winner === 'home' && "bg-green-900/50"
        )}>
          {homeScore}
        </div>
        <span className="text-gray-400 mx-1">:</span>
        <div className={cn(
          "w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded bg-[#333] font-semibold text-sm sm:text-base",
          winner === 'away' && "bg-green-900/50"
        )}>
          {awayScore}
        </div>
      </div>

      {homeScorePenalty !== null && awayScorePenalty !== null && (
        <div className="flex items-center mt-1.5">
          <span className="text-[10px] sm:text-xs text-gray-400 mr-1">(pen</span>
          <span className={cn(
            "text-[10px] sm:text-xs font-medium",
            homeScorePenalty > awayScorePenalty ? "text-green-400" : "text-gray-400"
          )}>
            {homeScorePenalty}
          </span>
          <span className="text-gray-400 mx-0.5">:</span>
          <span className={cn(
            "text-[10px] sm:text-xs font-medium",
            awayScorePenalty > homeScorePenalty ? "text-green-400" : "text-gray-400"
          )}>
            {awayScorePenalty}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400 ml-1">)</span>
        </div>
      )}
    </div>
  );
};