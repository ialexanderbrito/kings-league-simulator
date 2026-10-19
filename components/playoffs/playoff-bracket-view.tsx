import React, { useEffect, useMemo, useState } from "react";
import { PlayoffBracket, PlayoffMatch, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { ChampionBanner } from "./champion-banner";
import { isMexicoQuarterfinalsLocked, isPlayoffMatchFinished, updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { getLeagueQualification } from "@/lib/league-format";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";


interface PlayoffBracketViewProps {
  bracket: PlayoffBracket | null;
  teams: Record<string, Team>;
  onBracketUpdate: (updatedBracket: PlayoffBracket) => void;
  hasTwoGroups?: boolean;
  leagueId?: string;
}

export function PlayoffBracketView({ bracket, teams, onBracketUpdate, hasTwoGroups = false, leagueId }: PlayoffBracketViewProps) {
  const { t } = useLocale();
  const [localBracket, setLocalBracket] = useState<PlayoffBracket | null>(bracket ?? null);

  useEffect(() => setLocalBracket(bracket ?? null), [bracket]);

  const isLastChance =
    leagueId === "italy" ||
    (leagueId ? getLeagueQualification(leagueId).groupFormat === "lastChance" : false) ||
    Boolean(bracket?.playIns?.some((m) => m.id.startsWith("lc")));

  // If there's no bracket, show a friendly placeholder to avoid runtime errors
  if (!localBracket) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t.playoffs.notAvailable}
      </div>
    );
  }

  const quarterfinals = useMemo(() => localBracket.quarterfinals || [], [localBracket]);
  const playInRounds = useMemo(() => {
    const rounds = localBracket.playInRounds?.filter((round) => round.length > 0) || [];
    return rounds.length > 0 ? rounds : (localBracket.playIns?.length ? [localBracket.playIns] : []);
  }, [localBracket]);
  const hasPlayIn = playInRounds.length > 0;
  const semifinals = useMemo(() => localBracket.semifinals || [], [localBracket]);
  const finalMatch = useMemo(() => localBracket.final || null, [localBracket]);

  // Handler para seleção de vencedor
  const handleWinnerSelect = (matchId: string, winner: "home" | "away" | null) => {
    // Partidas já encerradas oficialmente não podem ter vencedor alterado
    const allMatches = [
      ...(localBracket?.playIns || []),
      ...(localBracket?.quarterfinals || []),
      ...(localBracket?.semifinals || []),
      ...(localBracket?.final ? [localBracket.final] : [])
    ];
    const target = allMatches.find(m => m.id === matchId);
    if (isMexicoQuarterfinalsLocked(localBracket, matchId, leagueId)) return;
    if (target && isPlayoffMatchFinished(target)) {
      return;
    }

    if (!winner) {
      const updated = JSON.parse(JSON.stringify(localBracket)) as PlayoffBracket;
      findAndClearMatch(updated, matchId);
      setLocalBracket(updated);
      onBracketUpdate(updated);
      return;
    }
    const homeScore = winner === "home" ? 2 : 1;
    const awayScore = winner === "away" ? 2 : 1;
    try {
      const updated = updatePlayoffBracket(localBracket, matchId, homeScore, awayScore, null, null, leagueId);
      setLocalBracket(updated);
      onBracketUpdate(updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao atualizar bracket:", err);
    }
  };

  // Campeão
  const champion = finalMatch && finalMatch.winnerId ? teams[finalMatch.winnerId] : null;
  const columns = [
    ...playInRounds.map((matches, roundIndex) => ({
      title: isLastChance ? t.playoffs.lastChance : t.playoffs.playIn,
      matches,
      stage: "playin" as const,
      playInRound: roundIndex,
    })),
    { title: t.playoffs.quarterfinals, matches: quarterfinals, stage: "quarterfinal" as const },
    { title: t.playoffs.semifinals, matches: semifinals, stage: "semifinal" as const },
    { title: t.playoffs.grandFinal, matches: finalMatch ? [finalMatch] : [], stage: "final" as const },
  ];
  const quarterfinalColumnIndex = playInRounds.length;
  const semifinalColumnIndex = quarterfinalColumnIndex + 1;

  return (
    <div className="w-full">
      {/* Banner do campeão com celebração e confetes */}
      {champion && (
        <ChampionBanner
          champion={champion}
          finalMatch={finalMatch}
          teams={teams}
        />
      )}

      <div className="w-full pb-4">
        <div className={cn(
          "relative grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:items-start lg:gap-0",
          playInRounds.length === 2
            ? "lg:grid-cols-[repeat(5,minmax(180px,1fr))]"
            : playInRounds.length === 1
              ? "lg:grid-cols-[repeat(4,minmax(190px,1fr))]"
              : "lg:grid-cols-[repeat(3,minmax(220px,1fr))]"
        )}>
          {columns.map((column, index) => (
              <section key={`${column.title}-${index}`} className="relative z-10 flex min-w-0 flex-col items-center lg:px-2">
                <div className="flex min-h-8 w-full items-start justify-center gap-2 border-b border-zinc-800/80 pb-3 text-center">
                  <span className="min-w-0 text-[11px] font-bold uppercase leading-tight tracking-wider text-zinc-300">{column.title}</span>
                  <span className="shrink-0 text-[10px] leading-tight text-zinc-500">{column.matches.length || "—"}</span>
                </div>
                <div className="relative h-[600px] w-full">
                  {column.matches.map((match) => (
                    <div
                      key={match.id}
                      className={cn(
                        "absolute inset-x-0 flex justify-center",
                        column.stage === "playin" && (
                          playInRounds.length === 2
                            ? ((column as { playInRound?: number }).playInRound === 0
                              ? (match.order === 1 ? "top-[48px]" : "top-[348px]")
                              : "top-[198px]")
                            : (column.matches.length === 2
                              ? (match.order === 1 ? "top-[48px]" : "top-[348px]")
                              : match.order === 1 ? "top-[48px]" : match.order === 2 ? "top-[248px]" : "top-[448px]")
                        ),
                        column.stage === "quarterfinal" && (
                          quarterfinals.length === 2
                            ? (match.id === "qf1" ? "top-[48px]" : "top-[348px]")
                            : (match.id === "qf1"
                              ? "top-[48px]"
                              : match.id === "qf2"
                                ? "top-[248px]"
                                : "top-[448px]")
                        ),
                        column.stage === "semifinal" && (match.id === "sf1" ? "top-[48px]" : "top-[348px]"),
                        column.stage === "final" && "top-[198px]"
                      )}
                    >
                      <PlayoffMatchCard
                        match={match}
                        teams={teams}
                        onWinnerSelect={handleWinnerSelect}
                        selectedWinner={match.winnerId ? (match.winnerId === match.homeTeamId ? "home" : "away") : null}
                        stage={column.stage}
                        isLive={Boolean(match.homeScore !== null || match.awayScore !== null) && !match.winnerId}
                        hasTwoGroups={hasTwoGroups}
                        isLocked={isMexicoQuarterfinalsLocked(localBracket, match.id, leagueId)}
                      />
                    </div>
                  ))}
                </div>
            </section>
          ))}
          {playInRounds.slice(0, -1).map((round, index) => (
            <div
              key={`playin-connector-${index}`}
              className="pointer-events-none absolute top-8 z-0 hidden h-[632px] lg:block"
              style={{ left: `${((index + 1) / columns.length) * 100}%`, width: "2rem", transform: "translateX(-50%)" }}
              aria-hidden="true"
            >
              <PlayInConnector
                firstWinner={Boolean(round[0]?.winnerId)}
                secondWinner={Boolean(round[1]?.winnerId)}
                nextReady={Boolean(playInRounds[index + 1]?.[0]?.homeTeamId && playInRounds[index + 1]?.[0]?.awayTeamId)}
              />
            </div>
          ))}
          {hasPlayIn && (
            <div
              className="pointer-events-none absolute top-8 z-0 hidden h-[632px] lg:block"
              style={{ left: `${(quarterfinalColumnIndex / columns.length) * 100}%`, width: "2rem", transform: "translateX(-50%)" }}
              aria-hidden="true"
            >
              <PlayInToQuarterConnector
                matches={playInRounds[playInRounds.length - 1]}
                quarterfinals={quarterfinals}
              />
            </div>
          )}
          <div
            className="pointer-events-none absolute top-8 z-0 hidden h-[632px] lg:block"
            style={{ left: `${((quarterfinalColumnIndex + 1) / columns.length) * 100}%`, width: "2rem", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <QuarterToSemiConnector
              qf1Winner={Boolean(quarterfinals[0]?.winnerId)}
              qf2Winner={Boolean(quarterfinals[1]?.winnerId)}
              qf3Winner={Boolean(quarterfinals[2]?.winnerId)}
              sf1Ready={Boolean(semifinals[0]?.homeTeamId && semifinals[0]?.awayTeamId)}
              sf2Ready={Boolean(semifinals[1]?.homeTeamId && semifinals[1]?.awayTeamId)}
              isTwoQuarterfinals={quarterfinals.length === 2}
            />
          </div>
          <div
            className="pointer-events-none absolute top-8 z-0 hidden h-[632px] lg:block"
            style={{ left: `${((semifinalColumnIndex + 1) / columns.length) * 100}%`, width: "2rem", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <SemiToFinalConnector
              sf1Winner={Boolean(semifinals[0]?.winnerId)}
              sf2Winner={Boolean(semifinals[1]?.winnerId)}
              finalReady={Boolean(finalMatch?.homeTeamId && finalMatch?.awayTeamId)}
            />
          </div>
        </div>
      </div>

      {/* Legenda e instruções */}
      <div className="mt-6">
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#09090d]/60 backdrop-blur-md px-4 py-3 text-xs text-zinc-400">
          <Info className="h-4 w-4 text-[var(--team-primary)] flex-shrink-0" />
          <span>
            {t.playoffs.instructions} {isLastChance ? t.playoffs.instructionsLastChance : hasTwoGroups ? t.playoffs.instructionsGroups : hasPlayIn ? t.playoffs.instructionsPlayIn : t.playoffs.instructionsStandard}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PlayInConnectorProps {
  firstWinner: boolean;
  secondWinner: boolean;
  nextReady: boolean;
}

function PlayInConnector({ firstWinner, secondWinner, nextReady }: PlayInConnectorProps) {
  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="0 0 40 600"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M 0 100 H 14 Q 20 100 20 106 V 244 Q 20 250 26 250 H 38"
        stroke={firstWinner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 0 400 H 14 Q 20 400 20 394 V 256 Q 20 250 26 250 H 38"
        stroke={secondWinner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="38"
        cy="250"
        r="2.5"
        fill={nextReady || firstWinner || secondWinner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
      />
    </svg>
  );
}

function PlayInToQuarterConnector({
  matches,
  quarterfinals,
}: {
  matches: PlayoffMatch[];
  quarterfinals: PlayoffMatch[];
}) {
  if (matches.length === 2 && quarterfinals.length === 2) {
    const lc1Active = Boolean(matches[0]?.winnerId);
    const lc2Active = Boolean(matches[1]?.winnerId);
    const qf1Ready = Boolean(quarterfinals[0]?.homeTeamId && quarterfinals[0]?.awayTeamId);
    const qf2Ready = Boolean(quarterfinals[1]?.homeTeamId && quarterfinals[1]?.awayTeamId);

    return (
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 40 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <filter id="gold-glow-lc" filterUnits="userSpaceOnUse" x="-10" y="0" width="60" height="600">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F4AF23" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* LC1 (Y=100) cruza para QF2 (Y=400) */}
        <path
          d="M 0 100 H 14 Q 20 100 20 106 V 394 Q 20 400 26 400 H 38"
          stroke={lc1Active ? "#F4AF23" : "rgba(255,255,255,0.18)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={lc1Active ? "url(#gold-glow-lc)" : undefined}
        />

        {/* LC2 (Y=400) cruza para QF1 (Y=100) */}
        <path
          d="M 0 400 H 14 Q 20 400 20 394 V 106 Q 20 100 26 100 H 38"
          stroke={lc2Active ? "#F4AF23" : "rgba(255,255,255,0.18)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={lc2Active ? "url(#gold-glow-lc)" : undefined}
        />

        <circle
          cx="38"
          cy="100"
          r="2.5"
          fill={qf1Ready || lc2Active ? "#F4AF23" : "rgba(255,255,255,0.3)"}
        />
        <circle
          cx="38"
          cy="400"
          r="2.5"
          fill={qf2Ready || lc1Active ? "#F4AF23" : "rgba(255,255,255,0.3)"}
        />
      </svg>
    );
  }

  const sourcePositions = matches.length === 1
    ? [250]
    : matches.length === 2
      ? [100, 400]
      : [100, 300, 500];
  const targetPositions = matches.length === 1
    ? [100]
    : matches.length === 2
      ? [100, 500]
      : [100, 300, 500];

  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="0 0 40 600"
      preserveAspectRatio="none"
      fill="none"
    >
      {matches.map((match, index) => {
        const sourceY = sourcePositions[index] ?? sourcePositions[sourcePositions.length - 1];
        const targetY = targetPositions[index] ?? targetPositions[targetPositions.length - 1];
        const targetMatch = index === 1 && matches.length === 2
          ? quarterfinals.find((quarterfinal) => quarterfinal.id === "qf4")
          : quarterfinals[index];
        const isActive = Boolean(match.winnerId);
        const isReady = Boolean(targetMatch?.homeTeamId && targetMatch?.awayTeamId);

        return (
          <g key={match.id}>
            <path
              d={sourceY === targetY
                ? `M 0 ${sourceY} H 38`
                : `M 0 ${sourceY} H 14 Q 20 ${sourceY} 20 ${sourceY + (targetY > sourceY ? 6 : -6)} V ${targetY + (targetY > sourceY ? -6 : 6)} Q 20 ${targetY} 26 ${targetY} H 38`}
              stroke={isActive ? "#F4AF23" : "rgba(255,255,255,0.18)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="38"
              cy={targetY}
              r="2.5"
              fill={isReady || isActive ? "#F4AF23" : "rgba(255,255,255,0.3)"}
            />
          </g>
        );
      })}
    </svg>
  );
}

// Conector Contínuo SVG entre Quartas de Final e Semifinais
interface QuarterToSemiConnectorProps {
  qf1Winner: boolean;
  qf2Winner: boolean;
  qf3Winner: boolean;
  sf1Ready?: boolean;
  sf2Ready: boolean;
  isTwoQuarterfinals?: boolean;
}

function QuarterToSemiConnector({
  qf1Winner,
  qf2Winner,
  qf3Winner,
  sf1Ready,
  sf2Ready,
  isTwoQuarterfinals,
}: QuarterToSemiConnectorProps) {
  if (isTwoQuarterfinals) {
    return (
      <svg
        className="w-full h-full overflow-visible pointer-events-none"
        viewBox="0 0 40 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <filter id="gold-glow-q2" filterUnits="userSpaceOnUse" x="-10" y="0" width="60" height="600">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F4AF23" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* QF1 direto para SF1 (Y = 100) */}
        <path
          d="M 0 100 H 38"
          stroke={qf1Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={qf1Winner ? "url(#gold-glow-q2)" : undefined}
        />
        <circle
          cx="38"
          cy="100"
          r="2.5"
          fill={sf1Ready || qf1Winner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
        />

        {/* QF2 direto para SF2 (Y = 400) */}
        <path
          d="M 0 400 H 38"
          stroke={qf2Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={qf2Winner ? "url(#gold-glow-q2)" : undefined}
        />
        <circle
          cx="38"
          cy="400"
          r="2.5"
          fill={sf2Ready || qf2Winner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-full h-full overflow-visible pointer-events-none"
      viewBox="0 0 40 600"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <filter id="gold-glow-q" filterUnits="userSpaceOnUse" x="-10" y="0" width="60" height="600">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F4AF23" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Rota 1: QF1 direto para SF1 (Y = 100) */}
      <path
        d="M 0 100 H 38"
        stroke={qf1Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={qf1Winner ? "url(#gold-glow-q)" : undefined}
      />
      <circle
        cx="38"
        cy="100"
        r="2.5"
        fill={qf1Winner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
      />

      {/* Rota 2: QF2 (Y = 300) desce para SF2 (Y = 400) */}
      <path
        d="M 0 300 H 14 Q 20 300 20 306 V 394 Q 20 400 26 400 H 38"
        stroke={qf2Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={qf2Winner ? "url(#gold-glow-q)" : undefined}
      />

      {/* Rota 3: QF3 (Y = 500) sobe para SF2 (Y = 400) */}
      <path
        d="M 0 500 H 14 Q 20 500 20 494 V 406 Q 20 400 26 400 H 38"
        stroke={qf3Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={qf3Winner ? "url(#gold-glow-q)" : undefined}
      />

      {/* Ponto de fusão em SF2 (Y = 400) */}
      <circle
        cx="38"
        cy="400"
        r="2.5"
        fill={sf2Ready || qf2Winner || qf3Winner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
      />
    </svg>
  );
}

// Conector Contínuo SVG entre Semifinais e Grande Final
interface SemiToFinalConnectorProps {
  sf1Winner: boolean;
  sf2Winner: boolean;
  finalReady: boolean;
}

function SemiToFinalConnector({ sf1Winner, sf2Winner, finalReady }: SemiToFinalConnectorProps) {
  return (
    <svg
      className="w-full h-full overflow-visible pointer-events-none"
      viewBox="0 0 40 600"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <filter id="gold-glow-s" filterUnits="userSpaceOnUse" x="-10" y="0" width="60" height="600">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F4AF23" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Rota SF1 (Y = 100) desce para Grande Final (Y = 250) */}
      <path
        d="M 0 100 H 14 Q 20 100 20 106 V 244 Q 20 250 26 250 H 38"
        stroke={sf1Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={sf1Winner ? "url(#gold-glow-s)" : undefined}
      />

      {/* Rota SF2 (Y = 400) sobe para Grande Final (Y = 250) */}
      <path
        d="M 0 400 H 14 Q 20 400 20 394 V 256 Q 20 250 26 250 H 38"
        stroke={sf2Winner ? "#F4AF23" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={sf2Winner ? "url(#gold-glow-s)" : undefined}
      />

      {/* Ponto de fusão na Grande Final (Y = 250) */}
      <circle
        cx="38"
        cy="250"
        r="2.5"
        fill={finalReady || sf1Winner || sf2Winner ? "#F4AF23" : "rgba(255,255,255,0.3)"}
      />
    </svg>
  );
}

function findAndClearMatch(bracket: PlayoffBracket, matchId: string): any {
  if (matchId === 'final' && bracket.final) {
    const m = bracket.final;
    m.homeScore = null; m.awayScore = null; m.homeScoreP = null; m.awayScoreP = null; m.winnerId = null;
    return m;
  }
  const q = bracket.quarterfinals.find(x => x.id === matchId);
  if (q) { q.homeScore = null; q.awayScore = null; q.homeScoreP = null; q.awayScoreP = null; q.winnerId = null; return q; }
  const pi = bracket.playIns?.find(x => x.id === matchId);
  if (pi) { pi.homeScore = null; pi.awayScore = null; pi.homeScoreP = null; pi.awayScoreP = null; pi.winnerId = null; return pi; }
  const s = bracket.semifinals.find(x => x.id === matchId);
  if (s) { s.homeScore = null; s.awayScore = null; s.homeScoreP = null; s.awayScoreP = null; s.winnerId = null; return s; }
  return null;
}
