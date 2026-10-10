"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Play, ArrowRight, RefreshCw, Share2, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Team } from "@/types/kings-league"
import { getProxyImageUrl } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface MicroSimulatorProps {
  teams?: Team[]
}

export function MicroSimulator({ teams = [] }: MicroSimulatorProps) {
  const { toast } = useToast()
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [scoreA, setScoreA] = useState<number | "-">("-")
  const [scoreB, setScoreB] = useState<number | "-">("-")
  const [isHovered, setIsHovered] = useState(false)

  // Sortear 2 times distintos da lista de forma sempre aleatória
  const pickRandomMatchup = (teamList: Team[]): { home: Team; away: Team } | null => {
    if (!teamList || teamList.length < 2) return null
    const firstIdx = Math.floor(Math.random() * teamList.length)
    let secondIdx = Math.floor(Math.random() * (teamList.length - 1))
    if (secondIdx >= firstIdx) {
      secondIdx += 1
    }
    return {
      home: teamList[firstIdx],
      away: teamList[secondIdx],
    }
  }

  const [matchup, setMatchup] = useState<{ home: Team; away: Team } | null>(() => {
    if (teams && teams.length >= 2) {
      return pickRandomMatchup(teams)
    }
    return null
  })

  // Ao carregar ou atualizar a lista de times, sortear aleatoriamente de forma automática
  useEffect(() => {
    if (teams && teams.length >= 2) {
      const randomInitial = pickRandomMatchup(teams)
      if (randomInitial) {
        setMatchup(randomInitial)
      }
    }
  }, [teams])

  const homeTeam = matchup?.home
  const awayTeam = matchup?.away

  useEffect(() => {
    setScoreA("-")
    setScoreB("-")
    setHasSimulated(false)
    setIsSimulating(false)
  }, [homeTeam?.id, awayTeam?.id])

  const handleReroll = () => {
    if (isSimulating || !teams || teams.length < 2) return
    const nextMatch = pickRandomMatchup(teams)
    if (nextMatch) {
      setMatchup(nextMatch)
    }
  }

  const handleShare = async () => {
    if (!homeTeam || !awayTeam || scoreA === "-" || scoreB === "-") return

    const homeName = homeTeam.shortName || homeTeam.name
    const awayName = awayTeam.shortName || awayTeam.name
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kings-league-simulator.vercel.app"
    const shareText = `🔥 Meu palpite na Kings League Brasil: ${homeName} ${scoreA} x ${scoreB} ${awayName}! Simule e faça sua previsão também:`

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Simulador Kings League Brasil",
          text: shareText,
          url: siteUrl,
        })
        return
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
      }
    }

    // Fallback para Clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} ${siteUrl}`)
      toast({
        title: "Palpite copiado com sucesso! 📋",
        description: "Cole no WhatsApp, Discord ou X para desafiar seus amigos.",
      })
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Compartilhe o link do site com seus amigos.",
      })
    }
  }

  const renderTeamBadge = (team?: Team, fallbackLabel = "") => {
    const initials = fallbackLabel || team?.shortName?.slice(0, 2) || team?.name?.slice(0, 2) || "-"

    return (
      <div className="flex flex-col items-center gap-2 w-1/3 min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center relative">
          {team?.logo?.url ? (
            <img
              src={getProxyImageUrl(team.logo.url)}
              alt={`Escudo do ${team.name}`}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105"
              loading="lazy"
              crossOrigin="anonymous"
            />
          ) : (
            <span className="text-base font-black text-white">{initials}</span>
          )}
        </div>
        <span className="text-sm font-bold text-white text-center leading-tight truncate w-full px-1">
          {team?.shortName || team?.name || fallbackLabel}
        </span>
      </div>
    )
  }

  const handleSimulate = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setHasSimulated(false)

    // Efeito rápido de rolagem de placar
    let iterations = 0
    const interval = setInterval(() => {
      setScoreA(Math.floor(Math.random() * 5))
      setScoreB(Math.floor(Math.random() * 5))
      iterations++

      if (iterations > 15) {
        clearInterval(interval)
        // Placar final coerente com o futebol de 7 da Kings League
        setScoreA(Math.floor(Math.random() * 5) + 1)
        setScoreB(Math.floor(Math.random() * 5))
        setIsSimulating(false)
        setHasSimulated(true)
      }
    }, 80)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg mx-auto mb-8">
      {/* Liquid Glass Capsule Card */}
      <div 
        className="w-full relative rounded-3xl p-5 sm:p-6 liquid-glass transition-all duration-200 overflow-hidden"
        style={{
          boxShadow: isHovered 
            ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 24px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -10px rgba(var(--team-primary-rgb, 244, 175, 35), 0.25)'
            : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), 0 20px 40px -15px rgba(0, 0, 0, 0.7)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient liquid glow inside the glass */}
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[var(--team-primary)]/15 rounded-full blur-2xl pointer-events-none transition-opacity duration-300"
          style={{ opacity: isHovered || isSimulating ? 0.9 : 0.4 }}
        />

        {/* Header Tag minimalista */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--team-primary)] ${isSimulating ? 'opacity-100' : 'opacity-75'}`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--team-primary)]" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              Confronto Direto
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-gray-400">
              {hasSimulated ? "Resultado Calculado" : "Motor Preditivo"}
            </span>
            {!hasSimulated && !isSimulating && (
              <button
                type="button"
                onClick={handleReroll}
                title="Sortear outros times"
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Matchup Layout */}
        <div className="flex items-center justify-between relative z-10 gap-2">
          {renderTeamBadge(homeTeam, "Time 1")}

          {/* Central Glass Scoreboard */}
          <div className="flex flex-col items-center justify-center w-1/3 min-w-[120px]">
            <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] flex items-center justify-center gap-3">
              <span 
                className={`w-7 text-center font-mono text-3xl font-black text-white tabular-nums transition-transform duration-150 ${isSimulating ? 'text-[var(--team-primary)] scale-110' : ''}`}
              >
                {scoreA}
              </span>
              <span className="text-gray-500 text-lg font-light">:</span>
              <span 
                className={`w-7 text-center font-mono text-3xl font-black text-white tabular-nums transition-transform duration-150 ${isSimulating ? 'text-[var(--team-primary)] scale-110' : ''}`}
              >
                {scoreB}
              </span>
            </div>

            {hasSimulated && (
              <span className="text-[10px] tracking-wider uppercase text-[var(--team-primary)] font-bold mt-2 px-2 py-0.5 rounded-full bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20">
                Fim de Jogo
              </span>
            )}
          </div>

          {renderTeamBadge(awayTeam, "Time 2")}
        </div>

        {/* Insight Esportivo Dinâmico Pós-Simulação */}
        {hasSimulated && typeof scoreA === "number" && typeof scoreB === "number" && (
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-center text-center relative z-10 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <p className="text-xs text-gray-300 font-medium">
              {scoreA > scoreB ? (
                <span>
                  🔥 <strong className="text-white">{homeTeam?.shortName || homeTeam?.name}</strong> vence e garante 3 pontos na tabela!
                </span>
              ) : scoreB > scoreA ? (
                <span>
                  🔥 <strong className="text-white">{awayTeam?.shortName || awayTeam?.name}</strong> surpreende e ganha vantagem!
                </span>
              ) : (
                <span>
                  ⚔️ <strong className="text-white">Empate!</strong> Decisão vai para o Shootout em velocidade.
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons & Click Triggers */}
      <div className="flex flex-col gap-2.5 w-full">
        {!hasSimulated ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <Button
              onClick={handleSimulate}
              disabled={isSimulating || !homeTeam || !awayTeam}
              className="btn-press group w-full relative bg-[var(--team-primary)] hover:bg-[var(--team-primary)] text-black font-bold text-base h-13 py-3.5 rounded-2xl shadow-lg shadow-[var(--team-primary)]/20 hover:shadow-[var(--team-primary)]/35 overflow-hidden transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              {isSimulating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2 fill-current" />
              )}
              <span>{isSimulating ? "Calculando Probabilidades..." : "Simular Confronto Rápido"}</span>
            </Button>

            {/* Click Trigger (Objection Breaking & Clarity) */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
              <span>⚡ Simulação instantânea</span>
              <span className="text-gray-600">•</span>
              <span>Sem necessidade de cadastro</span>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">100% Grátis</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 w-full animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={handleReroll}
                disabled={isSimulating}
                variant="outline"
                className="btn-press flex-1 bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white rounded-2xl h-11 font-semibold text-xs transition-all"
              >
                <Shuffle className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Outro Confronto
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="btn-press flex-1 bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white rounded-2xl h-11 font-semibold text-xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5 text-[var(--team-primary)]" />
                Compartilhar Palpite
              </Button>
            </div>

            <Button
              asChild
              className="btn-press group w-full relative bg-[var(--team-primary)] hover:bg-[var(--team-primary)] text-black font-bold text-sm h-12 rounded-2xl shadow-lg shadow-[var(--team-primary)]/20 overflow-hidden"
            >
              <Link href="/simulator" prefetch={true} className="flex items-center justify-center">
                <span>Simular Todas as 10 Rodadas da Liga</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
