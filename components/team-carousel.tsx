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
      <div className="w-full mx-auto relative px-6">
        <div className="-ml-2 md:-ml-4 mt-4 flex overflow-hidden">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="pl-2 md:pl-4 basis-1/4 xs:basis-1/5 sm:basis-1/6 md:basis-1/7 lg:basis-1/8 animate-pulse">
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-lg w-full h-20 sm:h-24 flex items-center justify-center p-2 bg-[#1a1a1a]/40">
                  <Skeleton className="w-[70px] h-[70px] rounded-md" />
                </div>
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>

        {!isMobile && (
          <div className="hidden sm:block">
            <div className="left-0 h-8 w-8 absolute top-1/2 -translate-y-1/2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="right-0 h-8 w-8 absolute top-1/2 -translate-y-1/2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        )}
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
        className="w-full mx-auto relative px-2 [--duration:60s]"
      >
        {teams.map((team) => (
          <div key={team.id} className="px-3 md:px-4">
            <Button
              variant="ghost"
              className="rounded-lg w-[100px] h-[100px] xs:w-[100px] xs:h-[100px] sm:w-[100px] sm:h-[100px] md:w-[100px] md:h-[100px] flex flex-col items-center justify-center p-3 transition-all hover:bg-white/10 hover:scale-105 border-0"
              onClick={() => handleTeamClick(team.id)}
              style={{
                background: `linear-gradient(120deg, ${team.firstColorHEX}15, ${team.secondColorHEX}25)`
              }}
              title={team.name}
            >
              <div className="flex items-center justify-center w-full h-full">
                {team.logo && (
                  <img
                    src={team.logo.url}
                    alt={team.name}
                    width={70}
                    height={70}
                    className="object-contain w-auto h-auto max-w-[85%] max-h-[85%]"
                    priority
                  />
                )}
              </div>
            </Button>
          </div>
        ))}
      </Marquee>
    </div>
  )
}