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
      placeholder=""
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 text-center rounded-xl font-mono text-base sm:text-lg font-black",
        "bg-[#08080c] border border-zinc-800 text-white shadow-inner",
        "transition-[border-color,box-shadow,background-color] duration-150 cursor-text",
        "focus:outline-none focus:border-[var(--team-primary,#F4AF23)] focus:ring-2 focus:ring-[var(--team-primary,#F4AF23)]/25 focus:bg-[#0c0c12]",
        "hover:border-zinc-700 hover:bg-[#0b0b10]",
        disabled && "cursor-not-allowed opacity-40 hover:border-zinc-800 hover:bg-[#08080c]"
      )}
      onFocus={(e) => {
        setIsFocused(true);
        e.target.select();
      }}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Backspace" || e.key === "Delete") {
          const target = e.target as HTMLInputElement;
          const isAllSelected = target.selectionStart === 0 && target.selectionEnd === target.value.length;
          if (value.length <= 1 || isAllSelected) {
            e.preventDefault();
            onScoreChange("");
          }
        }
      }}
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

