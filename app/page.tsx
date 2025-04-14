"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import TeamCarousel from "@/components/team-carousel"
import DisclaimerNotice from "@/components/disclaimer-notice"
import { fetchLeagueData, fetchMatchOdds } from "@/lib/fetch-league-data"
import { calculateStandings } from "@/lib/calculate-standings"
import type { Round, Team, TeamStanding, LeagueData, MatchOdds } from "@/types/kings-league"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MainContent } from "@/components/layout/main-content"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorState } from "@/components/ui/error-state"
import { SchemaMarkup } from "@/components/schema-markup"
import { useRouter } from "next/navigation"

export default function KingsLeagueSimulator() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [previousStandings, setPreviousStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [activeTab, setActiveTab] = useState<"matches" | "team">("matches")
  const router = useRouter()

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      setUsingFallback(false)

      const data = await fetchLeagueData()

      if (data.rounds.length === 1 && data.rounds[0].matches.length === 1) {
        setUsingFallback(true)
      }

      setLeagueData(data)

      const teamsDict: Record<string, Team> = {}
      data.teams.forEach((team) => {
        teamsDict[team.id] = team
      })
      setTeams(teamsDict)

      // Encontrar a rodada atual para buscar as odds
      const currentRound = data.rounds.find(round => !round.ended) || data.rounds[data.rounds.length - 1]

      if (currentRound) {
        try {
          // Formatar a data da primeira partida da rodada no formato necessário para a API de odds
          const firstMatchDate = currentRound.matches[0]?.date
          let formattedDate: string | undefined = undefined

          if (firstMatchDate) {
            const date = new Date(firstMatchDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:00`
          }


          // Buscar as odds das partidas
          const matchOdds = await fetchMatchOdds(formattedDate)


          // Atualizar as partidas com as odds
          const updatedRounds = data.rounds.map(round => {
            const updatedMatches = round.matches.map(match => {
              // Criar chaves para buscar as odds
              const homeTeam = teamsDict[match.participants.homeTeamId];
              const awayTeam = teamsDict[match.participants.awayTeamId];

              if (!homeTeam || !awayTeam) {
                return match;
              }

              // Tentar buscar odds usando ID
              const oddsKeyById = `${match.participants.homeTeamId}-${match.participants.awayTeamId}`;

              // Tentar buscar odds usando nome dos times
              const oddsKeyByName = `${homeTeam.name}|${awayTeam.name}`.toLowerCase();
              const oddsKeyByShortName = `${homeTeam.shortName}|${awayTeam.shortName}`.toLowerCase();

              // Verificar também com o nome completo se disponível
              const oddsKeyByFullName = homeTeam.completeName && awayTeam.completeName
                ? `${homeTeam.completeName}|${awayTeam.completeName}`.toLowerCase()
                : '';

              // Verificar também se há correspondência com o matchName da API de odds
              const matchNameOptions = [
                `${homeTeam.name}·${awayTeam.name}`,
                `${homeTeam.shortName}·${awayTeam.shortName}`,
                homeTeam.completeName && awayTeam.completeName ? `${homeTeam.completeName}·${awayTeam.completeName}` : null
              ].filter(Boolean);

              // Tentar encontrar as odds por qualquer uma das chaves
              let odds = matchOdds[oddsKeyById] || matchOdds[oddsKeyByName] || matchOdds[oddsKeyByShortName];

              if (!odds && oddsKeyByFullName) {
                odds = matchOdds[oddsKeyByFullName];
              }

              // Se ainda não encontrou, tentar percorrer todas as odds para encontrar por matchName
              if (!odds) {
                for (const key in matchOdds) {
                  const currentOdds = matchOdds[key];
                  if (matchNameOptions.includes(currentOdds.matchName)) {
                    odds = currentOdds;
                    break;
                  }
                }
              }

              if (odds) {

                return {
                  ...match,
                  odds
                };
              }

              return match;
            });

            return {
              ...round,
              matches: updatedMatches
            };
          });

          // Verificar se alguma partida tem odds depois da atualização
          let oddsFound = false
          updatedRounds.forEach(round => {
            round.matches.forEach(match => {
              if (match.odds) {
                oddsFound = true
              }
            })
          })


          setRounds(updatedRounds)
        } catch (oddsError) {
          console.warn("Erro ao carregar odds:", oddsError)
          setRounds(data.rounds)
        }
      } else {
        setRounds(data.rounds)
      }

      setStandings(data.standings)

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Erro ao carregar dados. Tente novamente.")
      setDebugInfo("Informações técnicas: " + (err.stack ? err.stack.split("\n")[0] : "Erro desconhecido"))
    }
  }

  useEffect(() => {
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
    setPreviousStandings(standings)

    const updatedRounds = rounds.map((round) => {
      if (round.id === roundId) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            if (match.status === "ended") {
              return match
            }

            const updatedScores = { ...match.scores }

            // Tratamento especial para valores zero (considerados vazios no input)
            // Isso garante a persistência dos valores ao navegar entre páginas
            if (homeScore !== null) {
              updatedScores.homeScore = homeScore
            }

            if (awayScore !== null) {
              updatedScores.awayScore = awayScore
            }

            // Atualiza o placar de pênaltis se for definido
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

    const updatedStandings = calculateStandings(updatedRounds, teams, leagueData?.standings || [])
    setStandings(updatedStandings)
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    router.push(`/team/${teamId}`)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} debugInfo={debugInfo} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="bg-[#121212] min-h-screen text-white">
      <Header
        loading={loading}
        selectedTeam={selectedTeam}
        teams={teams}
        standings={standings}
        onTeamSelect={handleTeamSelect}
        setActiveTab={setActiveTab}
      />

      <div className="container mx-auto px-4">
        <div className="pt-4 pb-2">
          <TeamCarousel
            teams={leagueData?.teams || []}
            onTeamSelect={handleTeamSelect}
            className="mb-6"
            loading={loading}
          />
        </div>

        <DisclaimerNotice forceShow={false} />

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

        <MainContent
          rounds={rounds}
          teams={teams}
          standings={standings}
          previousStandings={previousStandings}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          onScoreUpdate={handleScoreUpdate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      </div>
      <Footer />

      {/* Adicionando Schema Markup para melhorar dados estruturados */}
      <SchemaMarkup
        type="league"
        teams={teams}
        standings={standings}
        eventName="Kings League - Temporada Atual"
        startDate={new Date().toISOString()}
      />
    </main>
  )
}
