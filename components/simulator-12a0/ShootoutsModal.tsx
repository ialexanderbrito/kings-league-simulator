"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SimulatedTeam, ShootoutKick } from "@/lib/match-simulator";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";
import { getProxyImageUrl, cn } from "@/lib/utils";
import { penaltySound } from "@/lib/sound-effects";
import {
  Trophy,
  Zap,
  RotateCcw,
  FastForward,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";

interface ShootoutsModalProps {
  isOpen: boolean;
  homeTeam: SimulatedTeam;
  awayTeam: SimulatedTeam;
  userTeamId: string;
  isHome: boolean;
  homeScore: number;
  awayScore: number;
  homeShootoutScore: number;
  awayShootoutScore: number;
  shootoutKicks: ShootoutKick[];
  isAutoMode?: boolean;
  onClose: () => void;
}

export function ShootoutsModal({
  isOpen,
  homeTeam,
  awayTeam,
  userTeamId,
  isHome,
  homeScore,
  awayScore,
  homeShootoutScore,
  awayShootoutScore,
  shootoutKicks,
  isAutoMode = false,
  onClose
}: ShootoutsModalProps) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState(() => penaltySound.getMuted());
  const [flashType, setFlashType] = useState<"goal" | "miss" | null>(null);

  // Garantir montagem segura em portal
  useEffect(() => {
    setMounted(true);
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Bloquear rolagem do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const totalKicks = shootoutKicks.length;
  const isFinished = currentStep >= totalKicks;

  // Animação passo a passo da disputa de shootouts
  useEffect(() => {
    if (!isOpen || !isPlaying || isFinished) return;

    const timer = setTimeout(() => {
      const nextStep = currentStep + 1;
      const kick = shootoutKicks[currentStep];

      if (kick) {
        if (kick.isGoal) {
          setFlashType("goal");
          penaltySound.playKick("normal");
          setTimeout(() => penaltySound.playNet(), 60);
          setTimeout(() => penaltySound.playCheer(), 180);
        } else {
          setFlashType("miss");
          penaltySound.playGloveSave();
        }
      }

      setCurrentStep(nextStep);

      // Se for a última cobrança, tocar apito final
      if (nextStep >= totalKicks) {
        setTimeout(() => {
          penaltySound.playWhistle();
        }, 300);
      }

      setTimeout(() => {
        setFlashType(null);
      }, 500);
    }, 950);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStep, isFinished, shootoutKicks, totalKicks]);

  // No modo automático, aguardar término de toda animação do shootout para fechar o modal
  useEffect(() => {
    if (!isOpen || !isFinished || !isAutoMode) return;

    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 2400);

    return () => clearTimeout(autoCloseTimer);
  }, [isOpen, isFinished, isAutoMode, onClose]);

  if (!isOpen || !mounted) return null;

  const winnerTeam = homeShootoutScore > awayShootoutScore ? homeTeam : awayTeam;
  const isUserWinner = winnerTeam.id === userTeamId;

  // Cobranças reveladas até o momento atual
  const visibleKicks = shootoutKicks.slice(0, currentStep);
  const currentKick = !isFinished && shootoutKicks[currentStep] ? shootoutKicks[currentStep] : null;

  // Placar acumulado até o passo atual
  let currentHomeScore = 0;
  let currentAwayScore = 0;
  visibleKicks.forEach(k => {
    if (k.isGoal) {
      if (k.teamId === homeTeam.id) currentHomeScore++;
      else currentAwayScore++;
    }
  });

  const handleSkipAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(totalKicks);
    penaltySound.playWhistle();
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setFlashType(null);
  };

  const handleToggleMute = () => {
    const muted = penaltySound.toggleMute();
    setIsMuted(muted);
  };

  // 5 cobranças regulares da série 5x5
  const regularRounds = [1, 2, 3, 4, 5];

  // Maior rodada de morte súbita visível até o momento
  const activeKickRound = !isFinished && currentKick ? currentKick.round : (isFinished ? (shootoutKicks[totalKicks - 1]?.round || 5) : 5);
  const maxSuddenRound = Math.max(5, activeKickRound);
  const suddenRounds: number[] = [];
  if (currentStep >= 10 || (isFinished && maxSuddenRound >= 6)) {
    for (let r = 6; r <= maxSuddenRound; r++) {
      suddenRounds.push(r);
    }
  }

  const renderSlot = (roundNum: number, team: SimulatedTeam, isSudden: boolean = false) => {
    const kick = shootoutKicks.find(k => k.teamId === team.id && k.round === roundNum);
    const kickIndex = kick ? shootoutKicks.indexOf(kick) : -1;
    const isRevealed = kickIndex !== -1 && kickIndex < currentStep;
    const isActive = kickIndex !== -1 && kickIndex === currentStep && !isFinished;
    const isJustFlashed = kickIndex !== -1 && kickIndex === currentStep - 1 && flashType !== null;

    if (isRevealed) {
      const isGoal = kick?.isGoal;
      return (
        <div
          key={`${team.id}-${roundNum}`}
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 shadow-md",
            isGoal
              ? "bg-emerald-500 text-black border-emerald-300"
              : "bg-rose-500/90 text-white border-rose-300",
            isJustFlashed && (isGoal ? "scale-125 ring-4 ring-emerald-400/40 shadow-emerald-500/50" : "scale-125 ring-4 ring-rose-400/40 shadow-rose-500/50")
          )}
          title={`Cobrança ${roundNum} (${team.name}): ${isGoal ? "GOL" : "ERRO"}`}
        >
          {isGoal ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      );
    }

    if (isActive) {
      return (
        <div
          key={`${team.id}-${roundNum}`}
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 shadow-lg",
            "ring-2 ring-amber-400 bg-amber-400/25 border-amber-300 text-amber-300 scale-110 animate-pulse shadow-amber-400/30"
          )}
          title={`Cobrança ${roundNum} (${team.name}): Em andamento`}
        >
          <span className="font-mono text-[9px] font-black">{roundNum}</span>
        </div>
      );
    }

    // Não revelada ainda
    const isNotNeeded = isFinished && kickIndex === -1;
    return (
      <div
        key={`${team.id}-${roundNum}`}
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-mono border transition-all duration-300",
          isNotNeeded
            ? "bg-white/[0.02] border-white/5 text-zinc-600 opacity-40"
            : isSudden
            ? "bg-amber-400/5 border-amber-400/25 text-amber-400/50"
            : "bg-white/[0.04] border-white/10 text-zinc-500"
        )}
        title={isNotNeeded ? `Cobrança ${roundNum}: Não necessária` : `Cobrança ${roundNum}: Aguardando`}
      >
        <span className="text-[9px] font-bold">{isNotNeeded ? "—" : roundNum}</span>
      </div>
    );
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200"
    >
      <div
        className={cn(
          "relative w-full max-w-xl bg-[#090a10] border rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col transition-all duration-300 ring-1",
          flashType === "goal"
            ? "border-emerald-500/60 ring-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.25)]"
            : flashType === "miss"
            ? "border-rose-500/60 ring-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.25)]"
            : "border-white/10 ring-white/5"
        )}
      >
        {/* FLASH DE GOL / ERRO */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-300",
            flashType === "goal" ? "bg-emerald-500/10 opacity-100" : flashType === "miss" ? "bg-rose-500/10 opacity-100" : "opacity-0"
          )}
        />

        {/* TOP BAR / CONTROLES */}
        <div className="relative z-10 px-5 sm:px-6 py-3.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider block">
                {t.page.campaign.shootoutsModalTitle}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                1v1 • {t.page.campaign.halftime || "Tempo normal"}: {homeScore} - {awayScore}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 px-2.5 text-[11px] font-semibold text-zinc-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* PLACAR CENTRAL GIGANTE COM ANIMAÇÃO */}
        <div className="relative z-10 px-5 sm:px-8 py-8 bg-gradient-to-b from-black/80 via-black/40 to-black/80 flex flex-col items-center">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 w-full">
            
            {/* Time Mandante (Esquerda) */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-3">
                {homeTeam.logo && (
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shrink-0 shadow-lg order-1 sm:order-2">
                    <img src={getProxyImageUrl(homeTeam.logo)} alt={homeTeam.name} className="w-full h-full object-contain drop-shadow" />
                  </div>
                )}
                <div className="min-w-0 order-2 sm:order-1">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-[130px] sm:max-w-[160px]">
                    {homeTeam.name}
                  </h4>
                  {homeTeam.id === userTeamId && (
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                      {t.page.campaign.yourTeam}
                    </span>
                  )}
                </div>
              </div>

              {/* Série Regular 5x5 */}
              <div className="flex flex-col items-center sm:items-end w-full">
                <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Série Regular (5x5)
                </span>
                <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                  {regularRounds.map(r => renderSlot(r, homeTeam))}
                </div>
              </div>

              {/* Morte Súbita Alternada (só aparece quando a rodada 5 termina empatada) */}
              {suddenRounds.length > 0 && (
                <div className="flex flex-col items-center sm:items-end w-full mt-2.5 pt-2 border-t border-amber-400/20 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Morte Súbita
                  </span>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                    {suddenRounds.map(r => renderSlot(r, homeTeam, true))}
                  </div>
                </div>
              )}
            </div>

            {/* Placar Digital Central */}
            <div className="flex flex-col items-center justify-center px-3 py-2">
              <div className="flex items-center gap-2 text-4xl sm:text-5xl font-mono font-black text-white tabular-nums bg-white/[0.04] px-5 py-3 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5">
                <span
                  className={cn(
                    "transition-transform duration-200",
                    flashType === "goal" && currentKick?.teamId === homeTeam.id && "scale-125 text-emerald-400",
                    isFinished && currentHomeScore > currentAwayScore && "text-amber-400"
                  )}
                >
                  {currentHomeScore}
                </span>
                <span className="text-zinc-600 text-2xl font-light">:</span>
                <span
                  className={cn(
                    "transition-transform duration-200",
                    flashType === "goal" && currentKick?.teamId === awayTeam.id && "scale-125 text-emerald-400",
                    isFinished && currentAwayScore > currentHomeScore && "text-amber-400"
                  )}
                >
                  {currentAwayScore}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 mt-2">
                {t.page.campaign.shootoutsScoreboard}
              </span>
            </div>

            {/* Time Visitante (Direita) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-3">
                {awayTeam.logo && (
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shrink-0 shadow-lg">
                    <img src={getProxyImageUrl(awayTeam.logo)} alt={awayTeam.name} className="w-full h-full object-contain drop-shadow" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-[130px] sm:max-w-[160px]">
                    {awayTeam.name}
                  </h4>
                  {awayTeam.id === userTeamId && (
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                      {t.page.campaign.yourTeam}
                    </span>
                  )}
                </div>
              </div>

              {/* Série Regular 5x5 */}
              <div className="flex flex-col items-center sm:items-start w-full">
                <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Série Regular (5x5)
                </span>
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  {regularRounds.map(r => renderSlot(r, awayTeam))}
                </div>
              </div>

              {/* Morte Súbita Alternada (só aparece quando a rodada 5 termina empatada) */}
              {suddenRounds.length > 0 && (
                <div className="flex flex-col items-center sm:items-start w-full mt-2.5 pt-2 border-t border-amber-400/20 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Morte Súbita
                  </span>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    {suddenRounds.map(r => renderSlot(r, awayTeam, true))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* BANNER ANIMADO DE STATUS DA COBRANÇA */}
          <div className="w-full mt-7 pt-5 border-t border-white/[0.06] flex flex-col items-center justify-center min-h-[64px]">
            {!isFinished && currentStep < totalKicks && shootoutKicks[currentStep] ? (
              <div key={currentStep} className="animate-in fade-in duration-200 flex flex-col items-center text-center">
                {/* Tag de Rodada */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  {shootoutKicks[currentStep].round <= 5 ? (
                    <span>Cobrança {shootoutKicks[currentStep].round} de 5 • Série Regular</span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current text-amber-400" />
                      Morte Súbita • Rodada {shootoutKicks[currentStep].round} (1v1)
                    </span>
                  )}
                </div>

                {/* Atacante na corrida */}
                {flashType === null ? (
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-white tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-zinc-400 font-semibold">{shootoutKicks[currentStep].teamName}:</span>
                    <span className="text-amber-300 font-black">{shootoutKicks[currentStep].player?.shortName || "Cobrador"}</span>
                    <span className="text-zinc-400 text-[11px] font-normal">arrancando no 1v1...</span>
                  </div>
                ) : flashType === "goal" ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider animate-in zoom-in-95">
                    <BallIcon className="w-3.5 h-3.5" />
                    <span>GOL! {shootoutKicks[currentStep - 1]?.player?.shortName || "Atacante"} converteu com categoria!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider animate-in zoom-in-95">
                    <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>DEFENDEU! Cobrança interceptada pelo goleiro!</span>
                  </div>
                )}
              </div>
            ) : isFinished ? (
              <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-400/20 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>
                    {isUserWinner ? "SUA EQUIPE VENCEU A DISPUTA!" : `${winnerTeam.name} VENCEU NOS SHOOTOUTS!`}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {t.page.campaign.shootoutRule}
                </span>
                {isAutoMode && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                    <span>Avançando para a próxima rodada...</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-zinc-500 animate-pulse uppercase tracking-wider">
                Iniciando cobranças 1v1...
              </span>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="relative z-10 px-5 sm:px-6 py-4 bg-[#06070a] border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isFinished ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipAnimation}
                className="btn-press text-xs font-bold text-zinc-300 hover:text-white border border-white/10 hover:bg-white/5 h-9 px-3 rounded-xl"
              >
                <FastForward className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {t.page.campaign.skipAnimation || "Pular"}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplay}
                className="btn-press text-xs font-bold text-zinc-300 hover:text-white border border-white/10 hover:bg-white/5 h-9 px-3 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {t.page.campaign.replayShootouts || "Repetir"}
              </Button>
            )}
          </div>

          <Button
            variant="brand"
            size="sm"
            onClick={onClose}
            className="btn-press px-6 h-9 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/25"
          >
            {t.page.campaign.closeShootouts}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

const BallIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.5" fill="#f4f4f5" stroke="#27272a" strokeWidth="1" />
    <polygon points="12 7.5 15.3 9.9 14 13.8 10 13.8 8.7 9.9" fill="#18181b" stroke="#18181b" strokeWidth="0.5" />
    <line x1="12" y1="2.5" x2="12" y2="7.5" stroke="#18181b" strokeWidth="1" />
    <line x1="21.1" y1="9.1" x2="15.3" y2="9.9" stroke="#18181b" strokeWidth="1" />
    <line x1="17.7" y1="19.7" x2="14" y2="13.8" stroke="#18181b" strokeWidth="1" />
  </svg>
);
