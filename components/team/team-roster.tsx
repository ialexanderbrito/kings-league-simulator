import { PlayerCard } from "@/components/team/player-card"
import { PlayerCardSkeleton } from "@/components/skeletons/player-card-skeleton"
import type { Player } from "@/types/kings-league"

interface TeamRosterProps {
  players: Player[]
  loading: boolean
}

export function TeamRoster({ players, loading }: TeamRosterProps) {
  if (loading) {
    return <TeamRosterSkeleton />
  }

  const goalkeepers = players.filter(p => p.role === 'goalkeeper')
  const defenders = players.filter(p => p.role === 'defender')
  const midfielders = players.filter(p => p.role === 'midfielder')
  const forwards = players.filter(p => p.role === 'forward')

  return (
    <div className="space-y-6">
      <RatingLegend />

      {goalkeepers.length > 0 && (
        <PositionSection title="Goleiros" players={goalkeepers} />
      )}

      {defenders.length > 0 && (
        <PositionSection title="Defensores" players={defenders} />
      )}

      {midfielders.length > 0 && (
        <PositionSection title="Meio-campistas" players={midfielders} />
      )}

      {forwards.length > 0 && (
        <PositionSection title="Atacantes" players={forwards} />
      )}

      {players.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Nenhum jogador encontrado para este time
        </div>
      )}
    </div>
  )
}

function RatingLegend() {
  return (
    <div className="mb-4 p-3 bg-[#252525] border border-[#333] rounded-lg">
      <h4 className="text-sm font-medium text-[#F4AF23] mb-2">Legenda de cards</h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-b from-[#8B6810] to-black border border-[#F4AF23]"></div>
          <span className="text-xs text-gray-300">Wild Card</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-b from-[#3D6EB9] to-black border border-gray-600"></div>
          <span className="text-xs text-gray-300">Rating 78-82</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-b from-[#D53121] to-black border border-gray-600"></div>
          <span className="text-xs text-gray-300">Rating 74-77</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-b from-[#10694D] to-black border border-gray-600"></div>
          <span className="text-xs text-gray-300">Rating 70-73</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-b from-[#323232] to-black border border-gray-600"></div>
          <span className="text-xs text-gray-300">Rating 65-69</span>
        </div>
      </div>
    </div>
  )
}

interface PositionSectionProps {
  title: string
  players: Player[]
}

function PositionSection({ title, players }: PositionSectionProps) {
  return (
    <div>
      <h3 className="font-medium text-lg mb-3 text-[#F4AF23]">{title}</h3>
      <div className="flex flex-wrap justify-center sm:justify-start gap-6">
        {players.map(player => (
          <div key={player.id} className="w-72">
            <PlayerCard player={player} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamRosterSkeleton() {
  return (
    <div className="space-y-8">
      <div className="mb-4 p-3 bg-[#252525] border border-[#333] rounded-lg">
        {/* Skeleton para a legenda */}
        <div className="h-6 w-32 mb-3 bg-[#333] rounded animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#333] rounded"></div>
              <div className="h-3 w-16 bg-[#333] rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position) => (
        <div key={position}>
          <div className="h-6 w-32 mb-3 bg-[#333] rounded animate-pulse"></div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-6">
            {Array(position === 'Goleiros' ? 2 : 4).fill(0).map((_, i) => (
              <div key={i} className="w-72">
                <PlayerCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}