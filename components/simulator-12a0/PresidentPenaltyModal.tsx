"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SimulatedTeam } from "@/lib/match-simulator";
import { penaltySound } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { getProxyImageUrl, cn } from "@/lib/utils";
import {
  Crown,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Target,
  RotateCcw,
  XCircle,
  ShieldAlert,
  Flame,
  ArrowRight,
  Crosshair
} from "lucide-react";

export type ShotZone =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ShotStyle = "colocada" | "bomba" | "cavadinha";

export interface PenaltyResolutionPayload {
  isGoal: boolean;
  outcomeType: "goal" | "saved" | "woodwork";
  shotZone: ShotZone;
  shotStyle: ShotStyle;
  description: string;
}

interface PresidentPenaltyModalProps {
  isOpen: boolean;
  userTeam: SimulatedTeam;
  opponent: SimulatedTeam;
  isHome: boolean;
  currentHomeScore: number;
  currentAwayScore: number;
  minute?: number;
  isPracticeMode?: boolean;
  onResolve: (payload: PenaltyResolutionPayload) => void;
  onClose?: () => void;
  onSkip?: () => void;
}

interface ZoneConfig {
  id: ShotZone;
  label: string;
  tag: string;
  x: number; // percentage in goal box
  y: number; // percentage in goal box
  description: string;
  postRisk: number; // 0 to 1
}

const SHOT_ZONES: ZoneConfig[] = [
  {
    id: "top-left",
    label: "Gaveta Esquerda",
    tag: "Ângulo Esq.",
    x: 18,
    y: 22,
    description: "Indefensável no ângulo superior esquerdo.",
    postRisk: 0.08
  },
  {
    id: "top-center",
    label: "Meio Alto",
    tag: "Por Cima",
    x: 50,
    y: 24,
    description: "Chute alto no centro da meta.",
    postRisk: 0.04
  },
  {
    id: "top-right",
    label: "Gaveta Direita",
    tag: "Ângulo Dir.",
    x: 82,
    y: 22,
    description: "Indefensável no ângulo superior direito.",
    postRisk: 0.08
  },
  {
    id: "bottom-left",
    label: "Canto Esquerdo",
    tag: "Rasteiro Esq.",
    x: 18,
    y: 72,
    description: "Rasteiro e firme no canto esquerdo.",
    postRisk: 0.05
  },
  {
    id: "bottom-center",
    label: "Meio Rasteiro",
    tag: "Firme no Meio",
    x: 50,
    y: 72,
    description: "Forte e centrado no meio do gol.",
    postRisk: 0.02
  },
  {
    id: "bottom-right",
    label: "Canto Direito",
    tag: "Rasteiro Dir.",
    x: 82,
    y: 72,
    description: "Rasteiro e firme no canto direito.",
    postRisk: 0.05
  }
];

/**
 * Ilustração Vetorial Profissional do Goleiro da Kings League.
 * Figura anatômica com uniforme oficial neon, luvas profissionais com dedos abertos,
 * calção acolchoado, chuteiras com travas e crachá de identificação.
 */
