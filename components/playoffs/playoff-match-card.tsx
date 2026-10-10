import React from "react";
import { PlayoffMatch, Team } from "@/types/kings-league";
import { cn } from "@/lib/utils";
import { TeamDisplay } from "@/components/matches/team-display";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlayoffMatchCardProps {
  match: PlayoffMatch;
  teams: Record<string, Team>;
  onWinnerSelect: (
    matchId: string,
    winner: "home" | "away" | null
  ) => void;
  selectedWinner: "home" | "away" | null;
  stage: "quarterfinal" | "semifinal" | "final";
  isLive?: boolean;
  hasTwoGroups?: boolean;
}

export function PlayoffMatchCard({
  match,
  teams,
  onWinnerSelect,
  selectedWinner,
  stage,
  isLive = false,
  hasTwoGroups = false,
}: PlayoffMatchCardProps) {
  const homeTeam = match.homeTeamId ? teams[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? teams[match.awayTeamId] : null;

  // Helpers de título de cada confronto
  const getStageInfo = () => {
    switch (match.id) {
      case "qf1":
        return { label: "Quartas 1" }
      case "qf2":
        return { label: "Quartas 2" }
      case "qf3":
        return { label: "Quartas 3" }
      case "sf1":
        return { label: "Semifinal 1" }
      case "sf2":
        return { label: "Semifinal 2" }
      case "final":
        return { label: "Grande Final" }
      default:
        return {
          label: stage === 'quarterfinal' ? 'Quartas' : stage === 'semifinal' ? 'Semifinal' : 'Final',
        }
    }
  }

  const getPlaceholder = (side: "home" | "away") => {
    if (match.id === "sf1" && side === "away") {
      return { title: "Venc. Quartas 1" }
    }
    if (match.id === "sf2" && side === "home") {
      return { title: "Venc. Quartas 2" }
    }
    if (match.id === "sf2" && side === "away") {
      return { title: "Venc. Quartas 3" }
    }
    if (match.id === "final" && side === "home") {
      return { title: "Venc. Semifinal 1" }
    }
    if (match.id === "final" && side === "away") {
      return { title: "Venc. Semifinal 2" }
    }
    return { title: "A definir" }
  }

  const hasWinner = selectedWinner !== null;
  const isHomeWinner = selectedWinner === "home";
  const isAwayWinner = selectedWinner === "away";

  const stageInfo = getStageInfo()

  const isEnded = Boolean(
    match.status === "ended" ||
    match.status?.toLowerCase() === "ended" ||
    match.status?.toLowerCase() === "finished" ||
    (match.homeScore !== null && match.awayScore !== null && match.homeScore !== undefined && match.awayScore !== undefined)
  );
  const hasScores = match.homeScore !== null && match.awayScore !== null && match.homeScore !== undefined && match.awayScore !== undefined;

  return (
    <article
      className={cn(
        "relative rounded-2xl p-2.5 sm:p-3 border transition-[border-color,box-shadow,background-color] duration-150 w-full select-none",
        "bg-[#09090d]/90 backdrop-blur-md border-zinc-800 shadow-sm",
        isEnded ? "pointer-events-none cursor-default" : "hover:border-zinc-700",
        hasWinner && "border-zinc-800"
      )}
      aria-label={homeTeam && awayTeam ? `Partida: ${homeTeam.name} vs ${awayTeam.name}` : "Partida dos playoffs"}
    >
      <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-2 sm:gap-2.5 w-full">
        {/* Time da casa */}
        {homeTeam ? (
          <div className="flex items-center gap-2 justify-end">
            <TeamDisplay
              team={homeTeam}
              isWinner={isHomeWinner}
              position="left"
              showShootout={false}
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
        <div className="flex flex-col items-center px-1 sm:px-1.5 min-w-[80px] sm:min-w-[96px]">
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
              <span className="font-bold uppercase tracking-wider text-[8px]">Ao Vivo</span>
            </Badge>
          )}

          {/* Placa: Fase do playoff + Status */}
          <div className="flex items-center justify-center gap-1 mb-1.5 text-center leading-tight">
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
              {stageInfo.label}
            </span>
            {isEnded && (
              <span className="text-[8px] font-mono font-bold uppercase text-zinc-500 bg-zinc-900/80 px-1 py-0.2 rounded border border-zinc-800">
                FIM
              </span>
            )}
          </div>

          {/* Exibição de Placar ou Seletores de vencedor */}
          {hasScores ? (
            <div 
              className={cn(
                "flex flex-col items-center select-none",
                isEnded ? "cursor-default pointer-events-none" : "cursor-pointer group/score"
              )}
              onClick={isEnded ? undefined : () => {
                onWinnerSelect(match.id, selectedWinner === "home" ? "away" : "home");
              }}
              title={isEnded ? undefined : "Clique para alternar vencedor na simulação"}
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
                onClick={isEnded ? undefined : () => onWinnerSelect(match.id, selectedWinner === "home" ? null : "home")}
                disabled={isEnded}
                aria-disabled={isEnded}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.92] border",
                  isHomeWinner
                    ? "bg-[var(--team-primary)] border-[var(--team-primary)] text-black font-black shadow-[0_0_12px_rgba(244,175,35,0.4)]"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white",
                  isEnded && "cursor-not-allowed opacity-80 pointer-events-none select-none"
                )}
                aria-label={`Selecionar ${homeTeam.name} como vencedor`}
                title={isEnded ? undefined : isHomeWinner ? "Desmarcar vencedor" : `Marcar ${homeTeam.name} como vencedor`}
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
                onClick={isEnded ? undefined : () => onWinnerSelect(match.id, selectedWinner === "away" ? null : "away")}
                disabled={isEnded}
                aria-disabled={isEnded}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.92] border",
                  isAwayWinner
                    ? "bg-[var(--team-primary)] border-[var(--team-primary)] text-black font-black shadow-[0_0_12px_rgba(244,175,35,0.4)]"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white",
                  isEnded && "cursor-not-allowed opacity-80 pointer-events-none select-none"
                )}
                aria-label={`Selecionar ${awayTeam.name} como vencedor`}
                title={isEnded ? undefined : isAwayWinner ? "Desmarcar vencedor" : `Marcar ${awayTeam.name} como vencedor`}
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
              Aguardando
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

