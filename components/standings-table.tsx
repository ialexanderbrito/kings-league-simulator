"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { TeamStanding } from "@/types/kings-league"
import { ChevronsDown, ChevronsUp } from "lucide-react"

interface StandingsTableProps {
  standings: TeamStanding[]
  onTeamSelect: (teamId: string) => void
  previousStandings?: TeamStanding[] // Nova prop para comparar posições
}

export default function StandingsTable({ standings, onTeamSelect, previousStandings }: StandingsTableProps) {
  // Função para determinar a cor de fundo baseada na posição
  const getPositionStyle = (standing: TeamStanding, index: number) => {
    if (index === 0) {
      // Primeiro colocado - semifinal
      return { backgroundColor: "#4ade80", color: "white" }
    } else if (index >= 1 && index <= 6) {
      // 2º ao 7º - quartas de final
      return { backgroundColor: "#F4AF23", color: "black" }
    }
    return {}
  }

  // Função para determinar a mudança de posição
  const getPositionChange = (team: TeamStanding, currentIndex: number) => {
    // Verificar se temos classificação anterior para comparar
    if (!previousStandings || previousStandings.length === 0) return null

    const previousIndex = previousStandings.findIndex((t) => t.id === team.id)
    if (previousIndex === -1) return null

    const change = previousIndex - currentIndex // Invertemos a lógica aqui
    if (change === 0) return null

    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : "down", // Se a diferença é positiva, o time subiu
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-[#252525] border-b border-[#333]">
            <TableHead className="w-12 text-center text-[#F4AF23]">Pos</TableHead>
            <TableHead className="w-8"></TableHead>
            <TableHead className="text-[#F4AF23]">Time</TableHead>
            <TableHead className="text-center text-[#F4AF23]">P</TableHead>
            <TableHead className="text-center text-[#F4AF23]">J</TableHead>
            <TableHead className="text-center text-[#F4AF23]">V</TableHead>
            <TableHead className="text-center text-[#F4AF23]">E</TableHead>
            <TableHead className="text-center text-[#F4AF23]">D</TableHead>
            <TableHead className="text-center text-[#F4AF23]">GP</TableHead>
            <TableHead className="text-center text-[#F4AF23]">GC</TableHead>
            <TableHead className="text-center text-[#F4AF23]">SG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((team, index) => {
            const positionStyle = getPositionStyle(team, index)
            const positionChange = getPositionChange(team, index)

            return (
              <TableRow
                key={team.id}
                className="cursor-pointer hover:bg-[#252525] border-b border-[#333]"
                onClick={() => onTeamSelect(team.id)}
              >
                <TableCell className="text-center font-medium">
                  <Badge style={positionStyle} className="w-6 h-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="w-8 px-1">
                  {positionChange && (
                    <div className="flex items-center justify-center">
                      {positionChange.direction === "up" ? (
                        <ChevronsUp className="w-4 h-4 text-green-500" color="green" />
                      ) : (
                        <ChevronsDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {team.logo && (
                      <div className="w-10 h-10 relative">
                        <Image
                          src={team.logo.url || "/placeholder.svg"}
                          alt={team.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-[#F4AF23]">{team.points}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center">{team.won}</TableCell>
                <TableCell className="text-center">{team.drawn}</TableCell>
                <TableCell className="text-center">{team.lost}</TableCell>
                <TableCell className="text-center">{team.goalsFor}</TableCell>
                <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                <TableCell className="text-center">{team.goalDifference}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="mt-4 text-sm text-gray-300">
        <div className="flex items-center gap-2 mb-1">
          <Badge style={{ backgroundColor: "#4ade80" }} className="w-4 h-4 p-0"></Badge>
          <span>Semifinal</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge style={{ backgroundColor: "#F4AF23" }} className="w-4 h-4 p-0"></Badge>
          <span>Playoff: Quartas de final</span>
        </div>
      </div>
    </div>
  )
}
