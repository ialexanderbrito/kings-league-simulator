import { FC } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
      className="inline-flex gap-1.5 items-center px-2 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm select-none"
      role="group"
      aria-label="Seletor de vencedor no Shootout"
    >
      <button
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-lg border flex items-center justify-center btn-press",
          "transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-90",
          "focus:outline-none focus:ring-1 focus:ring-[var(--team-primary,#F4AF23)]/50",
          selectedWinner === "home"
            ? "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/40 font-black"
            : "bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        onClick={() => !disabled && onWinnerSelect(selectedWinner === "home" ? null : "home")}
        disabled={disabled}
        aria-label={`${homeTeamShortName} vence no Shootout`}
        aria-pressed={selectedWinner === "home"}
        title={`${homeTeamShortName} vence no Shootout`}
      >
        {selectedWinner === "home" ? (
          <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
        ) : (
          <span className="text-[9px] font-bold">1</span>
        )}
      </button>

      <span className="text-[10px] font-bold text-[var(--team-primary,#F4AF23)] uppercase tracking-wider px-1">
        SO
      </span>

      <button
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-lg border flex items-center justify-center btn-press",
          "transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-90",
          "focus:outline-none focus:ring-1 focus:ring-[var(--team-primary,#F4AF23)]/50",
          selectedWinner === "away"
            ? "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/40 font-black"
            : "bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        onClick={() => !disabled && onWinnerSelect(selectedWinner === "away" ? null : "away")}
        disabled={disabled}
        aria-label={`${awayTeamShortName} vence no Shootout`}
        aria-pressed={selectedWinner === "away"}
        title={`${awayTeamShortName} vence no Shootout`}
      >
        {selectedWinner === "away" ? (
          <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
        ) : (
          <span className="text-[9px] font-bold">2</span>
        )}
      </button>
    </div>
  );
};
