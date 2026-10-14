import React from "react";
import { PlayoffMatch, Team } from "@/types/kings-league";
import { cn } from "@/lib/utils";
import { TeamDisplay } from "@/components/matches/team-display";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { isPlayoffMatchFinished } from "@/lib/generate-playoff-bracket";

interface PlayoffMatchCardProps {
  match: PlayoffMatch;
  teams: Record<string, Team>;
  onWinnerSelect: (
    matchId: string,
    winner: "home" | "away" | null
  ) => void;
  selectedWinner: "home" | "away" | null;
  stage: "playin" | "quarterfinal" | "semifinal" | "final";
  isLive?: boolean;
  hasTwoGroups?: boolean;
  isLocked?: boolean;
}

export function PlayoffMatchCard({
  match,
  teams,
  onWinnerSelect,
  selectedWinner,
  stage,
  isLive = false,
  hasTwoGroups = false,
  isLocked = false,
}: PlayoffMatchCardProps) {
  const { t, locale } = useLocale();
  const homeTeam = match.homeTeamId ? teams[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? teams[match.awayTeamId] : null;

  // Helpers de título de cada confronto
  const getStageInfo = () => {
    switch (match.id) {
      case "qf1":
        return { label: `${t.playoffs.quartersAbbr} 1` }
      case "qf2":
        return { label: `${t.playoffs.quartersAbbr} 2` }
      case "qf3":
        return { label: `${t.playoffs.quartersAbbr} 3` }
      case "qf4":
        return { label: `${t.playoffs.quartersAbbr} 4` }
      case "pi1":
      case "pi2":
        return { label: t.playoffs.playIn }
      case "sf1":
        return { label: t.playoffs.semifinal1 }
      case "sf2":
        return { label: t.playoffs.semifinal2 }
      case "final":
        return { label: t.playoffs.grandFinal }
      default:
        return {
          label: stage === 'playin' ? t.playoffs.playIn : stage === 'quarterfinal' ? t.playoffs.quartersAbbr : stage === 'semifinal' ? t.playoffs.semiAbbr : t.playoffs.finalAbbr,
        }
    }
  }

  const getPlaceholder = (side: "home" | "away") => {
    if (match.id === "sf1" && side === "away") {
      return { title: t.playoffs.winnerQuarter1 }
    }
    if (match.id === "qf1" && side === "away") {
      return { title: t.playoffs.winnerPlayIn1 }
    }
    if (match.id === "qf4" && side === "home") {
      return { title: t.playoffs.winnerPlayIn2 }
    }
    if (match.id === "sf2" && side === "home") {
      return { title: t.playoffs.winnerQuarter2 }
    }
    if (match.id === "sf2" && side === "away") {
      return { title: t.playoffs.winnerQuarter3 }
    }
    if (match.id === "final" && side === "home") {
      return { title: t.playoffs.winnerSemi1 }
    }
    if (match.id === "final" && side === "away") {
      return { title: t.playoffs.winnerSemi2 }
    }
    return { title: t.playoffs.tbd }
  }

  const hasWinner = selectedWinner !== null;
  const isHomeWinner = selectedWinner === "home";
  const isAwayWinner = selectedWinner === "away";

  const stageInfo = getStageInfo()

  const isEnded = isPlayoffMatchFinished(match);
  const isReadOnly = isEnded || isLocked;
  const hasScores = match.homeScore !== null && match.awayScore !== null && match.homeScore !== undefined && match.awayScore !== undefined && (isEnded || Boolean(match.winnerId));

  return (
    <article
      className={cn(
        "relative h-[116px] w-full max-w-[330px] rounded-2xl border p-2.5 select-none transition-[border-color,box-shadow,background-color] duration-150 sm:h-[120px] sm:p-3",
        "bg-[#09090d]/90 backdrop-blur-md border-zinc-800 shadow-sm",
        isReadOnly ? "pointer-events-none cursor-default" : "hover:border-zinc-700",
        hasWinner && "border-zinc-800"
      )}
      aria-label={homeTeam && awayTeam ? `${t.playoffs.matchLabel}: ${homeTeam.name} vs ${awayTeam.name}` : t.playoffs.playoffMatch}
    >
      <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_104px_minmax(0,1fr)] sm:gap-2">
        {/* Time da casa */}
        {homeTeam ? (
          <div className="flex items-center gap-2 justify-end">
            <TeamDisplay
              team={homeTeam}
              isWinner={isHomeWinner}
              position="left"
              showShootout={false}
              compact
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0 justify-end">
            <div className="flex-1 text-right overflow-hidden">
              <p className="font-bold text-xs sm:text-sm truncate max-w-full text-zinc-400" title={getPlaceholder("home").title}>
                {getPlaceholder("home").title}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-xl liquid-stat-box flex items-center justify-center border border-dashed border-zinc-800">
              <span className="text-zinc-600 text-xs font-bold">?</span>
            </div>
          </div>
        )}

        {/* Área central - Placar ou Seletor de vencedor */}
        <div className="flex min-w-0 flex-col items-center px-1 sm:px-1.5">
          {/* Badge de Ao Vivo */}
          {isLive && (
            <Badge
              className="mb-1 bg-red-600/90 text-white text-[9px] py-0.5 px-2 h-auto flex items-center gap-1 hover:bg-red-600 shadow-md shadow-red-600/20"
              aria-live="polite"
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-[8px]">{t.matches.live}</span>
            </Badge>
          )}

          {/* Placa: Fase do playoff + Status */}
          <div className="flex items-center justify-center gap-1 mb-1.5 text-center leading-tight">
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
              {stageInfo.label}
            </span>
            {isEnded && (
              <span className="text-[8px] font-mono font-bold uppercase text-zinc-500 bg-zinc-900/80 px-1 py-0.2 rounded border border-zinc-800">
                {t.matches.ended}
              </span>
            )}
          </div>

          {/* Exibição de Placar ou Seletores de vencedor */}
          {hasScores ? (
            <div 
              className={cn(
                "flex flex-col items-center select-none",
                isReadOnly ? "cursor-default pointer-events-none" : "cursor-pointer group/score"
              )}
              onClick={isEnded ? undefined : () => {
                onWinnerSelect(match.id, selectedWinner === "home" ? "away" : "home");
              }}
              title={isEnded ? undefined : t.playoffs.toggleWinner}
            >
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span
                  className={cn(
                    "w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center font-mono font-black text-xs sm:text-sm rounded-lg border transition-all duration-150",
                    isHomeWinner
                      ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.18)] border-[var(--team-primary,#F4AF23)] text-[var(--team-primary,#F4AF23)] shadow-sm"
                      : "bg-zinc-900/90 border-zinc-800 text-zinc-300",
                    !isEnded && "group-hover/score:border-zinc-700"
                  )}
                >
                  {match.homeScore}
                </span>
                <span className="text-zinc-600 text-[10px] font-black select-none">×</span>
                <span
                  className={cn(
                    "w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center font-mono font-black text-xs sm:text-sm rounded-lg border transition-all duration-150",
                    isAwayWinner
                      ? "bg-[rgba(var(--team-primary-rgb,244,175,35),0.18)] border-[var(--team-primary,#F4AF23)] text-[var(--team-primary,#F4AF23)] shadow-sm"
                      : "bg-zinc-900/90 border-zinc-800 text-zinc-300",
                    !isEnded && "group-hover/score:border-zinc-700"
                  )}
                >
                  {match.awayScore}
                </span>
              </div>
              {match.homeScoreP !== null && match.awayScoreP !== null && match.homeScoreP !== undefined && match.awayScoreP !== undefined && (
                <span className="mt-1 text-[8px] sm:text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 select-none">
                  SO: {match.homeScoreP}-{match.awayScoreP}
                </span>
              )}
            </div>
          ) : homeTeam && awayTeam ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botão Time da Casa */}
              <button
                type="button"
                onClick={isReadOnly ? undefined : () => onWinnerSelect(match.id, selectedWinner === "home" ? null : "home")}
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.92] border",
                  isHomeWinner
                    ? "bg-[var(--team-primary)] border-[var(--team-primary)] text-black font-black shadow-[0_0_12px_rgba(244,175,35,0.4)] hover:bg-[#ffc13b] hover:border-[#ffc13b]"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-[var(--team-primary,#F4AF23)]/50 text-zinc-400 hover:text-[var(--team-primary,#F4AF23)] hover:bg-zinc-800",
                  isReadOnly && "cursor-not-allowed opacity-80 pointer-events-none select-none"
                )}
                aria-label={t.playoffs.selectWinner.replace("{team}", homeTeam.name)}
                title={isReadOnly ? (isLocked ? t.playoffs.quartersLocked : undefined) : isHomeWinner ? t.playoffs.unmarkWinner : t.playoffs.markWinner.replace("{team}", homeTeam.name)}
              >
                {isHomeWinner ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-semibold tracking-tighter">1</span>
                )}
              </button>

              <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-wider select-none">VS</span>

              {/* Botão Time Visitante */}
              <button
                type="button"
                onClick={isReadOnly ? undefined : () => onWinnerSelect(match.id, selectedWinner === "away" ? null : "away")}
                disabled={isReadOnly}
                aria-disabled={isReadOnly}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.92] border",
                  isAwayWinner
                    ? "bg-[var(--team-primary)] border-[var(--team-primary)] text-black font-black shadow-[0_0_12px_rgba(244,175,35,0.4)] hover:bg-[#ffc13b] hover:border-[#ffc13b]"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-[var(--team-primary,#F4AF23)]/50 text-zinc-400 hover:text-[var(--team-primary,#F4AF23)] hover:bg-zinc-800",
                  isReadOnly && "cursor-not-allowed opacity-80 pointer-events-none select-none"
                )}
                aria-label={t.playoffs.selectWinner.replace("{team}", awayTeam.name)}
                title={isReadOnly ? (isLocked ? t.playoffs.quartersLocked : undefined) : isAwayWinner ? t.playoffs.unmarkWinner : t.playoffs.markWinner.replace("{team}", awayTeam.name)}
              >
                {isAwayWinner ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-semibold tracking-tighter">2</span>
                )}
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-zinc-500 text-center font-medium">
              {t.playoffs.waiting}
            </p>
          )}
        </div>

        {/* Time visitante */}
        {awayTeam ? (
          <div className="flex items-center gap-2 justify-start">
            <TeamDisplay
              team={awayTeam}
              isWinner={isAwayWinner}
              position="right"
              showShootout={false}
              compact
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0 justify-start">
            <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-xl liquid-stat-box flex items-center justify-center border border-dashed border-zinc-800">
              <span className="text-zinc-600 text-xs font-bold">?</span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="font-bold text-xs sm:text-sm truncate max-w-full text-zinc-400" title={getPlaceholder("away").title}>
                {getPlaceholder("away").title}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
