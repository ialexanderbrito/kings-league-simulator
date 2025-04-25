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
  hasSimulatedData
} from "@/lib/simulated-data-manager"

export default function PlayoffsPage() {
  const [loading, setLoading] = useState(true)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usingSimulatedData, setUsingSimulatedData] = useState(false)

  // Carregar dados da liga
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Verificar se existem dados simulados
        const hasSimulated = hasSimulatedData();
        const simulatedStandings = getSimulatedStandings();
        const simulatedTeams = getSimulatedTeams();

        // Se tiver dados simulados, usar eles para os playoffs
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
  const handleBracketUpdate = (updatedBracket: PlayoffBracket) => {
    setBracket(updatedBracket)
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

          {usingSimulatedData && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="min-w-24 text-sm gap-2 border-[#333] bg-[#252525] hover:bg-[#333] text-gray-300"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Atualizar
            </Button>
          )}
        </div>

        {usingSimulatedData && (
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