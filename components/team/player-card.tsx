import { useState, useEffect } from "react"
import type { Player } from "@/types/kings-league"
import { calculateAge, cn } from "@/lib/utils"
import { Trophy, TrendingUp, Award, Star, Zap, Shield, Target, ChevronDown, ChevronUp, Sparkles } from "lucide-react"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [showAttributes, setShowAttributes] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(player.image?.url || '/kl-player-placeholder.webp')

  const isWildcard = player.category === "wildcard" || player?.metaInformation?.status === "Wildcard"

  useEffect(() => {
    setImageSrc(player.image?.url || '/kl-player-placeholder.webp')
  }, [player.image?.url])

  const roleMap = {
    goalkeeper: "Goleiro",
    defender: "Defensor",
    midfielder: "Meio-campo",
    forward: "Atacante",
  }

  const roleAbbr = {
    goalkeeper: "GOL",
    defender: "DEF",
    midfielder: "MEI",
    forward: "ATA",
  }

  const roleConfig = {
    goalkeeper: { color: "#F59E0B", bg: "bg-amber-500/20", text: "text-amber-400", icon: Shield },
    defender: { color: "#3B82F6", bg: "bg-blue-500/20", text: "text-blue-400", icon: Shield },
    midfielder: { color: "#22C55E", bg: "bg-green-500/20", text: "text-green-400", icon: Zap },
    forward: { color: "#EF4444", bg: "bg-red-500/20", text: "text-red-400", icon: Target },
  }

  const age = player.birthDate ? calculateAge(player.birthDate) : null

  const calculateRating = (): number | null => {
    if (isWildcard) return null
    if (!player.metaInformation) return 70

    if (player.role === 'goalkeeper') {
      const attrs = [
        parseInt(player.metaInformation.diving || '70'),
        parseInt(player.metaInformation.handling || '70'),
        parseInt(player.metaInformation.reflexes || '70'),
        parseInt(player.metaInformation.anticipation || '70')
      ]
      return Math.round(attrs.reduce((sum, val) => sum + val, 0) / attrs.length)
    } else {
      const attrs = [
        parseInt(player.metaInformation.passing || '70'),
        parseInt(player.metaInformation.shooting || '70'),
        parseInt(player.metaInformation.defence || '70'),
        parseInt(player.metaInformation.physical || '70'),
        parseInt(player.metaInformation.duels || '70'),
        parseInt(player.metaInformation.skills || '70')
      ]
      return Math.round(attrs.reduce((sum, val) => sum + val, 0) / attrs.length)
    }
  }

  const playerRating = calculateRating()

  const getCardStyle = () => {
    if (isWildcard) {
      return {
        border: "border-amber-500/50",
        glow: "shadow-amber-500/20",
        accent: "text-amber-400",
        accentBg: "bg-amber-500/20",
        gradient: "from-amber-500/10 via-amber-600/5 to-transparent",
        tier: "Wild Card",
        tierBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        tierText: "text-black"
      }
    }

    if (playerRating && playerRating >= 78) {
      return {
        border: "border-blue-500/50",
        glow: "shadow-blue-500/20",
        accent: "text-blue-400",
        accentBg: "bg-blue-500/20",
        gradient: "from-blue-500/10 via-blue-600/5 to-transparent",
        tier: "Elite",
        tierBg: "bg-gradient-to-r from-blue-500 to-blue-600",
        tierText: "text-white"
      }
    }
    if (playerRating && playerRating >= 74) {
      return {
        border: "border-red-500/50",
        glow: "shadow-red-500/20",
        accent: "text-red-400",
        accentBg: "bg-red-500/20",
        gradient: "from-red-500/10 via-red-600/5 to-transparent",
        tier: "Raro",
        tierBg: "bg-gradient-to-r from-red-500 to-red-600",
        tierText: "text-white"
      }
    }
    if (playerRating && playerRating >= 70) {
      return {
        border: "border-green-500/50",
        glow: "shadow-green-500/20",
        accent: "text-green-400",
        accentBg: "bg-green-500/20",
        gradient: "from-green-500/10 via-green-600/5 to-transparent",
        tier: "Comum",
        tierBg: "bg-gradient-to-r from-green-500 to-green-600",
        tierText: "text-white"
      }
    }

    return {
      border: "border-zinc-500/50",
      glow: "shadow-zinc-500/20",
      accent: "text-zinc-400",
      accentBg: "bg-zinc-500/20",
      gradient: "from-zinc-500/10 via-zinc-600/5 to-transparent",
      tier: "Básico",
      tierBg: "bg-gradient-to-r from-zinc-500 to-zinc-600",
      tierText: "text-white"
    }
  }

  const cardStyle = getCardStyle()
  const roleStyle = roleConfig[player.role]
  const RoleIcon = roleStyle.icon

  const getAttrValue = (attr: string | undefined): number => {
    return parseInt(attr || '70')
  }

  const getBarColor = (value: number): string => {
    if (value >= 85) return 'bg-emerald-500'
    if (value >= 75) return 'bg-lime-500'
    if (value >= 65) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const renderAttributeBar = (label: string, value: number) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
        <span className={cn(
          "text-xs font-bold",
          value >= 80 ? "text-emerald-400" : value >= 70 ? "text-lime-400" : "text-yellow-400"
        )}>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )

  const renderAttributes = () => {
    if (!player.metaInformation) return null

    if (player.role === 'goalkeeper') {
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {renderAttributeBar('REF', getAttrValue(player.metaInformation.reflexes))}
          {renderAttributeBar('DEF', getAttrValue(player.metaInformation.diving))}
          {renderAttributeBar('MÃO', getAttrValue(player.metaInformation.handling))}
          {renderAttributeBar('POS', getAttrValue(player.metaInformation.anticipation))}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {renderAttributeBar('FÍS', getAttrValue(player.metaInformation.physical))}
        {renderAttributeBar('TÉC', getAttrValue(player.metaInformation.skills))}
        {renderAttributeBar('PAS', getAttrValue(player.metaInformation.passing))}
        {renderAttributeBar('FIN', getAttrValue(player.metaInformation.shooting))}
        {renderAttributeBar('DEF', getAttrValue(player.metaInformation.defence))}
        {renderAttributeBar('DUE', getAttrValue(player.metaInformation.duels))}
      </div>
    )
  }

  const gameStats = player.stats
  const games = gameStats?.matchesPlayed || 0
  const goals = gameStats?.goalsScored || 0
  const assists = gameStats?.assists || 0
  const mvps = gameStats?.mvps || 0

  return (
    <article
      className="group relative w-full"
      aria-label={`Card do jogador ${player.shortName}`}
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-[#0a0a0a] hover:scale-[1.02]",
        cardStyle.border,
        "hover:shadow-xl",
        cardStyle.glow
      )}>
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          cardStyle.gradient
        )} />

        {/* Wildcard Shimmer */}
        {isWildcard && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transform -skew-x-12 group-hover:animate-shimmer" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Header com Rating e Info */}
          <div className="p-3 pb-0">
            <div className="flex items-start gap-3">
              {/* Rating */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl",
                cardStyle.accentBg,
                cardStyle.accent
              )}>
                {isWildcard ? <Star className="w-6 h-6" /> : playerRating}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm truncate">
                    {player.shortName}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">#{player.jersey}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase",
                    roleStyle.bg,
                    roleStyle.text
                  )}>
                    {roleAbbr[player.role]}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-md",
                    cardStyle.tierBg,
                    cardStyle.tierText
                  )}>
                    {isWildcard && <Sparkles className="w-2.5 h-2.5 inline mr-1" />}
                    {cardStyle.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Image */}
          <div className="relative h-36 flex items-end justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
            <img
              src={imageSrc}
              alt={player.shortName}
              className="relative z-20 h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => {
                if (imageSrc !== '/kl-player-placeholder.webp') setImageSrc('/kl-player-placeholder.webp')
              }}
            />
          </div>

          {/* Info Bar */}
          <div className="px-3 py-2 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-gray-500 block">Idade</span>
                  <span className="text-white font-semibold">{age || '–'}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <span className="text-gray-500 block">Altura</span>
                  <span className="text-white font-semibold">{player.height}cm</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <span className="text-gray-500 block">Posição</span>
                  <span className="text-white font-semibold">{roleMap[player.role]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-3 py-2 border-t border-white/5">
            <div className="grid grid-cols-4 gap-2">
              <StatItem value={games} label="Jogos" />
              <StatItem value={goals} label="Gols" highlight={goals > 0} />
              <StatItem value={assists} label="Assist" highlight={assists > 0} />
              <StatItem value={mvps} label="MVP" highlight={mvps > 0} />
            </div>
          </div>

          {/* Attributes Section */}
          {!isWildcard && player.metaInformation && (
            <div className="border-t border-white/5">
              <button
                onClick={() => setShowAttributes(!showAttributes)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="font-medium">Atributos</span>
                {showAttributes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAttributes && (
                <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
                  {renderAttributes()}
                </div>
              )}
            </div>
          )}

          {/* Wildcard Notice */}
          {isWildcard && (
            <div className="px-3 py-2 border-t border-white/5">
              <p className="text-[10px] text-gray-500 text-center">
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
                Atributos não disponíveis para Wild Cards
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function StatItem({ value, label, highlight, icon }: { value: number; label: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className={cn(
        "text-base font-bold",
        highlight ? "text-white" : "text-gray-500"
      )}>
        {icon && value > 0 ? icon : value}
      </div>
      <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}