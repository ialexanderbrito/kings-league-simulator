"use client"

import { useEffect, useState, useRef } from "react"
import { TeamStanding, Team, Round } from "@/types/kings-league"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FullStandingsTable from "@/components/full-standings-table"
import { Heart, TableIcon, InfoIcon } from "lucide-react"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { fetchLeagueData } from "@/lib/fetch-league-data"
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
  // groupedStandings agora contém objetos preparados com estatísticas adicionais (penaltyWins, penaltyLosses, regularWins, scPoints)
  const [groupedStandings, setGroupedStandings] = useState<Array<{ groupName: string; standings: any[] }>>([]);
  const [winnerGroupName, setWinnerGroupName] = useState<string | undefined>(undefined);
  const [winsByGroupState, setWinsByGroupState] = useState<Record<string, number>>({});

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

        // Agrupamento dos standings por grupo
        // Forçamos ordem estável: Grupo A primeiro, Grupo B por último. Outros grupos no meio (ordenados).
        const groups: Record<string, TeamStanding[]> = {};
        standings.forEach((team) => {
          const group = (team as any).groupName || (team as any).group || "A";
          if (!groups[group]) groups[group] = [];
          groups[group].push(team);
        });

        // Ordenar as chaves: A primeiro, B último, outros em ordem alfabética
        const keys = Object.keys(groups);
        const middle = keys.filter(k => k !== 'A' && k !== 'B').sort((a, b) => a.localeCompare(b));
        const orderedKeys: string[] = [];
        if (keys.includes('A')) orderedKeys.push('A');
        orderedKeys.push(...middle);
        if (keys.includes('B')) orderedKeys.push('B');

        // Prepara um mapa de grupo por teamId para calcular SC (desafio)
        const teamToGroup: Record<string, string> = {}
        Object.entries(groups).forEach(([gName, teamsArr]) => {
          teamsArr.forEach(t => teamToGroup[String((t as any).id)] = gName)
        })

        // Calcular stats extras (penaltis, scWins/scLosses/scPending) por time baseando-se nas rounds (resultados)
        const extraStats: Record<string, { penaltyWins: number; penaltyLosses: number; regularWins: number; scPoints: number; scWins: number; scLosses: number; scPending: number }> = {}
        Object.values(groups).flat().forEach((t) => {
          extraStats[String((t as any).id)] = { penaltyWins: 0, penaltyLosses: 0, regularWins: 0, scPoints: 0, scWins: 0, scLosses: 0, scPending: 0 }
        })

        rounds.forEach((round) => {
          round.matches.forEach((match) => {
            const homeId = String(match.participants.homeTeamId)
            const awayId = String(match.participants.awayTeamId)
            const homeScore = match.scores.homeScore
            const awayScore = match.scores.awayScore
            const homeScoreP = match.scores.homeScoreP
            const awayScoreP = match.scores.awayScoreP

            if (homeScore === null || awayScore === null) {
              // partida não disputada ou pendente
              // se for entre grupos diferentes, marcar pending
              const homeGroup = teamToGroup[homeId]
              const awayGroup = teamToGroup[awayId]
              if (homeGroup && awayGroup && homeGroup !== awayGroup) {
                if (extraStats[homeId]) extraStats[homeId].scPending++
                if (extraStats[awayId]) extraStats[awayId].scPending++
              }
              return
            }

            // Normal win
            if (homeScore !== awayScore) {
              if (homeScore > awayScore) {
                // home wins in regular
                if (extraStats[homeId]) extraStats[homeId].regularWins++
                // away gets nothing for regular
              } else {
                if (extraStats[awayId]) extraStats[awayId].regularWins++
              }
            } else {
              // Draw -> penalties
              if (homeScoreP === null || awayScoreP === null) return
              if (homeScoreP > awayScoreP) {
                if (extraStats[homeId]) extraStats[homeId].penaltyWins++
                if (extraStats[awayId]) extraStats[awayId].penaltyLosses++
              } else if (awayScoreP > homeScoreP) {
                if (extraStats[awayId]) extraStats[awayId].penaltyWins++
                if (extraStats[homeId]) extraStats[homeId].penaltyLosses++
              }
            }

            // Calcular SC: pontos ganhos contra time de outro grupo
            const homeGroup = teamToGroup[homeId]
            const awayGroup = teamToGroup[awayId]
            if (homeGroup && awayGroup && homeGroup !== awayGroup) {
              // avaliar quem ganhou e atribuir pontos conforme sistema
              if (homeScore !== awayScore) {
                if (homeScore > awayScore) {
                  if (extraStats[homeId]) {
                    extraStats[homeId].scPoints += 3
                    extraStats[homeId].scWins++
                  }
                  if (extraStats[awayId]) {
                    extraStats[awayId].scLosses++
                  }
                } else {
                  if (extraStats[awayId]) {
                    extraStats[awayId].scPoints += 3
                    extraStats[awayId].scWins++
                  }
                  if (extraStats[homeId]) {
                    extraStats[homeId].scLosses++
                  }
                }
              } else {
                // penalties
                if (homeScoreP === null || awayScoreP === null) return
                if (homeScoreP > awayScoreP) {
                  if (extraStats[homeId]) {
                    extraStats[homeId].scPoints += 2
                    extraStats[homeId].scWins++
                  }
                  if (extraStats[awayId]) {
                    extraStats[awayId].scPoints += 1
                    extraStats[awayId].scLosses++
                  }
                } else if (awayScoreP > homeScoreP) {
                  if (extraStats[awayId]) {
                    extraStats[awayId].scPoints += 2
                    extraStats[awayId].scWins++
                  }
                  if (extraStats[homeId]) {
                    extraStats[homeId].scPoints += 1
                    extraStats[homeId].scLosses++
                  }
                }
              }
            }
          })
        })

        // Merge dos stats extras nos objetos de standing e ordenar cada grupo corretamente
        const grouped = orderedKeys.map((k) => {
          const arr = (groups[k] || []).map((t) => {
            const id = String((t as any).id)
            const extras = extraStats[id] || { penaltyWins: 0, penaltyLosses: 0, regularWins: 0, scPoints: 0, scWins: 0, scLosses: 0, scPending: 0 }
            return {
              ...t,
              penaltyWins: extras.penaltyWins,
              penaltyLosses: extras.penaltyLosses,
              regularWins: extras.regularWins || (t.won - (extras.penaltyWins || 0)),
              scPoints: extras.scPoints || 0,
              scWins: extras.scWins || 0,
              scLosses: extras.scLosses || 0,
              scPending: extras.scPending || 0,
            }
          })

          // Ordenação estável: pontos desc, goalDifference desc, goalsFor desc, won desc
          arr.sort((a: any, b: any) => {
            if (b.points !== a.points) return b.points - a.points
            const gdA = a.goalDifference ?? (a.goalsFor - a.goalsAgainst)
            const gdB = b.goalDifference ?? (b.goalsFor - b.goalsAgainst)
            if (gdB !== gdA) return gdB - gdA
            if ((b.goalsFor ?? 0) !== (a.goalsFor ?? 0)) return (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
            return (b.won ?? 0) - (a.won ?? 0)
          })

          return { groupName: k, standings: arr }
        })

        setGroupedStandings(grouped);

        // Identificar vencedor do Challenger (se existir) e em qual grupo esse time aparece
        const challengerGroup = grouped.find(g => g.groupName === 'Challenger')
        const challengerWinnerId = challengerGroup?.standings?.[0]?.id
        let winnerGroupName: string | undefined = undefined
        if (challengerWinnerId) {
          const found = grouped.find(g => g.groupName !== 'Challenger' && g.standings.some(s => String((s as any).id) === String(challengerWinnerId)))
          winnerGroupName = found?.groupName
        }

        // Guardar winnerGroupName no state caso queira usar (opcional)
        // Se precisar usar em outro lugar, podemos setar em state; por enquanto passaremos como prop ao componente

        // Calcular quantas vitórias cada grupo teve sobre times do Challenger
        const challengerGroupName = 'Challenger'
        const challengerTeamIds = new Set<string>()
        // identificar times do grupo Challenger
        groups[challengerGroupName]?.forEach((t) => challengerTeamIds.add(String((t as any).id)))

        const winsByGroup: Record<string, number> = {}
        rounds.forEach((round) => {
          round.matches.forEach((match) => {
            const homeId = String(match.participants.homeTeamId)
            const awayId = String(match.participants.awayTeamId)
            const homeScore = match.scores.homeScore
            const awayScore = match.scores.awayScore

            // Partidas válidas e definidas
            if (homeScore === null || awayScore === null) return

            // Se um time do grupo enfrentou time do Challenger e venceu
            if (challengerTeamIds.has(homeId) && !challengerTeamIds.has(awayId)) {
              // away team pertence ao outro grupo -> obter grupo via teamToGroup (fallback para match.groupName se necessário)
              const otherGroup = teamToGroup[awayId] ?? (String((match as any).groupName ?? (match as any).group ?? ""))
              if (!otherGroup) return

              if (homeScore > awayScore) {
                // vitória do time Challenger -> não conta para o outro grupo
                return
              } else if (awayScore > homeScore) {
                // away venceu o time Challenger -> conta para o grupo do away
                winsByGroup[otherGroup] = (winsByGroup[otherGroup] || 0) + 1
              }
            } else if (challengerTeamIds.has(awayId) && !challengerTeamIds.has(homeId)) {
              const otherGroup = teamToGroup[homeId] ?? (String((match as any).groupName ?? (match as any).group ?? ""))
              if (!otherGroup) return

              if (awayScore > homeScore) {
                // vitória do time Challenger -> não conta
                return
              } else if (homeScore > awayScore) {
                // home venceu o time Challenger
                winsByGroup[otherGroup] = (winsByGroup[otherGroup] || 0) + 1
              }
            }
          })
        })

        // Determinar qual grupo teve mais vitórias sobre o Challenger (se houver)
        setWinsByGroupState(winsByGroup)
        let computedWinnerGroup: string | undefined = undefined
        const entries = Object.entries(winsByGroup)
        if (entries.length > 0) {
          entries.sort((a, b) => b[1] - a[1])
          if (entries[0][1] > 0) computedWinnerGroup = entries[0][0]
        }
        setWinnerGroupName(computedWinnerGroup)

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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


  if (loading) {
    return (

      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] text-white">
        <Header
          loading={false}
          selectedTeam={selectedTeam}
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
          </div>

          <FullTableSkeleton />

        </div>
        <Footer />
      </main>
    )
  }

  // Alerta visual para dados vazios (sem standings, rounds ou teams)
  const isEmptyLeagueData = standings.length === 0 || rounds.length === 0 || Object.keys(teams).length === 0

  if (!isEmptyLeagueData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] text-white">
        <Header
          loading={false}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={handleSetActiveTab}
        />
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#18120a] via-[#1a1a1a] to-[#23201a] border border-[#F4AF23]/30 shadow-xl p-8 flex flex-col items-center gap-4 mt-12 mb-8 animate-fade-in">
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-[#F4AF23]/10 border border-[#F4AF23]/30 p-4 mb-2">
                <svg className="h-8 w-8 text-[#F4AF23]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 5c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              <h2 className="text-2xl font-bold text-[#F4AF23] tracking-tight text-center">Dados em atualização</h2>
            </div>
            <p className="text-base text-white/90 text-center max-w-md">
              Os dados da <span className="font-semibold text-[#F4AF23]">Kings League Brazil</span> ainda não estão disponíveis para este split ou temporada.<br />
              <span className="block mt-3 text-white/70 text-sm">As informações exibidas aqui são fornecidas diretamente pela Kings League. Não armazenamos nada localmente, então a disponibilidade depende exclusivamente da atualização da base oficial da Kings League.</span>
            </p>
            <div className="w-full flex flex-col items-center mt-2">
              <span className="inline-block px-4 py-2 rounded-full bg-[#F4AF23]/10 border border-[#F4AF23]/20 text-[#F4AF23] text-sm font-medium tracking-wide mb-2">Aguarde novidades em breve!</span>
              <span className="text-xs text-white/40">Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#121212] text-white">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
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
        </div>

        <Card className="bg-[#1a1a1a]/50 border-gray-800 text-white mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-[var(--team-primary)]" />
              Tabela Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden" ref={tableRef}>
              {/* Renderizar StandingsTable agrupada */}
              <div className="overflow-x-auto">
                <FullStandingsTable
                  groupedStandings={groupedStandings}
                  onTeamSelect={handleTeamSelect}
                  previousStandings={previousStandings}
                  // passar grupo vencedor do Challenger (calculado a partir das vitórias sobre o Challenger)
                  winnerGroupName={winnerGroupName}
                  winsByGroup={winsByGroupState}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2">
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

        <Card className="bg-[#1a1a1a]/50 border-gray-800 text-white">
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
                    <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#22c55e" }}></span>
                    <span>1º — Semifinal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#F4AF23" }}></span>
                    <span>2º e 3º — Quartas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#fb923c" }}></span>
                    <span>4º — Quartas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#6b7280" }}></span>
                    <span>5º — Eliminado</span>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span>
                    <span>1º — Semifinal (se o grupo for ganhador do Challenger)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
                    <span>2º e 3º — Quartas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                    <span>4º — Quartas (se o grupo for ganhador do Challenger), caso contrário 4º Lugar</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Desafio (SC)</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-xs">SC</span>
                    <span>Pontos obtidos em partidas contra times de outro grupo (soma: 3 / 2 / 1 / 0 conforme resultado)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Legenda SC</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span>
                    <span>Vitória no desafio (mais vitórias que derrotas)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <span>Derrota no desafio (mais derrotas que vitórias)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block"></span>
                    <span>Pendente / empate no desempenho do desafio</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--team-primary)]">Posição</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 p-0 rounded-full shadow-sm" style={{ backgroundColor: "#6b7280" }}></span>
                    <span>Coluna P agora neutra (cinza). Use a coluna SC para ver o desempenho no desafio entre grupos.</span>
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