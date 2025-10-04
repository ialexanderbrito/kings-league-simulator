import React, { useState, useEffect } from "react";
import { PlayoffBracket, PlayoffMatch, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { useTeamTheme } from "@/contexts/team-theme-context";
import { Trophy, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlayoffBracketViewProps {
  bracket: PlayoffBracket;
  teams: Record<string, Team>;
  onBracketUpdate: (updatedBracket: PlayoffBracket) => void;
}

export function PlayoffBracketView({
  bracket,
  teams,
  onBracketUpdate
}: PlayoffBracketViewProps) {
  const { favoriteTeam } = useTeamTheme();
  const [scores, setScores] = useState<Record<string, {
    home: string;
    away: string;
    shootoutWinner: "home" | "away" | null;
  }>>({});
  const [showShootout, setShowShootout] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [lastMobileTab, setLastMobileTab] = useState<string>("quarterfinals");

  // Detectar se estamos em um dispositivo móvel para escolher a visualização correta
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      if (activeTab === "desktop" || !activeTab) {
        const initialTab = isMobileView ? "quarterfinals" : "desktop";
        setActiveTab(initialTab);
        setLastMobileTab(initialTab === "desktop" ? "quarterfinals" : initialTab);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [activeTab]);

  // Função personalizada para lidar com a mudança de aba
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue !== "desktop") {
      setLastMobileTab(tabValue);
    }
  };

  // Inicializar os placares
  useEffect(() => {
    const initialScores: Record<string, {
      home: string;
      away: string;
      shootoutWinner: "home" | "away" | null;
    }> = {};
    const initialShowShootout: Record<string, boolean> = {};

    // Quartas de final
    if (Array.isArray(bracket.quarterfinals)) {
      bracket.quarterfinals.forEach(match => {
        if (!match) return;

        const matchKey = match.id;
        initialScores[matchKey] = {
          home: match.homeScore !== null ? match.homeScore.toString() : "",
          away: match.awayScore !== null ? match.awayScore.toString() : "",
          shootoutWinner: match.homeScoreP !== null && match.awayScoreP !== null
            ? (match.homeScoreP > match.awayScoreP ? "home" : "away")
            : null
        };

        initialShowShootout[matchKey] =
          (match.homeScoreP !== null && match.awayScoreP !== null) ||
          (match.homeScore === match.awayScore && match.homeScore !== null);
      });
    }

    // Semifinais
    if (Array.isArray(bracket.semifinals)) {
      bracket.semifinals.forEach(match => {
        if (!match) return;

        const matchKey = match.id;
        initialScores[matchKey] = {
          home: match.homeScore !== null ? match.homeScore.toString() : "",
          away: match.awayScore !== null ? match.awayScore.toString() : "",
          shootoutWinner: match.homeScoreP !== null && match.awayScoreP !== null
            ? (match.homeScoreP > match.awayScoreP ? "home" : "away")
            : null
        };

        initialShowShootout[matchKey] =
          (match.homeScoreP !== null && match.awayScoreP !== null) ||
          (match.homeScore === match.awayScore && match.homeScore !== null);
      });
    }

    // Final
    if (bracket.final) {
      const finalKey = bracket.final.id;
      initialScores[finalKey] = {
        home: bracket.final.homeScore !== null ? bracket.final.homeScore.toString() : "",
        away: bracket.final.awayScore !== null ? bracket.final.awayScore.toString() : "",
        shootoutWinner: bracket.final.homeScoreP !== null && bracket.final.awayScoreP !== null
          ? (bracket.final.homeScoreP > bracket.final.awayScoreP ? "home" : "away")
          : null
      };

      initialShowShootout[finalKey] =
        (bracket.final.homeScoreP !== null && bracket.final.awayScoreP !== null) ||
        (bracket.final.homeScore === bracket.final.awayScore && bracket.final.homeScore !== null);
    }

    setScores(initialScores);
    setShowShootout(initialShowShootout);
  }, [bracket]);

  const handleScoreChange = (
    matchId: string,
    team: "home" | "away",
    value: string,
    isBackspace?: boolean
  ) => {
    let targetTab = activeTab;

    if (isMobile) {
      if (matchId.startsWith('qf')) {
        targetTab = "quarterfinals";
      } else if (matchId.startsWith('sf')) {
        targetTab = "semifinals";
      } else if (matchId === 'final') {
        targetTab = "final";
      }
    }

    if (isBackspace) {
      setScores(prev => {
        const currentMatch = prev[matchId] || {
          home: "",
          away: "",
          shootoutWinner: null
        };

        return {
          ...prev,
          [matchId]: {
            ...currentMatch,
            [team]: ""
          }
        };
      });

      if (team === "home" || team === "away") {
        setShowShootout(prev => ({
          ...prev,
          [matchId]: false
        }));
      }

      const match =
        bracket.quarterfinals.find(m => m.id === matchId) ||
        bracket.semifinals.find(m => m.id === matchId) ||
        (matchId === 'final' ? bracket.final : undefined);

      if (match) {
        const updatedBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;

        const targetMatch =
          updatedBracket.quarterfinals.find(m => m.id === matchId) ||
          updatedBracket.semifinals.find(m => m.id === matchId) ||
          (matchId === 'final' ? updatedBracket.final : undefined);

        if (targetMatch) {
          if (team === "home") targetMatch.homeScore = null;
          if (team === "away") targetMatch.awayScore = null;

          if (team === "home" || team === "away") {
            targetMatch.homeScoreP = null;
            targetMatch.awayScoreP = null;
            targetMatch.winnerId = null;
          }

          if (targetMatch.winnerId) {
            const previousWinnerId = targetMatch.winnerId;
            targetMatch.winnerId = null;

            if (targetMatch.nextMatchId) {
              const nextMatch =
                updatedBracket.semifinals.find(m => m.id === targetMatch.nextMatchId) ||
                (targetMatch.nextMatchId === 'final' ? updatedBracket.final : undefined);

              if (nextMatch) {
                if (nextMatch.homeTeamId === previousWinnerId) {
                  nextMatch.homeTeamId = null;
                } else if (nextMatch.awayTeamId === previousWinnerId) {
                  nextMatch.awayTeamId = null;
                }

                nextMatch.homeScore = null;
                nextMatch.awayScore = null;
                nextMatch.homeScoreP = null;
                nextMatch.awayScoreP = null;
                nextMatch.winnerId = null;

                if (nextMatch.nextMatchId === 'final' && updatedBracket.final) {
                  const finalMatch = updatedBracket.final;
                  const nextWinnerId = nextMatch.winnerId;
                  if (finalMatch.homeTeamId === nextWinnerId) {
                    finalMatch.homeTeamId = null;
                  } else if (finalMatch.awayTeamId === nextWinnerId) {
                    finalMatch.awayTeamId = null;
                  }
                  finalMatch.homeScore = null;
                  finalMatch.awayScore = null;
                  finalMatch.homeScoreP = null;
                  finalMatch.awayScoreP = null;
                  finalMatch.winnerId = null;
                }
              }
            }
          }

          onBracketUpdate(updatedBracket);
        }
      }

      if (isMobile && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }

      return;
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    setScores(prev => {
      const currentMatch = prev[matchId] || {
        home: "",
        away: "",
        shootoutWinner: null
      };

      const newScores = {
        ...prev,
        [matchId]: {
          ...currentMatch,
          [team]: value
        }
      };

      const updatedMatch = newScores[matchId];

      if (
        updatedMatch.home &&
        updatedMatch.away &&
        updatedMatch.home === updatedMatch.away
      ) {
        setShowShootout(prev => ({
          ...prev,
          [matchId]: true
        }));
      } else if (updatedMatch.home && updatedMatch.away) {
        setShowShootout(prev => ({
          ...prev,
          [matchId]: false
        }));

        newScores[matchId].shootoutWinner = null;

        const homeScore = parseInt(updatedMatch.home);
        const awayScore = parseInt(updatedMatch.away);

        const updatedBracket = updatePlayoffBracket(
          bracket,
          matchId,
          homeScore,
          awayScore
        );

        onBracketUpdate(updatedBracket);
      }

      if (isMobile && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }

      return newScores;
    });
  };

  const handleShootoutWinnerSelect = (
    matchId: string,
    winner: "home" | "away" | null
  ) => {
    let targetTab = activeTab;

    if (isMobile) {
      if (matchId.startsWith('qf')) {
        targetTab = "quarterfinals";
      } else if (matchId.startsWith('sf')) {
        targetTab = "semifinals";
      } else if (matchId === 'final') {
        targetTab = "final";
      }
    }

    setScores(prev => {
      const currentMatch = prev[matchId] || {
        home: "",
        away: "",
        shootoutWinner: null
      };

      const newScores = {
        ...prev,
        [matchId]: {
          ...currentMatch,
          shootoutWinner: winner
        }
      };

      if (winner && currentMatch.home && currentMatch.away) {
        const homeScore = parseInt(currentMatch.home);
        const awayScore = parseInt(currentMatch.away);

        const homeScoreP = winner === "home" ? 5 : 3;
        const awayScoreP = winner === "home" ? 3 : 5;

        const updatedBracket = updatePlayoffBracket(
          bracket,
          matchId,
          homeScore,
          awayScore,
          homeScoreP,
          awayScoreP
        );

        onBracketUpdate(updatedBracket);
      }

      if (isMobile && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }

      return newScores;
    });
  };

  const champion = bracket.final?.winnerId ? teams[bracket.final.winnerId] : null;

  return (
    <div className="space-y-6">
      {/* Champion Banner */}
      {champion && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--team-primary)]/20 blur-3xl rounded-full"></div>
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--team-primary)] relative z-10 drop-shadow-[0_0_10px_rgba(244,175,35,0.5)]" />
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Campeão Kings League 2025
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {champion.name}
                </h2>
              </div>

              <div className="w-20 h-20 sm:w-28 sm:h-28 relative ring-4 ring-[var(--team-primary)]/30 rounded-full p-2 bg-background/50 backdrop-blur-sm">
                <img
                  src={champion.logo?.url || "/placeholder.svg"}
                  alt={`Logo ${champion.name}`}
                  width={112}
                  height={112}
                  className="object-contain w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bracket Content */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--team-primary)]" />
            Chaveamento dos Playoffs
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Mobile Tabs */}
            <div className={cn("md:hidden mb-6", !isMobile && "hidden")}>
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger
                  value="quarterfinals"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground"
                >
                  Quartas
                </TabsTrigger>
                <TabsTrigger
                  value="semifinals"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground"
                >
                  Semifinais
                </TabsTrigger>
                <TabsTrigger
                  value="final"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground"
                >
                  Final
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Quarterfinals Tab */}
            <TabsContent value="quarterfinals" className="mt-0 md:hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                  <h3 className="text-lg font-semibold text-foreground">Quartas de Final</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {bracket.quarterfinals.map(match => (
                    <PlayoffMatchCard
                      key={match.id}
                      match={match}
                      teams={teams}
                      onScoreChange={handleScoreChange}
                      onShootoutWinnerSelect={handleShootoutWinnerSelect}
                      currentScores={scores[match.id] || { home: "", away: "", shootoutWinner: null }}
                      showShootout={showShootout[match.id] || false}
                      stage="quarterfinal"
                      favoriteTeam={favoriteTeam}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Semifinals Tab */}
            <TabsContent value="semifinals" className="mt-0 md:hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                  <h3 className="text-lg font-semibold text-foreground">Semifinais</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {Array.isArray(bracket.semifinals) && bracket.semifinals.map(match => (
                    match && (
                      <PlayoffMatchCard
                        key={match.id}
                        match={match}
                        teams={teams}
                        onScoreChange={handleScoreChange}
                        onShootoutWinnerSelect={handleShootoutWinnerSelect}
                        currentScores={scores[match.id] || { home: "", away: "", shootoutWinner: null }}
                        showShootout={showShootout[match.id] || false}
                        stage="semifinal"
                        favoriteTeam={favoriteTeam}
                        isLive={!match.winnerId && (match.homeScore !== null || match.awayScore !== null)}
                      />
                    )
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Final Tab */}
            <TabsContent value="final" className="mt-0 md:hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                  <h3 className="text-lg font-semibold text-foreground">Final</h3>
                </div>
                {bracket.final && (
                  <PlayoffMatchCard
                    match={bracket.final}
                    teams={teams}
                    onScoreChange={handleScoreChange}
                    onShootoutWinnerSelect={handleShootoutWinnerSelect}
                    currentScores={scores[bracket.final?.id] || { home: "", away: "", shootoutWinner: null }}
                    showShootout={showShootout[bracket.final?.id] || false}
                    stage="final"
                    favoriteTeam={favoriteTeam}
                    isLive={bracket.final && !bracket.final.winnerId &&
                      (bracket.final.homeScore !== null || bracket.final.awayScore !== null)}
                    youtubeUrl={bracket.final.youtubeUrl}
                  />
                )}
              </div>
            </TabsContent>

            {/* Desktop View */}
            <TabsContent value="desktop" className="mt-0 hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quarterfinals */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                    <h3 className="text-lg font-semibold text-foreground">Quartas de Final</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {Array.isArray(bracket.quarterfinals) && bracket.quarterfinals.map(match => (
                      match && (
                        <PlayoffMatchCard
                          key={match.id}
                          match={match}
                          teams={teams}
                          onScoreChange={handleScoreChange}
                          onShootoutWinnerSelect={handleShootoutWinnerSelect}
                          currentScores={scores[match.id] || { home: "", away: "", shootoutWinner: null }}
                          showShootout={showShootout[match.id] || false}
                          stage="quarterfinal"
                          favoriteTeam={favoriteTeam}
                          isLive={!match.winnerId && (match.homeScore !== null || match.awayScore !== null)}
                          youtubeUrl={match.youtubeUrl}
                        />
                      )
                    ))}
                  </div>
                </div>

                {/* Semifinals */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                    <h3 className="text-lg font-semibold text-foreground">Semifinais</h3>
                  </div>
                  <div className="flex flex-col h-full">
                    <div className="pt-16 flex items-center">
                      {Array.isArray(bracket.semifinals) && bracket.semifinals[0] && (
                        <PlayoffMatchCard
                          match={bracket.semifinals[0]}
                          teams={teams}
                          onScoreChange={handleScoreChange}
                          youtubeUrl={bracket.semifinals[0].youtubeUrl}
                          onShootoutWinnerSelect={handleShootoutWinnerSelect}
                          currentScores={scores[bracket.semifinals[0]?.id] || { home: "", away: "", shootoutWinner: null }}
                          showShootout={showShootout[bracket.semifinals[0]?.id] || false}
                          stage="semifinal"
                          favoriteTeam={favoriteTeam}
                          isLive={bracket.semifinals[0] &&
                            !bracket.semifinals[0].winnerId &&
                            (bracket.semifinals[0].homeScore !== null || bracket.semifinals[0].awayScore !== null)}
                        />
                      )}
                    </div>

                    <div className="pt-6 flex items-center">
                      {Array.isArray(bracket.semifinals) && bracket.semifinals[1] && (
                        <PlayoffMatchCard
                          match={bracket.semifinals[1]}
                          teams={teams}
                          onScoreChange={handleScoreChange}
                          onShootoutWinnerSelect={handleShootoutWinnerSelect}
                          currentScores={scores[bracket.semifinals[1]?.id] || { home: "", away: "", shootoutWinner: null }}
                          showShootout={showShootout[bracket.semifinals[1]?.id] || false}
                          stage="semifinal"
                          favoriteTeam={favoriteTeam}
                          isLive={bracket.semifinals[1] &&
                            !bracket.semifinals[1].winnerId &&
                            (bracket.semifinals[1].homeScore !== null || bracket.semifinals[1].awayScore !== null)}
                          youtubeUrl={bracket.semifinals[1].youtubeUrl}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Final */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-[var(--team-primary)]"></div>
                    <h3 className="text-lg font-semibold text-foreground">Final</h3>
                  </div>
                  <div className="flex items-center h-full justify-center">
                    {bracket.final && (
                      <PlayoffMatchCard
                        match={bracket.final}
                        teams={teams}
                        onScoreChange={handleScoreChange}
                        onShootoutWinnerSelect={handleShootoutWinnerSelect}
                        currentScores={scores[bracket.final?.id] || { home: "", away: "", shootoutWinner: null }}
                        showShootout={showShootout[bracket.final?.id] || false}
                        stage="final"
                        favoriteTeam={favoriteTeam}
                        isLive={!bracket.final.winnerId && (bracket.final.homeScore !== null || bracket.final.awayScore !== null)}
                        youtubeUrl={bracket.final.youtubeUrl}
                      />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rules Card */}
      <Alert className="bg-card border-border">
        <Info className="h-4 w-4 text-[var(--team-primary)]" />
        <AlertDescription className="ml-6">
          <h4 className="font-semibold text-foreground mb-3">Formato dos Playoffs</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
              <span>O 1º colocado avança diretamente para as Semifinais</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span>Quartas de Final: 4º vs 5º, 3º vs 6º, 2º vs 7º</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
              <span>Semifinal 1: 1º vs vencedor de (4º vs 5º)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
              <span>Semifinal 2: vencedor de (3º vs 6º) vs vencedor de (2º vs 7º)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Sistema eliminatório: quem perder está fora!</span>
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
