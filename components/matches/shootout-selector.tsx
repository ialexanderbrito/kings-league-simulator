import { FC } from "react";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShootoutSelectorProps {
  homeTeamShortName: string;
  awayTeamShortName: string;
  selectedWinner: "home" | "away" | null;
  onWinnerSelect: (winner: "home" | "away" | null) => void;
  disabled?: boolean;
}

export const ShootoutSelector: FC<ShootoutSelectorProps> = ({
  homeTeamShortName,
  awayTeamShortName,
  selectedWinner,
  onWinnerSelect,
  disabled = false
}) => {
  return (
    <div className="flex gap-2 items-center px-3 py-2 rounded-lg bg-muted/50 border border-border/50" role="group" aria-label="Seletor de vencedor nos pênaltis">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background",
                selectedWinner === "home"
                  ? "bg-green-600 border-green-500 shadow-md shadow-green-600/30 scale-110"
                  : "bg-card border-border hover:bg-accent hover:border-border/80 hover:scale-105",
                disabled && "opacity-60 cursor-not-allowed hover:scale-100"
              )}
              onClick={() => !disabled && onWinnerSelect(selectedWinner === "home" ? null : "home")}
              disabled={disabled}
              aria-label={`${homeTeamShortName} vence nos pênaltis`}
              aria-pressed={selectedWinner === "home"}
            >
              {selectedWinner === "home" && (
                <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
            <p className="text-xs font-medium">{homeTeamShortName} vence nos pênaltis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-1 px-2">
        <Trophy className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground">Pênaltis</span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background",
                selectedWinner === "away"
                  ? "bg-green-600 border-green-500 shadow-md shadow-green-600/30 scale-110"
                  : "bg-card border-border hover:bg-accent hover:border-border/80 hover:scale-105",
                disabled && "opacity-60 cursor-not-allowed hover:scale-100"
              )}
              onClick={() => !disabled && onWinnerSelect(selectedWinner === "away" ? null : "away")}
              disabled={disabled}
              aria-label={`${awayTeamShortName} vence nos pênaltis`}
              aria-pressed={selectedWinner === "away"}
            >
              {selectedWinner === "away" && (
                <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
            <p className="text-xs font-medium">{awayTeamShortName} vence nos pênaltis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};