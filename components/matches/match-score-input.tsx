import { FC, useState } from "react";
import { cn } from "@/lib/utils";

interface MatchScoreInputProps {
  value: string;
  onScoreChange: (value: string) => void;
  teamName: string;
  disabled?: boolean;
}

export const MatchScoreInput: FC<MatchScoreInputProps> = ({
  value,
  onScoreChange,
  teamName,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value}
      placeholder="0"
      style={{
        boxShadow: isFocused ? `0 0 0 2px var(--team-primary)` : "none",
      }}
      className={cn(
        "w-10 h-10 sm:w-11 sm:h-11 text-center rounded-lg text-base font-bold",
        "bg-white/5 border border-white/10 text-white placeholder:text-gray-600",
        "transition-all duration-200",
        "focus:outline-none focus:border-[color:var(--team-primary)]",
        "hover:border-white/20 hover:bg-white/10",
        disabled ? "cursor-not-allowed opacity-50" : ""
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e) => {
        if (disabled) return;
        const numericValue = e.target.value.replace(/[^0-9]/g, "");
        if (numericValue.length <= 2) {
          onScoreChange(numericValue);
        }
      }}
      aria-label={`Placar do ${teamName}`}
      disabled={disabled}
    />
  );
};
