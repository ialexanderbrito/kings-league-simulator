import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dices, RefreshCw } from "lucide-react"
import { getProxyImageUrl, cn } from "@/lib/utils"

export interface Challenge {
  id: string
  teamId: string
  teamName: string
  competition: string
  logo?: string
  seasonId?: string
  presidents?: string
}

interface DiceRollProps {
  onChallengeSelect: (challenge: Challenge) => void
  availableChallenges: Challenge[]
  className?: string
}

export function DiceRoll({ onChallengeSelect, availableChallenges, className }: DiceRollProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)

  const handleRoll = () => {
    if (availableChallenges.length === 0 || isRolling) return

    setIsRolling(true)

    let rolls = 0
    const maxRolls = 10
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableChallenges.length)
      setCurrentChallenge(availableChallenges[randomIndex])
      rolls++

      if (rolls >= maxRolls) {
        clearInterval(interval)
        setIsRolling(false)
        const finalChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
        setCurrentChallenge(finalChallenge)
        onChallengeSelect(finalChallenge)
      }
    }, 90)
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-5 liquid-glass-panel rounded-2xl border border-white/[0.08] w-full", className)}>
      <div className="text-center mb-4 min-h-[90px] flex flex-col justify-center items-center w-full">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">
          Time Sorteado
        </span>

        {currentChallenge ? (
          <div className="flex items-center gap-3.5 bg-white/[0.03] backdrop-blur-md px-4 py-3 rounded-2xl border border-white/[0.08] animate-in fade-in zoom-in-95 duration-200 w-full max-w-sm justify-center shadow-lg">
            {currentChallenge.logo && (
              <div className="w-10 h-10 relative shrink-0">
                <img
                  src={getProxyImageUrl(currentChallenge.logo)}
                  alt={currentChallenge.teamName}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                />
              </div>
            )}
            <div className="text-left flex-1 min-w-0">
              <div className="font-black text-white text-base leading-tight truncate">
                {currentChallenge.teamName}
              </div>
              {currentChallenge.presidents && (
                <div className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                  {currentChallenge.presidents}
                </div>
              )}
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                {currentChallenge.competition}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs italic">
            Role o dado para sortear um time da Kings League
          </div>
        )}
      </div>

      <Button
        variant="brand"
        onClick={handleRoll}
        disabled={isRolling || availableChallenges.length === 0}
        className="btn-press w-full max-w-xs gap-2 font-black text-xs uppercase tracking-wider rounded-xl h-11 disabled:opacity-50"
      >
        {isRolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
        {isRolling ? "Sorteando..." : "Rolar Dado"}
      </Button>
    </div>
  )
}
