"use client"

import { useEffect, useState, useRef } from "react"
import { TeamStanding, Team, Round } from "@/types/kings-league"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, Heart, TableIcon, Download, InfoIcon } from "lucide-react"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { calculateStandings } from "@/lib/calculate-standings"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FullTableSkeleton } from "@/components/skeletons/full-table-skeleton"
import html2canvas from "html2canvas"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function StandingsPage() {
  const tableRef = useRef<HTMLDivElement>(null)
  const { primaryColor, favoriteTeam } = useTeamTheme()
  const [loading, setLoading] = useState(true)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [rounds, setRounds] = useState<Round[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Carregar dados da liga
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { rounds, teams, standings } = await fetchLeagueData()

        // Converte o array de times para um objeto Record para facilitar acesso
        const teamsRecord: Record<string, Team> = teams.reduce((acc, team) => {
          acc[team.id] = team
          return acc
        }, {} as Record<string, Team>)

        setRounds(rounds)
        setTeams(teamsRecord)
        setStandings(standings)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Função para exportar a tabela como imagem
  const downloadStandings = async () => {
    if (!tableRef.current) return

    const element = tableRef.current

    // Clonando para manipulação
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.backgroundColor = '#121212'
    clone.style.padding = '16px'
    clone.style.width = '900px' // Maior para tabela completa
    clone.style.borderRadius = '12px'
    clone.style.position = 'fixed'
    clone.style.left = '-9999px'
    clone.style.top = '0'
    document.body.appendChild(clone)

    try {
      const canvas = await html2canvas(clone, {
        backgroundColor: '#121212',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ajustando estilos no clone
          const rows = clonedDoc.querySelectorAll('tr')
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th')
            cells.forEach(cell => {
              if (cell instanceof HTMLElement) {
                cell.style.padding = '8px 6px'
                cell.style.verticalAlign = 'middle'
                cell.style.whiteSpace = 'normal'
                cell.style.height = '48px'
                cell.style.lineHeight = '1'
              }
            })
          })
        }
      })

      // Converter para URL e fazer download
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'kings-league-classificacao-completa.png'
      link.href = url
      link.click()
    } finally {
      document.body.removeChild(clone)
    }
  }

  // Verificar se o time atual é o time favorito do usuário
  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeam?.id === teamId
  }

  // Função para determinar a cor de fundo baseada na posição
  const getPositionStyle = (standing: TeamStanding, index: number) => {
    if (index === 0) {
      // Primeiro colocado - semifinal
      return { backgroundColor: "#4ade80", color: "white" }
    } else if (index >= 1 && index <= 6) {
      // 2º ao 7º - quartas de final
      return { backgroundColor: "var(--team-primary)", color: "black" }
    }
    return {}
  }

  // Função para determinar a mudança de posição
  const getPositionChange = (team: TeamStanding, currentIndex: number) => {
    if (!previousStandings || previousStandings.length === 0) return null

    const previousIndex = previousStandings.findIndex((t) => t.id === team.id)
    if (previousIndex === -1) return null

    const change = previousIndex - currentIndex
    if (change === 0) return null

    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : "down",
    }
  }

  // Calcular vitórias e derrotas nos pênaltis
  const calculatePenaltyStats = (team: TeamStanding) => {
    let penaltyWins = 0;
    let penaltyLosses = 0;

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const { homeTeamId, awayTeamId } = match.participants;
        const { homeScore, awayScore, homeScoreP, awayScoreP } = match.scores;

        if (homeScore === null || awayScore === null) return;
        if (homeScore !== awayScore) return; // Só considerar jogos que foram para pênaltis
        if (homeScoreP === null || awayScoreP === null) return;

        if (homeTeamId === team.id) {
          if (homeScoreP > awayScoreP) {
            penaltyWins++;
          } else {
            penaltyLosses++;
          }
        } else if (awayTeamId === team.id) {
          if (awayScoreP > homeScoreP) {
            penaltyWins++;
          } else {
            penaltyLosses++;
          }
        }
      });
    });

    return { penaltyWins, penaltyLosses };
  };

  // Calcular o número de vitórias regulares (no tempo normal, sem pênaltis)
  const calculateRegularWins = (team: TeamStanding, penaltyWins: number) => {
    return team.won - penaltyWins;
  };

  // Handler para seleção de time
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    window.location.href = `/team/${teamId}`
  }

  // Handler para alternar entre abas
  const handleSetActiveTab = (tab: "matches" | "team") => {
    // Não faz nada nesta página, mas é necessário para o Header
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
        <FullTableSkeleton />
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
            <h1 className="text-3xl font-bold text-[var(--team-primary)] mb-2">Classificação Completa</h1>
            <p className="text-gray-400 max-w-2xl">
              Tabela detalhada da Kings League com estatísticas completas de todos os times.
            </p>
          </div>
          {/* <Button
            variant="outline"
            className="text-sm gap-2 border-[#333] hover:bg-[#1f1f1f] text-gray-300"
            onClick={downloadStandings}
          >
            <Download className="w-4 h-4" />
            Baixar Classificação
          </Button> */}
        </div>

        <Card className="bg-[#1a1a1a] border-[#333] text-white mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-[var(--team-primary)]" />
              Tabela Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden" ref={tableRef}>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-[#333] bg-[#121212]">
                      <TableHead className="w-12 text-center text-xs text-gray-400 font-normal">P</TableHead>
                      <TableHead className="w-8 px-0"></TableHead>
                      <TableHead className="text-xs text-gray-400 font-normal">TIME</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">PTS</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">PJ</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">V</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">VP</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">DP</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">D</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">GP</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">GC</TableHead>
                      <TableHead className="text-center text-xs text-gray-400 font-normal w-12">SG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((team, index) => {
                      const positionStyle = getPositionStyle(team, index);
                      const positionChange = getPositionChange(team, index);
                      const isTeamFavorite = isFavoriteTeam(team.id);
                      const { penaltyWins, penaltyLosses } = calculatePenaltyStats(team);
                      const regularWins = calculateRegularWins(team, penaltyWins);

                      return (
                        <TableRow
                          key={team.id}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-[#1f1f1f] border-b border-[#333]",
                            isTeamFavorite && "bg-[var(--team-primary)]/10"
                          )}
                          onClick={() => handleTeamSelect(team.id)}
                        >
                          {/* Posição */}
                          <TableCell className="font-medium text-center py-2">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center mb-0.5">
                                <Badge
                                  className="w-6 h-6 flex items-center justify-center p-0 text-xs font-medium rounded-full"
                                  style={positionStyle}
                                >
                                  {index + 1}
                                </Badge>
                              </div>
                              {positionChange && (
                                <div className="flex items-center">
                                  {positionChange.direction === "up" ? (
                                    <ArrowUp className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3 text-red-500" />
                                  )}
                                  <span className="text-[10px] text-gray-400">{positionChange.value}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Ícone favorito */}
                          <TableCell className="py-2 w-8 px-1">
                            {isTeamFavorite && (
                              <div className="flex items-center justify-center">
                                <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
                              </div>
                            )}
                          </TableCell>

                          {/* Nome do time */}
                          <TableCell className="py-2">
                            <div className="team-container flex items-center gap-2 min-w-0">
                              {team.logo && (
                                <div className="team-logo w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                  <Image
                                    src={team.logo.url || "/placeholder.svg"}
                                    alt={team.name}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span
                                  className="font-medium text-xs truncate"
                                  title={team.name}
                                >
                                  {team.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Pontos */}
                          <TableCell className="text-center font-bold text-[var(--team-primary)] text-sm py-2 w-12">
                            {team.points}
                          </TableCell>

                          {/* Partidas Jogadas */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {team.played}
                          </TableCell>

                          {/* Vitórias no tempo normal */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {regularWins}
                          </TableCell>

                          {/* Vitórias nos Pênaltis */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {penaltyWins}
                          </TableCell>

                          {/* Derrotas nos Pênaltis */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {penaltyLosses}
                          </TableCell>

                          {/* Derrotas */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {team.lost - penaltyLosses}
                          </TableCell>

                          {/* Gols Pró */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {team.goalsFor}
                          </TableCell>

                          {/* Gols Contra */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {team.goalsAgainst}
                          </TableCell>

                          {/* Saldo de Gols */}
                          <TableCell className="text-center text-xs text-gray-300 py-2 w-12">
                            {team.goalDifference}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Badge style={{ backgroundColor: "#4ade80" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Playoff: Semifinal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge style={{ backgroundColor: "var(--team-primary)" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Playoff: Quartas</span>
                  </div>
                  {favoriteTeam && (
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-2.5 h-2.5 text-red-400 flex-shrink-0" fill="currentColor" />
                      <span>Seu time do coração</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-[var(--team-primary)]" />
              Legenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Posição</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">P</span>
                    <span>Posição</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Pontuação</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">PTS</span>
                    <span>Pontos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">PJ</span>
                    <span>Partidas Jogadas</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Resultados</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">V</span>
                    <span>Vitórias (tempo normal)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">VP</span>
                    <span>Vitórias nos Pênaltis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">DP</span>
                    <span>Derrotas nos Pênaltis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">D</span>
                    <span>Derrotas (tempo normal)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Gols</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">GP</span>
                    <span>Gols Pró</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">GC</span>
                    <span>Gols Contra</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">SG</span>
                    <span>Saldo de Gols</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Sistema de Pontos</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">3 pts</span>
                    <span>Vitória no tempo normal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">2 pts</span>
                    <span>Vitória nos pênaltis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">1 pt</span>
                    <span>Derrota nos pênaltis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs">0 pt</span>
                    <span>Derrota no tempo normal</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Playoffs</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: "#4ade80" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Semifinal (1º colocado)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: "var(--team-primary)" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Quartas de Final (2º ao 7º)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  )
}