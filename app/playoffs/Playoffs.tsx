"use client"

import { useState, useEffect } from "react"
import { TeamStanding, Team, PlayoffBracket } from "@/types/kings-league"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { generatePlayoffBracket } from "@/lib/generate-playoff-bracket"
import { PlayoffBracketView } from "@/components/playoffs/playoff-bracket-view"
import { Card, CardContent } from "@/components/ui/card"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { Trophy, AlertTriangle, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  getSimulatedStandings,
  getSimulatedTeams,
  hasSimulatedData,
  getSimulatedPlayoffs,
  saveSimulatedPlayoffs,
  hasSimulatedPlayoffs
} from "@/lib/simulated-data-manager"

// Função auxiliar para converter o formato de turnos da API para o formato bracket
const convertTurnsToBracket = (turnsData: any[]): PlayoffBracket => {
  // Inicializar um bracket vazio
  const bracket: PlayoffBracket = {
    quarterfinals: [],
    semifinals: [],
    final: undefined
  };

  console.log("Convertendo dados da API para formato de bracket", turnsData);

  // Processar cada turno
  for (const turn of turnsData) {
    const turnName = turn.turnName.toLowerCase();

    // Processar quartas de final
    if (turnName.includes("quartas") || turnName.includes("quarter")) {
      bracket.quarterfinals = turn.matches.map((match: any) => {
        return {
          id: `qf${match.id % 10}`, // Extrair último dígito do ID
          stage: "quarterfinal",
          matchNumber: match.id % 10, // Extrair último dígito do ID
          order: match.id % 10,
          homeTeamId: match.participants.homeTeamId?.toString() || null,
          awayTeamId: match.participants.awayTeamId?.toString() || null,
          homeScore: match.scores.homeScore,
          awayScore: match.scores.awayScore,
          homeScoreP: match.scores.homeScoreP,
          awayScoreP: match.scores.awayScoreP,
          winnerId: determineWinner(match),
          nextMatchId: `sf${Math.ceil((match.id % 10) / 2)}`, // Calcular próximo matchId
          youtubeUrl: match.metaInformation?.youtube_url
        };
      });
    }

    // Processar semifinais
    else if (turnName.includes("semi")) {
      bracket.semifinals = turn.matches.map((match: any) => {
        return {
          id: `sf${match.id % 10}`, // Extrair último dígito do ID
          stage: "semifinal",
          matchNumber: match.id % 10, // Extrair último dígito do ID
          order: match.id % 10,
          homeTeamId: match.participants.homeTeamId?.toString() || null,
          awayTeamId: match.participants.awayTeamId?.toString() || null,
          homeScore: match.scores.homeScore,
          awayScore: match.scores.awayScore,
          homeScoreP: match.scores.homeScoreP,
          awayScoreP: match.scores.awayScoreP,
          winnerId: determineWinner(match),
          nextMatchId: "final",
          youtubeUrl: match.metaInformation?.youtube_url
        };
      });
    }

    // Processar final
    else if (turnName.includes("final")) {
      if (turn.matches.length > 0) {
        const finalMatch = turn.matches[0];
        bracket.final = {
          id: "final",
          stage: "final",
          matchNumber: 1,
          order: 1,
          homeTeamId: finalMatch.participants.homeTeamId?.toString() || null,
          awayTeamId: finalMatch.participants.awayTeamId?.toString() || null,
          homeScore: finalMatch.scores.homeScore,
          awayScore: finalMatch.scores.awayScore,
          homeScoreP: finalMatch.scores.homeScoreP,
          awayScoreP: finalMatch.scores.awayScoreP,
          winnerId: determineWinner(finalMatch),
          nextMatchId: null,
          youtubeUrl: finalMatch.metaInformation?.youtube_url
        };
      }
    }
  }

  return bracket;
}

// Função auxiliar para determinar o vencedor de uma partida
const determineWinner = (match: any): string | null => {
  if (match.scores.homeScore === null || match.scores.awayScore === null) {
    return null;
  }

  if (match.scores.homeScore > match.scores.awayScore) {
    return match.participants.homeTeamId?.toString() || null;
  }

  if (match.scores.homeScore < match.scores.awayScore) {
    return match.participants.awayTeamId?.toString() || null;
  }

  // Se empatou, verificar pênaltis
  if (match.scores.homeScoreP !== null && match.scores.awayScoreP !== null) {
    if (match.scores.homeScoreP > match.scores.awayScoreP) {
      return match.participants.homeTeamId?.toString() || null;
    } else {
      return match.participants.awayTeamId?.toString() || null;
    }
  }

  return null;
}

