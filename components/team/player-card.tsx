import { useState } from "react"
import type { Player } from "@/types/kings-league"
import { calculateAge, cn } from "@/lib/utils"
import { Trophy, TrendingUp, Award } from "lucide-react"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [showStats, setShowStats] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const isWildcard = player.category === "wildcard" || player?.metaInformation?.status === "Wildcard"

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

  const roleColor = {
    goalkeeper: "#FFC107",
    defender: "#2196F3",
    midfielder: "#4CAF50",
    forward: "#F44336",
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
        borderColor: '#F4AF23',
        cardBg: "from-amber-950/40 via-amber-900/30 to-black/50",
        ratingBg: "bg-gradient-to-br from-amber-400 to-amber-600",
        ratingText: "text-black",
        categoryBadge: "bg-gradient-to-r from-amber-400 to-amber-600 text-black",
        accentColor: "#F4AF23",
        glowColor: "rgba(244, 175, 35, 0.4)",
        tier: "wildcard"
      }
    }

    if (playerRating && playerRating >= 78) {
      return {
        borderColor: "#3D6EB9",
        cardBg: "from-blue-950/40 via-blue-900/30 to-black/50",
        ratingBg: "bg-gradient-to-br from-blue-500 to-blue-700",
        ratingText: "text-white",
        categoryBadge: "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
        accentColor: "#3D6EB9",
        glowColor: "rgba(61, 110, 185, 0.3)",
        tier: "elite"
      }
    }
    if (playerRating && playerRating >= 74) {
      return {
        borderColor: "#D53121",
        cardBg: "from-red-950/40 via-red-900/30 to-black/50",
        ratingBg: "bg-gradient-to-br from-red-500 to-red-700",
        ratingText: "text-white",
        categoryBadge: "bg-gradient-to-r from-red-500 to-red-700 text-white",
        accentColor: "#D53121",
        glowColor: "rgba(213, 49, 33, 0.3)",
        tier: "rare"
      }
    }
    if (playerRating && playerRating >= 70) {
      return {
        borderColor: "#10694D",
        cardBg: "from-green-950/40 via-green-900/30 to-black/50",
        ratingBg: "bg-gradient-to-br from-green-600 to-green-800",
        ratingText: "text-white",
        categoryBadge: "bg-gradient-to-r from-green-600 to-green-800 text-white",
        accentColor: "#10694D",
        glowColor: "rgba(16, 105, 77, 0.3)",
        tier: "uncommon"
      }
    }

    return {
      borderColor: "#444",
      cardBg: "from-zinc-900/40 via-zinc-800/30 to-black/50",
      ratingBg: "bg-gradient-to-br from-zinc-600 to-zinc-800",
      ratingText: "text-white",
      categoryBadge: "bg-gradient-to-r from-zinc-600 to-zinc-800 text-white",
      accentColor: "#666",
      glowColor: "rgba(100, 100, 100, 0.2)",
      tier: "common"
    }
  }

  const cardStyle = getCardStyle()


  const renderAttributeBars = () => {
    if (!player.metaInformation) return null

    const getAttrValue = (attr: string | undefined): number => {
      return parseInt(attr || '70')
    }

    const getBarColor = (value: number): string => {
      if (value >= 90) return 'bg-emerald-500'
      if (value >= 80) return 'bg-lime-500'
      if (value >= 70) return 'bg-yellow-500'
      if (value >= 60) return 'bg-orange-500'
      return 'bg-red-500'
    }

    const getBarGlow = (value: number): string => {
      if (value >= 90) return 'shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      if (value >= 80) return 'shadow-[0_0_8px_rgba(132,204,22,0.4)]'
      if (value >= 70) return 'shadow-[0_0_6px_rgba(234,179,8,0.3)]'
      return ''
    }

    const renderAttributeBar = (label: string, value: number) => (
      <div className="group/attr">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-gray-300 font-medium tracking-wide">{label}</span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-md text-xs min-w-[2.5rem] text-center transition-all",
            value >= 85 ? "bg-emerald-500/20 text-emerald-400" :
              value >= 75 ? "bg-lime-500/20 text-lime-400" :
                value >= 65 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-500/20 text-gray-400"
          )}>{value}</span>
        </div>
        <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              getBarColor(value),
              getBarGlow(value)
            )}
            style={{ width: `${value}%` }}
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    )

    if (player.role === 'goalkeeper') {
      return (
        <div className="space-y-3">
          {renderAttributeBar('Reflexos', getAttrValue(player.metaInformation.reflexes))}
          {renderAttributeBar('Defesa', getAttrValue(player.metaInformation.diving))}
          {renderAttributeBar('Mãos', getAttrValue(player.metaInformation.handling))}
          {renderAttributeBar('Posicionamento', getAttrValue(player.metaInformation.anticipation))}
        </div>
      )
    } else {
      return (
        <div className="space-y-3">
          {renderAttributeBar('Físico', getAttrValue(player.metaInformation.physical))}
          {renderAttributeBar('Técnica', getAttrValue(player.metaInformation.skills))}
          {renderAttributeBar('Passe', getAttrValue(player.metaInformation.passing))}
          {renderAttributeBar('Finalização', getAttrValue(player.metaInformation.shooting))}
          {player.role !== 'forward' && renderAttributeBar('Defesa', getAttrValue(player.metaInformation.defence))}
          {player.role === 'forward' && renderAttributeBar('Duelos', getAttrValue(player.metaInformation.duels))}
        </div>
      )
    }
  }


  const renderGameStats = () => {
    const gameStats = player.stats

    if (!gameStats) {
      return (
        <div className="text-center py-6 text-gray-500 text-sm">
          Estatísticas não disponíveis
        </div>
      )
    }

    const games = gameStats.matchesPlayed || 0
    const goals = gameStats.goalsScored || 0
    const assists = gameStats.assists || 0
    const yellowCards = gameStats.yellowCards || 0
    const redCards = gameStats.redCards || 0
    const mvps = gameStats.mvps || 0

    const statItem = (value: number, label: string, icon?: React.ReactNode) => (
      <div className="flex flex-col items-center gap-1 group/stat">
        <div className={cn(
          "text-xl font-bold transition-all",
          value > 0 ? "text-white" : "text-gray-600"
        )}>
          {value}
        </div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
        {icon && <div className="opacity-0 group-hover/stat:opacity-100 transition-opacity">{icon}</div>}
      </div>
    )

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          {statItem(games, "Jogos")}
          {statItem(goals, "Gols")}
          {statItem(assists, "Assists")}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="grid grid-cols-3 gap-4">
          {statItem(yellowCards, "Amarelos")}
          {statItem(redCards, "Vermelhos")}
          {statItem(mvps, "MVP")}
        </div>
      </div>
    )
  }

  return (
    <article
      className="group relative h-full w-full max-w-[280px] mx-auto"
      style={{ minHeight: '440px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Cartão do jogador ${player.shortName}`}
    >
      {/* Card Container com efeito de profundidade */}
      <div
        className={cn(
          "relative h-full rounded-xl overflow-hidden border-2 transition-all duration-500",
          "shadow-2xl backdrop-blur-sm",
          isHovered && "transform scale-105 -translate-y-2"
        )}
        style={{
          borderColor: cardStyle.borderColor,
          boxShadow: isHovered ? `0 20px 40px ${cardStyle.glowColor}, 0 0 20px ${cardStyle.glowColor}` : undefined
        }}
      >
        {/* Background gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            cardStyle.cardBg
          )}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, ${cardStyle.glowColor} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${cardStyle.glowColor} 0%, transparent 50%)
            `
          }}
        />

        {/* Wildcard shimmer effect */}
        {isWildcard && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div
              className={cn(
                "absolute -inset-full w-[60%] h-[200%] opacity-0 transition-opacity duration-300",
                isHovered && "opacity-100"
              )}
              style={{
                background: "linear-gradient(225deg, transparent, rgba(255,255,255,0.5) 30%, transparent 60%)",
                transform: "rotate(30deg)",
                animation: isHovered ? "diagonal-shine 1.7s ease-in-out infinite" : "none",
                top: "-200%",
                left: "-100%"
              }}
            />
          </div>
        )}

        {/* Card Content */}
        <div className="relative z-20 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              {/* Rating Badge */}
              <div className={cn(
                "flex items-center justify-center w-14 h-14 rounded-lg font-black text-2xl shadow-lg relative overflow-hidden",
                cardStyle.ratingBg,
                cardStyle.ratingText
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="relative z-10 drop-shadow-md">
                  {isWildcard ? "★" : playerRating}
                </span>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-white truncate mb-1 drop-shadow-lg">
                  {player.shortName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-black px-2 py-1 rounded-md shadow-md uppercase tracking-wider"
                    style={{ backgroundColor: roleColor[player.role] }}
                  >
                    {roleAbbr[player.role]}
                  </span>
                  <span className="text-xs text-white/80 font-bold">#{player.jersey}</span>
                </div>
              </div>

              {/* Category Badge */}
              {player.category && (
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg",
                  cardStyle.categoryBadge
                )}>
                  {isWildcard ? "★ WC" : "DFT"}
                </div>
              )}
            </div>
          </div>

          {/* Player Image */}
          <div className="relative flex-1 flex items-end justify-center px-4 pb-2 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at bottom, ${cardStyle.glowColor} 0%, transparent 70%)`
              }}
            />
            {player.image?.url ? (
              <img
                src={player.image.url}
                alt={player.shortName}
                className={cn(
                  "relative z-10 w-full h-44 object-contain transition-all duration-500",
                  isHovered && "scale-110 filter drop-shadow-2xl"
                )}
                loading="lazy"
              />
            ) : (
              <img
                src="/kl-player-placeholder.webp"
                alt={`${player.shortName} placeholder`}
                className="relative z-10 w-full h-44 object-contain opacity-60"
                loading="lazy"
              />
            )}

            {/* Geometric patterns */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>

          {/* Stats Section */}
          <div className="relative bg-black/60 backdrop-blur-md border-t border-white/10 p-4">
            {/* Info Bar */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider">Idade</span>
                  <span className="text-white font-bold">{age || '–'}</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider">Altura</span>
                  <span className="text-white font-bold">{player.height}cm</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider">Posição</span>
                  <span className="text-white font-bold text-[10px]">{roleMap[player.role]}</span>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            {!isWildcard && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStats(!showStats)
                }}
                className={cn(
                  "w-full mb-3 text-[10px] px-3 py-2 rounded-lg font-bold uppercase tracking-wider",
                  "bg-white/10 hover:bg-white/20 text-white/90 hover:text-white",
                  "border border-white/20 hover:border-white/40",
                  "transition-all duration-200 backdrop-blur-sm"
                )}
                aria-label={showStats ? "Mostrar atributos" : "Mostrar estatísticas"}
              >
                {showStats ? "Ver Atributos" : "Ver Estatísticas"}
              </button>
            )}

            {/* Content */}
            <div className="min-h-[140px]">
              {isWildcard ? renderGameStats() : (showStats ? renderGameStats() : renderAttributeBars())}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}