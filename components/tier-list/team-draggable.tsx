"use client"

import { Team } from "@/types/kings-league"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

interface TeamDraggableProps {
  team: Team
  isDragging?: boolean
}

// Função para gerar URL do proxy de imagem
function getProxyImageUrl(originalUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
}

export function TeamDraggable({ team, isDragging = false }: TeamDraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: team.id,
  })

  const style = transform
    ? {
      transform: CSS.Translate.toString(transform),
    }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative flex flex-col items-center justify-start pt-2
        w-20 h-[7rem] xs:w-24 xs:h-[8rem] sm:w-28 sm:h-[8rem]
        rounded-xl cursor-grab active:cursor-grabbing
        border border-white/10 hover:border-white/30
        transition-all duration-200 shadow-lg
        ${isDragging ? 'opacity-50 scale-95 shadow-2xl' : 'hover:scale-105 hover:shadow-2xl'}
      `}
    >
      {/* Background com cores do time */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${team.firstColorHEX} 0%, ${team.secondColorHEX} 100%)`,
        }}
      />

      {/* Overlay escuro para melhor contraste */}
      <div className="absolute inset-0 rounded-xl bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />

      {/* Logo do time - usando img nativo via proxy para compatibilidade com html2canvas */}
      <div className="relative z-10 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mb-1 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getProxyImageUrl(team.logo.url)}
          alt={team.name}
          crossOrigin="anonymous"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* Nome do time */}
      <div className="relative z-10 w-full px-1 pb-2 mt-auto">
        <p
          className="text-white text-[10px] xs:text-xs sm:text-sm font-bold text-center leading-relaxed"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {team.shortName}
        </p>
      </div>
    </div>
  )
}
