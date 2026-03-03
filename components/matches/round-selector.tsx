import { FC } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Round } from "@/types/kings-league";

interface RoundSelectorProps {
  rounds: Round[];
  selectedRound: string;
  onRoundSelect: (roundId: string) => void;
}

export const RoundSelector: FC<RoundSelectorProps> = ({
  rounds,
  selectedRound,
  onRoundSelect,
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
        className="flex gap-2 pb-2"
        role="tablist"
        aria-label="Seletor de rodadas"
      >
        {rounds.map((round) => {
          const roundComplete = isRoundComplete(round);
          const isSelected = selectedRound === round.id.toString();
          const roundNumber = round.name.replace(/\D/g, '');

          return (
            <button
              key={round.id}
              onClick={() => onRoundSelect(round.id.toString())}
              role="tab"
              aria-selected={isSelected}
              aria-label={`Rodada ${roundNumber}${roundComplete ? ' - Concluída' : ''}`}
              className={cn(
                "relative flex items-center justify-center min-w-[44px] h-10 px-3",
                "text-sm font-medium rounded-xl whitespace-nowrap",
                "transition-all duration-200",
                isSelected
                  ? "text-black"
                  : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/10",
                roundComplete && !isSelected && "text-gray-500"
              )}
              style={isSelected ? { backgroundColor: "var(--team-primary)" } : {}}
            >
              <span>{roundNumber}</span>
              {roundComplete && (
                <Check
                  className={cn(
                    "w-3 h-3 ml-1.5",
                    isSelected ? "text-black" : "text-green-500"
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
        className="h-1.5 bg-white/5 rounded-full"
        thumbClassName="rounded-full transition-colors bg-[color-mix(in_srgb,var(--team-primary)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--team-primary)_70%,transparent)]"
      />
    </ScrollArea >
  );
};
