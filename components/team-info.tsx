import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Calendar, ExternalLink, Instagram, TwitchIcon, Youtube, Clock, Trophy } from "lucide-react"
import Image from "next/image"
import { fetchTeamDetails } from "@/lib/fetch-league-data"
import type { Team, Round, TeamDetails, Player } from "@/types/kings-league"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TeamInfoProps {
  team: Team
  rounds: Round[]
  teams: Record<string, Team>
}

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
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

function formatBirthDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Erro ao formatar data de nascimento:", error)
    return dateString
  }
}

function PlayerCard({ player }: { player: Player }) {
  const roleMap = {
    goalkeeper: "Goleiro",
    defender: "Defensor",
    midfielder: "Meio-campo",
    forward: "Atacante",
  }

  const roleColor = {
    goalkeeper: "#FFC107", // Amarelo
    defender: "#2196F3", // Azul
    midfielder: "#4CAF50", // Verde
    forward: "#F44336", // Vermelho
  }

  const roleBgColor = {
    goalkeeper: "from-yellow-900 to-yellow-950",
    defender: "from-blue-900 to-blue-950",
    midfielder: "from-green-900 to-green-950",
    forward: "from-red-900 to-red-950",
  }

  const age = player.birthDate ? calculateAge(player.birthDate) : null

  // Verificar se é um Wildcard para aplicar estilo especial
  const isWildcard = player.category === "wildcard"

  // Calcular média do jogador com base nos atributos disponíveis
  const calculateRating = (): number => {
    if (!player.metaInformation) return 75;

    if (player.role === 'goalkeeper') {
      const attrs = [
        parseInt(player.metaInformation.diving || '75'),
        parseInt(player.metaInformation.handling || '75'),
        parseInt(player.metaInformation.reflexes || '75'),
        parseInt(player.metaInformation.anticipation || '75')
      ];
      return Math.round(attrs.reduce((sum, val) => sum + val, 0) / attrs.length);
    } else {
      // Para jogadores de linha
      const attrs = [
        parseInt(player.metaInformation.passing || '75'),
        parseInt(player.metaInformation.shooting || '75'),
        parseInt(player.metaInformation.defence || '75'),
        parseInt(player.metaInformation.physical || '75'),
        parseInt(player.metaInformation.duels || '75'),
        parseInt(player.metaInformation.skills || '75')
      ];
      return Math.round(attrs.reduce((sum, val) => sum + val, 0) / attrs.length);
    }
  };

  const playerRating = calculateRating();

  // Definir a cor de fundo baseada na categoria e rating
  const getBgStyle = () => {
    if (isWildcard) {
      return "bg-gradient-to-b from-[#8B6810] to-black border-[#F4AF23]";
    }

    // Com base no rating
    if (playerRating >= 87) return "bg-gradient-to-b from-[#3D6EB9] to-black border-gray-600"; // Elevado 
    if (playerRating >= 83) return "bg-gradient-to-b from-[#D53121] to-black border-gray-600"; // Alto
    if (playerRating >= 78) return "bg-gradient-to-b from-[#10694D] to-black border-gray-600"; // Médio

    // Padrão
    return "bg-gradient-to-b from-[#323232] to-black border-gray-600";
  };

  const renderAttributeBars = () => {
    if (!player.metaInformation) return null;

    const getAttributeValue = (attr: string | undefined): number => {
      return parseInt(attr || '70');
    };

    const getBarColor = (value: number): string => {
      if (value >= 90) return 'bg-green-500';
      if (value >= 80) return 'bg-lime-500';
      if (value >= 70) return 'bg-yellow-500';
      if (value >= 60) return 'bg-orange-500';
      return 'bg-red-500';
    };

    // Renderizar 6 atributos padrões baseados na posição
    if (player.role === 'goalkeeper') {
      const diving = getAttributeValue(player.metaInformation.diving);
      const handling = getAttributeValue(player.metaInformation.handling);
      const reflexes = getAttributeValue(player.metaInformation.reflexes);
      const positioning = getAttributeValue(player.metaInformation.anticipation);
      const passing = getAttributeValue(player.metaInformation.goalkeeperPassing);

      return (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2">
          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>DEF</span>
            <span className="font-medium">{diving}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(diving)}`} style={{ width: `${diving}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>MÃO</span>
            <span className="font-medium">{handling}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(handling)}`} style={{ width: `${handling}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>REF</span>
            <span className="font-medium">{reflexes}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(reflexes)}`} style={{ width: `${reflexes}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>POS</span>
            <span className="font-medium">{positioning}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(positioning)}`} style={{ width: `${positioning}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>PAS</span>
            <span className="font-medium">{passing}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(passing)}`} style={{ width: `${passing}%` }}></div>
            </div>
          </div>
        </div>
      );
    } else {
      // Para jogadores de linha
      const pace = getAttributeValue(player.metaInformation.physical);
      const shooting = getAttributeValue(player.metaInformation.shooting);
      const passing = getAttributeValue(player.metaInformation.passing);
      const dribbling = getAttributeValue(player.metaInformation.skills);
      const defending = getAttributeValue(player.metaInformation.defence);
      const physical = getAttributeValue(player.metaInformation.duels);

      return (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2">
          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>VEL</span>
            <span className="font-medium">{pace}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(pace)}`} style={{ width: `${pace}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>FIN</span>
            <span className="font-medium">{shooting}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(shooting)}`} style={{ width: `${shooting}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>PAS</span>
            <span className="font-medium">{passing}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(passing)}`} style={{ width: `${passing}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>DRI</span>
            <span className="font-medium">{dribbling}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(dribbling)}`} style={{ width: `${dribbling}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>DEF</span>
            <span className="font-medium">{defending}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(defending)}`} style={{ width: `${defending}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 text-[10px] text-gray-200 flex justify-between">
            <span>FIS</span>
            <span className="font-medium">{physical}</span>
          </div>
          <div className="col-span-2 flex items-center">
            <div className="h-1.5 w-full bg-black/50 rounded-full">
              <div className={`h-1.5 rounded-full ${getBarColor(physical)}`} style={{ width: `${physical}%` }}></div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="group h-full w-full perspective-1000 cursor-pointer" style={{ minHeight: '360px' }}>
      <div className="card-container relative h-full w-full transition-all duration-700">
        {/* Frente do card */}
        <div className={`absolute inset-0 ${getBgStyle()} rounded-lg border overflow-hidden shadow-lg`}>
          {/* Cabeçalho do card com rating, posição e foto */}
          <div className="relative h-full flex flex-col">
            {/* Rating e posição */}
            <div className="absolute top-0 left-0 z-10 flex flex-col items-center pt-2 pl-2">
              <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full ${isWildcard ? 'bg-gradient-to-br from-[#F4AF23] to-amber-600' : 'bg-gradient-to-br from-white to-gray-300'
                }`}>
                <span className={`text-lg font-black ${isWildcard ? 'text-black' : 'text-black'}`}>
                  {playerRating}
                </span>
              </div>
              <div
                className="w-8 h-6 -mt-1 flex items-center justify-center rounded-sm text-xs font-bold text-white"
                style={{ backgroundColor: roleColor[player.role] }}
              >
                {player.role === 'goalkeeper' ? 'GOL' :
                  player.role === 'defender' ? 'DEF' :
                    player.role === 'midfielder' ? 'MEI' : 'ATA'}
              </div>
            </div>

            {/* Badge de tipo (WC ou Draft) */}
            {player.category && (
              <div className="absolute top-0 right-0 z-10 pt-2 pr-2">
                <div className={`px-2 py-1 rounded-full text-xs font-bold
                  ${isWildcard
                    ? 'bg-gradient-to-r from-amber-500 to-[#F4AF23] text-black shadow-glow-gold'
                    : 'bg-purple-600 text-white'
                  }`}
                >
                  {isWildcard ? (
                    <span className="flex items-center">
                      <span className="mr-1 animate-pulse">★</span> WC
                    </span>
                  ) : "DRAFT"}
                </div>
              </div>
            )}

            {/* Imagem do jogador */}
            <div className="flex-grow relative" style={{ height: '200px' }}>
              <div className={`absolute inset-0 ${isWildcard ? 'bg-gradient-to-b from-[#F4AF23]/20 to-transparent animate-pulse-slow' : ''}`}></div>
              {player.image?.url ? (
                <Image
                  src={player.image.url}
                  alt={player.shortName}
                  fill
                  className="object-contain object-center p-2 drop-shadow-xl z-10"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-600">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Rodapé do card */}
            <div className="p-2 bg-gradient-to-b from-black/70 to-black text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className={`font-bold text-sm truncate ${isWildcard ? 'text-[#F4AF23]' : 'text-white'}`}>
                    {player.shortName}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="bg-black/40 text-[10px] px-1.5 rounded text-gray-300">#{player.jersey}</div>
                    {age && <div className="text-[10px] text-gray-400">{age} anos</div>}
                    <div className="text-[10px] text-gray-400">{player.height}cm</div>
                  </div>
                </div>

                {/* Logo da Kings League */}
                <div className="h-8 w-8 opacity-70">
                  <Image
                    src="/favicon.svg"
                    alt="Kings League Logo"
                    width={32}
                    height={32}
                  />
                </div>
              </div>

              {/* Atributos do jogador */}
              {renderAttributeBars()}
            </div>
          </div>
        </div>

        {/* Verso do card (detalhes) */}
        <div className={`absolute inset-0 rotate-y-180 ${getBgStyle()} rounded-lg border overflow-hidden shadow-lg`}>
          <div className="h-full flex flex-col">
            {/* Cabeçalho do verso */}
            <div className="bg-black/80 p-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${isWildcard ? 'bg-[#F4AF23] text-black' : 'bg-white text-black'}`}>
                  {playerRating}
                </div>
                <div>
                  <div className="font-bold text-sm">{player.shortName}</div>
                  <div className="text-[10px] text-gray-300">{roleMap[player.role]}</div>
                </div>
              </div>
              <div
                className="w-8 h-6 flex items-center justify-center rounded-sm text-xs font-bold text-white"
                style={{ backgroundColor: roleColor[player.role] }}
              >
                {player.role === 'goalkeeper' ? 'GOL' :
                  player.role === 'defender' ? 'DEF' :
                    player.role === 'midfielder' ? 'MEI' : 'ATA'}
              </div>
            </div>

            {/* Conteúdo principal do verso */}
            <div className="flex-grow p-3 flex flex-col justify-between">
              {/* Detalhes do jogador */}
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-gray-400">Nome completo</div>
                  <div className="text-xs">{player.shortName}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] text-gray-400">Altura</div>
                    <div className="text-xs">{player.height}cm</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Idade</div>
                    <div className="text-xs">{age || '-'} anos</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Camisa</div>
                    <div className="text-xs">#{player.jersey}</div>
                  </div>
                </div>
                {player.birthDate && (
                  <div>
                    <div className="text-[10px] text-gray-400">Data de nascimento</div>
                    <div className="text-xs">{formatBirthDate(player.birthDate)}</div>
                  </div>
                )}

                {/* Categoria especial */}
                {player.category && (
                  <div className="mt-2">
                    <div className="text-[10px] text-gray-400">Categoria</div>
                    <div className={`text-xs ${isWildcard ? 'text-[#F4AF23]' : 'text-purple-400'}`}>
                      {isWildcard ? '★ Wildcard (Jogador Especial)' : 'Draftado'}
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="mt-4">
                {player.metaInformation?.videoLink && (
                  <a
                    href={player.metaInformation.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs flex items-center gap-1 hover:underline
                      ${isWildcard ? 'text-[#F4AF23]' : 'text-white'}`}
                    aria-label={`Ver vídeo de ${player.shortName}`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Ver highlights do jogador</span>
                  </a>
                )}

                {player.metaInformation?.matchLink && (
                  <a
                    href={player.metaInformation.matchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 mt-1.5 text-gray-300 hover:text-white hover:underline"
                    aria-label={`Ver partida com ${player.shortName}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver partida completa</span>
                  </a>
                )}
              </div>
            </div>

            {/* Rodapé do verso */}
            <div className="bg-black/70 p-2 text-center">
              <div className="text-[10px] text-gray-400">Kings League Brasil</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton do Card de Jogador
function PlayerCardSkeleton() {
  return (
    <div className="h-full w-full" style={{ minHeight: '360px' }}>
      <div className="relative h-full rounded-lg border border-[#333] bg-[#1a1a1a] overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 z-10 pt-2 pl-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-8 h-6 -mt-1" />
        </div>

        <div className="absolute top-0 right-0 z-10 pt-2 pr-2">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>

        <div className="h-[200px] relative">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="p-2 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="mt-2 space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Skeleton className="h-2 w-6" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton para cabeçalho do time
function TeamHeaderSkeleton() {
  return (
    <div className="relative rounded-xl bg-gradient-to-b from-black to-[#121212] border border-[#333] p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="w-28 h-28 rounded-md" />
        <div className="text-center md:text-left flex-grow">
          <Skeleton className="h-8 w-44 mb-4 mx-auto md:mx-0" />
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton para as estatísticas
function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="bg-[#252525] border-[#333]">
          <CardHeader className="pb-2">
            <CardTitle>
              <Skeleton className="h-4 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function TeamInfo({ team, rounds, teams }: TeamInfoProps) {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadTeamDetails = async () => {
      try {
        setLoading(true)
        const details = await fetchTeamDetails(team.id)
        setTeamDetails(details)
        setError(null)
      } catch (err) {
        console.error("Erro ao carregar detalhes do time:", err)
        setError("Não foi possível carregar todos os detalhes do time.")
      } finally {
        setLoading(false)
      }
    }

    loadTeamDetails()
  }, [team.id])

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

  // Preparar jogadores por posição
  const goalkeepers = teamDetails?.players.filter(p => p.role === 'goalkeeper') || []
  const defenders = teamDetails?.players.filter(p => p.role === 'defender') || []
  const midfielders = teamDetails?.players.filter(p => p.role === 'midfielder') || []
  const forwards = teamDetails?.players.filter(p => p.role === 'forward') || []

  return (
    <div className="space-y-6">
      {/* Cabeçalho do time */}
      {loading ? (
        <TeamHeaderSkeleton />
      ) : (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-black to-[#121212] border border-[#333]">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: teamDetails?.metaInformation?.loop_video_poster ?
              `url('${teamDetails.metaInformation.loop_video_poster}')` :
              'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}></div>

          <div className="relative z-10 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 relative">
              {teamDetails?.logo ? (
                <Image
                  src={teamDetails.logo.url || "/placeholder.svg"}
                  alt={team.name}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <Skeleton className="w-full h-full rounded-full" />
              )}
            </div>

            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl font-bold text-[#F4AF23] mb-2">{team.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <Badge style={{ backgroundColor: team.firstColorHEX }} className="text-white">
                  Cor Principal
                </Badge>
                <Badge style={{ backgroundColor: team.secondColorHEX }} className="text-white">
                  Cor Secundária
                </Badge>
              </div>

              {teamDetails?.metaInformation && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
                  {teamDetails.metaInformation.instagram_url && (
                    <a
                      href={teamDetails.metaInformation.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#F4AF23] transition-colors"
                      aria-label={`Instagram de ${team.name}`}
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  {teamDetails.metaInformation.youtube_url && (
                    <a
                      href={teamDetails.metaInformation.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#F4AF23] transition-colors"
                      aria-label={`YouTube de ${team.name}`}
                    >
                      <Youtube className="w-4 h-4" />
                      <span className="text-sm">YouTube</span>
                    </a>
                  )}
                  {teamDetails.metaInformation.twitch_url && (
                    <a
                      href={teamDetails.metaInformation.twitch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#F4AF23] transition-colors"
                      aria-label={`Twitch de ${team.name}`}
                    >
                      <TwitchIcon className="w-4 h-4" />
                      <span className="text-sm">Twitch</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Staff (Presidente) */}
            {teamDetails?.staff && teamDetails.staff.length > 0 && (
              <div className="text-center min-w-[170px]">
                <div className="mb-1 text-xs text-gray-400">Presidente</div>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2 bg-[#252525] border border-[#333] overflow-hidden">
                    {teamDetails.staff[0].image?.url ? (
                      <Image
                        src={teamDetails.staff[0].image.url}
                        alt={teamDetails.staff[0].shortName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#252525] text-[#F4AF23] text-2xl font-bold">
                        {teamDetails.staff[0].shortName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold">{teamDetails.staff[0].shortName}</div>
                  <div className="text-xs text-gray-400">Presidente</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {loading ? (
        <StatisticsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#252525] border-[#333]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Partidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{
                    teamMatches.filter(m =>
                      m.scores.homeScore !== null &&
                      m.scores.awayScore !== null
                    ).length
                  }</div>
                  <div className="text-xs text-gray-400">Jogos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{
                    teamMatches.filter(m => {
                      if (m.scores.homeScore === null || m.scores.awayScore === null) return false
                      const isHome = m.participants.homeTeamId === team.id
                      return isHome
                        ? m.scores.homeScore > m.scores.awayScore
                        : m.scores.awayScore > m.scores.homeScore
                    }).length
                  }</div>
                  <div className="text-xs text-gray-400">Vitórias</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{
                    teamMatches.filter(m => {
                      if (m.scores.homeScore === null || m.scores.awayScore === null) return false
                      const isHome = m.participants.homeTeamId === team.id
                      return isHome
                        ? m.scores.homeScore < m.scores.awayScore
                        : m.scores.awayScore < m.scores.homeScore
                    }).length
                  }</div>
                  <div className="text-xs text-gray-400">Derrotas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#252525] border-[#333]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Gols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#F4AF23]">{
                    teamMatches.reduce((total, match) => {
                      if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                      const isHome = match.participants.homeTeamId === team.id
                      return total + (isHome ? match.scores.homeScore : match.scores.awayScore)
                    }, 0)
                  }</div>
                  <div className="text-xs text-gray-400">Marcados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{
                    teamMatches.reduce((total, match) => {
                      if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                      const isHome = match.participants.homeTeamId === team.id
                      return total + (isHome ? match.scores.awayScore : match.scores.homeScore)
                    }, 0)
                  }</div>
                  <div className="text-xs text-gray-400">Sofridos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{
                    teamMatches.reduce((total, match) => {
                      if (match.scores.homeScore === null || match.scores.awayScore === null) return total
                      const isHome = match.participants.homeTeamId === team.id
                      const goalsFor = isHome ? match.scores.homeScore : match.scores.awayScore
                      const goalsAgainst = isHome ? match.scores.awayScore : match.scores.homeScore
                      return total + (goalsFor - goalsAgainst)
                    }, 0)
                  }</div>
                  <div className="text-xs text-gray-400">Saldo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#252525] border-[#333]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Elenco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{teamDetails?.players.length || 0}</div>
                  <div className="text-xs text-gray-400">Jogadores</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#F4AF23]">{
                    teamDetails?.players.filter(p => p.category === "wildcard").length || 0
                  }</div>
                  <div className="text-xs text-gray-400">Wildcards</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{
                    Math.round(teamDetails?.players.reduce((sum, player) => {
                      const age = player.birthDate ? calculateAge(player.birthDate) : 0
                      return sum + age
                    }, 0) / (teamDetails?.players.length || 1)) || 0
                  }</div>
                  <div className="text-xs text-gray-400">Média Idade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert className="bg-[#332700] border-[#F4AF23] text-white">
          <AlertTriangle className="h-4 w-4 text-[#F4AF23]" />
          <AlertTitle className="text-[#F4AF23]">Atenção</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a]">
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
          >
            Partidas
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-[#F4AF23] data-[state=active]:text-black"
          >
            Elenco
          </TabsTrigger>
        </TabsList>

        {/* Aba de Partidas */}
        <TabsContent value="matches" className="mt-0">
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader className="pb-3 border-b border-[#333]">
              <CardTitle className="text-xl text-[#F4AF23] flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Partidas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Histórico e próximos jogos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
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
              ) : teamMatches.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Nenhuma partida encontrada para este time
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Jogos já realizados */}
                  {teamMatches.filter(m => m.scores.homeScore !== null && m.scores.awayScore !== null).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#F4AF23] mb-3 flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        Partidas disputadas
                      </h3>
                      <div className="space-y-3">
                        {teamMatches
                          .filter(m => m.scores.homeScore !== null && m.scores.awayScore !== null)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((match) => {
                            const isHome = match.participants.homeTeamId === team.id;
                            const opponentId = isHome ? match.participants.awayTeamId : match.participants.homeTeamId;
                            const opponent = teams[opponentId];

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
                          })
                        }
                      </div>
                    </div>
                  )}

                  {/* Jogos futuros */}
                  {teamMatches.filter(m => m.scores.homeScore === null || m.scores.awayScore === null).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#F4AF23] mb-3 flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                        Próximas partidas
                      </h3>
                      <div className="space-y-3">
                        {teamMatches
                          .filter(m => m.scores.homeScore === null || m.scores.awayScore === null)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((match) => {
                            const isHome = match.participants.homeTeamId === team.id;
                            const opponentId = isHome ? match.participants.awayTeamId : match.participants.homeTeamId;
                            const opponent = teams[opponentId];

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
                          })
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Elenco */}
        <TabsContent value="team" className="mt-0">
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader className="pb-2 border-b border-[#333]">
              <CardTitle className="text-xl text-[#F4AF23]">Elenco</CardTitle>
              <CardDescription className="text-gray-400">
                Jogadores da temporada atual
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              {loading ? (
                <div className="space-y-8">
                  {/* Skeleton para cada seção de posição */}
                  {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position) => (
                    <div key={position}>
                      <Skeleton className="h-6 w-32 mb-3" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array(position === 'Goleiros' ? 2 : 4).fill(0).map((_, i) => (
                          <PlayerCardSkeleton key={i} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {goalkeepers.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-3 text-[#F4AF23]">Goleiros</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {goalkeepers.map(player => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {defenders.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-3 text-[#F4AF23]">Defensores</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {defenders.map(player => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {midfielders.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-3 text-[#F4AF23]">Meio-campistas</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {midfielders.map(player => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {forwards.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-3 text-[#F4AF23]">Atacantes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {forwards.map(player => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {teamDetails?.players.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      Nenhum jogador encontrado para este time
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
