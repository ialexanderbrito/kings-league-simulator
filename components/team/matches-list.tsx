import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Clock, Youtube, Calendar, CheckCircle2, Timer, Swords, TrendingUp, ChevronRight } from "lucide-react"
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
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    return dateString
  }
}

function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
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

  // Calcular estatísticas rápidas
  const totalWins = pastMatches.filter(m => {
    const isHome = m.participants.homeTeamId === teamId;
    const homeScore = m.scores.homeScore || 0;
    const awayScore = m.scores.awayScore || 0;
    const homeScoreP = m.scores.homeScoreP;
    const awayScoreP = m.scores.awayScoreP;

    if (homeScore !== awayScore) {
      return (isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore);
    }
    // Empate - verificar pênaltis
    if (homeScoreP !== undefined && homeScoreP !== null && awayScoreP !== undefined && awayScoreP !== null) {
      return (isHome && homeScoreP > awayScoreP) || (!isHome && awayScoreP > homeScoreP);
    }
    return false;
  }).length;

  const totalLosses = pastMatches.length - totalWins;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Swords className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Histórico de Partidas</h2>
            <p className="text-sm text-gray-400">
              {pastMatches.length} disputadas • {futureMatches.length} agendadas
            </p>
          </div>
        </div>

        {pastMatches.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-400">{totalWins}V</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-400">{totalLosses}D</span>
            </div>
          </div>
        )}
      </div>

      {teamMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-white mb-1">Nenhuma partida encontrada</p>
          <p className="text-sm text-gray-500">As partidas aparecerão aqui quando forem agendadas</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Próximas partidas */}
          {futureMatches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Próximas Partidas</h3>
                  <p className="text-xs text-gray-500">{futureMatches.length} partida{futureMatches.length > 1 ? 's' : ''} agendada{futureMatches.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {futureMatches.map((match) => {
                  const isOpponentFavorite = hasOpponentFavoriteTeam(match);
                  const isHomeTeamFavorite = favoriteTeam?.id === match.participants.homeTeamId;
                  const isAwayTeamFavorite = favoriteTeam?.id === match.participants.awayTeamId;
                  const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

                  return (
                    <div
                      key={match.id}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                        isLiveMatch
                          ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                          : isOpponentFavorite
                            ? "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium border-white/10 bg-white/5 text-gray-300"
                          >
                            {match.round}
                          </Badge>
                          {isLiveMatch && (
                            <Badge className="bg-red-500 text-white text-[10px] px-2 flex items-center gap-1.5 animate-pulse">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                              </span>
                              AO VIVO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <time dateTime={match.date}>{formatDate(match.date)}</time>
                        </div>
                      </div>

                      {/* Match Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0",
                              isHomeTeamFavorite && "ring-2 ring-orange-500"
                            )}>
                              <img
                                src={teams[match.participants.homeTeamId].logo?.url || "/placeholder.svg"}
                                alt={teams[match.participants.homeTeamId].name}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "font-bold text-sm truncate",
                                isHomeTeamFavorite ? "text-orange-400" : "text-white"
                              )}>
                                {teams[match.participants.homeTeamId].shortName}
                              </p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Mandante</p>
                            </div>
                          </div>

                          {/* VS Badge */}
                          <div className="flex flex-col items-center px-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-400">VS</span>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1.5">
                              {isLiveMatch ? 'Em andamento' : 'Agendada'}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                            <div className="min-w-0 text-right">
                              <p className={cn(
                                "font-bold text-sm truncate",
                                isAwayTeamFavorite ? "text-orange-400" : "text-white"
                              )}>
                                {teams[match.participants.awayTeamId].shortName}
                              </p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visitante</p>
                            </div>
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0",
                              isAwayTeamFavorite && "ring-2 ring-orange-500"
                            )}>
                              <img
                                src={teams[match.participants.awayTeamId].logo?.url || "/placeholder.svg"}
                                alt={teams[match.participants.awayTeamId].name}
                                className="w-10 h-10 object-contain"
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

          {/* Partidas disputadas */}
          {pastMatches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Partidas Disputadas</h3>
                  <p className="text-xs text-gray-500">{pastMatches.length} partida{pastMatches.length > 1 ? 's' : ''} finalizada{pastMatches.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {pastMatches.map((match) => {
                  const isHome = match.participants.homeTeamId === teamId;
                  const isOpponentFavorite = hasOpponentFavoriteTeam(match);

                  const homeScore = match.scores.homeScore;
                  const awayScore = match.scores.awayScore;
                  const homeScoreP = match.scores.homeScoreP;
                  const awayScoreP = match.scores.awayScoreP;
                  const hasPenalties = homeScoreP !== undefined && homeScoreP !== null &&
                    awayScoreP !== undefined && awayScoreP !== null;

                  const isLiveMatch = match.status === "inPlay1H" || match.status === "inPlay2H" || match.status === "inPlayET" || match.status === "inPlayP";

                  const homePenaltyWin = hasPenalties && homeScoreP > awayScoreP;
                  const awayPenaltyWin = hasPenalties && awayScoreP > homeScoreP;

                  // Determinar resultado
                  let result = '';
                  let resultStyle = { bg: '', text: '', border: '' };

                  if (homeScore === awayScore) {
                    if (hasPenalties) {
                      if ((isHome && homePenaltyWin) || (!isHome && awayPenaltyWin)) {
                        result = 'Vitória (pen)';
                        resultStyle = { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
                      } else {
                        result = 'Derrota (pen)';
                        resultStyle = { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
                      }
                    } else {
                      result = 'Empate';
                      resultStyle = { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
                    }
                  } else if ((isHome && homeScore! > awayScore!) || (!isHome && awayScore! > homeScore!)) {
                    result = 'Vitória';
                    resultStyle = { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
                  } else {
                    result = 'Derrota';
                    resultStyle = { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
                  }

                  const leftTeamId = match.participants.homeTeamId;
                  const rightTeamId = match.participants.awayTeamId;
                  const showLeftTeamTrophy = homeScore === awayScore && hasPenalties && homePenaltyWin;
                  const showRightTeamTrophy = homeScore === awayScore && hasPenalties && awayPenaltyWin;
                  const isLeftTeamFavorite = favoriteTeam?.id === leftTeamId;
                  const isRightTeamFavorite = favoriteTeam?.id === rightTeamId;

                  return (
                    <div
                      key={match.id}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                        result.includes('Vitória')
                          ? "bg-green-500/[0.03] border-green-500/20 hover:border-green-500/40"
                          : result.includes('Derrota')
                            ? "bg-red-500/[0.03] border-red-500/20 hover:border-red-500/40"
                            : "bg-yellow-500/[0.03] border-yellow-500/20 hover:border-yellow-500/40"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium border-white/10 bg-white/5 text-gray-300"
                          >
                            {match.round}
                          </Badge>
                          <Badge className={cn("text-[10px] px-2 border", resultStyle.bg, resultStyle.text, resultStyle.border)}>
                            {result}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <time dateTime={match.date}>{formatDate(match.date)}</time>
                        </div>
                      </div>

                      {/* Match Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0",
                              isLeftTeamFavorite && "ring-2 ring-orange-500"
                            )}>
                              <img
                                src={teams[leftTeamId].logo?.url || "/placeholder.svg"}
                                alt={teams[leftTeamId].name}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={cn(
                                  "font-bold text-sm truncate",
                                  isLeftTeamFavorite ? "text-orange-400" : "text-white"
                                )}>
                                  {teams[leftTeamId].shortName}
                                </p>
                                {showLeftTeamTrophy && (
                                  <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Mandante</p>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-2xl font-black text-white tabular-nums">{homeScore}</span>
                              <span className="text-sm text-gray-500">-</span>
                              <span className="text-2xl font-black text-white tabular-nums">{awayScore}</span>
                            </div>
                            {hasPenalties && (
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500">Pênaltis:</span>
                                <span className="text-xs font-bold text-white tabular-nums">{homeScoreP} - {awayScoreP}</span>
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                            <div className="min-w-0 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {showRightTeamTrophy && (
                                  <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                                )}
                                <p className={cn(
                                  "font-bold text-sm truncate",
                                  isRightTeamFavorite ? "text-orange-400" : "text-white"
                                )}>
                                  {teams[rightTeamId].shortName}
                                </p>
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visitante</p>
                            </div>
                            <div className={cn(
                              "relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0",
                              isRightTeamFavorite && "ring-2 ring-orange-500"
                            )}>
                              <img
                                src={teams[rightTeamId].logo?.url || "/placeholder.svg"}
                                alt={teams[rightTeamId].name}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        {/* YouTube Link */}
                        {match.metaInformation?.youtube_url && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <a
                              href={match.metaInformation.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all duration-200 group"
                            >
                              <Youtube className="w-4 h-4" />
                              <span className="text-sm font-medium">Assistir Partida</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
        </div>
      )}
    </div>
  )
}

export function MatchesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Section header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Match cards skeleton */}
      <div className="grid gap-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
                <Skeleton className="w-28 h-12 rounded-xl" />
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-3 w-14 ml-auto" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}