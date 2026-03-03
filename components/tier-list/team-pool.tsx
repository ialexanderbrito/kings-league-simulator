"use client"

import { Team } from "@/types/kings-league"
import { useDroppable } from "@dnd-kit/core"
import { TeamDraggable } from "./team-draggable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2 } from "lucide-react"

interface TeamPoolProps {
  teams: Team[]
}

export function TeamPool({ teams }: TeamPoolProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  const isEmpty = teams.length === 0

  // Versão minimizada quando não há times
  if (isEmpty) {
    return (
      <Card className="bg-[#1a1a1a] border-white/10 shadow-lg shadow-black/20">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-[var(--team-primary,#F4AF23)]" />
              Times Disponíveis
            </CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-xs font-medium">
                Todos organizados! 🎉
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // Versão completa quando há times
  return (
    <Card className="bg-[#1a1a1a] border-white/10 shadow-lg shadow-black/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-[var(--team-primary,#F4AF23)]" />
            Times Disponíveis
          </CardTitle>
          <span className="text-gray-400 text-xs sm:text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            {teams.length} {teams.length === 1 ? 'time' : 'times'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={`
            min-h-[150px] p-4 rounded-xl border-2 border-dashed
            transition-all duration-200
            ${isOver
              ? 'border-[var(--team-primary,#F4AF23)]/50 bg-[var(--team-primary,#F4AF23)]/5'
              : 'border-white/10 bg-white/[0.02]'
            }
          `}
        >
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {teams.map((team) => (
              <TeamDraggable key={team.id} team={team} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
