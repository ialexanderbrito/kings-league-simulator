"use client";

import React, { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { Crown, Sparkles, Trophy, PartyPopper } from "lucide-react";
import { Team, PlayoffMatch } from "@/types/kings-league";
import { getProxyImageUrl, cn } from "@/lib/utils";

interface ChampionBannerProps {
  champion: Team;
  finalMatch: PlayoffMatch | null;
  teams: Record<string, Team>;
}

export function ChampionBanner({ champion, finalMatch, teams }: ChampionBannerProps) {
  // Runner-up (vice-campeão)
  const runnerUpId = finalMatch
    ? finalMatch.homeTeamId === champion.id
      ? finalMatch.awayTeamId
      : finalMatch.homeTeamId
    : null;
  const runnerUp = runnerUpId ? teams[runnerUpId] : null;

  const triggerConfettiCelebration = useCallback(() => {
    try {
      // Disparo cerimonial central
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F4AF23", "#FFD700", "#F59E0B", "#FDE047", "#FFFFFF", "#FBBF24"],
        zIndex: 9999,
      });

      // Canhões festivos laterais
      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 60,
            origin: { x: 0.05, y: 0.7 },
            colors: ["#F4AF23", "#FFD700", "#F59E0B", "#FFFFFF"],
            zIndex: 9999,
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 60,
            origin: { x: 0.95, y: 0.7 },
            colors: ["#F4AF23", "#FFD700", "#F59E0B", "#FFFFFF"],
            zIndex: 9999,
          });
        } catch {
          // Ignora silenciosamente se o ambiente não possuir suporte a canvas
        }
      }, 250);

      return () => clearTimeout(timer);
    } catch {
      // Ignora silenciosamente caso não suporte canvas
    }
  }, []);

  useEffect(() => {
    const cleanup = triggerConfettiCelebration();
    return () => {
      cleanup?.();
      try {
        confetti.reset();
      } catch {
        // cleanup
      }
    };
  }, [champion.id, triggerConfettiCelebration]);

  const hasFinalScores =
    finalMatch &&
    finalMatch.homeScore !== null &&
    finalMatch.awayScore !== null &&
    finalMatch.homeScore !== undefined &&
    finalMatch.awayScore !== undefined;

  const isHomeChampion = finalMatch?.homeTeamId === champion.id;
  const championScore = isHomeChampion ? finalMatch?.homeScore : finalMatch?.awayScore;
  const runnerUpScore = isHomeChampion ? finalMatch?.awayScore : finalMatch?.homeScore;
  const championShootout = isHomeChampion ? finalMatch?.homeScoreP : finalMatch?.awayScoreP;
  const runnerUpShootout = isHomeChampion ? finalMatch?.awayScoreP : finalMatch?.homeScoreP;
  const hasShootout =
    championShootout !== null &&
    runnerUpShootout !== null &&
    championShootout !== undefined &&
    runnerUpShootout !== undefined;

  return (
    <>
      {/* Banner Principal com Liquid Glass nativo do projeto */}
      <div className="mb-8 w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="liquid-glass-panel relative rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)]">
          {/* Fundo Personalizado de Campeão: Marca d'água monumental do escudo */}
          {champion.logo?.url && (
            <div
              className="absolute -right-6 -bottom-10 sm:-right-8 sm:-bottom-12 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 opacity-[0.06] pointer-events-none select-none overflow-hidden"
              aria-hidden="true"
            >
              <img
                src={getProxyImageUrl(champion.logo.url)}
                alt=""
                className="w-full h-full object-contain filter blur-[1px]"
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Fundo Personalizado: Iluminação cerimonial com gradientes radiais suaves */}
          <div
            className="absolute -top-24 left-1/4 -translate-x-1/2 w-96 h-96 bg-[var(--team-primary,#F4AF23)]/10 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-[90px] pointer-events-none"
            aria-hidden="true"
          />

          {/* Raios de luz sutis de vitória (SVG semitransparente) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] select-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="champion-glow" cx="20%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#F4AF23" stopOpacity="1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#champion-glow)" />
          </svg>

          {/* Conteúdo em Liquid Glass */}
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 text-center md:text-left">
            {/* Escudo Orgânico sem div de caixa retangular desnecessária */}
            <div className="relative flex-shrink-0 flex flex-col items-center">
              {/* Coroa Real Flutuante sobre o escudo */}
              <div
                className="relative -mb-3.5 sm:-mb-4 z-20 flex items-center justify-center filter drop-shadow-[0_4px_14px_rgba(244,175,35,0.65)]"
                aria-hidden="true"
              >
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-[var(--team-primary,#F4AF23)] fill-[var(--team-primary,#F4AF23)] stroke-[1.2]" />
              </div>

              {/* Escudo livre com iluminação radial suave */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full bg-[var(--team-primary,#F4AF23)]/20 blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <img
                  src={getProxyImageUrl(champion.logo?.url)}
                  alt={`Escudo oficial do ${champion.name}`}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] drop-shadow-[0_0_36px_rgba(var(--team-primary-rgb,244,175,35),0.35)] select-none"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Informações Editoriais do Campeão */}
            <div className="min-w-0 flex-1 flex flex-col items-center md:items-start space-y-2.5">
              {/* Pill Badge Superior: Liquid Glass Pill */}
              <div className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary,#F4AF23)]/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
                <span>Campeão dos Playoffs • Kings League</span>
              </div>

              {/* Nome do Campeão */}
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none truncate max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                title={champion.name}
              >
                {champion.name}
              </h2>

              {/* Vencedor da Grande Final + Placar Oficial em Liquid Glass */}
              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-zinc-300">
                <div className="liquid-glass inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] text-zinc-200">
                  <Trophy className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)] shrink-0" />
                  <span className="font-semibold text-zinc-100">Vencedor da Grande Final</span>

                  {runnerUp && hasFinalScores && (
                    <>
                      <span className="text-zinc-600 select-none">•</span>
                      <span className="font-mono font-bold text-white tracking-tight">
                        {championScore} × {runnerUpScore}
                      </span>
                      {hasShootout && (
                        <span className="font-mono text-[11px] text-amber-400 font-bold">
                          (SO: {championShootout}-{runnerUpShootout})
                        </span>
                      )}
                      <span className="text-zinc-400">vs {runnerUp.shortName || runnerUp.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Ações: Botão comemorativo com Liquid Pill Button e retorno de toque */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerConfettiCelebration}
                  className={cn(
                    "liquid-pill-btn btn-press inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold",
                    "text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary,#F4AF23)]/30",
                    "bg-[rgba(var(--team-primary-rgb,244,175,35),0.08)]",
                    "hover:bg-[rgba(var(--team-primary-rgb,244,175,35),0.16)] hover:border-[var(--team-primary,#F4AF23)]/50",
                    "cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--team-primary,#F4AF23)]/40"
                  )}
                  title="Soltar nova chuva de confetes"
                  aria-label="Comemorar com confetes"
                >
                  <PartyPopper className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Comemorar</span>
                  <span className="text-[11px] font-mono text-zinc-400">🎉</span>
                </button>

                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500">
                  🏆 Conquista Histórica
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
