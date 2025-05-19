import { FC, KeyboardEvent } from "react";

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
      className={`w-8 h-8 text-center bg-[#333] border border-[#444] rounded focus:outline-none focus:ring-1 focus:ring-[var(--team-primary)] text-white text-sm sm:text-base ${disabled ? 'cursor-not-allowed' : ''}`}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        if (disabled) return;
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length <= 2) {
          onScoreChange(value);
        }
      }}
      aria-label={`Placar ${teamName}`}
      disabled={disabled}
    />
  );
};