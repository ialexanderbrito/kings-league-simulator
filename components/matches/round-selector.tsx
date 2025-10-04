import { FC } from "react";
import { CheckCircle2 } from "lucide-react";
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

    if (round.matches.some(match => match.status === 'inPlay1H' || match.status === 'inPlay2H')) {
      return false;
    }

    // Verificar se todas as partidas têm resultados
    return round.matches.every(
      match =>
        match.scores.homeScore !== null &&
        match.scores.awayScore !== null
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground/90">
          Selecione a Rodada
        </h3>
        <span className="text-xs text-muted-foreground">
          {rounds.length} rodada{rounds.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea className="w-full">
        <div
          className="flex gap-2 px-1 pb-3"
          role="tablist"
          aria-label="Seletor de rodadas"
        >
          {rounds.map((round) => {
            const roundComplete = isRoundComplete(round);
            const isSelected = selectedRound === round.id.toString();

            return (
              <button
                key={round.id}
                onClick={() => onRoundSelect(round.id.toString())}
                role="tab"
                aria-selected={isSelected}
                aria-label={`${round.name}${roundComplete ? ' - Concluída' : ''}`}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2.5 min-w-fit",
                  "text-sm font-medium rounded-full whitespace-nowrap",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background",
                  isSelected
                    ? "bg-[var(--team-primary)] text-background shadow-lg shadow-[var(--team-primary)]/20"
                    : "bg-card hover:bg-accent text-foreground/70 hover:text-foreground border border-border/50 hover:border-border",
                  roundComplete && !isSelected && "opacity-60"
                )}
              >
                <span className="relative z-10">
                  {round.name.replace('Jornada', 'R').replace('Rodada', 'R')}
                </span>

                {roundComplete && (
                  <CheckCircle2
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isSelected ? "text-background" : "text-[var(--team-primary)]"
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
          className="h-2 bg-muted/20 rounded-full"
          thumbClassName="bg-[var(--team-primary)]/60 hover:bg-[var(--team-primary)]/80 rounded-full transition-colors"
        />
      </ScrollArea>
    </div>
  );
};