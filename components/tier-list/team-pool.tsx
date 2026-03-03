"use client"

import { Team } from "@/types/kings-league"
import { useDroppable } from "@dnd-kit/core"
import { TeamDraggable } from "./team-draggable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface TeamPoolProps {
  teams: Team[]
}

export function TeamPool({ teams }: TeamPoolProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  return (
    <Card className="bg-[#1a1a1a]/50 border-white/10 mb-8">
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
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[120px] gap-2">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-gray-400 text-sm">
                Todos os times foram organizados!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {teams.map((team) => (
                <TeamDraggable key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
