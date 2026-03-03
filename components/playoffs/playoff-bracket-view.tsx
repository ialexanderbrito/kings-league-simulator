import React, { useEffect, useMemo, useState } from "react";
import { PlayoffBracket, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { Card, CardContent } from "@/components/ui/card";
import { updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { useTeamTheme } from "@/contexts/team-theme-context";
import { Trophy, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { cn, getProxyImageUrl } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";


interface PlayoffBracketViewProps {
  bracket: PlayoffBracket | null;
  teams: Record<string, Team>;
  onBracketUpdate: (updatedBracket: PlayoffBracket) => void;
}

export function PlayoffBracketView({ bracket, teams, onBracketUpdate }: PlayoffBracketViewProps) {
  const { favoriteTeam } = useTeamTheme();
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
    if (!winner) {
      const updated = JSON.parse(JSON.stringify(localBracket)) as PlayoffBracket;
      const target = findAndClearMatch(updated, matchId);
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
      {/* Banner do campeão */}
      {champion && (
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 via-yellow-200/10 to-transparent border border-yellow-400/30 shadow">
            <Trophy className="w-6 h-6 text-yellow-500 drop-shadow" />
            <span className="font-bold text-lg text-yellow-700">{champion.name}</span>
            <span className="text-xs text-yellow-700 font-medium uppercase ml-2">Campeão</span>
          </div>
          <img
            src={getProxyImageUrl(champion.logo?.url)}
            alt={`Logo ${champion.name}`}
            className="w-20 h-20 mt-2 rounded-full border-4 border-yellow-400 bg-white object-contain shadow-lg"
            loading="lazy"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Bracket grid com linhas SVG */}
      <div className="relative overflow-x-auto">
        <div className="grid grid-cols-3 gap-x-8 gap-y-8 min-h-[420px]">
          {/* Quartas de final */}
          <div className="flex flex-col justify-between h-full min-h-[320px]">
            {quarterfinals.map((m, i) => (
              <div key={m.id} className="relative flex-1 flex items-center">
                <PlayoffMatchCard
                  match={m}
                  teams={teams}
                  onWinnerSelect={handleWinnerSelect}
                  selectedWinner={m.winnerId ? (m.winnerId === m.homeTeamId ? "home" : "away") : null}
                  stage="quarterfinal"
                  favoriteTeam={favoriteTeam ? teams[favoriteTeam.id] : null}
                  isLive={Boolean(m.homeScore !== null || m.awayScore !== null) && !m.winnerId}
                  youtubeUrl={m.youtubeUrl || undefined}
                />
                {/* Linha para semifinais (SVG) */}
                <BracketLine fromCol={1} toCol={2} fromRow={i} totalRows={quarterfinals.length} />
              </div>
            ))}
          </div>
          {/* Semifinais */}
          <div className="flex flex-col justify-between h-full min-h-[220px]">
            {semifinals.map((m, i) => (
              <div key={m.id} className="relative flex-1 flex items-center">
                <PlayoffMatchCard
                  match={m}
                  teams={teams}
                  onWinnerSelect={handleWinnerSelect}
                  selectedWinner={m.winnerId ? (m.winnerId === m.homeTeamId ? "home" : "away") : null}
                  stage="semifinal"
                  favoriteTeam={favoriteTeam ? teams[favoriteTeam.id] : null}
                  isLive={Boolean(m.homeScore !== null || m.awayScore !== null) && !m.winnerId}
                  youtubeUrl={m.youtubeUrl || undefined}
                />
                {/* Linha para final (SVG) */}
                <BracketLine fromCol={2} toCol={3} fromRow={i} totalRows={semifinals.length} />
              </div>
            ))}
          </div>
          {/* Final */}
          <div className="flex flex-col justify-center h-full min-h-[120px]">
            {finalMatch ? (
              <PlayoffMatchCard
                match={finalMatch}
                teams={teams}
                onWinnerSelect={handleWinnerSelect}
                selectedWinner={finalMatch.winnerId ? (finalMatch.winnerId === finalMatch.homeTeamId ? "home" : "away") : null}
                stage="final"
                favoriteTeam={favoriteTeam ? teams[favoriteTeam.id] : null}
                isLive={Boolean(finalMatch.homeScore !== null || finalMatch.awayScore !== null) && !finalMatch.winnerId}
                youtubeUrl={finalMatch.youtubeUrl || undefined}
              />
            ) : (
              <div className="text-sm text-muted-foreground">Final ainda não definida</div>
            )}
          </div>
        </div>
      </div>

      {/* Legenda e instruções */}
      <div className="mt-6">
        <Alert className="bg-card border-border shadow-sm">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--team-primary)] flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground mt-0 ml-2">
            Clique no botão ao lado do time para marcar vencedor. O sistema atualizará automaticamente próximos confrontos.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// Linha SVG entre colunas do bracket
function BracketLine({ fromCol, toCol, fromRow, totalRows }: { fromCol: number; toCol: number; fromRow: number; totalRows: number }) {
  // Só desenha em desktop
  if (typeof window !== "undefined" && window.innerWidth < 768) return null;
  // Calcula posição vertical
  const y = 60 + fromRow * 120;
  const x1 = fromCol * 260 + 200;
  const x2 = toCol * 260 + 40;
  return (
    <svg className="absolute left-0 top-1/2 -z-10" width="120" height="40" style={{ transform: "translateX(220px) translateY(-20px)" }}>
      <line x1="0" y1="20" x2="120" y2="20" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6 4" />
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
