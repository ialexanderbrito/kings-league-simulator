import { FC } from "react";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShootoutSelectorProps {
  homeTeamShortName: string;
  awayTeamShortName: string;
  selectedWinner: "home" | "away" | null;
  onWinnerSelect: (winner: "home" | "away" | null) => void;
}

export const ShootoutSelector: FC<ShootoutSelectorProps> = ({
  homeTeamShortName,
  awayTeamShortName,
  selectedWinner,
  onWinnerSelect,
}) => {
  return (
    <div className="flex gap-1 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "w-4 h-4 rounded-full border transition-colors",
                selectedWinner === "home"
                  ? "bg-green-600 border-green-500"
                  : "bg-[#333] border-[#555] hover:bg-[#444]"
              )}
              onClick={() => onWinnerSelect(selectedWinner === "home" ? null : "home")}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{homeTeamShortName} vence nos pênaltis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Trophy className="w-4 h-4 text-[#F4AF23] mx-1" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "w-4 h-4 rounded-full border transition-colors",
                selectedWinner === "away"
                  ? "bg-green-600 border-green-500"
                  : "bg-[#333] border-[#555] hover:bg-[#444]"
              )}
              onClick={() => onWinnerSelect(selectedWinner === "away" ? null : "away")}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{awayTeamShortName} vence nos pênaltis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};