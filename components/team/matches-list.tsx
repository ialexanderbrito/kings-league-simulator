import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Clock, Youtube } from "lucide-react"
import { Team } from "@/types/kings-league"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn } from "@/lib/utils"

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
    status?: string
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
    return dateString
  }
}

export function MatchesList({ teamId, teamMatches, teams, loading }: MatchesListProps) {
  const { favoriteTeam } = useTeamTheme();

  if (loading) {
    return <MatchesListSkeleton />
  }

  const pastMatches = teamMatches
    .filter(m => m.scores.homeScore !== null && m.scores.awayScore !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const futureMatches = teamMatches
    .filter(m => m.scores.homeScore === null || m.scores.awayScore === null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Função para verificar se um time da partida é o favorito (exceto o time atual da página)
  const hasOpponentFavoriteTeam = (match: any) => {
    if (!favoriteTeam) return false;

    // Se o time atual não for o favorito, verificar se o oponente é o favorito
    if (teamId !== favoriteTeam.id) {
      const opponentId = match.participants.homeTeamId === teamId
        ? match.participants.awayTeamId
        : match.participants.homeTeamId;

      return opponentId === favoriteTeam.id;
    }

    return false;
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 sm:p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Partidas</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico e próximos jogos
        </p>
      </div>
      <div className="p-4 sm:p-5">
        {teamMatches.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
            <p className="text-muted-foreground">Nenhuma partida encontrada para este time</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Jogos já realizados */}
            {pastMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500" aria-hidden="true"></span>
                  Partidas disputadas
                </h3>
                <div className="space-y-3">
                  {pastMatches.map((match) => {
                    const isHome = match.participants.homeTeamId === teamId;
                    const opponentId = isHome ? match.participants.awayTeamId : match.participants.homeTeamId;
                    const isOpponentFavorite = hasOpponentFavoriteTeam(match);

                    const homeScore = match.scores.homeScore;
                    const awayScore = match.scores.awayScore;
                    const homeScoreP = match.scores.homeScoreP;
                    const awayScoreP = match.scores.awayScoreP;
                    const hasPenalties = homeScoreP !== undefined && homeScoreP !== null &&
                      awayScoreP !== undefined && awayScoreP !== null;

                    // Verificar se a partida está ao vivo
                    const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

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

                    // Verificar se o time à esquerda ou à direita é o favorito
                    const isLeftTeamFavorite = favoriteTeam?.id === leftTeamId;
                    const isRightTeamFavorite = favoriteTeam?.id === rightTeamId;

                    return (
                      <div
                        key={match.id}
                        className={cn(
                          "rounded-lg border-2 overflow-hidden transition-all duration-200",
                          // Borda verde para vitórias, vermelha para derrotas
                          result === 'Vitória' || result === 'Vitória (pen)'
                            ? "bg-muted/30 border-green-500/60 hover:border-green-500"
                            : result === 'Derrota' || result === 'Derrota (pen)'
                              ? "bg-muted/30 border-red-500/30 hover:border-red-500/50"
                              : isOpponentFavorite
                                ? "bg-accent/50 border-accent hover:border-accent/80"
                                : "bg-muted/30 border-border hover:border-border/80"
                        )}
                      >
                        {/* Cabeçalho com rodada e data */}
                        <div className="bg-muted/50 px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-normal border-border bg-background/50">
                              {match.round}
                            </Badge>
                            {isLiveMatch && (
                              <Badge className="bg-red-600 text-white text-[10px] py-0 h-5 px-2 flex items-center gap-1 animate-pulse">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                AO VIVO
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <time dateTime={match.date}>{formatDate(match.date)}</time>
                          </div>
                        </div>

                        {/* Conteúdo da partida */}
                        <div className="p-3 sm:p-4">
                          {/* Placar e times */}
                          <div className="flex items-center justify-between gap-2 sm:gap-4">
                            {/* Time da casa (sempre à esquerda) */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-full",
                                isLeftTeamFavorite && "ring-2 ring-primary"
                              )}>
                                <img
                                  src={teams[leftTeamId].logo?.url || "/placeholder.svg"}
                                  alt={`Logo ${teams[leftTeamId].name}`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className={cn(
                                    "font-semibold text-sm sm:text-base truncate",
                                    isLeftTeamFavorite ? "text-primary" : "text-foreground"
                                  )}>
                                    {teams[leftTeamId].shortName}
                                  </p>
                                  {hasPenalties && showLeftTeamTrophy && (
                                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" aria-label="Vencedor nos pênaltis" />
                                  )}
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">Mandante</p>
                              </div>
                            </div>

                            {/* Placar centralizado */}
                            <div className="flex flex-col items-center px-2 sm:px-3">
                              <div className="flex items-center justify-center gap-2 sm:gap-3">
                                <span className="text-lg sm:text-2xl font-bold tabular-nums">{homeScore}</span>
                                <span className="text-xs text-muted-foreground">×</span>
                                <span className="text-lg sm:text-2xl font-bold tabular-nums">{awayScore}</span>
                              </div>

                              {/* Pênaltis, se houver */}
                              {hasPenalties && (
                                <div className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                                  <span>Pênaltis: </span>
                                  <span className="font-semibold text-foreground tabular-nums">{homeScoreP} × {awayScoreP}</span>
                                </div>
                              )}

                              {/* Badge de resultado */}
                              <div className="mt-2">
                                <Badge className={cn("text-[10px] sm:text-xs px-2 py-0.5", resultClass)}>
                                  {result}
                                </Badge>
                              </div>
                            </div>

                            {/* Time visitante (sempre à direita) */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
                              <div className="min-w-0 flex-1 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {hasPenalties && showRightTeamTrophy && (
                                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" aria-label="Vencedor nos pênaltis" />
                                  )}
                                  <p className={cn(
                                    "font-semibold text-sm sm:text-base truncate",
                                    isRightTeamFavorite ? "text-primary" : "text-foreground"
                                  )}>
                                    {teams[rightTeamId].shortName}
                                  </p>
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">Visitante</p>
                              </div>
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-full",
                                isRightTeamFavorite && "ring-2 ring-primary"
                              )}>
                                <img
                                  src={teams[rightTeamId].logo?.url || "/placeholder.svg"}
                                  alt={`Logo ${teams[rightTeamId].name}`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Links e informações extras */}
                          {match.metaInformation?.youtube_url && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <a
                                href={match.metaInformation.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                aria-label="Assistir partida no YouTube"
                              >
                                <Youtube className="w-4 h-4" aria-hidden="true" />
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
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" aria-hidden="true"></span>
                  Próximas partidas
                </h3>
                <div className="space-y-3">
                  {futureMatches.map((match) => {
                    const isOpponentFavorite = hasOpponentFavoriteTeam(match);
                    const isHomeTeamFavorite = favoriteTeam?.id === match.participants.homeTeamId;
                    const isAwayTeamFavorite = favoriteTeam?.id === match.participants.awayTeamId;

                    // Verificar se a partida está ao vivo
                    const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

                    return (
                      <div
                        key={match.id}
                        className={cn(
                          "rounded-lg border overflow-hidden transition-all duration-200",
                          isOpponentFavorite
                            ? "bg-accent/50 border-accent hover:border-accent/80"
                            : "bg-muted/30 border-border hover:border-border/80"
                        )}
                      >
                        {/* Cabeçalho com rodada e data */}
                        <div className="bg-muted/50 px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-normal border-border bg-background/50">
                              {match.round}
                            </Badge>
                            {isLiveMatch && (
                              <Badge className="bg-red-600 text-white text-[10px] py-0 h-5 px-2 flex items-center gap-1 animate-pulse">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                AO VIVO
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <time dateTime={match.date}>{formatDate(match.date)}</time>
                          </div>
                        </div>

                        {/* Conteúdo da partida */}
                        <div className="p-3 sm:p-4">
                          {/* Placar e times */}
                          <div className="flex items-center justify-between gap-2 sm:gap-4">
                            {/* Estrutura consistente: sempre time local à esquerda e visitante à direita */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-full",
                                isHomeTeamFavorite && "ring-2 ring-primary"
                              )}>
                                <img
                                  src={teams[match.participants.homeTeamId].logo?.url || "/placeholder.svg"}
                                  alt={`Logo ${teams[match.participants.homeTeamId].name}`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                  loading="lazy"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  "font-semibold text-sm sm:text-base truncate",
                                  isHomeTeamFavorite ? "text-primary" : "text-foreground"
                                )}>
                                  {teams[match.participants.homeTeamId].shortName}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">Mandante</p>
                              </div>
                            </div>

                            {/* Placar centralizado para partidas futuras */}
                            <div className="flex flex-col items-center px-2 sm:px-3">
                              <div className="flex items-center justify-center">
                                <span className="text-base sm:text-lg font-semibold text-muted-foreground">VS</span>
                              </div>
                              <div className="mt-1.5 text-[10px] sm:text-xs">
                                {isLiveMatch ? (
                                  <Badge variant="destructive" className="text-[10px] animate-pulse">
                                    EM ANDAMENTO
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {match.ended ? 'Finalizada' : 'Agendada'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Time visitante */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
                              <div className="min-w-0 flex-1 text-right">
                                <p className={cn(
                                  "font-semibold text-sm sm:text-base truncate",
                                  isAwayTeamFavorite ? "text-primary" : "text-foreground"
                                )}>
                                  {teams[match.participants.awayTeamId].shortName}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">Visitante</p>
                              </div>
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-full",
                                isAwayTeamFavorite && "ring-2 ring-primary"
                              )}>
                                <img
                                  src={teams[match.participants.awayTeamId].logo?.url || "/placeholder.svg"}
                                  alt={`Logo ${teams[match.participants.awayTeamId].name}`}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                  loading="lazy"
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
      </div>
    </div>
  )
}

export function MatchesListSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 sm:p-5 border-b border-border">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-3 sm:px-4 py-2 flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}