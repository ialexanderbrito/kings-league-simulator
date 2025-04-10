"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Calendar, TableIcon, Info, AlertTriangle } from "lucide-react"
import MatchesTable from "@/components/matches-table"
import StandingsTable from "@/components/standings-table"
import TeamInfo from "@/components/team-info"
import { calculateStandings } from "@/lib/calculate-standings"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import type { Round, Team, TeamStanding, LeagueData } from "@/types/kings-league"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { cn } from "@/lib/utils"
import TeamCarousel from "@/components/team-carousel"
import DisclaimerNotice from "@/components/disclaimer-notice"

// Componente de esqueleto para a tabela de classificação
function StandingsTableSkeleton() {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[30px_auto_repeat(3,1fr)] gap-1 text-xs font-medium text-gray-400 border-b border-[#333] pb-2">
        <div className="text-center">#</div>
        <div className="text-left">TIME</div>
        <div className="text-center">PTS</div>
        <div className="text-center hidden sm:block">J</div>
        <div className="text-center hidden sm:block">SG</div>
      </div>
      {Array(12).fill(0).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[30px_auto_repeat(3,1fr)] gap-1 py-2 text-sm border-b border-[#333]"
        >
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
              <Skeleton className="h-3 w-3" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="text-center flex justify-center items-center">
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="text-center hidden sm:flex justify-center items-center">
            <Skeleton className="h-3 w-3" />
          </div>
          <div className="text-center hidden sm:flex justify-center items-center">
            <Skeleton className="h-3 w-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente de esqueleto para a tabela de partidas
function MatchesTableSkeleton() {
  return (
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="border-b border-[#333] bg-[#1f1f1f] py-3 px-4">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
          <Calendar className="w-4 h-4 text-[#F4AF23]" />
          <span>Calendário e Resultados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="space-y-4">
            {/* Tabs para navegação entre rodadas */}
            <div className="flex overflow-x-auto pb-2 space-x-1">
              {Array(11).fill(0).map((_, i) => (
                <div key={i} className="flex-none">
                  <Skeleton className="h-7 w-16 rounded" />
                </div>
              ))}
            </div>

            {/* Conteúdo das partidas */}
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#252525] rounded-md p-3 border border-[#333]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 sm:flex-auto">
                        <Skeleton className="h-3.5 w-20 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-5 w-10" />
                      <Skeleton className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-auto order-2 sm:order-1 text-right">
                        <Skeleton className="h-3.5 w-20 mb-1 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full order-1 sm:order-2" />
                    </div>
                  </div>

                  <div className="mt-2 flex justify-center">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function KingsLeagueSimulator() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("matches")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)
        setUsingFallback(false)

        const data = await fetchLeagueData()

        // Verificar se estamos usando dados de fallback
        if (data.rounds.length === 1 && data.rounds[0].matches.length === 1) {
          setUsingFallback(true)
        }

        setLeagueData(data)

        // Extrair times
        const teamsDict: Record<string, Team> = {}
        data.teams.forEach((team) => {
          teamsDict[team.id] = team
        })
        setTeams(teamsDict)

        // Extrair rodadas
        const extractedRounds = data.rounds
        setRounds(extractedRounds)

        // Usar classificação da API
        setStandings(data.standings)

        setLoading(false)
      } catch (err: any) {
        setLoading(false)
        setError(err.message || "Erro ao carregar dados. Tente novamente.")

        // Adicionar informações de debug
        setDebugInfo("Informações técnicas: " + (err.stack ? err.stack.split("\n")[0] : "Erro desconhecido"))
      }
    }

    loadData()
  }, [])

  const handleScoreUpdate = (
    roundId: number,
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
    homeShootoutScore?: number,
    awayShootoutScore?: number
  ) => {
    // Salvar standings atuais antes da atualização
    setPreviousStandings(standings)

    const updatedRounds = rounds.map((round) => {
      if (round.id === roundId) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            // Se a partida já estiver encerrada, não permitir alterações
            if (match.status === "ended") {
              return match
            }

            // Criar um novo objeto de scores para evitar mutações parciais
            const updatedScores = { ...match.scores }

            // Atualizar apenas os scores que foram fornecidos
            if (homeScore !== null) {
              updatedScores.homeScore = homeScore
            }

            if (awayScore !== null) {
              updatedScores.awayScore = awayScore
            }

            // Atualizar shootouts se fornecidos
            if (homeShootoutScore !== undefined) {
              updatedScores.homeScoreP = homeShootoutScore
            }

            if (awayShootoutScore !== undefined) {
              updatedScores.awayScoreP = awayShootoutScore
            }

            return {
              ...match,
              scores: updatedScores,
            }
          }
          return match
        })

        return {
          ...round,
          matches: updatedMatches,
        }
      }
      return round
    })

    setRounds(updatedRounds)

    // Recalcular classificação com os novos resultados
    const updatedStandings = calculateStandings(updatedRounds, teams, leagueData?.standings || [])
    setStandings(updatedStandings)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setActiveTab("team")
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#121212] w-full overflow-x-hidden">
        {/* Header simplificado para o estado de loading */}
        <header className="bg-gradient-to-r from-black via-black/95 to-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#222] shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KingsLeagueLogo width={40} height={50} />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#F4AF23] to-[#F7D380] bg-clip-text text-transparent">
                Kings League Simulator
              </h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4">
          {/* Sempre exibir o carrossel, mesmo durante o carregamento */}
          <div className="pt-2 pb-6">
            <TeamCarousel
              teams={[]}
              onTeamSelect={() => { }}
              className="mb-6"
              loading={true}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 flex-grow max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,400px)] gap-6">
            <div className="w-full overflow-hidden">
              <MatchesTableSkeleton />
            </div>

            <div className="space-y-6 w-full">
              <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden w-full">
                <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                    <TableIcon className="w-4 h-4 text-[#F4AF23]" />
                    Classificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <StandingsTableSkeleton />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Adicionar exibição de erro
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#121212] min-h-screen">
        <div className="flex justify-center mb-8">
          <KingsLeagueLogo className="mx-auto" width={100} height={128} />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 text-[#F4AF23]">Simulador Kings League Brasil</h1>

        <div className="bg-red-900/60 backdrop-blur border border-red-700 text-white p-6 rounded-md max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Erro ao carregar dados
          </h2>
          <p>{error}</p>
          {debugInfo && <p className="mt-2 text-xs text-red-400">{debugInfo}</p>}
          <Button className="mt-4 bg-red-700 hover:bg-red-600" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-[#121212] min-h-screen text-white">
      {/* Novo header moderno e minimalista */}
      <header className="bg-gradient-to-r from-black/90 via-black/85 to-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#222]/30 shadow-sm transition-all duration-300">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-md">
                <KingsLeagueLogo
                  width={42}
                  height={60}
                  className="transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F4AF23]/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F4AF23] to-[#F7D380] bg-clip-text text-transparent">
                  Kings League
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Simulador</p>
              </div>
            </div>

            {/* Menu de seleção de equipes - desktop */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-black/50 border-[#333] hover:bg-[#252525] hover:border-[#444] transition-all duration-200">
                    {selectedTeam ? (
                      <>
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#333] bg-black/30">
                          <Image
                            src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                            alt={teams[selectedTeam].name}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <span className="truncate max-w-[120px]">{teams[selectedTeam].name}</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#F4AF23]" />
                        Selecionar Time
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-[#333] text-white" align="end">
                  <DropdownMenuLabel className="text-xs font-normal text-gray-400 uppercase tracking-wider">Times</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#333]" />
                  <div className="max-h-[60vh] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                    {standings.map((team) => (
                      <DropdownMenuItem
                        key={team.id}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 hover:bg-[#252525] focus:bg-[#252525]",
                          selectedTeam === team.id && "bg-[#252525] font-medium"
                        )}
                        onClick={() => handleTeamSelect(team.id)}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-black/30 ring-1 ring-[#333]">
                          <Image
                            src={team.logo?.url || "/placeholder-logo.svg"}
                            alt={team.name}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <span className="truncate">{team.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão mobile para menu de times */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-[#252525] transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {selectedTeam ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-[#333] bg-black/30">
                    <Image
                      src={teams[selectedTeam].logo?.url || "/placeholder-logo.svg"}
                      alt={teams[selectedTeam].name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Trophy className="h-5 w-5 text-[#F4AF23]" />
                )}
              </Button>

              {/* Menu mobile estilizado */}
              {isMenuOpen && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm sm:hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div
                    className="absolute top-16 right-4 w-64 bg-gradient-to-b from-[#1a1a1a] to-[#151515] border border-[#333] rounded-lg shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#333] bg-black/30">
                      Times
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {standings.map((team) => (
                        <button
                          key={team.id}
                          className={cn(
                            "w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors",
                            selectedTeam === team.id ? "bg-[#252525]" : "hover:bg-[#252525]/70"
                          )}
                          onClick={() => {
                            handleTeamSelect(team.id)
                            setIsMenuOpen(false)
                          }}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#333] bg-black/30">
                            <Image
                              src={team.logo?.url || "/placeholder-logo.svg"}
                              alt={team.name}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                          <span className="truncate">{team.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="pt-4 pb-2">
          <TeamCarousel
            teams={leagueData?.teams || []}
            onTeamSelect={handleTeamSelect}
            className="mb-6"
            loading={loading}
          />
        </div>

        <DisclaimerNotice forceShow={showDisclaimer} />

        {usingFallback && (
          <Alert className="mb-6 bg-[#332700] border-[#F4AF23] text-white">
            <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
            <AlertTitle className="text-[#F4AF23]">Usando dados de demonstração</AlertTitle>
            <AlertDescription>
              Não foi possível acessar todos os dados da API da Kings League. Estamos usando dados parciais para que
              você possa testar o simulador.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#1a1a1a]">
            <TabsTrigger
              value="matches"
              className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
            >
              <Calendar className="w-4 h-4" />
              <span>Partidas</span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center gap-2 data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
              disabled={!selectedTeam}
            >
              <Info className="w-4 h-4" />
              <span>Time</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
              <MatchesTable rounds={rounds} teams={teams} onScoreUpdate={handleScoreUpdate} />

              <div className="space-y-6">
                <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden lg:sticky lg:top-6">
                  <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                      <TableIcon className="w-4 h-4 text-[#F4AF23]" />
                      Classificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <StandingsTable
                      standings={standings}
                      onTeamSelect={handleTeamSelect}
                      previousStandings={previousStandings}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            {selectedTeam && <TeamInfo team={teams[selectedTeam]} rounds={rounds} teams={teams} />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer elegante e minimalista */}
      <footer className="mt-16 py-6 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm border-t border-[#333]/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-400">
              Desenvolvido com <span className="text-[#F4AF23]">♥</span> por
            </p>
            <a
              href="https://ialexanderbrito.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-md font-medium text-white hover:text-[#F4AF23] transition-colors group flex items-center gap-1.5"
            >
              ialexanderbrito
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              >
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </a>
            <p className="mt-3 text-xs text-gray-500">© {new Date().getFullYear()} Kings League Simulator</p>

          </div>
        </div>
      </footer>
    </main>
  )
}
