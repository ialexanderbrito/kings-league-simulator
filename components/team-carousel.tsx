"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"
import type { Team } from "@/types/kings-league"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface TeamCarouselProps {
  teams: Team[]
  onTeamSelect: (teamId: string) => void
  className?: string
  loading?: boolean
}

function TeamCarouselSkeleton() {
  const isMobile = useIsMobile()

  return (
    <div className="w-full mx-auto">
      <div className="w-full mx-auto relative px-4 sm:px-6">
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {Array(10).fill(0).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[90px] sm:w-[100px] animate-pulse"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl w-full aspect-square flex items-center justify-center p-3 bg-muted/50 border border-border/50">
                  <Skeleton className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamCarousel({ teams, onTeamSelect, className, loading = false }: TeamCarouselProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;

    if (loading || !teams?.length) {
      setIsLoading(true)
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [teams, loading, mounted])

  const handleTeamClick = (teamId: string) => {
    onTeamSelect(teamId)
    router.push(`/team/${teamId}`)
  }

  if (!mounted || isLoading) {
    return <TeamCarouselSkeleton />
  }

  return (
    <div className={cn("w-full mx-auto", className)}>
      <Marquee
        pauseOnHover
        repeat={2}
        className="w-full mx-auto relative px-4 sm:px-6 [--duration:60s]"
        role="region"
        aria-label="Carrossel de times"
      >
        {teams.map((team) => (
          <div key={team.id} className="px-2 sm:px-3">
            <Button
              variant="ghost"
              onClick={() => handleTeamClick(team.id)}
              aria-label={`Ver detalhes do time ${team.name}`}
              className={cn(
                "group relative rounded-xl w-[90px] h-[90px] sm:w-[100px] sm:h-[100px]",
                "flex flex-col items-center justify-center p-3",
                "transition-all duration-300 ease-out",
                "bg-card hover:bg-accent border border-border/50 hover:border-border",
                "hover:scale-105 hover:shadow-lg hover:shadow-[var(--team-primary)]/10",
                "focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background",
                "active:scale-95"
              )}
              style={{
                background: `linear-gradient(135deg, ${team.firstColorHEX}10, ${team.secondColorHEX}15)`
              }}
            >
              <div className="relative flex items-center justify-center w-full h-full">
                {team.logo && (
                  <img
                    src={team.logo.url}
                    alt={`Logo do ${team.name}`}
                    width={70}
                    height={70}
                    className={cn(
                      "object-contain w-auto h-auto max-w-[85%] max-h-[85%]",
                      "transition-transform duration-300 group-hover:scale-110"
                    )}
                    loading="lazy"
                  />
                )}

                {/* Indicador visual sutil ao hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${team.firstColorHEX}15, transparent 70%)`
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Tooltip com nome do time */}
              <span className="sr-only">{team.name}</span>
            </Button>
          </div>
        ))}
      </Marquee>
    </div>
  )
}