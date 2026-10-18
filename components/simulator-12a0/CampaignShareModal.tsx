"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { snapdom } from "@zumer/snapdom";
import { SimulatedTeam } from "@/lib/match-simulator";
export type PlayoffStage = "quarterfinals" | "semifinals" | "final" | null;
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/locale-context";
import { getProxyImageUrl, getPlayerOverall, cn } from "@/lib/utils";
import { Player } from "@/types/kings-league";
import {
  Download,
  Copy,
  Share2,
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  Check,
  Loader2,
  X,
  Target,
  Flame,
  Shield
} from "lucide-react";

interface CampaignShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTeam?: SimulatedTeam;
  isChampion: boolean;
  playoffStage?: PlayoffStage;
  groupRank?: number;
  difficulty?: "Clássico" | "Lendas";
  formationName?: string;
  playStyle?: "Defensivo" | "Equilibrado" | "Ofensivo";
  wins: number;
  losses: number;
  winRate: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  presGoals: number;
  presTotal: number;
  presRate: number;
  totalMatches: number;
}

export function CampaignShareModal({
  isOpen,
  onClose,
  userTeam,
  isChampion,
  playoffStage,
  groupRank,
  difficulty = "Clássico",
  formationName = "1-2-3-1",
  playStyle = "Equilibrado",
  wins,
  losses,
  winRate,
  goalsFor,
  goalsAgainst,
  goalDiff,
  presGoals,
  presTotal,
  presRate,
  totalMatches
}: CampaignShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const teamName = userTeam?.name || "Meu Time";
  const presidents = userTeam?.presidents || "Presidente";

  let titleBadge = "FASE REGULAR";
  if (isChampion) titleBadge = "GRANDE CAMPEÃO DA KINGS LEAGUE 12a0";
  else if (playoffStage === "final") titleBadge = "FINALISTA DOS PLAYOFFS";
  else if (playoffStage === "semifinals") titleBadge = "SEMIFINALISTA DOS PLAYOFFS";
  else if (playoffStage === "quarterfinals") titleBadge = "PLAYOFFS • QUARTAS DE FINAL";
  else if (groupRank) titleBadge = `${groupRank}º LUGAR NA FASE DE GRUPOS`;

  const starting7: Player[] = userTeam?.players?.slice(0, 7) || [];
  const teamAverageOvr = starting7.length > 0
    ? Math.round(starting7.reduce((acc, p) => acc + getPlayerOverall(p), 0) / starting7.length)
    : (userTeam?.overall || 80);
  const topPlayer = starting7.length > 0
    ? [...starting7].sort((a, b) => getPlayerOverall(b) - getPlayerOverall(a))[0]
    : null;

  const getRoleInfo = (role?: string) => {
    switch (role) {
      case "goalkeeper":
        return { label: "GL", style: "bg-amber-400/20 text-amber-300 border-amber-400/40" };
      case "defender":
        return { label: "DF", style: "bg-sky-400/20 text-sky-300 border-sky-400/40" };
      case "midfielder":
        return { label: "MC", style: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40" };
      case "forward":
        return { label: "AT", style: "bg-rose-400/20 text-rose-300 border-rose-400/40" };
      default:
        return { label: "JG", style: "bg-zinc-400/20 text-zinc-300 border-zinc-400/40" };
    }
  };

  const getCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const capture = await snapdom(cardRef.current, {
      scale: 2,
      useProxy: "https://proxy.corsfix.com/?"
    });
    const canvas = await capture.toCanvas();
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), "image/png", 1);
    });
  };

  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      const blob = await getCardBlob();
      if (!blob) throw new Error("Falha ao gerar imagem");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kings-league-12a0-${teamName.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);

      toast({
        title: t.page.campaign.campaignImageDownloaded,
        description: "Imagem em alta definição pronta para compartilhar nas suas redes sociais!"
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro ao gerar imagem",
        description: "Tente novamente ou compartilhe pelo link de texto.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsGenerating(true);
      const blob = await getCardBlob();
      if (!blob) throw new Error("Falha ao gerar imagem");

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);

        toast({
          title: t.page.campaign.campaignImageCopied,
          description: "Pronto! Cole direto no WhatsApp, Discord, X (Twitter) ou Telegram."
        });
      } else {
        throw new Error("Área de transferência de imagem não suportada");
      }
    } catch (e) {
      console.error(e);
      handleDownloadImage();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareNative = async () => {
    try {
      setIsGenerating(true);
      const blob = await getCardBlob();
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `kings-league-12a0-${teamName}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Kings League 12a0 - ${teamName}`,
            text: `Minha campanha no simulador 12a0 da Kings League Brasil com o ${teamName}: ${titleBadge}!`,
            files: [file]
          });
          return;
        }
      }
      handleDownloadImage();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md select-none overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#090a0f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto max-h-[95vh] ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER MODAL */}
        <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                {t.page.campaign.shareSummaryTitle}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {t.page.campaign.shareSummarySub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTAINER DO CARD OG (ÁREA QUE SERÁ CAPTURADA EM PRINT) */}
        <div className="p-4 sm:p-6 flex justify-center overflow-x-auto overflow-y-auto bg-[#050608] max-h-[calc(95vh-130px)]">
          <div
            ref={cardRef}
            id="campaign-share-card"
            className={cn(
              "w-full max-w-[620px] rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col gap-3.5 select-none shadow-2xl bg-[#08090d]",
              isChampion
                ? "border border-amber-400/40 shadow-[0_0_50px_-10px_rgba(244,175,35,0.25)] ring-1 ring-amber-400/20"
                : "border border-white/10 ring-1 ring-white/5"
            )}
            style={{
              background: isChampion
                ? "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(244,175,35,0.18) 0%, rgba(8,9,13,1) 75%)"
                : "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(244,175,35,0.08) 0%, rgba(8,9,13,1) 75%)"
            }}
          >
            {/* Spotlight sutil superior */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-400/[0.08] rounded-full blur-3xl pointer-events-none" />

            {/* Grid arquitetural tático oficial Kings League (sem triângulos) */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.7) 1px, transparent 1px)",
                backgroundSize: "32px 32px"
              }}
            />

            {/* Linhas de demarcação da quadra Kings League */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 620 420"
              preserveAspectRatio="none"
            >
              {/* Contorno externo da quadra */}
              <rect x="8" y="8" width="604" height="404" rx="12" fill="none" stroke="#F4AF23" strokeWidth="1.2" />
              {/* Linha divisória de meio-campo */}
              <line x1="310" y1="8" x2="310" y2="412" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
              {/* Círculo central */}
              <circle cx="310" cy="210" r="58" fill="none" stroke="#F4AF23" strokeWidth="1.2" />
              <circle cx="310" cy="210" r="3" fill="#F4AF23" />
              {/* Áreas de gol */}
              <rect x="8" y="150" width="55" height="120" rx="4" fill="none" stroke="#ffffff" strokeWidth="1" />
              <rect x="557" y="150" width="55" height="120" rx="4" fill="none" stroke="#ffffff" strokeWidth="1" />
            </svg>

            {/* TOPO DO CARD: LOGOS E BADGE DO RESULTADO */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block leading-none">
                    KINGS LEAGUE SANTANDER
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mt-0.5">
                    DESAFIO 12a0 BRASIL
                  </span>
                </div>
              </div>

              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5",
                isChampion
                  ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                  : "bg-white/10 text-white border-white/20"
              )}>
                {isChampion ? (
                  <Trophy className="w-3.5 h-3.5 fill-current" />
                ) : playoffStage === "final" ? (
                  <Medal className="w-3.5 h-3.5 text-amber-300" />
                ) : playoffStage === "semifinals" ? (
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                ) : null}
                <span>{titleBadge}</span>
              </div>
            </div>

            {/* BARRA TÁTICA: MODO DE JOGO, FORMAÇÃO E ESTILO */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Modo:</span>
                <span className="font-bold text-amber-300 uppercase">{difficulty}</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Formação:</span>
                <span className="font-bold text-white">{formationName}</span>
              </div>
              {playStyle && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Estilo:</span>
                    <span className="font-bold text-zinc-200">{playStyle}</span>
                  </div>
                </>
              )}
            </div>

            {/* MEIO DO CARD: TIME DO USUÁRIO E PRESIDENTES */}
            <div className="relative z-10 flex items-center gap-4 my-1">
              {userTeam?.logo && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.05] border border-white/15 p-2 flex items-center justify-center shrink-0 shadow-lg">
                  <img
                    src={userTeam.logo.startsWith("data:") ? userTeam.logo : getProxyImageUrl(userTeam.logo)}
                    alt={teamName}
                    className="w-full h-full object-contain drop-shadow"
                    {...(!userTeam.logo.startsWith("data:") ? { crossOrigin: "anonymous" } : {})}
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate leading-tight drop-shadow">
                  {teamName}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-zinc-300 mt-1 flex-wrap">
                  <span className="font-medium">Presidentes: <strong className="text-amber-300 font-bold">{presidents}</strong></span>
                  <span className="text-white/20">•</span>
                  <div className="inline-flex items-center gap-1.5 font-bold">
                    <span className="text-emerald-400 font-black">{wins}V</span>
                    <span className="text-zinc-600 font-normal">-</span>
                    <span className="text-rose-400 font-black">{losses}D</span>
                    <span className="text-zinc-400 text-[10px] font-medium">({winRate}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GRID DE 4 ESTATÍSTICAS DA CAMPANHA */}
            <div className="relative z-10 grid grid-cols-4 gap-2 pt-1 border-t border-white/[0.08]">
              
              {/* Stat 1: Vitórias / Derrotas (Verde / Vermelho) */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase text-zinc-400 block truncate">
                  Campanha
                </span>
                <div className="text-sm sm:text-lg font-black mt-0.5 tabular-nums flex items-center justify-center gap-1">
                  <span className="text-emerald-400">{wins}V</span>
                  <span className="text-zinc-600 font-normal">-</span>
                  <span className="text-rose-400">{losses}D</span>
                </div>
                <span className="text-[8px] text-zinc-500 font-medium block truncate">
                  {winRate}% Vitórias
                </span>
              </div>

              {/* Stat 2: Gols */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase text-zinc-400 block truncate">
                  Gols Pró
                </span>
                <span className="text-sm sm:text-lg font-black text-white block mt-0.5 tabular-nums">
                  {goalsFor}
                </span>
                <span className="text-[8px] text-zinc-500 font-medium block truncate">
                  {goalsAgainst} sofridos
                </span>
              </div>

              {/* Stat 3: Saldo */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase text-zinc-400 block truncate">
                  Saldo de Gols
                </span>
                <span className={cn(
                  "text-sm sm:text-lg font-black block mt-0.5 tabular-nums",
                  goalDiff > 0 ? "text-emerald-400" : goalDiff < 0 ? "text-rose-400" : "text-white"
                )}>
                  {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                </span>
                <span className="text-[8px] text-zinc-500 font-medium block truncate">
                  Diferença
                </span>
              </div>

              {/* Stat 4: Pênaltis do Presidente */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase text-zinc-400 block truncate">
                  Pênalti Pres.
                </span>
                <span className="text-sm sm:text-lg font-black text-amber-300 block mt-0.5 tabular-nums">
                  {presGoals}/{presTotal}
                </span>
                <span className="text-[8px] text-amber-400/80 font-medium block truncate">
                  {presRate}% acerto
                </span>
              </div>

            </div>

            {/* ELENCO TITULAR (STARTING 7 SELECIONADOS NO DRAFT) */}
            {starting7.length > 0 && (
              <div className="relative z-10 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Elenco Titular ({starting7.length})
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    OVR Médio: <strong className="text-white font-bold">{teamAverageOvr}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {starting7.map((player, idx) => {
                    const ovr = getPlayerOverall(player);
                    const roleInfo = getRoleInfo(player.role);
                    const jersey = player.jersey || player.metaInformation?.jerseyNumber || String(idx + 1);

                    return (
                      <div
                        key={player.id || idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black uppercase shrink-0 border",
                            roleInfo.style
                          )}>
                            {roleInfo.label}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-500 font-bold shrink-0">
                            #{jersey}
                          </span>
                          <span className="text-[11px] font-black text-white truncate">
                            {player.shortName}
                          </span>
                        </div>

                        <span className={cn(
                          "text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md tabular-nums shrink-0 ml-1.5",
                          ovr >= 90
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                            : ovr >= 85
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-white/[0.06] text-zinc-300 border border-white/10"
                        )}>
                          {ovr}
                        </span>
                      </div>
                    );
                  })}

                  {/* 8º Slot: Destaque da Equipe (CRAQUE) */}
                  {topPlayer && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/15 via-amber-400/5 to-transparent border border-amber-400/30">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-amber-400/25 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                          <Crown className="w-3 h-3 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[7.5px] font-mono font-black uppercase tracking-wider text-amber-400 block leading-none">
                            CRAQUE DO TIME
                          </span>
                          <span className="text-[11px] font-black text-white truncate block leading-tight mt-0.5">
                            {topPlayer.shortName}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md bg-amber-400 text-black shadow-sm tabular-nums shrink-0 ml-1.5">
                        {getPlayerOverall(topPlayer)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RODAPÉ DO CARD: WATERMARK & URL */}
            <div className="relative z-10 pt-2 flex items-center justify-between text-[9px] text-zinc-500 border-t border-white/[0.06] font-mono">
              <span className="truncate">Crie sua escalação e jogue agora</span>
              <span className="text-amber-400/80 font-bold truncate">kings-league-simulator.vercel.app/12a0</span>
            </div>

          </div>
        </div>

        {/* CONTROLES DE EXPORTAÇÃO */}
        <div className="p-4 sm:p-5 bg-[#07080c] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 text-center sm:text-left">
            <span className="font-semibold text-white block">Compartilhe sua conquista!</span>
            <span>Baixe a imagem oficial ou copie direto para colar nas suas redes.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="brand"
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="btn-press flex-1 sm:flex-none px-5 h-10 text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.page.campaign.preparingImage}
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> {t.page.campaign.downloadCampaignImage}
                </>
              )}
            </Button>

            <Button
              variant="glass"
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="btn-press flex-1 sm:flex-none px-4 h-10 text-xs font-bold uppercase tracking-wider rounded-xl border-white/10 hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> {t.page.campaign.copyCampaignImage}
                </>
              )}
            </Button>

            {typeof navigator !== "undefined" && typeof (navigator as any).share === "function" && (
              <Button
                variant="glass"
                onClick={handleShareNative}
                disabled={isGenerating}
                className="btn-press px-3 h-10 rounded-xl border-white/10 hover:bg-white/10 flex items-center justify-center text-amber-400"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
