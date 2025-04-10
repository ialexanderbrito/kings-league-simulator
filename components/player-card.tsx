"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Player } from "@/types/kings-league"

interface PlayerCardProps {
  player: Player
  teamColors: {
    primary: string
    secondary: string
  }
}

export default function PlayerCard({ player, teamColors }: PlayerCardProps) {
  // Função para mapear role para texto em português
  const getRoleText = (role: string) => {
    switch (role) {
      case "goalkeeper": return "Goleiro"
      case "defender": return "Defensor"
      case "midfielder": return "Meio-campo"
      case "forward": return "Atacante"
      default: return role
    }
  }

  // Função para calcular idade a partir da data de nascimento
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Cores de destaque baseadas na posição do jogador
  const getRoleColor = (role: string) => {
    switch (role) {
      case "goalkeeper": return "bg-yellow-500/20 text-yellow-500"
      case "defender": return "bg-blue-500/20 text-blue-500"
      case "midfielder": return "bg-green-500/20 text-green-500"
      case "forward": return "bg-red-500/20 text-red-500"
      default: return "bg-gray-500/20 text-gray-500"
    }
  }

  // Função para transformar valores de métricas em números para display
  const getStatValue = (value?: string) => {
    if (!value) return 0
    const num = parseInt(value, 10)
    return isNaN(num) ? 0 : num
  }

  // Pegar métricas do jogador
  const stats = {
    skills: getStatValue(player.metaInformation?.skills),
    physical: getStatValue(player.metaInformation?.physical),
    passing: getStatValue(player.metaInformation?.passing),
    shooting: getStatValue(player.metaInformation?.shooting),
    defence: getStatValue(player.metaInformation?.defence),
    reflexes: getStatValue(player.metaInformation?.reflexes),
    handling: getStatValue(player.metaInformation?.handling),
    diving: getStatValue(player.metaInformation?.diving),
  }

  // Determinar as estatísticas relevantes com base na posição
  const relevantStats = player.role === "goalkeeper"
    ? [
      { name: "Reflexos", value: stats.reflexes },
      { name: "Posicionamento", value: stats.handling },
      { name: "Defesa", value: stats.diving },
    ]
    : [
      { name: "Técnica", value: stats.skills },
      { name: "Físico", value: stats.physical },
      { name: "Passe", value: stats.passing },
      ...(player.role === "forward" ? [{ name: "Finalização", value: stats.shooting }] : []),
      ...(player.role === "defender" ? [{ name: "Defesa", value: stats.defence }] : []),
    ]

  return (
    <Card className="overflow-hidden border-none bg-[#252525] relative">
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: teamColors.primary }}
      />
      <CardContent className="p-0">
        <div className="relative">
          <div
            className="w-full aspect-[3/4] relative bg-gradient-to-b"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${teamColors.primary}22, ${teamColors.secondary}22)`
            }}
          >
            <Image
              src={player.image?.url || "/placeholder-user.jpg"}
              alt={player.shortName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
              <Badge
                className={cn(
                  "absolute top-3 right-3",
                  getRoleColor(player.role)
                )}
              >
                {getRoleText(player.role)}
              </Badge>

              {player.category && (
                <Badge
                  className="absolute top-3 left-3 bg-[#F4AF23] text-black"
                >
                  {player.category === "wildcard" ? "Wild Card" : "Draft"}
                </Badge>
              )}

              <h3 className="text-lg font-bold text-white">{player.shortName}</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300">
                  {player.jersey ? `#${player.jersey}` : ''}
                  {player.birthDate && ` • ${calculateAge(player.birthDate)} anos`}
                </p>
                {player.height > 0 && (
                  <p className="text-sm text-gray-300">{player.height}cm</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            {relevantStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{stat.name}</span>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 bg-[#333] rounded-full w-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stat.value * 10}%`,
                        backgroundColor: teamColors.primary
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono w-5 text-center">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {player.metaInformation?.videoLink && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={player.metaInformation.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#F4AF23] hover:underline mt-1"
                  >
                    Ver highlights <ExternalLink className="w-3 h-3" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Abrir vídeo em nova aba</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  )
}