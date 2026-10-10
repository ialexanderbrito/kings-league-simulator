import { FC } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Round } from "@/types/kings-league";

interface RoundSelectorProps {
  rounds: Round[];
  selectedRound: string;
  onRoundSelect: (roundId: string) => void;
  showPlayoffs?: boolean;
}

export const RoundSelector: FC<RoundSelectorProps> = ({
  rounds,
  selectedRound,
  onRoundSelect,
  showPlayoffs = false,
}) => {
  const isRoundComplete = (round: Round): boolean => {
    if (!round.ended) return false;
    if (round.matches.some(match => match.status === 'inPlay1H' || match.status === 'inPlay2H')) {
      return false;
    }
    return round.matches.every(
      match =>
        match.scores.homeScore !== null &&
        match.scores.awayScore !== null
    );
  };

  return (
    <ScrollArea className="w-full">
      <div
        className="flex items-center gap-1.5 sm:gap-2 pb-2 px-0.5"
        role="tablist"
        aria-label="Seletor de rodadas da Kings League"
      >
        {rounds.map((round) => {
          const roundComplete = isRoundComplete(round);
          const isSelected = !showPlayoffs && selectedRound === round.id.toString();
          const roundNumber = round.name.replace(/\D/g, '');

          return (
            <button
              key={round.id}
              onClick={() => onRoundSelect(round.id.toString())}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Rodada ${roundNumber}${roundComplete ? ' - Concluída' : ''}`}
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
              <span>{`R${roundNumber}`}</span>
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
