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
      <Table className="border-collapse w-full text-sm">
        <TableHeader>
          <TableRow className="border-b border-[#333] bg-transparent">
            <TableHead className="w-[50px] text-center text-xs text-gray-400 font-normal py-2">P</TableHead>
            <TableHead className="w-6"></TableHead>
            <TableHead className="text-xs text-gray-400 font-normal py-2">TIME</TableHead>
            <TableHead className="text-center text-xs text-gray-400 font-normal w-10 py-2">PTS</TableHead>
            <TableHead className="text-center text-xs text-gray-400 font-normal w-10 py-2 hidden sm:table-cell">J</TableHead>
            <TableHead className="text-center text-xs text-gray-400 font-normal w-10 py-2 hidden sm:table-cell">SG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((team, index) => {
            const positionStyle = getPositionStyle(team, index)
            const positionChange = getPositionChange(team, index)

            return (
              <TableRow
                key={team.id}
                className="cursor-pointer transition-colors hover:bg-[#1f1f1f] border-b border-[#333]"
                onClick={() => onTeamSelect(team.id)}
              >
                <TableCell className="text-center font-medium py-2">
                  <div className="flex items-center justify-center">
                    <Badge
                      style={positionStyle}
                      className="w-6 h-6 flex items-center justify-center p-0 text-xs font-medium rounded-full"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-6 px-1">
                  {positionChange && (
                    <div className="flex items-center justify-center">
                      {positionChange.direction === "up" ? (
                        <ChevronsUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <ChevronsDown className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    {team.logo && (
                      <div className="w-6 h-6 relative">
                        <Image
                          src={team.logo.url || "/placeholder.svg"}
                          alt={team.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="font-medium text-xs truncate">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-[#F4AF23] text-sm py-2">{team.points}</TableCell>
                <TableCell className="text-center text-xs text-gray-300 py-2 hidden sm:table-cell">{team.played}</TableCell>
                <TableCell className="text-center text-xs text-gray-300 py-2 hidden sm:table-cell">{team.goalDifference}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="mt-4 px-2 pb-2 text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <Badge style={{ backgroundColor: "#4ade80" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
          <span>SF</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge style={{ backgroundColor: "#F4AF23" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
          <span>QF</span>
        </div>
      </div>
    </div>
  )
}