export default function PlayoffsPage() {
  const [loading, setLoading] = useState(true)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingSimulatedData, setUsingSimulatedData] = useState(false)
  const [liveResultsAvailable, setLiveResultsAvailable] = useState(false)

  // Carregar dados da liga
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Primeiro, tentar obter resultados ao vivo dos playoffs da API
        try {
          const livePlayoffsResponse = await fetch('/api/playoff-matches', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
            next: { revalidate: 60 }, // Revalidar a cada 1 minuto
          });

          if (livePlayoffsResponse.ok) {
            const livePlayoffsData = await livePlayoffsResponse.json();

            if (livePlayoffsData) {
              console.log("Usando resultados ao vivo dos playoffs");
              setLiveResultsAvailable(true);

              // Precisamos ainda buscar os dados dos times e classificação
              const data = await fetchLeagueData();

              // Converter o array de times para um objeto Record para facilitar acesso
              const teamsRecord: Record<string, Team> = {};
              data.teams.forEach(team => {
                teamsRecord[team.id] = team;
              });

              setTeams(teamsRecord);
              setStandings(data.standings);

              // Converter o formato de turnos para o formato bracket
              const bracketData = convertTurnsToBracket(livePlayoffsData);

              // Usar o chaveamento com resultados ao vivo
              setBracket(bracketData);
              setLoading(false);
              return;
            }
          }
        } catch (liveError) {
          console.error("Erro ao buscar resultados ao vivo:", liveError);
          // Continuar com o fluxo normal se falhar a busca dos resultados ao vivo
        }

        // Verificar se existem dados simulados
        const hasSimulated = hasSimulatedData();
        const simulatedStandings = getSimulatedStandings();
        const simulatedTeams = getSimulatedTeams();
        const simulatedPlayoffs = getSimulatedPlayoffs();

        // Se tiver dados simulados de playoffs, usar eles com prioridade
        if (hasSimulatedPlayoffs() && simulatedPlayoffs && simulatedTeams) {
          console.log("Usando playoffs simulados");

          setTeams(simulatedTeams);

          // Se tivermos standings simulados, usá-los também
          if (simulatedStandings) {
            setStandings(simulatedStandings);
          } else {
            // Se não, buscar standings da API
            const data = await fetchLeagueData();
            setStandings(data.standings);
          }

          setBracket(simulatedPlayoffs);
          setUsingSimulatedData(true);
          setLoading(false);
          return;
        }

        // Se tiver dados simulados da liga, mas não dos playoffs, gerar os playoffs a partir deles
        if (hasSimulated && simulatedStandings && simulatedTeams) {
          console.log("Usando dados simulados para os playoffs");

          // Verificar se temos times suficientes para os playoffs
          if (simulatedStandings.length < 7) {
            setError("É necessário ter pelo menos 7 times na classificação para simular os playoffs");
            setLoading(false);
            return;
          }

          setTeams(simulatedTeams);
          setStandings(simulatedStandings);
          setUsingSimulatedData(true); // Indicar que estamos usando dados simulados

          // Gerar o chaveamento dos playoffs com base na classificação simulada
          const playoffBracket = generatePlayoffBracket(simulatedStandings, simulatedTeams);
          setBracket(playoffBracket);

          // Salvar o chaveamento gerado
          saveSimulatedPlayoffs(playoffBracket);

          setLoading(false);
          return;
        }

        // Se não tiver dados simulados, buscar da API normalmente
        const data = await fetchLeagueData();

        // Verificar se temos times suficientes para os playoffs
        if (data.standings.length < 7) {
          setError("É necessário ter pelo menos 7 times na classificação para simular os playoffs");
          setLoading(false);
          return;
        }

        // Converter o array de times para um objeto Record para facilitar acesso
        const teamsRecord: Record<string, Team> = {};
        data.teams.forEach(team => {
          teamsRecord[team.id] = team;
        });

        setTeams(teamsRecord);
        setStandings(data.standings);

        // Gerar o chaveamento dos playoffs com base na classificação
        const playoffBracket = generatePlayoffBracket(data.standings, teamsRecord);
        setBracket(playoffBracket);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
        setError("Ocorreu um erro ao carregar os dados da liga");
        setLoading(false);
      }
    };

    loadData();
  }, [])

  // Handler para seleção de time
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    window.location.href = `/team/${teamId}`
  }

  // Handler para alternar entre abas
  const handleSetActiveTab = (tab: "matches" | "team") => {
    // Não faz nada nesta página, mas é necessário para o Header
  }

  // Handler para atualização do chaveamento
  const handleBracketUpdate = async (updatedBracket: PlayoffBracket) => {
    // Atualizar o estado local
    setBracket(updatedBracket);

    // Ver se algum jogo está em andamento (tem placar sem vencedor definido)
    const hasLiveMatches = [
      ...updatedBracket.quarterfinals,
      ...updatedBracket.semifinals,
      ...(updatedBracket.final ? [updatedBracket.final] : [])
    ].some(match =>
      match && (match.homeScore !== null || match.awayScore !== null) && match.winnerId === null
    );

    // Atualizar o indicador de resultados ao vivo
    setLiveResultsAvailable(hasLiveMatches);

    // Salvar os resultados simulados no localStorage
    if (usingSimulatedData) {
      saveSimulatedPlayoffs(updatedBracket);
    }

    // Enviar os resultados atualizados para a API (para atualizações ao vivo)
    try {
      // Converter diretamente o bracket para o formato de turnos
      // para garantir compatibilidade com o novo formato da API
      const response = await fetch('/api/playoff-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bracket: updatedBracket }),
      });

      if (!response.ok) {
        console.error('Erro ao salvar resultados na API:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao enviar resultados dos playoffs:', error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] text-white">
        <Header
          loading={true}
          selectedTeam={null}
          teams={{}}
          standings={[]}
          onTeamSelect={() => { }}
          setActiveTab={() => { }}
        />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-[#252525] rounded-md mb-4"></div>
            <div className="h-4 w-96 bg-[#252525] rounded-md mb-8"></div>

            <div className="h-96 bg-[#1a1a1a] border border-[#333] rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
        teams={teams}
        standings={standings}
        onTeamSelect={handleTeamSelect}
        setActiveTab={handleSetActiveTab}
      />

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--team-primary)] mb-2 flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Playoffs Kings League
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Simule os playoffs da Kings League com o formato eliminatório. O 1º colocado vai
              direto para a semifinal, enquanto os times do 2º ao 7º lugar disputam as quartas.
            </p>
          </div>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="min-w-24 text-sm gap-2 border-[#333] bg-[#252525] hover:bg-[#333] text-gray-300"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Atualizar
          </Button>
        </div>

        {liveResultsAvailable && (
          <Alert className="mb-6 bg-[#1E3A29] border-[#34D399] text-white">
            <Trophy className="h-4 w-4 text-[#34D399]" />
            <AlertTitle className="text-[#34D399]">Resultados ao vivo</AlertTitle>
            <AlertDescription>
              Estamos exibindo os resultados atualizados em tempo real dos playoffs da Kings League.
              Você pode editar os resultados dos jogos que ainda não terminaram.
            </AlertDescription>
          </Alert>
        )}

        {usingSimulatedData && !liveResultsAvailable && (
          <Alert className="mb-6 bg-[#2A2D4A] border-[var(--team-primary)] text-white">
            <Trophy className="h-4 w-4 text-[var(--team-primary)]" />
            <AlertTitle className="text-[var(--team-primary)]">Usando dados simulados</AlertTitle>
            <AlertDescription>
              Este chaveamento dos playoffs está sendo gerado com base nas suas simulações de resultados
              na tabela de classificação. Continue simulando resultados para ver como eles afetam o chaveamento.
            </AlertDescription>
          </Alert>
        )}

        {error ? (
          <Alert className="mb-6 bg-[#332700] border-[#F4AF23] text-white">
            <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
            <AlertTitle className="text-[#F4AF23]">Não foi possível gerar os playoffs</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : bracket ? (
          <PlayoffBracketView
            bracket={bracket}
            teams={teams}
            onBracketUpdate={handleBracketUpdate}
          />
        ) : (
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Dados de playoffs indisponíveis</h3>
                <p className="text-gray-400">
                  Não foi possível gerar o chaveamento dos playoffs. Verifique a classificação
                  e tente novamente.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </main>
  )
}