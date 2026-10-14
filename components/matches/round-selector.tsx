import { FC } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Round } from "@/types/kings-league";
import { useLocale } from "@/contexts/locale-context";
import { isRoundComplete } from "@/lib/regular-season";

interface RoundSelectorProps {
  rounds: Round[];
  playInRounds?: Round[];
  selectedRound: string;
  onRoundSelect: (roundId: string) => void;
  showPlayoffs?: boolean;
  canShowPlayoffs?: boolean;
}

export const RoundSelector: FC<RoundSelectorProps> = ({
  rounds,
  selectedRound,
  onRoundSelect,
  showPlayoffs = false,
}) => {
  const { t } = useLocale()

  const regularRounds = rounds
    .filter((round) => /\d/.test(round.name))
    .map((round) => ({ round, label: `R${round.name.match(/\d+/)?.[0] ?? ""}` }));

  return (
    <ScrollArea className="w-full">
      <div
        className="flex items-center gap-1.5 sm:gap-2 pb-2 px-0.5"
        role="tablist"
        aria-label={t.ui.roundSelector}
      >
        {regularRounds.map(({ round, label }) => {
          const roundComplete = isRoundComplete(round);
          const selectionId = round.id.toString();
          const isSelected = !showPlayoffs && selectedRound === selectionId;
          return (
            <button
              key={selectionId}
              onClick={() => onRoundSelect(selectionId)}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${label}${roundComplete ? ` - ${t.matches.ended}` : ''}`}
              className={cn(
                "relative flex items-center justify-center min-w-[40px] sm:min-w-[46px] h-8 sm:h-9 px-2.5 sm:px-3",
                "text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap btn-press",
                "transition-[background-color,color,transform,box-shadow,border-color] duration-150 active:scale-[0.96]",
                isSelected
                  ? "bg-[var(--team-primary,#F4AF23)] text-black shadow-md shadow-[var(--team-primary,#F4AF23)]/25 font-black scale-[1.02]"
                  : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700",
                roundComplete && !isSelected && "text-zinc-500"
              )}
            >
              <span>{label}</span>
              {roundComplete && (
                <Check
                  className={cn(
                    "w-3 h-3 ml-1",
                    isSelected ? "text-black" : "text-emerald-400"
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      <ScrollBar
        orientation="horizontal"
        className="h-1.5 bg-zinc-800/40 rounded-full"
        thumbClassName="rounded-full transition-colors bg-[color-mix(in_srgb,var(--team-primary)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--team-primary)_70%,transparent)]"
      />
    </ScrollArea>
  );
};

