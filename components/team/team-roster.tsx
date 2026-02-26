import { PlayerCard } from "@/components/team/player-card"
import { PlayerCardSkeleton } from "@/components/skeletons/player-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { Player } from "@/types/kings-league"
import { Users, ShieldCheck, Target, Zap, Goal, Info, Sparkles, Star, ChevronRight } from "lucide-react"
import type { ReactNode } from 'react'
import { cn } from "@/lib/utils"

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

  // Calcular estatísticas do elenco
  const totalPlayers = players.length

  const wildcardCount = players.filter(p => p.category === "wildcard" || p?.metaInformation?.status === "Wildcard").length
  const draftedCount = players.filter(p => p.category === "draft" || p?.metaInformation?.status === "Draft").length

  return (
    <div className="space-y-8">
      {/* Header com estatísticas do elenco */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          icon={Users}
          value={totalPlayers}
          label="Total de Jogadores"
          color="orange"
        />
        <StatCard
          icon={Star}
          value={draftedCount}
          label="Draftados"
          color="blue"
        />
        <StatCard
          icon={Sparkles}
          value={wildcardCount}
          label="Wild Cards"
          color="amber"
        />
      </div>

      {/* Legenda de cards */}
      <RatingLegend />

      {/* Seções por posição */}
      {goalkeepers.length > 0 && (
        <PositionSection
          title="Goleiros"
          players={goalkeepers}
          icon={Goal}
          color="yellow"
          description="Última linha de defesa"
        />
      )}

      {defenders.length > 0 && (
        <PositionSection
          title="Defensores"
          players={defenders}
          icon={ShieldCheck}
          color="blue"
          description="Proteção e marcação"
        />
      )}

      {midfielders.length > 0 && (
        <PositionSection
          title="Meio-campistas"
          players={midfielders}
          icon={Zap}
          color="green"
          description="Criação e distribuição"
        />
      )}

      {forwards.length > 0 && (
        <PositionSection
          title="Atacantes"
          players={forwards}
          icon={Target}
          color="red"
          description="Finalizadores"
        />
      )}

      {players.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-white mb-1">Nenhum jogador encontrado</p>
          <p className="text-sm text-gray-500">O elenco será exibido quando disponível</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: ReactNode; label: string; color: string }) {
  const colorClasses = {
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  }

  const iconBg = {
    orange: "bg-orange-500/20",
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
    red: "bg-red-500/20",
    green: "bg-green-500/20",
    yellow: "bg-yellow-500/20",
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
      colorClasses[color as keyof typeof colorClasses]
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg[color as keyof typeof iconBg])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function RatingLegend() {
  const ratings = [
    { color: "from-amber-600 to-amber-800", border: "border-amber-500", label: "Wild Card", desc: "Jogadores contratados fora do draft" },
    { color: "from-blue-600 to-blue-800", border: "border-blue-500", label: "78-82", desc: "Rating Elite" },
    { color: "from-red-600 to-red-800", border: "border-red-500", label: "74-77", desc: "Rating Alto" },
    { color: "from-green-600 to-green-800", border: "border-green-500", label: "70-73", desc: "Rating Médio" },
    { color: "from-zinc-600 to-zinc-800", border: "border-zinc-500", label: "65-69", desc: "Rating Básico" },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">Sistema de Rating</h4>
            <p className="text-xs text-gray-500">Classificação dos cards baseada no rating geral</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ratings.map((rating, index) => (
            <div
              key={index}
              className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-b border flex-shrink-0",
                rating.color,
                rating.border
              )} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{rating.label}</p>
                <p className="text-[10px] text-gray-500 truncate">{rating.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-gray-400">Nota:</strong> Os jogadores Wild Card não possuem atributos detalhados,
              pois os ratings são definidos pela equipe da Kings League apenas para os jogadores draftados.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

interface PositionSectionProps {
  title: string
  players: Player[]
  icon: any
  color: string
  description: string
}

function PositionSection({ title, players, icon: Icon, color, description }: PositionSectionProps) {
  const colorClasses = {
    yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    green: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    red: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  }

  const styles = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className="space-y-4">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", styles.bg)}>
            <Icon className={cn("w-5 h-5", styles.text)} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("border", styles.border, styles.text)}>
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
        </Badge>
      </div>

      {/* Grid de jogadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {players.map(player => (
          <div key={player.id} className="w-72 transition-transform duration-300 hover:scale-[1.02]">
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
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="rounded-2xl border border-white/5 p-5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position sections skeleton */}
      {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position, index) => (
        <div key={position} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
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