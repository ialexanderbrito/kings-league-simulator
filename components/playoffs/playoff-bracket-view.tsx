import React, { useEffect, useMemo, useState } from "react";
import { PlayoffBracket, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { useTeamTheme } from "@/contexts/team-theme-context";
import { Trophy, Sparkles, Info } from "lucide-react";
import { getProxyImageUrl } from "@/lib/utils";
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
        <div className="mb-6 sm:mb-7 flex justify-center">
          <div className="w-full max-w-[360px] rounded-2xl border border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm px-3.5 py-3 sm:px-4 sm:py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 rounded-full bg-[var(--team-primary)]/20 blur-sm" aria-hidden="true" />
                <img
                  src={getProxyImageUrl(champion.logo?.url)}
                  alt={`Logo ${champion.name}`}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[var(--team-primary)]/35 bg-background object-contain p-1"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--team-primary)]/35 bg-[var(--team-primary)]/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-foreground/90">
                  <Trophy className="w-3.5 h-3.5 text-[var(--team-primary)]" />
                  Campeão
                </div>
                <p className="mt-1.5 text-base sm:text-lg font-semibold leading-tight text-foreground truncate" title={champion.name}>
                  {champion.name}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" />
                  Melhor campanha no bracket
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bracket grid com linhas SVG */}
      <div className="relative overflow-x-auto pb-2">
        <div className="grid grid-cols-3 gap-x-3 sm:gap-x-5 md:gap-x-8 gap-y-4 sm:gap-y-6 md:gap-y-8 min-h-[360px] sm:min-h-[400px] md:min-h-[420px] min-w-[920px] md:min-w-0">
          {/* Quartas de final */}
          <div className="flex flex-col justify-between h-full min-h-[260px] sm:min-h-[300px] md:min-h-[320px]">
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
          <div className="flex flex-col justify-between h-full min-h-[170px] sm:min-h-[200px] md:min-h-[220px]">
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
          <div className="flex flex-col justify-center h-full min-h-[90px] sm:min-h-[100px] md:min-h-[120px]">
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
