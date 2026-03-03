"use client"

import * as React from "react"
import { Marquee } from "@/components/ui/marquee"
import { cn, getProxyImageUrl } from "@/lib/utils"
import type { Team } from "@/types/kings-league"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface TeamCarouselProps {
  teams: Team[]
  onTeamSelect: (teamId: string) => void
  className?: string
  loading?: boolean
}

function TeamCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-hidden py-2">
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5" />
          </div>
        ))}
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
      }, 300)
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
    <div className={cn("w-full", className)}>
      <Marquee
        pauseOnHover
        repeat={2}
        className="w-full [--duration:50s] py-2"
        role="region"
        aria-label="Times da Kings League"
      >
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
            aria-label={`Ver detalhes do time ${team.name}`}
            className={cn(
              "group relative mx-1.5 sm:mx-2",
              "w-14 h-14 sm:w-16 sm:h-16",
              "rounded-xl overflow-hidden",
              "bg-[#111111] border border-white/5",
              "hover:border-white/20 hover:bg-[#1a1a1a]",
              "transition-all duration-300 ease-out",
              "hover:scale-110 hover:-translate-y-1",
              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
              "active:scale-95"
            )}
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{
                boxShadow: `0 0 20px ${team.firstColorHEX}30, inset 0 0 15px ${team.firstColorHEX}10`
              }}
            />

            {/* Gradient border on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${team.firstColorHEX}20, ${team.secondColorHEX}20)`
              }}
            />

            {/* Logo */}
            <div className="relative w-full h-full flex items-center justify-center p-2">
              {team.logo && (
                <img
                  src={getProxyImageUrl(team.logo.url)}
                  alt=""
                  className={cn(
                    "w-full h-full object-contain",
                    "transition-transform duration-300",
                    "group-hover:scale-110"
                  )}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              )}
            </div>

            {/* Tooltip */}
            <div className={cn(
              "absolute -bottom-8 left-1/2 -translate-x-1/2",
              "px-2 py-1 rounded-md",
              "bg-[#1a1a1a] border border-white/10",
              "text-[10px] text-white font-medium whitespace-nowrap",
              "opacity-0 group-hover:opacity-100",
              "transition-all duration-200 pointer-events-none",
              "translate-y-1 group-hover:translate-y-0"
            )}>
              {team.shortName || team.name}
            </div>
          </button>
        ))}
      </Marquee>
    </div>
  )
}