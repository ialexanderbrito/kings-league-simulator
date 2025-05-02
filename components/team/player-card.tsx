import { useState } from "react"
import type { Player } from "@/types/kings-league"
import { calculateAge, cn } from "@/lib/utils"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [showStats, setShowStats] = useState(true)

  const isWildcard = player.category === "wildcard" || player?.metaInformation?.status === "Wildcard"

  // Cor fixa para Wild Cards conforme solicitado
  const wildcardColor = "#F4AF23";

  const roleMap = {
    goalkeeper: "Goleiro",
    defender: "Defensor",
    midfielder: "Meio-campo",
    forward: "Atacante",
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
        borderColor: '#F4AF23', // Mantendo a cor amarela fixa para Wild Cards
        headerBg: "bg-gradient-to-r from-amber-600 to-amber-800",
        ratingBg: `bg-[#F4AF23]`,
        ratingText: "text-black",
        categoryBadge: `bg-[#F4AF23] text-black`,
        imageBg: "bg-gradient-to-b from-amber-600/30 to-amber-900/20"
      }
    }

    if (playerRating && playerRating >= 78) {
      return {
        borderColor: "#3D6EB9",
        headerBg: "bg-gradient-to-r from-blue-700 to-blue-900",
        ratingBg: "bg-blue-600",
        ratingText: "text-white",
        categoryBadge: "bg-blue-500 text-white",
        imageBg: "bg-gradient-to-b from-blue-700/30 to-blue-900/20"
      }
    }
    if (playerRating && playerRating >= 74) {
      return {
        borderColor: "#D53121",
        headerBg: "bg-gradient-to-r from-red-700 to-red-900",
        ratingBg: "bg-red-600",
        ratingText: "text-white",
        categoryBadge: "bg-red-500 text-white",
        imageBg: "bg-gradient-to-b from-red-700/30 to-red-900/20"
      }
    }
    if (playerRating && playerRating >= 70) {
      return {
        borderColor: "#10694D",
        headerBg: "bg-gradient-to-r from-green-700 to-green-900",
        ratingBg: "bg-green-600",
        ratingText: "text-white",
        categoryBadge: "bg-green-500 text-white",
        imageBg: "bg-gradient-to-b from-green-700/30 to-green-900/20"
      }
    }

    return {
      borderColor: "#333",
      headerBg: "bg-gradient-to-r from-zinc-700 to-zinc-900",
      ratingBg: "bg-zinc-700",
      ratingText: "text-white",
      categoryBadge: "bg-zinc-600 text-white",
      imageBg: "bg-gradient-to-b from-zinc-700/30 to-zinc-900/20"
    }
  }

  const cardStyle = getCardStyle()

  const renderAttributeBars = () => {
    if (!player.metaInformation) return null

    const getAttrValue = (attr: string | undefined): number => {
      return parseInt(attr || '70')
    }

    const getBarColor = (value: number): string => {
      if (value >= 90) return 'bg-green-500'
      if (value >= 80) return 'bg-lime-500'
      if (value >= 70) return 'bg-yellow-500'
      if (value >= 60) return 'bg-orange-500'
      return 'bg-red-500'
    }

    const renderAttributeBar = (label: string, value: number) => (
      <div className="mb-1 last:mb-0">
        <div className="flex justify-between text-xs text-gray-300 mb-0.5">
          <span>{label}</span>
          <span className="font-medium">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${getBarColor(value)}`} style={{ width: `${value}%` }}></div>
        </div>
      </div>
    )

    if (player.role === 'goalkeeper') {
      return (
        <div className="space-y-2">
          {renderAttributeBar('Reflexos', getAttrValue(player.metaInformation.reflexes))}
          {renderAttributeBar('Defesa', getAttrValue(player.metaInformation.diving))}
          {renderAttributeBar('Mãos', getAttrValue(player.metaInformation.handling))}
          {renderAttributeBar('Posicionamento', getAttrValue(player.metaInformation.anticipation))}
        </div>
      )
    } else {
      return (
        <div className="space-y-2">
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
        <div className="text-center py-2 text-gray-500 text-sm">
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

    const statItem = (value: number, label: string) => (

      <div className="flex flex-col items-center">
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    )

    return (
      <div className="grid grid-cols-3 gap-3 mt-4">
        {statItem(games, "Jogos")}
        {statItem(goals, "Gols")}
        {statItem(assists, "Assists")}
        {statItem(yellowCards, "Amarelos")}
        {statItem(redCards, "Vermelhos")}
        {statItem(mvps, "MVP")}
      </div>
    )
  }

  return (
    <div
      className="group relative h-full w-72"
      style={{ minHeight: '420px' }}
    >
      <div
        className={`h-full rounded-lg overflow-hidden border transition-all duration-300 shadow-lg ${isWildcard ? "shadow-amber-900/30 relative" : ""}`}
        style={{ borderColor: cardStyle.borderColor, borderWidth: "2px" }}
      >
        {isWildcard && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Efeito de brilho diagonal aprimorado */}
            <div
              className="absolute -inset-full w-[60%] h-[200%] z-5 block opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "linear-gradient(225deg, transparent, rgba(255,255,255,0.4) 30%, transparent 60%)",
                transform: "rotate(30deg)",
                animation: "diagonal-shine 1.7s ease-in-out infinite",
                animationDelay: "0.1s",
                top: "-200%",
                left: "-100%"
              }}
            />
            <div
              className="absolute inset-0 w-full h-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)",
                animation: "pulse-glow 1s ease-in-out infinite"
              }}
            />
          </div>
        )}

        <div className={`p-3 ${cardStyle.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${cardStyle.ratingBg} ${cardStyle.ratingText} font-bold text-xl`}>
                {isWildcard ? "★" : playerRating}
              </div>
              <div>
                <h3 className="font-bold text-white whitespace-nowrap">{player.shortName}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: roleColor[player.role], color: 'white' }}>
                    {player.role === 'goalkeeper' ? 'GOL' : player.role === 'defender' ? 'DEF' : player.role === 'midfielder' ? 'MEI' : 'ATA'}
                  </span>
                  <span className="text-xs text-gray-300">#{player.jersey}</span>
                </div>
              </div>
            </div>

            {player.category && (
              <div className={`px-1 py-0 rounded-full text-[10px] font-bold ${cardStyle.categoryBadge}`}>
                {isWildcard ? "★ WC" : "DRAFT"}
              </div>
            )}
          </div>
        </div>

        <div className={`relative h-48 ${cardStyle.imageBg}`}>
          {player.image?.url ? (
            <img
              src={player.image.url}
              alt={player.shortName}
              fill
              className="object-contain"
            />
          ) : (
            <img
              src="/kl-player-placeholder.webp"
              alt={`${player.shortName} placeholder`}
              fill
              className="object-contain"
            />
          )}
        </div>

        <div className="p-3 bg-[#1a1a1a]">

          <div className="flex justify-end mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowStats(!showStats)
              }}
              className={cn("text-xs px-2 py-1 rounded bg-[#333] text-gray-300 hover:bg-[#444] transition-colors",
                isWildcard && "opacity-0 pointer-events-none"
              )}
            >
              {showStats ? "Ver Atributos" : "Ver Estatísticas"}
            </button>
          </div>

          <div className="mb-3 pb-3 border-b border-[#333]">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Idade</div>
                <div>{age || '–'} anos</div>
              </div>
              <div>
                <div className="text-gray-400">Altura</div>
                <div>{player.height}cm</div>
              </div>
              <div>
                <div className="text-gray-400">Posição</div>
                <div>{roleMap[player.role]}</div>
              </div>
            </div>
          </div>

          {isWildcard ? renderGameStats() : (showStats ? renderGameStats() : renderAttributeBars())}
        </div>
      </div>
    </div>
  )
}