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
  // Verificar se a rodada está realmente completa (todas as partidas têm resultados)
  const isRoundComplete = (round: Round): boolean => {
    if (!round.ended) return false;

    // Verificar se todas as partidas têm resultados
    return round.matches.every(
      match =>
        match.scores.homeScore !== null &&
        match.scores.awayScore !== null
    );
  };

  return (
    <ScrollArea className="w-full pb-1">
      <div className="flex space-x-1 px-1 min-w-max pb-1">
        {rounds.map((round) => (
          <button
            key={round.id}
            onClick={() => onRoundSelect(round.id.toString())}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
              selectedRound === round.id.toString()
                ? "bg-[var(--team-primary)] text-black"
                : "bg-[#252525] text-gray-300 hover:bg-[#333]"
            )}
          >
            {round.name.replace('Jornada', 'R').replace('Rodada', 'R')}
            {isRoundComplete(round) && <Check className="inline w-3 h-3 ml-1" />}
          </button>
        ))}
      </div>
      <ScrollBar
        orientation="horizontal"
        className="h-1.5 bg-transparent mt-1"
        thumbClassName="bg-[var(--team-primary)]/40 hover:bg-[var(--team-primary)]/60 active:bg-[var(--team-primary)]/80 transition-colors duration-200"
      />
    </ScrollArea>
  );
};