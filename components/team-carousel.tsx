"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { Team } from "@/types/kings-league"
import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamCarouselProps {
  teams: Team[]
  onTeamSelect: (teamId: string) => void
  className?: string
  loading?: boolean
}

// Componente de skeleton para o carrossel
function TeamCarouselSkeleton() {
  const isMobile = useIsMobile()

  return (
    <div className="w-full mx-auto">
      <div className="max-w-lg sm:max-w-3xl lg:max-w-5xl mx-auto relative">
        <div className="-ml-2 md:-ml-4 mt-4 flex overflow-hidden">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="pl-2 md:pl-4 basis-1/4 sm:basis-1/5 md:basis-1/6 animate-pulse">
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-lg w-full h-20 sm:h-24 flex items-center justify-center p-2 bg-[#1a1a1a]/40">
                  <Skeleton className="w-[70px] h-[70px] rounded-md" />
                </div>
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Botões de navegação apenas para desktop */}
        {!isMobile && (
          <div className="hidden sm:block">
            <div className="-left-6 h-8 w-8 absolute top-1/2 -translate-y-1/2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="-right-6 h-8 w-8 absolute top-1/2 -translate-y-1/2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeamCarousel({ teams, onTeamSelect, className, loading = false }: TeamCarouselProps) {
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Gerenciar o estado de loading com base nas props e no estado dos dados
  useEffect(() => {
    if (!mounted) return;

    if (loading || !teams?.length) {
      setIsLoading(true)
    } else {
      // Pequeno delay para evitar flash de loading
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500) // Aumentei para 500ms para dar tempo de carregar as imagens
      return () => clearTimeout(timer)
    }
  }, [teams, loading, mounted])

  // Configurar rolagem automática
  useEffect(() => {
    if (!mounted || isLoading) return;

    // Limpar intervalo anterior se existir
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }

    // Iniciar novo intervalo para rolagem automática
    autoplayRef.current = setInterval(() => {
      const nextButton = document.querySelector('[data-carousel-next]')
      if (nextButton) {
        nextButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    }, 3000) // Avança a cada 3 segundos

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [isLoading, mounted])

  // Se não estiver no cliente, exibir skeleton para evitar hidratação incompatível
  if (!mounted || isLoading) {
    return <TeamCarouselSkeleton />
  }

  return (
    <div className={cn("w-full mx-auto", className)}>
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="max-w-lg sm:max-w-3xl lg:max-w-5xl mx-auto relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4 mt-4">
          {teams.map((team) => (
            <CarouselItem key={team.id} className="pl-2 md:pl-4 basis-1/4 sm:basis-1/5 md:basis-1/6">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  className="rounded-lg w-full h-20 sm:h-24 flex items-center justify-center p-2 transition-all hover:bg-white/10 hover:scale-105 border-0"
                  onClick={() => onTeamSelect(team.id)}
                  style={{
                    background: `linear-gradient(120deg, ${team.firstColorHEX}10, ${team.secondColorHEX}15)`
                  }}
                >
                  {team.logo && (
                    <Image
                      src={team.logo.url}
                      alt={team.name}
                      width={70}
                      height={70}
                      className="object-contain w-auto h-auto max-w-[80%] max-h-[80%]"
                      priority
                    />
                  )}
                </Button>
                <span className="text-xs font-medium text-center text-white/80 max-w-full px-1 truncate">
                  {team.name}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Botões de navegação apenas para desktop */}
        {!isMobile && (
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-6 h-8 w-8 border shadow-sm opacity-70 hover:opacity-100" />
            <CarouselNext className="-right-6 h-8 w-8 border shadow-sm opacity-70 hover:opacity-100" />
          </div>
        )}
      </Carousel>
    </div>
  )
}