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
        "w-10 h-10 sm:w-11 sm:h-11 text-center rounded-lg text-base font-bold",
        "bg-white/5 border border-white/10 text-white placeholder:text-gray-600",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#F4AF23]/50 focus:border-[#F4AF23]/50",
        "hover:border-white/20 hover:bg-white/10",
        disabled ? "cursor-not-allowed opacity-50" : ""
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