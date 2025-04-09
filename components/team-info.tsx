import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import type { Team, Round } from "@/types/kings-league"

interface TeamInfoProps {
  team: Team
  rounds: Round[]
  teams: Record<string, Team>
}

export default function TeamInfo({ team, rounds, teams }: TeamInfoProps) {
  // Encontrar todas as partidas deste time
  const teamMatches = rounds.flatMap((round) =>
    round.matches
      .filter((match) => match.participants.homeTeamId === team.id || match.participants.awayTeamId === team.id)
      .map((match) => ({
        ...match,
        round: round.name.replace('Jornada', 'Rodada'),
        roundId: round.id,
        ended: round.ended,
      })),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333] text-white">
        <CardHeader className="pb-2 border-b border-[#333]">
          <CardTitle className="text-xl flex items-center gap-3 text-[#F4AF23]">
            {team.logo && (
              <div className="w-12 h-12 relative">
                <Image
                  src={team.logo.url || "/placeholder.svg"}
                  alt={team.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <span>{team.name}</span>
              <div className="flex gap-2 mt-1">
                <Badge style={{ backgroundColor: team.firstColorHEX }} className="text-white h-5">
                  Cor 1
                </Badge>
                <Badge style={{ backgroundColor: team.secondColorHEX }} className="text-white h-5">
                  Cor 2
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333] text-white">
        <CardHeader className="pb-2 border-b border-[#333]">
          <CardTitle className="text-xl text-[#F4AF23]">Partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-[#252525] border-b border-[#333]">
                <TableHead className="text-[#F4AF23]">Rodada</TableHead>
                <TableHead className="text-[#F4AF23]">Data</TableHead>
                <TableHead className="text-[#F4AF23]">Adversário</TableHead>
                <TableHead className="text-center text-[#F4AF23]">Resultado</TableHead>
                <TableHead className="text-center text-[#F4AF23]">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMatches.map((match) => {
                const isHome = match.participants.homeTeamId === team.id
                const opponentId = isHome ? match.participants.awayTeamId : match.participants.homeTeamId
                const opponent = teams[opponentId]

                const homeScore = match.scores.homeScore
                const awayScore = match.scores.awayScore

                return (
                  <TableRow key={match.id} className="border-b border-[#333]">
                    <TableCell>{match.round}</TableCell>
                    <TableCell>{formatDate(match.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {opponent?.logo && (
                          <div className="w-6 h-6 relative">
                            <Image
                              src={opponent.logo.url || "/placeholder.svg"}
                              alt={opponent.name}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span>{isHome ? `vs ${opponent?.shortName} (Casa)` : `vs ${opponent?.shortName} (Fora)`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {homeScore === null || awayScore === null ? (
                        <Badge variant="outline">Pendente</Badge>
                      ) : (
                        <>
                          {isHome ? (
                            <>
                              {homeScore > awayScore && <Badge className="bg-green-600">V {homeScore}-{awayScore}</Badge>}
                              {homeScore < awayScore && <Badge className="bg-red-600">D {homeScore}-{awayScore}</Badge>}
                              {homeScore === awayScore && (
                                <>
                                  {match.scores.homeScoreP !== null && match.scores.awayScoreP !== null ? (
                                    match.scores.homeScoreP > match.scores.awayScoreP ? (
                                      <Badge className="bg-green-600">V (Pênaltis)</Badge>
                                    ) : (
                                      <Badge className="bg-red-600">D (Pênaltis)</Badge>
                                    )
                                  ) : (
                                    <Badge className="bg-gray-600">E {homeScore}-{awayScore}</Badge>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {awayScore > homeScore && <Badge className="bg-green-600">V {awayScore}-{homeScore}</Badge>}
                              {awayScore < homeScore && <Badge className="bg-red-600">D {awayScore}-{homeScore}</Badge>}
                              {awayScore === homeScore && (
                                <>
                                  {match.scores.homeScoreP !== null && match.scores.awayScoreP !== null ? (
                                    match.scores.awayScoreP > match.scores.homeScoreP ? (
                                      <Badge className="bg-green-600">V (Pênaltis)</Badge>
                                    ) : (
                                      <Badge className="bg-red-600">D (Pênaltis)</Badge>
                                    )
                                  ) : (
                                    <Badge className="bg-gray-600">E {awayScore}-{homeScore}</Badge>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {match.metaInformation?.youtube_url && (
                        <a
                          href={match.metaInformation.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-[#F4AF23] hover:underline"
                          aria-label={`Ver ${team.name} vs ${opponent?.name} no YouTube`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only">Ver no YouTube</span>
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
