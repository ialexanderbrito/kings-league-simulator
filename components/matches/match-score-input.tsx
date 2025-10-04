import { FC, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface MatchScoreInputProps {
  value: string;
  onScoreChange: (value: string, isBackspace?: boolean) => void;
  onBackspace?: () => void;
  currentValue: string;
  teamName: string;
  disabled?: boolean;
}

export const MatchScoreInput: FC<MatchScoreInputProps> = ({
  value,
  onScoreChange,
  currentValue,
  teamName,
  disabled = false
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Se for Backspace ou Delete e há apenas um caractere, limpa o campo
    if ((e.key === "Backspace" || e.key === "Delete") && currentValue.length === 1) {
      onScoreChange("", true);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value}
      placeholder="0"
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 text-center rounded-lg text-sm sm:text-base font-semibold",
        "bg-muted border-2 border-border text-foreground placeholder:text-muted-foreground",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background focus:border-[var(--team-primary)]",
        "hover:border-border/80",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-accent"
      )}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        if (disabled) return;
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length <= 2) {
          onScoreChange(value);
        }
      }}
      aria-label={`Placar do ${teamName}`}
      aria-describedby={disabled ? undefined : `score-help-${teamName}`}
      disabled={disabled}
    />
  );
};