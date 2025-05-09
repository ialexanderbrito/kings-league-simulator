import React, { useState, useEffect } from "react";
import { PlayoffBracket, PlayoffMatch, Team } from "@/types/kings-league";
import { PlayoffMatchCard } from "./playoff-match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePlayoffBracket } from "@/lib/generate-playoff-bracket";
import { useTeamTheme } from "@/contexts/team-theme-context";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    bracket.quarterfinals.forEach(match => {
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

    // Semifinais
    bracket.semifinals.forEach(match => {
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

    // Final
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

                if (nextMatch.nextMatchId === 'final') {
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

  const champion = bracket.final.winnerId ? teams[bracket.final.winnerId] : null;

  return (
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="border-b border-[#333] pb-3">
        <CardTitle className="text-xl flex items-center gap-2 text-[var(--team-primary)]">
          <Trophy className="w-5 h-5" />
          Playoffs Kings League
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {champion && (
          <div className="mb-8 mx-auto max-w-lg bg-gradient-to-r from-[#1c1c1c] via-[#252525] to-[#1c1c1c] rounded-xl p-4 xs:p-6 shadow-lg border border-[#333] overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-repeat" style={{
              backgroundImage: 'url("/bg-card-president.jpg")',
              backgroundSize: '200px'
            }}></div>

            <div className="flex flex-col items-center justify-center relative z-10">
              <div className="absolute -top-2 left-0 right-0 flex justify-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
              </div>

              <h2 className="text-lg sm:text-2xl text-center font-bold text-[var(--team-primary)] mt-6 sm:mt-8 mb-3 sm:mb-4">
                CAMPEÃO KINGS LEAGUE 2025
              </h2>

              <div className="w-16 h-16 sm:w-24 sm:h-24 relative mb-3 sm:mb-4 ring-3 sm:ring-4 ring-yellow-500 rounded-full p-1.5 sm:p-2 bg-black">
                <img
                  src={champion.logo?.url || "/placeholder.svg"}
                  alt={champion.name}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full"
                  loading="lazy"
                />
              </div>

              <div className="w-full px-2 flex flex-col items-center">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500 truncate w-full text-center"
                  title={champion.name}
                >
                  {champion.name}
                </h3>

                <span className="text-xs sm:text-sm text-gray-300 mt-1 block">
                  {champion.shortName}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-transparent to-yellow-500/50"></div>
                <span className="text-yellow-200 font-medium text-xs sm:text-sm uppercase tracking-wider">Temporada 2025</span>
                <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-l from-transparent to-yellow-500/50"></div>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className={cn("md:hidden mb-4", !isMobile && "hidden")}>
            <TabsList className="grid w-full grid-cols-3 bg-[#252525]">
              <TabsTrigger
                value="quarterfinals"
                className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black"
              >
                Quartas
              </TabsTrigger>
              <TabsTrigger
                value="semifinals"
                className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black"
              >
                Semifinais
              </TabsTrigger>
              <TabsTrigger
                value="final"
                className="data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black"
              >
                Final
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="quarterfinals" className="mt-0 md:hidden">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Quartas de Final</h3>
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

          <TabsContent value="semifinals" className="mt-0 md:hidden">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Semifinais</h3>
              <div className="flex flex-col gap-4">
                {bracket.semifinals.map(match => (
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
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="final" className="mt-0 md:hidden">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Final</h3>
              <PlayoffMatchCard
                match={bracket.final}
                teams={teams}
                onScoreChange={handleScoreChange}
                onShootoutWinnerSelect={handleShootoutWinnerSelect}
                currentScores={scores[bracket.final.id] || { home: "", away: "", shootoutWinner: null }}
                showShootout={showShootout[bracket.final.id] || false}
                stage="final"
                favoriteTeam={favoriteTeam}
              />
            </div>
          </TabsContent>

          <TabsContent value="desktop" className="mt-0 hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Quartas de Final</h3>
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

              <div>
                <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Semifinais</h3>
                <div className="flex flex-col h-full">
                  <div className="pt-16 flex items-center">
                    <PlayoffMatchCard
                      match={bracket.semifinals[0]}
                      teams={teams}
                      onScoreChange={handleScoreChange}
                      onShootoutWinnerSelect={handleShootoutWinnerSelect}
                      currentScores={scores[bracket.semifinals[0].id] || { home: "", away: "", shootoutWinner: null }}
                      showShootout={showShootout[bracket.semifinals[0].id] || false}
                      stage="semifinal"
                      favoriteTeam={favoriteTeam}
                    />
                  </div>

                  <div className="pt-6 flex items-center">
                    <PlayoffMatchCard
                      match={bracket.semifinals[1]}
                      teams={teams}
                      onScoreChange={handleScoreChange}
                      onShootoutWinnerSelect={handleShootoutWinnerSelect}
                      currentScores={scores[bracket.semifinals[1].id] || { home: "", away: "", shootoutWinner: null }}
                      showShootout={showShootout[bracket.semifinals[1].id] || false}
                      stage="semifinal"
                      favoriteTeam={favoriteTeam}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[var(--team-primary)] mb-4">Final</h3>
                <div className="flex items-center h-full justify-center">
                  <PlayoffMatchCard
                    match={bracket.final}
                    teams={teams}
                    onScoreChange={handleScoreChange}
                    onShootoutWinnerSelect={handleShootoutWinnerSelect}
                    currentScores={scores[bracket.final.id] || { home: "", away: "", shootoutWinner: null }}
                    showShootout={showShootout[bracket.final.id] || false}
                    stage="final"
                    favoriteTeam={favoriteTeam}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-[#252525] border border-[#333] rounded-lg">
          <h4 className="text-sm font-medium text-[var(--team-primary)] mb-2">Formato dos Playoffs (Atualizado em 16.04.2025)</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              O 1º colocado avança diretamente para as Semifinais
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Quartas de Final: 4º vs 5º, 3º vs 6º, 2º vs 7º
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Semifinal 1: 1º vs vencedor de (4º vs 5º)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Semifinal 2: vencedor de (3º vs 6º) vs vencedor de (2º vs 7º)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Sistema eliminatório: quem perder está fora!
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}