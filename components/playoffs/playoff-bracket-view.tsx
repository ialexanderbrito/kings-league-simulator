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
  const [winners, setWinners] = useState<Record<string, "home" | "away" | null>>({});
  const [activeTab, setActiveTab] = useState("desktop");
  const [isMobile, setIsMobile] = useState(false);
  const [lastMobileTab, setLastMobileTab] = useState<string>("quarterfinals");

  // Detectar se estamos em um dispositivo móvel
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

  // Função para lidar com mudança de aba
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue !== "desktop") {
      setLastMobileTab(tabValue);
    }
  };

  // Inicializar os vencedores baseado no bracket
  useEffect(() => {
    const initialWinners: Record<string, "home" | "away" | null> = {};

    // Quartas de final
    if (Array.isArray(bracket.quarterfinals)) {
      bracket.quarterfinals.forEach(match => {
        if (!match) return;

        let winner: "home" | "away" | null = null;
        if (match.winnerId) {
          winner = match.winnerId === match.homeTeamId ? "home" : "away";
        }
        initialWinners[match.id] = winner;
      });
    }

    // Semifinais
    if (Array.isArray(bracket.semifinals)) {
      bracket.semifinals.forEach(match => {
        if (!match) return;

        let winner: "home" | "away" | null = null;
        if (match.winnerId) {
          winner = match.winnerId === match.homeTeamId ? "home" : "away";
        }
        initialWinners[match.id] = winner;
      });
    }

    // Final
    if (bracket.final) {
      let winner: "home" | "away" | null = null;
      if (bracket.final.winnerId) {
        winner = bracket.final.winnerId === bracket.final.homeTeamId ? "home" : "away";
      }
      initialWinners[bracket.final.id] = winner;
    }

    setWinners(initialWinners);
  }, [bracket]);

  // Handler para selecionar vencedor
  const handleWinnerSelect = (
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

    // Atualizar estado local
    const updatedWinners = { ...winners };
    updatedWinners[matchId] = winner;
    setWinners(updatedWinners);

    // Encontrar a partida
    const match =
      bracket.quarterfinals.find(m => m.id === matchId) ||
      bracket.semifinals.find(m => m.id === matchId) ||
      (matchId === 'final' ? bracket.final : undefined);

    if (!match) return;

    // Se não selecionou vencedor, limpar tudo
    if (!winner) {
      const updatedBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;

      if (matchId.startsWith('qf')) {
        const qfMatch = updatedBracket.quarterfinals.find(m => m.id === matchId);
        if (qfMatch) {
          qfMatch.homeScore = null;
          qfMatch.awayScore = null;
          qfMatch.homeScoreP = null;
          qfMatch.awayScoreP = null;
          qfMatch.winnerId = null;
        }
      } else if (matchId.startsWith('sf')) {
        const sfMatch = updatedBracket.semifinals.find(m => m.id === matchId);
        if (sfMatch) {
          sfMatch.homeScore = null;
          sfMatch.awayScore = null;
          sfMatch.homeScoreP = null;
          sfMatch.awayScoreP = null;
          sfMatch.winnerId = null;
        }
      } else if (matchId === 'final' && updatedBracket.final) {
        updatedBracket.final.homeScore = null;
        updatedBracket.final.awayScore = null;
        updatedBracket.final.homeScoreP = null;
        updatedBracket.final.awayScoreP = null;
        updatedBracket.final.winnerId = null;
      }

      onBracketUpdate(updatedBracket);
      if (isMobile && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
      return;
    }

    // Definir placares fictícios (2x1 para o vencedor)
    const homeScore = winner === "home" ? 2 : 1;
    const awayScore = winner === "away" ? 2 : 1;

    // Atualizar o bracket
    const updatedBracket = updatePlayoffBracket(
      bracket,
      matchId,
      homeScore,
      awayScore
    );

    onBracketUpdate(updatedBracket);

    if (isMobile && targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  };

  const champion = bracket.final?.winnerId ? teams[bracket.final.winnerId] : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Champion Banner */}
      {champion && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--team-primary)]/10 via-card to-card border-[var(--team-primary)]/30 shadow-xl">
          <div className="absolute inset-0 bg-[var(--team-primary)] opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--team-primary)] opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--team-primary)] opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              {/* Logo do time campeão */}
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--team-primary)] opacity-30 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 ring-4 ring-[var(--team-primary)]/40 rounded-full p-4 bg-background/80 backdrop-blur-sm shadow-2xl shadow-[var(--team-primary)]/20">
                  <img
                    src={champion.logo?.url || "/placeholder.svg"}
                    alt={`Logo ${champion.name}`}
                    className="object-contain w-full h-full drop-shadow-lg"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Informações do campeão */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--team-primary)] opacity-20 blur-xl animate-pulse"></div>
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--team-primary)] relative z-10 drop-shadow-[0_0_15px_rgba(244,175,35,0.6)]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                      Campeão dos Playoffs
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
                      {champion.name}
                    </h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Parabéns ao <span className="font-semibold text-[var(--team-primary)]">{champion.name}</span> pela conquista do título dos playoffs!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bracket Content */}
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-foreground">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--team-primary)]" />
              Chaveamento dos Playoffs
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Clique nos botões para selecionar os vencedores
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 lg:p-6">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Mobile Tabs */}
            <div className={cn("md:hidden mb-4", !isMobile && "hidden")}>
              <TabsList className="grid w-full grid-cols-3 bg-muted h-11">
                <TabsTrigger
                  value="quarterfinals"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground text-xs sm:text-sm font-medium"
                >
                  Quartas
                </TabsTrigger>
                <TabsTrigger
                  value="semifinals"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground text-xs sm:text-sm font-medium"
                >
                  Semis
                </TabsTrigger>
                <TabsTrigger
                  value="final"
                  className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-primary-foreground text-xs sm:text-sm font-medium"
                >
                  Final
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Quarterfinals Tab */}
            <TabsContent value="quarterfinals" className="mt-0 md:hidden">
              <div className="space-y-3 sm:space-y-4">
                {bracket.quarterfinals.map((match, index) => (
                  <PlayoffMatchCard
                    key={match.id}
                    match={match}
                    teams={teams}
                    onWinnerSelect={handleWinnerSelect}
                    selectedWinner={winners[match.id] || null}
                    stage="quarterfinal"
                    favoriteTeam={favoriteTeam}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Semifinals Tab */}
            <TabsContent value="semifinals" className="mt-0 md:hidden">
              <div className="space-y-3 sm:space-y-4">
                {bracket.semifinals.map((match) => (
                  <PlayoffMatchCard
                    key={match.id}
                    match={match}
                    teams={teams}
                    onWinnerSelect={handleWinnerSelect}
                    selectedWinner={winners[match.id] || null}
                    stage="semifinal"
                    favoriteTeam={favoriteTeam}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Final Tab */}
            <TabsContent value="final" className="mt-0 md:hidden">
              <div className="space-y-3 sm:space-y-4">
                {bracket.final && (
                  <PlayoffMatchCard
                    match={bracket.final}
                    teams={teams}
                    onWinnerSelect={handleWinnerSelect}
                    selectedWinner={winners[bracket.final.id] || null}
                    stage="final"
                    favoriteTeam={favoriteTeam}
                  />
                )}
              </div>
            </TabsContent>

            {/* Desktop View - Bracket Horizontal */}
            <TabsContent value="desktop" className="mt-0 hidden md:block">
              <div className="overflow-x-auto overflow-y-hidden pb-6 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">
                <div className="flex items-start gap-6 lg:gap-10 xl:gap-12 min-w-[850px] py-6">
                  {/* Quartas de Final */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="text-center mb-6 lg:mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20">
                        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-[var(--team-primary)]">
                          Quartas de Final
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                      {bracket.quarterfinals.map((match) => (
                        <PlayoffMatchCard
                          key={match.id}
                          match={match}
                          teams={teams}
                          onWinnerSelect={handleWinnerSelect}
                          selectedWinner={winners[match.id] || null}
                          stage="quarterfinal"
                          favoriteTeam={favoriteTeam}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Semifinais */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="text-center mb-6 lg:mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20">
                        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-[var(--team-primary)]">
                          Semifinais
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-8 lg:space-y-12 flex flex-col justify-center" style={{ minHeight: '450px' }}>
                      {bracket.semifinals.map((match) => (
                        <PlayoffMatchCard
                          key={match.id}
                          match={match}
                          teams={teams}
                          onWinnerSelect={handleWinnerSelect}
                          selectedWinner={winners[match.id] || null}
                          stage="semifinal"
                          favoriteTeam={favoriteTeam}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Final */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="text-center mb-6 lg:mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20">
                        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-[var(--team-primary)]">
                          Final
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-center" style={{ minHeight: '450px' }}>
                      {bracket.final && (
                        <div className="w-full">
                          <PlayoffMatchCard
                            match={bracket.final}
                            teams={teams}
                            onWinnerSelect={handleWinnerSelect}
                            selectedWinner={winners[bracket.final.id] || null}
                            stage="final"
                            favoriteTeam={favoriteTeam}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rules Card */}
      <Alert className="bg-card border-border shadow-sm">
        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--team-primary)] flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-muted-foreground mt-0 ml-2 space-y-3">
          <div>
            <p className="font-bold text-sm sm:text-base text-foreground mb-2">
              💡 Como usar o simulador
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[var(--team-primary)] mt-0.5">•</span>
                <span>Clique no <strong>botão circular</strong> ao lado do time para selecionar o vencedor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--team-primary)] mt-0.5">•</span>
                <span>Você pode <strong>mudar sua escolha</strong> quantas vezes quiser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--team-primary)] mt-0.5">•</span>
                <span>O sistema <strong>atualiza automaticamente</strong> as próximas fases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--team-primary)] mt-0.5">•</span>
                <span>Simule todas as partidas até descobrir o <strong className="text-[var(--team-primary)]">campeão</strong>!</span>
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
