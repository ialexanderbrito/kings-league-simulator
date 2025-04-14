import { FC } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import type { MatchOdds } from "@/types/kings-league"

interface MatchOddsDisplayProps {
  odds: MatchOdds
  position?: "top" | "bottom"
}

export const MatchOddsDisplay: FC<MatchOddsDisplayProps> = ({ odds, position = "bottom" }) => {
  if (!odds || (!odds.homeWin && !odds.draw && !odds.awayWin)) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 text-xs font-medium">
      {/* Odd Casa */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-gray-400">Casa</span>
        <span className="text-emerald-400">{odds.homeWin?.toFixed(2) || '-'}</span>
      </div>

      <div className="text-gray-500">|</div>

      {/* Odd Empate */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-gray-400">Empate</span>
        <span className="text-blue-400">{odds.draw?.toFixed(2) || '-'}</span>
      </div>

      <div className="text-gray-500">|</div>

      {/* Odd Fora */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-gray-400">Fora</span>
        <span className="text-amber-400">{odds.awayWin?.toFixed(2) || '-'}</span>
      </div>
    </div>
  )
}