import React, { useEffect, useMemo, useState } from "react";
import { PlayoffBracket, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { ChampionBanner } from "./champion-banner";
import { updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { Info } from "lucide-react";


interface PlayoffBracketViewProps {
  bracket: PlayoffBracket | null;
  teams: Record<string, Team>;
  onBracketUpdate: (updatedBracket: PlayoffBracket) => void;
  hasTwoGroups?: boolean;
}

export function PlayoffBracketView({ bracket, teams, onBracketUpdate, hasTwoGroups = false }: PlayoffBracketViewProps) {
  const [localBracket, setLocalBracket] = useState<PlayoffBracket | null>(bracket ?? null);

  useEffect(() => setLocalBracket(bracket ?? null), [bracket]);

  // If there's no bracket, show a friendly placeholder to avoid runtime errors
  if (!localBracket) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Bracket não disponível
      </div>
    );
  }

  const quarterfinals = useMemo(() => localBracket.quarterfinals || [], [localBracket]);
  const semifinals = useMemo(() => localBracket.semifinals || [], [localBracket]);
  const finalMatch = useMemo(() => localBracket.final || null, [localBracket]);

  // Handler para seleção de vencedor
  const handleWinnerSelect = (matchId: string, winner: "home" | "away" | null) => {
    // Partidas já encerradas oficialmente não podem ter vencedor alterado
    const allMatches = [
      ...(localBracket?.quarterfinals || []),
      ...(localBracket?.semifinals || []),
      ...(localBracket?.final ? [localBracket.final] : [])
    ];
    const target = allMatches.find(m => m.id === matchId);
    if (
      target && (
        target.status === "ended" ||
        target.status?.toLowerCase() === "ended" ||
        target.status?.toLowerCase() === "finished" ||
        (target.homeScore !== null && target.awayScore !== null && target.homeScore !== undefined && target.awayScore !== undefined)
      )
    ) {
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
      const updated = updatePlayoffBracket(localBracket, matchId, homeScore, awayScore, null, null);
      setLocalBracket(updated);
      onBracketUpdate(updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao atualizar bracket:", err);
    }
  };

  // Campeão
  const champion = finalMatch && finalMatch.winnerId ? teams[finalMatch.winnerId] : null;

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

      {/* Mobile scroll hint */}
      <div className="flex md:hidden items-center justify-between px-1 pb-2 text-[10px] text-zinc-400 select-none">
        <span className="font-semibold uppercase tracking-wider text-zinc-500">Chaveamento Eliminatório</span>
        <span className="flex items-center gap-1 text-[var(--team-primary,#F4AF23)] font-semibold">
          Deslize para ver tudo →
        </span>
      </div>

      {/* Bracket grid com linhas e headers de fase */}
      <div className="relative overflow-x-auto pb-4 scrollbar-minimal">
        {/* Headers das fases */}
        <div className="grid grid-cols-[1fr,24px,1fr,24px,1fr] sm:grid-cols-[1fr,36px,1fr,36px,1fr] min-w-[760px] lg:min-w-0 mb-3 px-1">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Quartas de Final</span>
            <span className="text-[10px] text-zinc-500 font-mono">6 Times</span>
          </div>
          <div className="flex items-center justify-center pb-2 border-b border-zinc-800/80 text-zinc-600 text-xs select-none">
            →
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Semifinais</span>
            <span className="text-[10px] text-[var(--team-primary)] font-semibold">1º colocado entra</span>
          </div>
          <div className="flex items-center justify-center pb-2 border-b border-zinc-800/80 text-zinc-600 text-xs select-none">
            →
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Grande Final</span>
            <span className="text-[10px] text-[var(--team-primary)] font-bold">Decisão</span>
          </div>
        </div>

        {/* Grid com 6 linhas exatas e 5 colunas (Partidas + Conectores contínuos) */}
        <div className="grid grid-cols-[1fr,24px,1fr,24px,1fr] sm:grid-cols-[1fr,36px,1fr,36px,1fr] grid-rows-6 min-w-[760px] lg:min-w-0 min-h-[460px] sm:min-h-[500px] gap-y-3">
          {/* Quartas 1: 4º vs 5º (Linhas 1-2) */}
          <div className="col-start-1 row-start-1 row-span-2 flex items-center">
            {quarterfinals[0] && (
              <PlayoffMatchCard
                match={quarterfinals[0]}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={quarterfinals[0].winnerId ? (quarterfinals[0].winnerId === quarterfinals[0].homeTeamId ? "home" : "away") : null}
                stage="quarterfinal"
                isLive={Boolean(quarterfinals[0].homeScore !== null || quarterfinals[0].awayScore !== null) && !quarterfinals[0].winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            )}
          </div>

          {/* Quartas 2: 3º vs 6º (Linhas 3-4) */}
          <div className="col-start-1 row-start-3 row-span-2 flex items-center">
            {quarterfinals[1] && (
              <PlayoffMatchCard
                match={quarterfinals[1]}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={quarterfinals[1].winnerId ? (quarterfinals[1].winnerId === quarterfinals[1].homeTeamId ? "home" : "away") : null}
                stage="quarterfinal"
                isLive={Boolean(quarterfinals[1].homeScore !== null || quarterfinals[1].awayScore !== null) && !quarterfinals[1].winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            )}
          </div>

          {/* Quartas 3: 2º vs 7º (Linhas 5-6) */}
          <div className="col-start-1 row-start-5 row-span-2 flex items-center">
            {quarterfinals[2] && (
              <PlayoffMatchCard
                match={quarterfinals[2]}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={quarterfinals[2].winnerId ? (quarterfinals[2].winnerId === quarterfinals[2].homeTeamId ? "home" : "away") : null}
                stage="quarterfinal"
                isLive={Boolean(quarterfinals[2].homeScore !== null || quarterfinals[2].awayScore !== null) && !quarterfinals[2].winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            )}
          </div>

          {/* Conector 1: Quartas -> Semifinais (Linhas 1-6 contínuas) */}
          <div className="col-start-2 row-start-1 row-span-6 relative w-full h-full py-1">
            <QuarterToSemiConnector
              qf1Winner={Boolean(quarterfinals[0]?.winnerId)}
              qf2Winner={Boolean(quarterfinals[1]?.winnerId)}
              qf3Winner={Boolean(quarterfinals[2]?.winnerId)}
              sf2Ready={Boolean(quarterfinals[1]?.winnerId && quarterfinals[2]?.winnerId)}
            />
          </div>

          {/* Semifinal 1: 1º vs Venc. QF1 (Linhas 1-2, alinhada com QF1) */}
          <div className="col-start-3 row-start-1 row-span-2 flex items-center">
            {semifinals[0] && (
              <PlayoffMatchCard
                match={semifinals[0]}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={semifinals[0].winnerId ? (semifinals[0].winnerId === semifinals[0].homeTeamId ? "home" : "away") : null}
                stage="semifinal"
                isLive={Boolean(semifinals[0].homeScore !== null || semifinals[0].awayScore !== null) && !semifinals[0].winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            )}
          </div>

          {/* Semifinal 2: Venc. QF2 vs Venc. QF3 (Linhas 4-5, centralizada entre QF2 e QF3) */}
          <div className="col-start-3 row-start-4 row-span-2 flex items-center">
            {semifinals[1] && (
              <PlayoffMatchCard
                match={semifinals[1]}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={semifinals[1].winnerId ? (semifinals[1].winnerId === semifinals[1].homeTeamId ? "home" : "away") : null}
                stage="semifinal"
                isLive={Boolean(semifinals[1].homeScore !== null || semifinals[1].awayScore !== null) && !semifinals[1].winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            )}
          </div>

          {/* Conector 2: Semifinais -> Grande Final (Linhas 1-6 contínuas) */}
          <div className="col-start-4 row-start-1 row-span-6 relative w-full h-full py-1">
            <SemiToFinalConnector
              sf1Winner={Boolean(semifinals[0]?.winnerId)}
              sf2Winner={Boolean(semifinals[1]?.winnerId)}
              finalReady={Boolean(semifinals[0]?.winnerId && semifinals[1]?.winnerId)}
            />
          </div>

          {/* Grande Final (Linhas 2-4, centralizada entre SF1 e SF2) */}
          <div className="col-start-5 row-start-2 row-span-3 flex items-center">
            {finalMatch ? (
              <PlayoffMatchCard
                match={finalMatch}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={finalMatch.winnerId ? (finalMatch.winnerId === finalMatch.homeTeamId ? "home" : "away") : null}
                stage="final"
                isLive={Boolean(finalMatch.homeScore !== null || finalMatch.awayScore !== null) && !finalMatch.winnerId}
                hasTwoGroups={hasTwoGroups}
              />
            ) : (
              <div className="w-full rounded-2xl border border-zinc-800 bg-[#09090d]/60 backdrop-blur-md p-6 text-center text-xs text-zinc-500">
                Aguardando definição das semifinais
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legenda e instruções */}
      <div className="mt-6">
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#09090d]/60 backdrop-blur-md px-4 py-3 text-xs text-zinc-400">
          <Info className="h-4 w-4 text-[var(--team-primary)] flex-shrink-0" />
          <span>
            Clique no seletor de vencedor (<strong>1</strong> ou <strong>2</strong>) de cada jogo para avançar o time na chave. {hasTwoGroups ? "O chaveamento segue a classificação dos grupos." : "O 1º colocado avança diretamente à Semifinal 1, enquanto os times classificados de 2º a 7º disputam as Quartas de Final."}
          </span>
        </div>
      </div>
    </div>
  );
}

// Conector Contínuo SVG entre Quartas de Final e Semifinais
interface QuarterToSemiConnectorProps {
  qf1Winner: boolean;
  qf2Winner: boolean;
  qf3Winner: boolean;
  sf2Ready: boolean;
}

function QuarterToSemiConnector({ qf1Winner, qf2Winner, qf3Winner, sf2Ready }: QuarterToSemiConnectorProps) {
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
  const s = bracket.semifinals.find(x => x.id === matchId);
  if (s) { s.homeScore = null; s.awayScore = null; s.homeScoreP = null; s.awayScoreP = null; s.winnerId = null; return s; }
  return null;
}
