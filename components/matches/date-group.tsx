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
      {/* Date Header */}
      <div className="flex items-center gap-2 px-1">
        <DateIcon className="w-4 h-4 text-[#F4AF23]" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-300">
          {DateFormatter.getWeekdayName(date)}, {DateFormatter.formatDateDisplay(date)}
        </span>
      </div>

      {/* Matches */}
      <div className="space-y-2">
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