import { PlayerCard } from "@/components/team/player-card"
import { PlayerCardSkeleton } from "@/components/skeletons/player-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import type { Player } from "@/types/kings-league"
import { Users } from "lucide-react"

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
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Nenhum jogador encontrado para este time</p>
        </div>
      )}
    </div>
  )
}

function RatingLegend() {
  return (
    <div className="mb-6 p-4 bg-muted/50 border border-border rounded-xl">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--team-primary)]"></span>
        Legenda de cards
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-[#8B6810] to-black border border-[#F4AF23] rounded"></div>
          <span className="text-xs text-muted-foreground">Wild Card</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-[#3D6EB9] to-black border border-gray-600 rounded"></div>
          <span className="text-xs text-muted-foreground">Rating 78-82</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-[#D53121] to-black border border-gray-600 rounded"></div>
          <span className="text-xs text-muted-foreground">Rating 74-77</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-[#10694D] to-black border border-gray-600 rounded"></div>
          <span className="text-xs text-muted-foreground">Rating 70-73</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-b from-[#323232] to-black border border-gray-600 rounded"></div>
          <span className="text-xs text-muted-foreground">Rating 65-69</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Nota:</span> Os jogadores Wild Card não possuem atributos detalhados, pois os ratings são definidos pela equipe da Kings League apenas para os jogadores draftados.
        </p>
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
      <h3 className="font-semibold text-base mb-4 text-foreground flex items-center gap-2">
        <span className="w-1 h-5 bg-[var(--team-primary)] rounded-full"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
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
      <div className="mb-6 p-4 bg-muted/50 border border-border rounded-xl">
        {/* Skeleton para a legenda */}
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position) => (
        <div key={position}>
          <Skeleton className="h-6 w-32 mb-4" />
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