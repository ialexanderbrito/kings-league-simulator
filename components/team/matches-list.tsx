import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, Youtube } from "lucide-react"
import { Team } from "@/types/kings-league"

interface MatchesListProps {
  teamId: string
  teamMatches: Array<{
    id: string
    round: string
    roundId: string
    ended: boolean
    date: string
    participants: { homeTeamId: string; awayTeamId: string }
    scores: {
      homeScore: number | null
      awayScore: number | null
      homeScoreP?: number | null
      awayScoreP?: number | null
    }
    metaInformation?: {
      youtube_url?: string
    }
  }>
  teams: Record<string, Team>
  loading: boolean
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dateString
  }
}

export function MatchesList({ teamId, teamMatches, teams, loading }: MatchesListProps) {
  if (loading) {
    return <MatchesListSkeleton />
  }

  const pastMatches = teamMatches
    .filter(m => m.scores.homeScore !== null && m.scores.awayScore !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const futureMatches = teamMatches
    .filter(m => m.scores.homeScore === null || m.scores.awayScore === null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="pb-3 border-b border-[#333]">
        <CardTitle className="text-xl text-[#F4AF23] flex items-center gap-2">
          <Clock className="w-5 h-5" /> Partidas
        </CardTitle>
        <CardDescription className="text-gray-400">
          Histórico e próximos jogos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {teamMatches.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Nenhuma partida encontrada para este time
          </div>
        ) : (
          <div className="space-y-6">
            {/* Jogos já realizados */}
            {pastMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#F4AF23] mb-3 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  Partidas disputadas
                </h3>
                <div className="space-y-3">
                  {pastMatches.map((match) => {
                    const isHome = match.participants.homeTeamId === teamId;
                    const opponentId = isHome ? match.participants.awayTeamId : match.participants.homeTeamId;

                    const homeScore = match.scores.homeScore;
                    const awayScore = match.scores.awayScore;
                    const homeScoreP = match.scores.homeScoreP;
                    const awayScoreP = match.scores.awayScoreP;
                    const hasPenalties = homeScoreP !== undefined && homeScoreP !== null &&
                      awayScoreP !== undefined && awayScoreP !== null;

                    // Determinar qual time venceu nos pênaltis
                    const homePenaltyWin = hasPenalties && homeScoreP > awayScoreP;
                    const awayPenaltyWin = hasPenalties && awayScoreP > homeScoreP;

                    // Determinar o resultado do time atual
                    let result = '';
                    let resultClass = '';

                    if (homeScore === awayScore) {
                      // Empate no tempo normal
                      if (hasPenalties) {
                        if ((isHome && homePenaltyWin) || (!isHome && awayPenaltyWin)) {
                          result = 'Vitória (pen)';
                          resultClass = 'bg-green-600/80';
                        } else {
                          result = 'Derrota (pen)';
                          resultClass = 'bg-red-600/80';
                        }
                      } else {
                        result = 'Empate';
                        resultClass = 'bg-yellow-600/80';
                      }
                    } else if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) {
                      result = 'Vitória';
                      resultClass = 'bg-green-600';
                    } else {
                      result = 'Derrota';
                      resultClass = 'bg-red-600';
                    }

                    // Determinar qual time é mostrado do lado esquerdo e direito
                    const leftTeamId = match.participants.homeTeamId;
                    const rightTeamId = match.participants.awayTeamId;

                    // Determinar se mostrar o troféu para cada time
                    // Troféu mostrado apenas para o time vencedor nos pênaltis
                    const showLeftTeamTrophy = homeScore === awayScore && hasPenalties && homeScoreP > awayScoreP;
                    const showRightTeamTrophy = homeScore === awayScore && hasPenalties && awayScoreP > homeScoreP;

                    return (
                      <div
                        key={match.id}
                        className="bg-[#252525] rounded-lg border border-[#333] hover:border-[#444] transition-colors overflow-hidden"
                      >
                        {/* Cabeçalho com rodada e data */}
                        <div className="bg-[#1f1f1f] px-4 py-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-[#333] text-xs font-normal">
                              {match.round}
                            </Badge>
                          </div>
                          <div className="text-gray-400 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(match.date)}
                          </div>
                        </div>

                        {/* Conteúdo da partida */}
                        <div className="p-4">
                          {/* Placar e times */}
                          <div className="flex items-center justify-between">
                            {/* Time da casa (sempre à esquerda) */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 relative flex-shrink-0">
                                <Image
                                  src={teams[leftTeamId].logo?.url || "/placeholder.svg"}
                                  alt={teams[leftTeamId].name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center">
                                  <p className="font-medium truncate">{teams[leftTeamId].shortName}</p>
                                  {hasPenalties && showLeftTeamTrophy && (
                                    <Trophy className="w-4 h-4 text-[#F4AF23] ml-1.5" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">Local</p>
                              </div>
                            </div>

                            {/* Placar centralizado */}
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center gap-3 px-3">
                                <span className="text-xl font-bold">{homeScore}</span>
                                <span className="text-xs text-gray-500">x</span>
                                <span className="text-xl font-bold">{awayScore}</span>
                              </div>

                              {/* Pênaltis, se houver */}
                              {hasPenalties && (
                                <div className="mt-0.5 text-xs text-gray-400">
                                  <span className="font-light">Pênaltis:</span>
                                  <span className="ml-1 font-medium text-gray-300">{homeScoreP} x {awayScoreP}</span>
                                </div>
                              )}

                              {/* Badge de resultado */}
                              <div className="mt-1.5">
                                <Badge className={`text-xs ${resultClass}`}>{result}</Badge>
                              </div>
                            </div>

                            {/* Time visitante (sempre à direita) */}
                            <div className="flex items-center gap-3">
                              <div className="min-w-0 text-right">
                                <div className="flex items-center justify-end">
                                  {hasPenalties && showRightTeamTrophy && (
                                    <Trophy className="w-4 h-4 text-[#F4AF23] mr-1.5" />
                                  )}
                                  <p className="font-medium truncate">{teams[rightTeamId].shortName}</p>
                                </div>
                                <p className="text-xs text-gray-400">Visitante</p>
                              </div>
                              <div className="w-10 h-10 relative flex-shrink-0">
                                <Image
                                  src={teams[rightTeamId].logo?.url || "/placeholder.svg"}
                                  alt={teams[rightTeamId].name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Links e informações extras */}
                          {match.metaInformation?.youtube_url && (
                            <div className="mt-3 pt-2 border-t border-[#333] flex justify-center">
                              <a
                                href={match.metaInformation.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[#F4AF23] text-sm hover:underline transition-colors"
                              >
                                <Youtube className="w-4 h-4" />
                                <span>Assistir partida</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Jogos futuros */}
            {futureMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#F4AF23] mb-3 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                  Próximas partidas
                </h3>
                <div className="space-y-3">
                  {futureMatches.map((match) => {
                    return (
                      <div
                        key={match.id}
                        className="bg-[#252525] rounded-lg border border-[#333] hover:border-[#444] transition-colors overflow-hidden"
                      >
                        {/* Cabeçalho com rodada e data */}
                        <div className="bg-[#1f1f1f] px-4 py-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-[#333] text-xs font-normal">
                              {match.round}
                            </Badge>
                          </div>
                          <div className="text-gray-400 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(match.date)}
                          </div>
                        </div>

                        {/* Conteúdo da partida */}
                        <div className="p-4">
                          {/* Placar e times */}
                          <div className="flex items-center justify-between">
                            {/* Estrutura consistente: sempre time local à esquerda e visitante à direita */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 relative flex-shrink-0">
                                <Image
                                  src={teams[match.participants.homeTeamId].logo?.url || "/placeholder.svg"}
                                  alt={teams[match.participants.homeTeamId].name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{teams[match.participants.homeTeamId].shortName}</p>
                                <p className="text-xs text-gray-400">Local</p>
                              </div>
                            </div>

                            {/* Placar centralizado para partidas futuras */}
                            <div className="px-4 py-1 rounded-lg bg-[#121212]/50 border border-[#333]/50">
                              <span className="text-sm text-gray-400">Em breve</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="min-w-0 text-right">
                                <p className="font-medium truncate">{teams[match.participants.awayTeamId].shortName}</p>
                                <p className="text-xs text-gray-400">Visitante</p>
                              </div>
                              <div className="w-10 h-10 relative flex-shrink-0">
                                <Image
                                  src={teams[match.participants.awayTeamId].logo?.url || "/placeholder.svg"}
                                  alt={teams[match.participants.awayTeamId].name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MatchesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-[#252525] p-4 rounded-lg border border-[#333]">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}