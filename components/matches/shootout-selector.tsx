import { FC } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Check } from "lucide-react";

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
    <div
      className="flex gap-2 items-center px-3 py-2 rounded-lg bg-white/5 border border-white/10"
      role="group"
      aria-label="Seletor de vencedor nos pênaltis"
    >
      <button
        className={cn(
          "w-6 h-6 rounded-full border transition-all duration-200 flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#F4AF23]/50",
          selectedWinner === "home"
            ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30"
            : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onWinnerSelect(selectedWinner === "home" ? null : "home")}
        disabled={disabled}
        aria-label={`${homeTeamShortName} vence nos pênaltis`}
        aria-pressed={selectedWinner === "home"}
        title={`${homeTeamShortName} vence nos pênaltis`}
      >
        {selectedWinner === "home" && (
          <Check className="w-4 h-4 text-white" aria-hidden="true" />
        )}
      </button>

      <div className="flex items-center gap-1.5 px-1.5">
        <Trophy className="w-3.5 h-3.5 text-[#F4AF23]" aria-hidden="true" />
        <span className="text-xs font-medium text-gray-400">Pênaltis</span>
      </div>

      <button
        className={cn(
          "w-6 h-6 rounded-full border transition-all duration-200 flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#F4AF23]/50",
          selectedWinner === "away"
            ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30"
            : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onWinnerSelect(selectedWinner === "away" ? null : "away")}
        disabled={disabled}
        aria-label={`${awayTeamShortName} vence nos pênaltis`}
        aria-pressed={selectedWinner === "away"}
        title={`${awayTeamShortName} vence nos pênaltis`}
      >
        {selectedWinner === "away" && (
          <Check className="w-4 h-4 text-white" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};