function GoalkeeperAthlete({
  dive,
  gkName,
  gkOvr,
  photo,
  teamLogo
}: {
  dive: string;
  gkName: string;
  gkOvr: number;
  photo?: string | null;
  teamLogo?: string | null;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Crachá Flutuante de Identificação do Goleiro */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 border border-white/20 shadow-xl backdrop-blur-md whitespace-nowrap z-30 ring-1 ring-black/40">
        {photo ? (
          <img
            src={photo}
            alt={gkName}
            className="w-4 h-4 rounded-full object-cover border border-amber-400/50 shrink-0"
            onError={e => { (e.target as HTMLElement).style.display = "none"; }}
          />
        ) : teamLogo ? (
          <img
            src={teamLogo}
            alt="Time"
            className="w-3.5 h-3.5 object-contain shrink-0"
            onError={e => { (e.target as HTMLElement).style.display = "none"; }}
          />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        )}
        <span className="text-[10px] font-bold text-white tracking-tight">{gkName}</span>
        <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-400/15 px-1 py-0.2 rounded border border-amber-400/30">
          ★ {gkOvr}
        </span>
      </div>

      {/* SVG do Goleiro com Postura Atlética Real */}
      <svg
        viewBox="0 0 160 170"
        className="w-28 h-32 sm:w-32 sm:h-36 drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] select-none pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sombra no gramado */}
          <radialGradient id="turfShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Gradiente da Camisa de Goleiro Kings League (Neon Volt & Esmeralda) */}
          <linearGradient id="gkKitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="40%" stopColor="#84cc16" />
            <stop offset="85%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Pele Atlética com Sombreamento Muscular */}
          <linearGradient id="gkSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fba86b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Luvas Profissionais (Látex Branco de Alta Aderência) */}
          <linearGradient id="gkPalmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Dorso da Luva (Laranja Neon & Carbono) */}
          <linearGradient id="gkBackhandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Calção de Goleiro Acolchoado */}
          <linearGradient id="gkShortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Chuteiras */}
          <linearGradient id="gkBootsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Cabelo */}
          <linearGradient id="gkHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="50%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        {/* 1. Sombra projetada no gramado */}
        <ellipse
          cx="80"
          cy="162"
          rx={dive !== "idle" ? "22" : "38"}
          ry={dive !== "idle" ? "3.5" : "6"}
          fill="url(#turfShadow)"
          className="transition-all duration-300"
        />

        {/* 2. Chuteiras Modernas de Campo com Travas de Alumínio */}
        {/* Chuteira Esquerda */}
        <g id="leftBoot">
          <path
            d="M 46 156 Q 42 161 50 164 L 68 163 Q 71 158 66 155 Z"
            fill="url(#gkBootsGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          <circle cx="48" cy="164" r="1.3" fill="#a3e635" />
          <circle cx="56" cy="164" r="1.3" fill="#a3e635" />
          <circle cx="65" cy="163.5" r="1.3" fill="#a3e635" />
          <path d="M 50 159 Q 58 157 66 161" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Chuteira Direita */}
        <g id="rightBoot">
          <path
            d="M 114 156 Q 118 161 110 164 L 92 163 Q 89 158 94 155 Z"
            fill="url(#gkBootsGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          <circle cx="112" cy="164" r="1.3" fill="#a3e635" />
          <circle cx="104" cy="164" r="1.3" fill="#a3e635" />
          <circle cx="95" cy="163.5" r="1.3" fill="#a3e635" />
          <path d="M 110 159 Q 102 157 94 161" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* 3. Pernas / Meiões de Goleiro com Canelerias */}
        {/* Meião Esquerdo */}
        <path
          d="M 52 126 Q 47 140 48 156 L 66 155 Q 68 138 64 126 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1"
        />
        <path d="M 48 136 L 66 136" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 48.5 141 L 65.5 141" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

        {/* Meião Direito */}
        <path
          d="M 108 126 Q 113 140 112 156 L 94 155 Q 92 138 96 126 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1"
        />
        <path d="M 112 136 L 94 136" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 111.5 141 L 94.5 141" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

        {/* 4. Calção Acolchoado com Proteção Lateral de Quadril */}
        <path
          d="M 46 102 Q 80 106 114 102 L 118 128 L 94 128 Q 80 116 66 128 L 42 128 Z"
          fill="url(#gkShortsGrad)"
          stroke="#334155"
          strokeWidth="1"
        />
        <path d="M 43 108 L 45 125" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 117 108 L 115 125" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 66 126 L 94 126" stroke="#020617" strokeWidth="2" />

        {/* 5. Tronco Atlético / Camisa Raglan com Recortes Ergonômicos */}
        <path
          d="M 40 54 Q 80 58 120 54 L 114 105 Q 80 109 46 105 Z"
          fill="url(#gkKitGrad)"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Recortes laterais respiráveis */}
        <path d="M 40 54 Q 48 78 46 105" stroke="#090d16" strokeWidth="3.5" fill="none" opacity="0.8" />
        <path d="M 120 54 Q 112 78 114 105" stroke="#090d16" strokeWidth="3.5" fill="none" opacity="0.8" />

        {/* Linha peitoral / sombreamento muscular */}
        <path d="M 52 74 Q 80 82 108 74" stroke="rgba(0,0,0,0.25)" strokeWidth="2" fill="none" />
        <path d="M 80 78 L 80 98" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

        {/* Número 1 do Goleiro no Peito */}
        <text
          x="80"
          y="95"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
        >
          1
        </text>

        {/* Coroa Kings League Dourada no Peito */}
        <g transform="translate(80, 66) scale(0.7) translate(-12, -10)">
          <polygon points="12,2 15,9 22,5 19,16 5,16 2,5 9,9" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
        </g>

        {/* Gola V Atlética */}
        <path d="M 68 55 Q 80 64 92 55 L 89 49 Q 80 53 71 49 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />

        {/* 6. Pescoço e Cabeça com Corte Fade e Foco nos Olhos */}
        <path d="M 72 52 L 72 40 Q 80 42 88 40 L 88 52 Z" fill="url(#gkSkinGrad)" />
        <path d="M 75 42 L 75 51" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />
        <path d="M 85 42 L 85 51" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />

        {/* Cabeça / Queixo / Mandíbula */}
        <path
          d="M 69 31 Q 69 46 80 46 Q 91 46 91 31 Q 91 18 80 18 Q 69 18 69 31 Z"
          fill="url(#gkSkinGrad)"
          stroke="#7c2d12"
          strokeWidth="0.8"
        />

        {/* Orelhas */}
        <ellipse cx="68.5" cy="31" rx="2.2" ry="4" fill="url(#gkSkinGrad)" stroke="#9a3412" strokeWidth="0.6" />
        <ellipse cx="91.5" cy="31" rx="2.2" ry="4" fill="url(#gkSkinGrad)" stroke="#9a3412" strokeWidth="0.6" />

        {/* Cabelo Atlético com Fade Moderno */}
        <path
          d="M 67 28 Q 68 14 80 13 Q 92 14 93 28 Q 88 23 80 23 Q 72 23 67 28 Z"
          fill="url(#gkHairGrad)"
        />
        <path d="M 68 25 Q 70 19 74 17 L 74 21 Q 70 23 68 28 Z" fill="#27272a" />
        <path d="M 92 25 Q 90 19 86 17 L 86 21 Q 90 23 92 28 Z" fill="#27272a" />

        {/* Olhar Focado e Determinado */}
        <path d="M 72 28 L 78 29.5" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 88 28 L 82 29.5" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="75" cy="32" rx="1.8" ry="1.4" fill="#ffffff" />
        <circle cx="75.2" cy="32" r="1.1" fill="#090d16" />
        <ellipse cx="85" cy="32" rx="1.8" ry="1.4" fill="#ffffff" />
        <circle cx="84.8" cy="32" r="1.1" fill="#090d16" />
        <path d="M 80 30 L 79 36 L 81.5 36" stroke="#9a3412" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        <path d="M 76 40 Q 80 39 84 40" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" />

        {/* 7. Braços e LUVAS PROFISSIONAIS (O Destaque do Goleiro) */}
        {/* BRAÇO ESQUERDO */}
        <g id="leftArm">
          <path d="M 42 56 Q 24 64 18 74 L 26 82 Q 34 72 48 66 Z" fill="url(#gkKitGrad)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 18 74 Q 12 66 8 58 L 16 54 Q 22 64 26 82 Z" fill="url(#gkSkinGrad)" stroke="#7c2d12" strokeWidth="0.8" />
          <rect x="7" y="52" width="11" height="6" rx="2" fill="#090d16" stroke="#a3e635" strokeWidth="1" transform="rotate(-30 12 55)" />

          {/* Luva Esquerda com Dedos Abertos */}
          <g transform="translate(1, 30) rotate(-18)">
            <path
              d="M 10 18 Q 4 15 4 26 Q 4 36 14 36 Q 22 36 22 25 Q 22 18 10 18 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <path d="M 5 24 Q 4 32 14 34 Q 18 34 20 28 Q 12 28 5 24 Z" fill="url(#gkBackhandGrad)" />
            <path d="M 18 28 Q 28 26 27 20 Q 25 16 19 21 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <path d="M 23 20 L 25 24" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 14 19 Q 15 8 10 7 Q 6 7 8 19 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="11" cy="11" r="1.2" fill="#a3e635" />
            <path d="M 9 19 Q 8 5 4 5 Q 0 5 3 19 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="5" cy="9" r="1.2" fill="#a3e635" />
            <path d="M 4 20 Q 2 8 -2 9 Q -5 12 -1 22 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="-1" cy="13" r="1.2" fill="#a3e635" />
            <path d="M 1 24 Q -2 14 -7 17 Q -9 22 -3 28 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="-5" cy="19" r="1.2" fill="#a3e635" />
          </g>
        </g>

        {/* BRAÇO DIREITO */}
        <g id="rightArm">
          <path d="M 118 56 Q 136 64 142 74 L 134 82 Q 126 72 112 66 Z" fill="url(#gkKitGrad)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 142 74 Q 148 66 152 58 L 144 54 Q 138 64 134 82 Z" fill="url(#gkSkinGrad)" stroke="#7c2d12" strokeWidth="0.8" />
          <rect x="142" y="52" width="11" height="6" rx="2" fill="#090d16" stroke="#a3e635" strokeWidth="1" transform="rotate(30 148 55)" />

          {/* Luva Direita com Dedos Abertos */}
          <g transform="translate(159, 30) scale(-1, 1) rotate(-18)">
            <path
              d="M 10 18 Q 4 15 4 26 Q 4 36 14 36 Q 22 36 22 25 Q 22 18 10 18 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <path d="M 5 24 Q 4 32 14 34 Q 18 34 20 28 Q 12 28 5 24 Z" fill="url(#gkBackhandGrad)" />
            <path d="M 18 28 Q 28 26 27 20 Q 25 16 19 21 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <path d="M 23 20 L 25 24" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 14 19 Q 15 8 10 7 Q 6 7 8 19 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="11" cy="11" r="1.2" fill="#a3e635" />
            <path d="M 9 19 Q 8 5 4 5 Q 0 5 3 19 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="5" cy="9" r="1.2" fill="#a3e635" />
            <path d="M 4 20 Q 2 8 -2 9 Q -5 12 -1 22 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="-1" cy="13" r="1.2" fill="#a3e635" />
            <path d="M 1 24 Q -2 14 -7 17 Q -9 22 -3 28 Z" fill="url(#gkPalmGrad)" stroke="#0f172a" strokeWidth="1" />
            <circle cx="-5" cy="19" r="1.2" fill="#a3e635" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function PresidentPenaltyModal({
  isOpen,
  userTeam,
  opponent,
  isHome,
  currentHomeScore,
  currentAwayScore,
  minute = 28,
  isPracticeMode = false,
  onResolve,
  onClose,
  onSkip
}: PresidentPenaltyModalProps) {
  const [selectedZone, setSelectedZone] = useState<ShotZone>("top-left");
  const [selectedStyle, setSelectedStyle] = useState<ShotStyle>("colocada");
  const [isKicking, setIsKicking] = useState(false);
  const [outcome, setOutcome] = useState<PenaltyResolutionPayload | null>(null);
  const [gkDive, setGkDive] = useState<string>("idle");
  const [isMuted, setIsMuted] = useState(() => penaltySound.getMuted());
  const [autoContinueSec, setAutoContinueSec] = useState<number | null>(null);

  // Informações do Goleiro Adversário
  const oppGk = useMemo(() => {
    const gkPlayer = opponent.players?.find(p => p.role === "goalkeeper");
    const gkOvr = opponent.defenseScore || opponent.overall || 76;
    const rawPhoto = (gkPlayer as any)?.image?.url || (gkPlayer as any)?.photoUrl || null;
    return {
      name: gkPlayer?.shortName || (gkPlayer as any)?.fullName || (gkPlayer as any)?.name || "Goleiro",
      ovr: (gkPlayer as any)?.overall || (gkPlayer as any)?.rating || (gkPlayer as any)?.score || gkOvr,
      photo: rawPhoto ? getProxyImageUrl(rawPhoto) : null,
      teamName: opponent.name,
      teamLogo: opponent.logo ? getProxyImageUrl(opponent.logo) : null
    };
  }, [opponent]);

  // Nome do Presidente Cobrador
  const presidentName = userTeam.presidents || "Presidente";

  // Resetar quando abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedZone("top-left");
      setSelectedStyle("colocada");
      setIsKicking(false);
      setOutcome(null);
      setGkDive("idle");
      setAutoContinueSec(null);
      // Apito inicial
      setTimeout(() => {
        penaltySound.playWhistle();
      }, 300);
    }
  }, [isOpen]);

  // Timer de auto-continuação após o resultado
  useEffect(() => {
    if (outcome && !isPracticeMode) {
      setAutoContinueSec(4);
      const interval = setInterval(() => {
        setAutoContinueSec(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            onResolve(outcome);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [outcome, isPracticeMode, onResolve]);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const muted = penaltySound.toggleMute();
    setIsMuted(muted);
  };

  const executeShot = (zoneId: ShotZone, style: ShotStyle) => {
    if (isKicking || outcome) return;
    setIsKicking(true);

    // Som do chute
    penaltySound.playKick(style === "colocada" ? "normal" : style);

    // 1. Decisão do Goleiro Adversário
    const possibleDives = [
      "top-left",
      "bottom-left",
      "top-right",
      "bottom-right",
      "center-high",
      "stay-center"
    ];

    // OVR do goleiro influencia a chance de adivinhar o lado certo
    const gkPredictSkill = Math.min(0.55, 0.28 + (oppGk.ovr - 70) * 0.008);
    const gkGuessesSide = Math.random() < gkPredictSkill;

    let chosenDive: string;
    if (gkGuessesSide) {
      if (zoneId === "top-left") chosenDive = Math.random() < 0.65 ? "top-left" : "bottom-left";
      else if (zoneId === "bottom-left") chosenDive = Math.random() < 0.65 ? "bottom-left" : "top-left";
      else if (zoneId === "top-right") chosenDive = Math.random() < 0.65 ? "top-right" : "bottom-right";
      else if (zoneId === "bottom-right") chosenDive = Math.random() < 0.65 ? "bottom-right" : "top-right";
      else if (zoneId === "top-center") chosenDive = Math.random() < 0.5 ? "center-high" : "stay-center";
      else chosenDive = "stay-center";
    } else {
      const wrongDives = possibleDives.filter(d => {
        if (zoneId.includes("left")) return d.includes("right") || d.includes("center");
        if (zoneId.includes("right")) return d.includes("left") || d.includes("center");
        return d.includes("left") || d.includes("right");
      });
      chosenDive = wrongDives[Math.floor(Math.random() * wrongDives.length)] || "bottom-right";
    }

    setGkDive(chosenDive);

    // 2. Cálculo do Resultado
    const targetConfig = SHOT_ZONES.find(z => z.id === zoneId)!;
    let outcomeType: "goal" | "saved" | "woodwork" = "goal";
    let isGoal = true;
    let desc = "";

    const woodworkChance = style === "bomba" ? targetConfig.postRisk * 1.5 : targetConfig.postRisk * 0.7;
    const hitWoodwork = Math.random() < woodworkChance;

    if (hitWoodwork) {
      outcomeType = "woodwork";
      isGoal = false;
      desc = `💥 NA TRAVE! ${presidentName} bateu na ${targetConfig.label}, mas a bola explodiu no poste e saiu!`;
    } else {
      const sameCorner = (
        (zoneId === "top-left" && chosenDive === "top-left") ||
        (zoneId === "bottom-left" && chosenDive === "bottom-left") ||
        (zoneId === "top-right" && chosenDive === "top-right") ||
        (zoneId === "bottom-right" && chosenDive === "bottom-right") ||
        (zoneId === "top-center" && chosenDive === "center-high") ||
        (zoneId === "bottom-center" && chosenDive === "stay-center")
      );

      const sameSideDifferentHeight = (
        (zoneId === "top-left" && chosenDive === "bottom-left") ||
        (zoneId === "bottom-left" && chosenDive === "top-left") ||
        (zoneId === "top-right" && chosenDive === "bottom-right") ||
        (zoneId === "bottom-right" && chosenDive === "top-right")
      );

      if (sameCorner) {
        if (style === "cavadinha") {
          outcomeType = "saved";
          isGoal = false;
          desc = `DEFENDEU! ${oppGk.name} leu a cavadinha e segurou firme nos braços!`;
        } else if (style === "bomba") {
          const powerThrough = Math.random() < 0.42;
          if (powerThrough) {
            outcomeType = "goal";
            isGoal = true;
            desc = `GOOOOOL! Uma verdadeira BOMBA de ${presidentName}! O goleiro tocou mas a força do chute estufou as redes!`;
          } else {
            outcomeType = "saved";
            isGoal = false;
            desc = `GRANDE DEFESA! ${oppGk.name} espalmou a bomba na ${targetConfig.label}!`;
          }
        } else {
          const saveChance = Math.min(0.72, 0.45 + (oppGk.ovr - 70) * 0.015);
          if (Math.random() < saveChance) {
            outcomeType = "saved";
            isGoal = false;
            desc = `ESPETACULAR! ${oppGk.name} voou no canto e buscou com a ponta dos dedos!`;
          } else {
            outcomeType = "goal";
            isGoal = true;
            desc = `GOLAÇO! Cobrança perfeita na bochecha da rede, sem chances para o goleiro!`;
          }
        }
      } else if (sameSideDifferentHeight) {
        if (zoneId.includes("top")) {
          outcomeType = "goal";
          isGoal = true;
          desc = `GOOOOOOOL! ${presidentName} mandou na gaveta enquanto o goleiro caiu por baixo!`;
        } else {
          const luckyLegSave = Math.random() < 0.22;
          if (luckyLegSave) {
            outcomeType = "saved";
            isGoal = false;
            desc = `SALVOU COM O PÉ! O goleiro esticou a perna no reflexo e desviou!`;
          } else {
            outcomeType = "goal";
            isGoal = true;
            desc = `GOOOL! Chute rasteiro com precisão, tirando totalmente do alcance do goleiro!`;
          }
        }
      } else {
        if (style === "cavadinha") {
          outcomeType = "goal";
          isGoal = true;
          desc = `QUE PINTURA! ${presidentName} cavou com frieza absurda com o goleiro no chão! Pura classe!`;
        } else {
          outcomeType = "goal";
          isGoal = true;
          desc = `GOOOOOL! Goleiro para um lado, bola para o outro com categoria!`;
        }
      }
    }

    // 3. Efeitos sonoros sincronizados (~700ms)
    setTimeout(() => {
      if (outcomeType === "goal") {
        penaltySound.playNet();
        penaltySound.playCheer();
      } else if (outcomeType === "woodwork") {
        penaltySound.playWoodwork();
      } else {
        penaltySound.playGloveSave();
      }

      setOutcome({
        isGoal,
        outcomeType,
        shotZone: zoneId,
        shotStyle: style,
        description: desc
      });
      setIsKicking(false);
    }, 700);
  };

  const handleConfirmAndClose = () => {
    if (outcome) {
      onResolve(outcome);
    } else if (onClose) {
      onClose();
    }
  };

  const currentZoneConfig = SHOT_ZONES.find(z => z.id === selectedZone)!;

  // Animação e Física Explosiva do Goleiro
  const getKeeperTransform = () => {
    if (gkDive === "idle") return "translate(-50%, -50%) scale(1)";
    if (gkDive === "top-left") return "translate(-122%, -108%) rotate(-45deg) scale(1.06)";
    if (gkDive === "bottom-left") return "translate(-126%, -18%) rotate(-66deg) scale(1.02)";
    if (gkDive === "top-right") return "translate(22%, -108%) rotate(45deg) scale(1.06)";
    if (gkDive === "bottom-right") return "translate(26%, -18%) rotate(66deg) scale(1.02)";
    if (gkDive === "center-high") return "translate(-50%, -116%) scale(1.08)";
    if (gkDive === "stay-center") return "translate(-50%, -44%) scale(1.05)";
    return "translate(-50%, -50%)";
  };

  // Trajetória e Escala 3D da Bola
  const getBallStyle = (): React.CSSProperties => {
    if (!isKicking && !outcome) {
      return {
        left: "50%",
        top: "86%",
        transform: "translate(-50%, -50%) scale(1)",
        transition: "none"
      };
    }

    const target = SHOT_ZONES.find(z => z.id === selectedZone)!;

    if (outcome && outcome.outcomeType === "woodwork") {
      return {
        left: `${target.x}%`,
        top: `${Math.max(12, target.y - 4)}%`,
        transform: "translate(-50%, -50%) scale(0.48) rotate(720deg)",
        transition: "all 0.65s cubic-bezier(0.12, 0.8, 0.32, 1)"
      };
    }

    return {
      left: `${target.x}%`,
      top: `${target.y}%`,
      transform: "translate(-50%, -50%) scale(0.42) rotate(840deg)",
      transition: "all 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090a0f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto ring-1 ring-white/5">
        
        {/* HEADER: MINIMALISTA & DIRETO */}
        <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/[0.07] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                Pênalti do Presidente
              </span>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-[11px] font-mono font-medium text-amber-400/90 truncate">
                {isPracticeMode ? "Modo Treino" : `${presidentName} (${minute}')`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Placar em Partida Real */}
            {!isPracticeMode && (
              <div className="px-2.5 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono font-bold text-white tracking-wider">
                {isHome ? `${currentHomeScore} - ${currentAwayScore}` : `${currentAwayScore} - ${currentHomeScore}`}
              </div>
            )}

            {/* Mute Áudio */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors btn-press"
              title={isMuted ? "Ativar Áudio" : "Mutar Áudio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Sair ou Pular */}
            {isPracticeMode ? (
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors btn-press"
              >
                Sair
              </button>
            ) : onSkip && !outcome && (
              <button
                type="button"
                onClick={onSkip}
                className="text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Pular cobrança"
              >
                Pular
              </button>
            )}
          </div>
        </div>

        {/* ARENA: A TRAVE, A BOLA E O GOLEIRO */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[340px] bg-gradient-to-b from-[#06090e] via-[#07130f] to-[#041009] overflow-hidden select-none border-b border-white/[0.07]">
          {/* Luzes ambiente sutis */}
          <div className="absolute top-0 left-1/4 w-72 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Gramado / Perspectiva */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "radial-gradient(ellipse at bottom, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0.85) 75%)"
            }}
          />

          {/* Marca penal na cal */}
          <div className="absolute top-[86%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none" />

          {/* ═══════════════════════════════════════════════ */}
          {/* A TRAVE (GOALPOST & NET) */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="absolute top-7 sm:top-8 inset-x-6 sm:inset-x-12 bottom-12 z-10 pointer-events-none">
            {/* Sombra da Trave no Chão */}
            <div className="absolute bottom-0 inset-x-2 h-3 bg-black/60 blur-md rounded-full pointer-events-none" />

            {/* Rede do Gol com Profundidade */}
            <svg
              className={cn(
                "absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300",
                outcome?.isGoal && "animate-[pulse_0.4s_ease-out]"
              )}
              preserveAspectRatio="none"
              viewBox="0 0 600 300"
            >
              <defs>
                <pattern id="netMesh" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path
                    d="M 14 0 L 0 0 0 14"
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="0.75"
                  />
                  <path
                    d="M 0 0 L 14 14"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                  />
                </pattern>
                <linearGradient id="netShade" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.85)" />
                  <stop offset="60%" stopColor="rgba(0,0,0,0.4)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
                </linearGradient>
              </defs>

              <polygon points="50,20 550,20 580,285 20,285" fill="url(#netShade)" />
              <polygon points="50,20 550,20 580,285 20,285" fill="url(#netMesh)" />
              <line x1="20" y1="285" x2="580" y2="285" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            </svg>

            {/* Estrutura Tubular Branca da Trave */}
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              outcome?.outcomeType === "woodwork" && "animate-bounce"
            )}>
              {/* Travessão */}
              <div
                className="absolute top-0 inset-x-0 h-3 sm:h-3.5 rounded-t-sm"
                style={{
                  background: "linear-gradient(to bottom, #ffffff 0%, #e2e8f0 50%, #64748b 100%)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.9)"
                }}
              />
              {/* Poste Esquerdo */}
              <div
                className="absolute top-0 left-0 bottom-0 w-3 sm:w-3.5 rounded-l-sm"
                style={{
                  background: "linear-gradient(to right, #ffffff 0%, #e2e8f0 50%, #64748b 100%)",
                  boxShadow: "3px 0 8px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.9)"
                }}
              />
              {/* Poste Direito */}
              <div
                className="absolute top-0 right-0 bottom-0 w-3 sm:w-3.5 rounded-r-sm"
                style={{
                  background: "linear-gradient(to left, #ffffff 0%, #e2e8f0 50%, #64748b 100%)",
                  boxShadow: "-3px 0 8px rgba(0,0,0,0.5), inset -1px 0 1px rgba(255,255,255,0.9)"
                }}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* O GOLEIRO ADVERSÁRIO (PROFESSIONAL ATHLETE FIGURE) */}
          {/* ═══════════════════════════════════════════════ */}
          <div
            className="absolute z-20 pointer-events-none transition-transform duration-500 ease-out"
            style={{
              left: "50%",
              top: "54%",
              transform: getKeeperTransform(),
              transformOrigin: "center 85%"
            }}
          >
            <GoalkeeperAthlete
              dive={gkDive}
              gkName={oppGk.name}
              gkOvr={oppGk.ovr}
              photo={oppGk.photo}
              teamLogo={oppGk.teamLogo}
            />
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* ZONAS DE MIRA MINIMALISTAS NO GOL */}
          {/* ═══════════════════════════════════════════════ */}
          {!isKicking && !outcome && (
            <div className="absolute top-7 sm:top-8 inset-x-6 sm:inset-x-12 bottom-12 z-30 pointer-events-none">
              {SHOT_ZONES.map(zone => {
                const isSelected = selectedZone === zone.id;
                return (
                  <div
                    key={zone.id}
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedZone(zone.id);
                        penaltySound.playKick("cavadinha");
                      }}
                      onDoubleClick={() => executeShot(zone.id, selectedStyle)}
                      className={cn(
                        "relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer group btn-press",
                        isSelected
                          ? "bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105"
                          : "bg-black/30 hover:bg-white/15 border border-white/20 hover:border-white/50"
                      )}
                      title={`${zone.label} • Clique para mirar`}
                    >
                      {/* Retícula Crosshair */}
                      <div className={cn(
                        "transition-all duration-150 flex items-center justify-center",
                        isSelected ? "text-amber-300 scale-110" : "text-white/40 group-hover:text-white/80"
                      )}>
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        ) : (
                          <Crosshair className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Micro Tag de Indicação Apenas no Alvo Ativo */}
                    {isSelected && (
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/90 border border-amber-400/40 text-[9px] font-mono font-bold text-amber-300 uppercase whitespace-nowrap shadow-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        {zone.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* A BOLA NA CAL */}
          {/* ═══════════════════════════════════════════════ */}
          <div
            className="absolute z-40 pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]"
            style={getBallStyle()}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-zinc-900 shadow-xl flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <polygon points="50,30 68,43 61,65 39,65 32,43" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                <path d="M 50 30 L 50 0 M 68 43 L 100 35 M 61 65 L 85 100 M 39 65 L 15 100 M 32 43 L 0 35" stroke="#18181b" strokeWidth="3" />
                <polygon points="46,50 44,44 48,46 50,42 52,46 56,44 54,50" fill="#f59e0b" />
              </svg>
            </div>
          </div>

          {/* DIALOG DE RESULTADO */}
          {outcome && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="max-w-sm w-full p-5 rounded-2xl bg-[#0c0d12] border border-white/15 text-center shadow-2xl space-y-3 transform transition-all duration-200 animate-in zoom-in-95">
                {outcome.isGoal ? (
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-tight">
                      GOOOOOOL!
                    </h3>
                    <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                      {presidentName} converteu com perfeição!
                    </p>
                  </div>
                ) : outcome.outcomeType === "woodwork" ? (
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-orange-400 uppercase tracking-tight">
                      NA TRAVE!
                    </h3>
                    <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                      A bola bateu no poste e saiu!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-rose-400 uppercase tracking-tight">
                      DEFENDEU O GOLEIRO!
                    </h3>
                    <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                      {oppGk.name} interceptou a cobrança!
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                  {outcome.description}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  {isPracticeMode ? (
                    <>
                      <Button
                        variant="brand"
                        onClick={() => {
                          setOutcome(null);
                          setIsKicking(false);
                          setGkDive("idle");
                        }}
                        className="btn-press w-full sm:w-auto text-xs font-black uppercase tracking-wider rounded-xl h-9 px-4"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Bater Novamente
                      </Button>
                      <Button
                        variant="glass"
                        onClick={onClose}
                        className="btn-press w-full sm:w-auto text-xs font-semibold uppercase tracking-wider rounded-xl h-9 px-4 border-white/10"
                      >
                        Concluir Treino
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="brand"
                      onClick={handleConfirmAndClose}
                      className="btn-press w-full text-xs font-black uppercase tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-amber-400/25"
                    >
                      Continuar Partida {autoContinueSec !== null && `(${autoContinueSec}s)`}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES: DOCK COMPACTO E UNIFICADO */}
        <div className="p-3 sm:p-4 bg-[#07080c] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Alvo Atual */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">
                Alvo Selecionado
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-tight block truncate">
                {currentZoneConfig.label}
              </span>
            </div>
          </div>

          {/* Segmented: Estilo do Chute */}
          <div className="flex items-center gap-1 bg-black/50 border border-white/10 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              disabled={isKicking || outcome !== null}
              onClick={() => setSelectedStyle("colocada")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 btn-press disabled:opacity-50",
                selectedStyle === "colocada"
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Target className="w-3 h-3 text-emerald-400" /> Colocada
            </button>

            <button
              type="button"
              disabled={isKicking || outcome !== null}
              onClick={() => setSelectedStyle("bomba")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 btn-press disabled:opacity-50",
                selectedStyle === "bomba"
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Flame className="w-3 h-3 text-orange-400" /> Bomba
            </button>

            <button
              type="button"
              disabled={isKicking || outcome !== null}
              onClick={() => setSelectedStyle("cavadinha")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 btn-press disabled:opacity-50",
                selectedStyle === "cavadinha"
                  ? "bg-amber-400 text-black font-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Crown className="w-3 h-3 text-amber-300" /> Cavadinha
            </button>
          </div>

          {/* Botão de Chute */}
          <Button
            variant="brand"
            disabled={isKicking || outcome !== null}
            onClick={() => executeShot(selectedZone, selectedStyle)}
            className="w-full sm:w-auto px-6 h-10 text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-amber-400/20 btn-press shrink-0 flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isKicking ? "CHUTANDO..." : "BATER PÊNALTI"}
          </Button>
        </div>
      </div>
    </div>
  );
}
