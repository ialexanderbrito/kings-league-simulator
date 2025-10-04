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
    value: string,
    isBackspace?: boolean
  ) => void;
  onShootoutWinnerSelect: (
    roundId: number,
    matchId: number,
    winner: "home" | "away" | null
  ) => void;
  favoriteTeam?: Team | null;
}

export const DateGroup: FC<DateGroupProps> = ({
  date,
  matches,
  round,
  teams,
  scores,
  showShootout,
  onScoreChange,
  onShootoutWinnerSelect,
  favoriteTeam
}) => {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border-l-4 border-[var(--team-primary)]"
        role="heading"
        aria-level={3}
      >
        <div className="p-1.5 rounded-md bg-[var(--team-primary)]/10">
          <DateIcon className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {DateFormatter.getWeekdayName(date)}, {DateFormatter.formatDateDisplay(date)}
        </span>
      </div>

      <div className="space-y-3">
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
              formatDate={DateFormatter.formatMatchDate}
              currentScores={currentScores}
              showShootout={showShootoutInputs}
              onScoreChange={onScoreChange}
              onShootoutWinnerSelect={onShootoutWinnerSelect}
              favoriteTeam={favoriteTeam}
            />
          );
        })}
      </div>
    </div>
  );
};