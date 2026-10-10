import { FC } from "react";
import { Calendar as DateIcon } from "lucide-react";
import { Round, Team } from "@/types/kings-league";
import { DateFormatter } from "@/lib/date-formatter";
import { MatchCard } from "./match-card";

interface DateGroupProps {
  date: string;
  matches: Round["matches"];
  round: Round;
  teams: Record<string, Team>;
  teamGroupMap?: Record<string, string>;
  scores: Record<string, {
    home: string;
    away: string;
    shootoutWinner: string | null;
  }>;
  showShootout: Record<string, boolean>;
  onScoreChange: (
    roundId: number,
    matchId: number,
    team: "home" | "away",
    value: string
  ) => void;
  onShootoutWinnerSelect: (
    roundId: number,
    matchId: number,
    winner: "home" | "away" | null
  ) => void;
}

export const DateGroup: FC<DateGroupProps> = ({
  date,
  matches,
  round,
  teams,
  teamGroupMap,
  scores,
  showShootout,
  onScoreChange,
  onShootoutWinnerSelect,
}) => {
  return (
    <div className="space-y-1.5">
      {/* Date Header - Minimalista e elegante */}
      <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400">
        <span className="flex items-center gap-1.5">
          <DateIcon className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
          <span>
            {DateFormatter.getWeekdayName(date)
              ? `${DateFormatter.getWeekdayName(date)}, ${DateFormatter.formatDateDisplay(date)}`
              : DateFormatter.formatDateDisplay(date)
            }
          </span>
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {matches.length} {matches.length === 1 ? "jogo" : "jogos"}
        </span>
      </div>

      {/* Matches */}
      <div className="space-y-1.5">
        {matches.map((match) => {
          const matchKey = `${round.id}-${match.id}`;
          const currentScores = scores[matchKey] || {
            home: "",
            away: "",
            shootoutWinner: null
          };
          const showShootoutInputs = showShootout[matchKey];

          return (
            <MatchCard
              key={match.id}
              match={match}
              round={round}
              teams={teams}
              teamGroupMap={teamGroupMap}
              formatDate={DateFormatter.formatMatchDate}
              currentScores={currentScores}
              showShootout={showShootoutInputs}
              onScoreChange={onScoreChange}
              onShootoutWinnerSelect={onShootoutWinnerSelect}
            />
          );
        })}
      </div>
    </div>
  );
};
