"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { SimulatedTeam, getTeamGoalkeeper } from "@/lib/match-simulator";
import { penaltySound } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Crown,
  Volume2,
  VolumeX,
  Target,
  Crosshair,
  ArrowRight,
  Zap
} from "lucide-react";

export type ShotZone =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
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
  x: number; // percentage in goal
  y: number; // percentage in goal
  description: string;
  postRisk: number;
}

export const SHOT_ZONES: ZoneConfig[] = [
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
    id: "top-right",
    label: "Gaveta Direita",
    tag: "Ângulo Dir.",
    x: 82,
    y: 22,
    description: "Indefensável no ângulo superior direito.",
    postRisk: 0.08
  },
  {
    id: "center",
    label: "Meio Alto",
    tag: "Centro",
    x: 50,
    y: 38,
    description: "Chute forte e alto no centro da meta.",
    postRisk: 0.03
  },
  {
    id: "bottom-left",
    label: "Canto Esquerdo",
    tag: "Rasteiro Esq.",
    x: 18,
    y: 74,
    description: "Rasteiro e firme no canto esquerdo.",
    postRisk: 0.05
  },
  {
    id: "bottom-right",
    label: "Canto Direito",
    tag: "Rasteiro Dir.",
    x: 82,
    y: 74,
    description: "Rasteiro e firme no canto direito.",
    postRisk: 0.05
  }
];

/**
 * Ilustração Vetorial Profissional do Goleiro da Kings League.
 * Figura com proporções anatômicas reais de atleta (alto, ombros largos e pernas compridas),
 * luvas oficiais de alta aderência voltadas para a frente com dedos abertos em posição de prontidão,
 * e uniforme oficial com o escudo do time adversário no peito.
 */
function GoalkeeperAthlete({
  dive,
  teamLogo
}: {
  dive: string;
  teamLogo?: string | null;
}) {
  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      <svg
        viewBox="0 0 160 216"
        className="w-36 h-48 sm:w-44 sm:h-56 drop-shadow-[0_16px_28px_rgba(0,0,0,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sombra no gramado */}
          <radialGradient id="turfShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.75)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Gradiente da Camisa de Goleiro Kings League (Volt & Esmeralda) */}
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

          {/* Luvas Profissionais: Palma de Látex Branco */}
          <linearGradient id="gkPalmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Luvas Profissionais: Dorso Laranja Neon & Carbono */}
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

          {/* Recorte Circular do Escudo no Peito */}
          <clipPath id="gkChestCrestClip">
            <circle cx="80" cy="72" r="8.5" />
          </clipPath>

          {/* Molde Oficial da Luva de Goleiro (Proporção Real de Luva Profissional) */}
          <g id="officialGkGlove">
            {/* Dorso protetor externo em laranja neon */}
            <path
              d="M 15 62 Q 10 52 12 43 Q 16 38 23 40 Q 28 44 26 63 Z"
              fill="url(#gkBackhandGrad)"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Palma principal em látex branco de alta aderência */}
            <path
              d="M 16 61 Q 13 52 14 45 Q 19 41 23 44 Q 26 50 25 61 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            {/* Sulcos ergonômicos da palma */}
            <path d="M 16 53 Q 19 55 23 52" stroke="#cbd5e1" strokeWidth="0.8" fill="none" />
            <path d="M 17 58 Q 20 59 23 57" stroke="#cbd5e1" strokeWidth="0.8" fill="none" />

            {/* Dedo Polegar (interno, voltado para o corpo) */}
            <path
              d="M 24 53 Q 29 50 31 48 Q 30 45 27 46 Q 24 48 23 51 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <path d="M 28 47 L 30 49" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" />

            {/* Dedo Indicador */}
            <path
              d="M 22 45 L 23 35 Q 21 32 18 33 L 19 44 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <circle cx="20.5" cy="34.5" r="1" fill="#a3e635" />

            {/* Dedo Médio (o mais longo) */}
            <path
              d="M 19 44 L 18 31 Q 16 28 13 29 L 15 43 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <circle cx="15.5" cy="30.5" r="1" fill="#a3e635" />

            {/* Dedo Anelar */}
            <path
              d="M 15 44 L 13 34 Q 11 31 8 33 L 11 45 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <circle cx="10.5" cy="33.5" r="1" fill="#a3e635" />

            {/* Dedo Mínimo (externo) */}
            <path
              d="M 11 46 L 8 38 Q 6 36 4 38 L 7 48 Z"
              fill="url(#gkPalmGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <circle cx="6" cy="38" r="0.9" fill="#a3e635" />
          </g>
        </defs>

        {/* 1. Sombra no gramado */}
        <ellipse
          cx="80"
          cy="204"
          rx={dive !== "idle" ? "26" : "44"}
          ry={dive !== "idle" ? "3.5" : "6"}
          fill="url(#turfShadow)"
          className="transition-all duration-300"
        />

        {/* 2. Chuteiras Modernas de Campo com Travas de Alumínio */}
        {/* Chuteira Esquerda */}
        <g id="leftBoot">
          <path
            d="M 50 196 Q 46 201 54 204 L 72 203 Q 75 198 70 195 Z"
            fill="url(#gkBootsGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          <circle cx="52" cy="204" r="1.3" fill="#a3e635" />
          <circle cx="60" cy="204" r="1.3" fill="#a3e635" />
          <circle cx="69" cy="203.5" r="1.3" fill="#a3e635" />
          <path d="M 54 199 Q 62 197 70 201" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Chuteira Direita */}
        <g id="rightBoot">
          <path
            d="M 110 196 Q 114 201 106 204 L 88 203 Q 85 198 90 195 Z"
            fill="url(#gkBootsGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          <circle cx="108" cy="204" r="1.3" fill="#a3e635" />
          <circle cx="100" cy="204" r="1.3" fill="#a3e635" />
          <circle cx="91" cy="203.5" r="1.3" fill="#a3e635" />
          <path d="M 106 199 Q 98 197 90 201" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* 3. Pernas e Meiões Longos e Fortes (Proporção Real de Atleta de 1,90m) */}
        {/* Meião Esquerdo */}
        <path
          d="M 54 132 Q 52 162 54 196 L 72 195 Q 73 162 74 132 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1"
        />
        <path d="M 53 154 L 73 154" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 53.5 160 L 72.5 160" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

        {/* Meião Direito */}
        <path
          d="M 106 132 Q 108 162 106 196 L 88 195 Q 87 162 86 132 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1"
        />
        <path d="M 107 154 L 87 154" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 106.5 160 L 87.5 160" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

        {/* 4. Calção Acolchoado com Corte Anatômico Profissional */}
        <path
          d="M 57 102 Q 80 105 103 102 L 108 134 L 86 134 Q 80 122 74 134 L 52 134 Z"
          fill="url(#gkShortsGrad)"
          stroke="#334155"
          strokeWidth="1"
        />
        <path d="M 53 108 L 54 131" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 107 108 L 106 131" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 74 132 L 86 132" stroke="#020617" strokeWidth="2" />

        {/* 5. Tronco Atlético em V-Taper (Ombros Largos, Cintura Fina) */}
        <path
          d="M 48 50 Q 80 54 112 50 L 104 104 Q 80 107 56 104 Z"
          fill="url(#gkKitGrad)"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Recortes laterais ergonômicos respiráveis */}
        <path d="M 48 50 Q 56 76 56 104" stroke="#090d16" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 112 50 Q 104 76 104 104" stroke="#090d16" strokeWidth="3" fill="none" opacity="0.8" />

        {/* Linha peitoral / sombreamento muscular */}
        <path d="M 56 70 Q 80 77 104 70" stroke="rgba(0,0,0,0.25)" strokeWidth="2" fill="none" />
        <path d="M 80 74 L 80 94" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

        {/* Escudo Oficial do Time ou Coroa Kings League no Peito */}
        {teamLogo ? (
          <g>
            <circle cx="80" cy="72" r="9.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <image
              href={teamLogo}
              x="71"
              y="63"
              width="18"
              height="18"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#gkChestCrestClip)"
            />
          </g>
        ) : (
          <g transform="translate(80, 68) scale(0.65) translate(-12, -10)">
            <polygon points="12,2 15,9 22,5 19,16 5,16 2,5 9,9" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
          </g>
        )}

        {/* Número 1 do Goleiro no Peito */}
        <text
          x="80"
          y="93"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="20"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
        >
          1
        </text>

        {/* Gola V Atlética */}
        <path d="M 70 51 Q 80 60 90 51 L 87 46 Q 80 49 73 46 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />

        {/* 6. Pescoço Forte e Cabeça com Corte Fade e Foco nos Olhos */}
        <path d="M 73 48 L 73 38 Q 80 40 87 38 L 87 48 Z" fill="url(#gkSkinGrad)" />
        <path d="M 76 40 L 76 47" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />
        <path d="M 84 40 L 84 47" stroke="#ea580c" strokeWidth="0.8" opacity="0.5" />

        {/* Cabeça / Queixo / Mandíbula */}
        <path
          d="M 70 29 Q 70 44 80 44 Q 90 44 90 29 Q 90 16 80 16 Q 70 16 70 29 Z"
          fill="url(#gkSkinGrad)"
          stroke="#7c2d12"
          strokeWidth="0.8"
        />

        {/* Orelhas */}
        <ellipse cx="69.5" cy="29" rx="2.2" ry="3.8" fill="url(#gkSkinGrad)" stroke="#9a3412" strokeWidth="0.6" />
        <ellipse cx="90.5" cy="29" rx="2.2" ry="3.8" fill="url(#gkSkinGrad)" stroke="#9a3412" strokeWidth="0.6" />

        {/* Cabelo Atlético com Fade Moderno */}
        <path
          d="M 68 26 Q 69 13 80 12 Q 91 13 92 26 Q 87 21 80 21 Q 73 21 68 26 Z"
          fill="url(#gkHairGrad)"
        />
        <path d="M 69 23 Q 71 18 75 16 L 75 20 Q 71 22 69 26 Z" fill="#27272a" />
        <path d="M 91 23 Q 89 18 85 16 L 85 20 Q 89 22 91 26 Z" fill="#27272a" />

        {/* Olhar Focado e Determinado */}
        <path d="M 73 26 L 78 27.5" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 87 26 L 82 27.5" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="75.5" cy="30" rx="1.8" ry="1.4" fill="#ffffff" />
        <circle cx="75.7" cy="30" r="1.1" fill="#090d16" />
        <ellipse cx="84.5" cy="30" rx="1.8" ry="1.4" fill="#ffffff" />
        <circle cx="84.3" cy="30" r="1.1" fill="#090d16" />
        <path d="M 80 28 L 79 34 L 81.5 34" stroke="#9a3412" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        <path d="M 76 38 Q 80 37 84 38" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" />

        {/* 7. Braços e LUVAS PROFISSIONAIS OFICIAIS (POSIÇÃO DE PRONTIDÃO DE GOLEIRO) */}
        {/* BRAÇO E LUVA ESQUERDA (Palma para frente, na altura do peito, dedos naturais) */}
        <g id="leftArm">
          {/* Manga da Camisa no Bíceps (do ombro ao cotovelo flexionado) */}
          <path
            d="M 46 50 Q 30 58 24 72 L 32 78 Q 40 64 48 60 Z"
            fill="url(#gkKitGrad)"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          {/* Antebraço Atlético (do cotovelo ao punho) */}
          <path
            d="M 24 72 Q 16 64 18 56 L 25 58 Q 23 66 32 78 Z"
            fill="url(#gkSkinGrad)"
            stroke="#7c2d12"
            strokeWidth="0.8"
          />
          {/* Munhequeira / Cinta de Fechamento da Luva com fecho volt */}
          <path
            d="M 16 57 L 26 59 L 25 64 L 15 62 Z"
            fill="#090d16"
            stroke="#a3e635"
            strokeWidth="1"
          />

          {/* Luva de Goleiro Oficial */}
          <use href="#officialGkGlove" />
        </g>

        {/* BRAÇO E LUVA DIREITA (Espelhamento Anatômico Perfeito) */}
        <g id="rightArm" transform="translate(160, 0) scale(-1, 1)">
          {/* Manga da Camisa no Bíceps */}
          <path
            d="M 46 50 Q 30 58 24 72 L 32 78 Q 40 64 48 60 Z"
            fill="url(#gkKitGrad)"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          {/* Antebraço Atlético */}
          <path
            d="M 24 72 Q 16 64 18 56 L 25 58 Q 23 66 32 78 Z"
            fill="url(#gkSkinGrad)"
            stroke="#7c2d12"
            strokeWidth="0.8"
          />
          {/* Munhequeira / Cinta de Fechamento da Luva */}
          <path
            d="M 16 57 L 26 59 L 25 64 L 15 62 Z"
            fill="#090d16"
            stroke="#a3e635"
            strokeWidth="1"
          />

          {/* Luva de Goleiro Oficial */}
          <use href="#officialGkGlove" />
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
  minute = 25,
  isPracticeMode = false,
  onResolve,
  onClose,
  onSkip
}: PresidentPenaltyModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShotZone>("top-left");
  const [isKicking, setIsKicking] = useState(false);
  const [outcome, setOutcome] = useState<PenaltyResolutionPayload | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [gkDive, setGkDive] = useState<string>("idle");
  const [autoContinueSec, setAutoContinueSec] = useState<number | null>(null);

  // Identificação do Presidente e Goleiro
  const presidentName = useMemo(() => {
    return userTeam.presidents || "Presidente";
  }, [userTeam]);

  const oppGk = useMemo(() => {
    const { player, ovr } = getTeamGoalkeeper(opponent);
    return {
      name: player?.shortName || "Goleiro",
      ovr: ovr || 82,
      photo: player?.image?.url || null,
      teamLogo: opponent.logo || null
    };
  }, [opponent]);

  // Montagem segura no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedZone("top-left");
      setIsKicking(false);
      setOutcome(null);
      setGkDive("idle");
      setAutoContinueSec(null);
    }
  }, [isOpen]);

  // Sons de apito ao abrir o modal
  useEffect(() => {
    if (isOpen && !outcome) {
      penaltySound.playWhistle();
    }
  }, [isOpen, outcome]);

  // Animação da Barra de Timing via requestAnimationFrame
  const needlePosRef = useRef(50);
  const needleDirectionRef = useRef(1); // 1 = direita, -1 = esquerda
  const animFrameIdRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [frozenPos, setFrozenPos] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || isKicking || outcome !== null) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    setFrozenPos(null);
    let lastTimestamp = performance.now();
    const speed = 0.088; // velocidade refinada para reflexo justo e emocionante

    const step = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      needlePosRef.current += needleDirectionRef.current * speed * delta;

      if (needlePosRef.current >= 100) {
        needlePosRef.current = 100;
        needleDirectionRef.current = -1;
      } else if (needlePosRef.current <= 0) {
        needlePosRef.current = 0;
        needleDirectionRef.current = 1;
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${needlePosRef.current}%`;
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isOpen, isKicking, outcome]);

  const stopBarAnimation = useCallback((): number => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    const finalPos = Math.max(0, Math.min(100, needlePosRef.current));
    setFrozenPos(finalPos);
    return finalPos;
  }, []);

  // Coordenadas das defesas do goleiro para a bola se conectar
  const getSavedBallCoords = (dive: string) => {
    switch (dive) {
      case "top-left":
        return { x: 24, y: 26 };
      case "bottom-left":
        return { x: 24, y: 70 };
      case "top-right":
        return { x: 76, y: 26 };
      case "bottom-right":
        return { x: 76, y: 70 };
      case "center-high":
        return { x: 50, y: 36 };
      default:
        return { x: 50, y: 52 };
    }
  };

  // Disparo do Pênalti com Físicas Reais e Resolução Justa
  const handleKick = useCallback(() => {
    if (isKicking || outcome) return;
    const timingPos = stopBarAnimation();
    setIsKicking(true);

    // Determinar precisão do chute com base na barra:
    // Verde (Sweet Spot central): 42 a 58%
    // Amarelo (Bom): 22 a 42% e 58 a 78%
    // Vermelho (Erro): 0 a 22% e 78 a 100%
    let quality: "green" | "yellow" | "red" = "red";
    if (timingPos >= 42 && timingPos <= 58) {
      quality = "green";
    } else if ((timingPos >= 22 && timingPos < 42) || (timingPos > 58 && timingPos <= 78)) {
      quality = "yellow";
    } else {
      quality = "red";
    }

    penaltySound.playKick(quality === "green" ? "bomba" : "normal");

    const targetConfig = SHOT_ZONES.find(z => z.id === selectedZone)!;

    // 1. Decisão do Goleiro Adversário
    const gkPredictSkill = Math.min(0.58, 0.28 + (oppGk.ovr - 70) * 0.008);
    const gkGuessesSide = Math.random() < gkPredictSkill;

    let chosenDive: string;
    if (gkGuessesSide) {
      if (selectedZone === "top-left") chosenDive = Math.random() < 0.65 ? "top-left" : "bottom-left";
      else if (selectedZone === "bottom-left") chosenDive = Math.random() < 0.65 ? "bottom-left" : "top-left";
      else if (selectedZone === "top-right") chosenDive = Math.random() < 0.65 ? "top-right" : "bottom-right";
      else if (selectedZone === "bottom-right") chosenDive = Math.random() < 0.65 ? "bottom-right" : "top-right";
      else chosenDive = Math.random() < 0.5 ? "center-high" : "stay-center";
    } else {
      const wrongDives = ["top-left", "bottom-left", "top-right", "bottom-right"].filter(d => {
        if (selectedZone.includes("left")) return d.includes("right");
        if (selectedZone.includes("right")) return d.includes("left");
        return true;
      });
      chosenDive = wrongDives[Math.floor(Math.random() * wrongDives.length)] || "bottom-right";
    }

    setGkDive(chosenDive);

    // 2. Cálculo do Resultado
    let outcomeType: "goal" | "saved" | "woodwork" = "goal";
    let isGoal = true;
    let desc = "";

    const sameCorner = (
      (selectedZone === "top-left" && chosenDive === "top-left") ||
      (selectedZone === "bottom-left" && chosenDive === "bottom-left") ||
      (selectedZone === "top-right" && chosenDive === "top-right") ||
      (selectedZone === "bottom-right" && chosenDive === "bottom-right") ||
      (selectedZone === "center" && (chosenDive === "center-high" || chosenDive === "stay-center"))
    );

    if (quality === "green") {
      // Chute no verde (Precisão máxima)
      if (sameCorner) {
        if (Math.random() < 0.22) {
          outcomeType = "saved";
          isGoal = false;
          desc = `MILAGRE! ${oppGk.name} voou no ângulo e tocou com a ponta dos dedos!`;
        } else {
          outcomeType = "goal";
          isGoal = true;
          desc = `GOLAÇO INDEFENSÁVEL! ${presidentName} acertou em cheio na ${targetConfig.label}! O goleiro até pulou certo, mas a força e precisão foram perfeitas!`;
        }
      } else {
        outcomeType = "goal";
        isGoal = true;
        desc = `GOOOOOOOL! Cobrança perfeita no verde! ${presidentName} deslocou completamente ${oppGk.name}!`;
      }
    } else if (quality === "yellow") {
      // Chute no amarelo (Bom)
      if (sameCorner) {
        if (Math.random() < 0.65) {
          outcomeType = "saved";
          isGoal = false;
          desc = `DEFENDEU! ${oppGk.name} adivinhou o canto e espalmou a batida firme de ${presidentName}!`;
        } else {
          outcomeType = "goal";
          isGoal = true;
          desc = `GOOOOL! ${presidentName} mandou firme na ${targetConfig.label}, o goleiro tocou de raspão mas a bola estufou as redes!`;
        }
      } else {
        outcomeType = "goal";
        isGoal = true;
        desc = `GOOOL! ${presidentName} bateu na ${targetConfig.label} com o goleiro caindo para o outro lado!`;
      }
    } else {
      // Chute no vermelho (Erro no tempo)
      const woodworkChance = targetConfig.postRisk * 2.2;
      if (Math.random() < woodworkChance) {
        outcomeType = "woodwork";
        isGoal = false;
        desc = `💥 NA TRAVE! ${presidentName} errou o tempo da batida e a bola explodiu no poste!`;
      } else if (sameCorner || Math.random() < 0.62) {
        outcomeType = "saved";
        isGoal = false;
        desc = `DEFESA TRANQUILA! Batida sem força no vermelho, ${oppGk.name} segurou firme nos braços!`;
      } else {
        outcomeType = "goal";
        isGoal = true;
        desc = `GOOOOL! Mesmo pegando mal na bola, ${presidentName} contou com a sorte e ela morreu no canto da meta!`;
      }
    }

    // 3. Efeitos sonoros sincronizados (~650ms)
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
        shotZone: selectedZone,
        shotStyle: quality === "green" ? "bomba" : "colocada",
        description: desc
      });
      setIsKicking(false);
    }, 650);
  }, [isKicking, outcome, stopBarAnimation, selectedZone, oppGk, presidentName]);

  // Atalho de Teclado: Espaço ou Enter para Bater
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleKick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKick]);

  // Temporizador de auto-avanço após cobrança
  useEffect(() => {
    if (outcome && !isPracticeMode) {
      setAutoContinueSec(6);
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

  if (!isOpen || !isMounted) return null;

  const handleToggleMute = () => {
    const muted = penaltySound.toggleMute();
    setIsMuted(muted);
  };

  const handleConfirmAndClose = () => {
    if (outcome) {
      onResolve(outcome);
    } else if (onClose) {
      onClose();
    }
  };

  const currentZoneConfig = SHOT_ZONES.find(z => z.id === selectedZone)!;

  // Animação e Física Real do Goleiro
  const getKeeperTransform = () => {
    if (gkDive === "idle") return "translate(-50%, -50%) scale(1)";
    if (gkDive === "top-left") return "translate(-112%, -84%) rotate(-36deg) scale(1.04)";
    if (gkDive === "bottom-left") return "translate(-116%, -12%) rotate(-54deg) scale(1.02)";
    if (gkDive === "top-right") return "translate(12%, -84%) rotate(36deg) scale(1.04)";
    if (gkDive === "bottom-right") return "translate(16%, -12%) rotate(54deg) scale(1.02)";
    if (gkDive === "center-high") return "translate(-50%, -92%) scale(1.06)";
    if (gkDive === "stay-center") return "translate(-50%, -46%) scale(1.03)";
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
        top: `${Math.max(10, target.y - 6)}%`,
        transform: "translate(-50%, -50%) scale(0.48) rotate(720deg)",
        transition: "all 0.65s cubic-bezier(0.12, 0.8, 0.32, 1)"
      };
    }

    if (outcome && outcome.outcomeType === "saved") {
      const savedCoords = getSavedBallCoords(gkDive);
      return {
        left: `${savedCoords.x}%`,
        top: `${savedCoords.y}%`,
        transform: "translate(-50%, -50%) scale(0.44) rotate(720deg)",
        transition: "all 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      };
    }

    return {
      left: `${target.x}%`,
      top: `${target.y}%`,
      transform: "translate(-50%, -50%) scale(0.42) rotate(840deg)",
      transition: "all 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090a0f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto ring-1 ring-white/5">
        
        {/* HEADER OFICIAL KINGS LEAGUE (EXATAMENTE COMO NA IMAGEM 2) */}
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

            {/* Pular Cobrança */}
            {onSkip && !outcome && (
              <button
                type="button"
                onClick={onSkip}
                className="text-[11px] font-medium text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
                title="Pular cobrança"
              >
                Pular
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ARENA: A TRAVE DE VERDADE, A BOLA E O GOLEIRO (SEM NEON)       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[340px] bg-gradient-to-b from-[#06090e] via-[#07130f] to-[#041009] overflow-hidden select-none border-b border-white/[0.07]">
          {/* Luzes ambiente sutis de estádio */}
          <div className="absolute top-0 left-1/4 w-72 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Gramado com profundidade e perspectiva */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "radial-gradient(ellipse at bottom, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0.85) 75%)"
            }}
          />

          {/* Ponto penal na cal oficial */}
          <div className="absolute top-[86%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* A TRAVE DE VERDADE (TUBULAR METÁLICA COM REDE 3D)              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="absolute top-7 sm:top-8 inset-x-6 sm:inset-x-12 bottom-12 z-10 pointer-events-none">
            {/* Sombra da Trave no Gramado */}
            <div className="absolute bottom-0 inset-x-2 h-3 bg-black/60 blur-md rounded-full pointer-events-none" />

            {/* Rede do Gol com Profundidade 3D */}
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

            {/* Estrutura Tubular Branca da Trave Real (Travessão e Traves) */}
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* O GOLEIRO ADVERSÁRIO (COM LUVAS E CORPO DE ATLETA REAL)        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            className="absolute z-20 pointer-events-none transition-transform duration-500 ease-out"
            style={{
              left: "50%",
              top: "50%",
              transform: getKeeperTransform(),
              transformOrigin: "center 88%"
            }}
          >
            <GoalkeeperAthlete
              dive={gkDive}
              teamLogo={oppGk.teamLogo}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* OS 5 ALVOS DE MIRA NO GOL (EXATAMENTE COMO NA IMAGEM 2)        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
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
                      className={cn(
                        "relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer group",
                        isSelected
                          ? "bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-105"
                          : "bg-black/30 hover:bg-white/15 border border-white/20 hover:border-white/50"
                      )}
                      title={`${zone.label} • Clique para mirar`}
                    >
                      {/* Retícula Crosshair ou Ponto Ativo Dourado */}
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

                    {/* Badge Dourada Elegante Apenas no Alvo Ativo */}
                    {isSelected && (
                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-amber-400/40 text-[9px] font-mono font-bold text-amber-300 uppercase whitespace-nowrap shadow-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        {zone.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* A BOLA OFICIAL KINGS LEAGUE NA MARCA DO PÊNALTI               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div
            className="absolute z-40 pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)]"
            style={getBallStyle()}
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-zinc-900 shadow-2xl flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <polygon points="50,30 68,43 61,65 39,65 32,43" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
                <path d="M 50 30 L 50 0 M 68 43 L 100 35 M 61 65 L 85 100 M 39 65 L 15 100 M 32 43 L 0 35" stroke="#18181b" strokeWidth="3" />
                <polygon points="46,50 44,44 48,46 50,42 52,46 56,44 54,50" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO INFERIOR: BARRA DE TIMING + BATER OU RESULTADO           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {outcome === null ? (
          <div className="p-4 sm:p-5 bg-[#07080c] space-y-3.5">
            {/* A BARRA DE TIMING PADRONIZADA COM AS CORES OFICIAIS DO PROJETO */}
            <div className="w-[94%] sm:w-[86%] max-w-sm sm:max-w-md mx-auto">
              <div
                style={{
                  height: "28px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  backgroundColor: "rgba(10, 11, 16, 0.95)",
                  boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "stretch",
                  position: "relative",
                  overflow: "hidden",
                  userSelect: "none"
                }}
              >
                {/* Segmento Rose Oficial Esquerdo (0% a 22%) */}
                <div
                  style={{
                    width: "22%",
                    background: "linear-gradient(180deg, rgba(244, 63, 94, 0.85) 0%, rgba(190, 18, 60, 0.92) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                  }}
                  className="h-full"
                />
                <div style={{ width: "1px", backgroundColor: "rgba(255, 255, 255, 0.3)" }} className="h-full z-10" />

                {/* Segmento Dourado Oficial Kings League Esquerdo (22% a 42%) */}
                <div
                  style={{
                    width: "20%",
                    background: "linear-gradient(180deg, rgba(251, 191, 36, 0.9) 0%, rgba(244, 175, 35, 0.95) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                  }}
                  className="h-full"
                />
                <div style={{ width: "1px", backgroundColor: "rgba(255, 255, 255, 0.3)" }} className="h-full z-10" />

                {/* Segmento Esmeralda Oficial Central (Sweet Spot: 42% a 58%) */}
                <div
                  style={{
                    width: "16%",
                    background: "linear-gradient(180deg, rgba(52, 211, 153, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 12px rgba(16, 185, 129, 0.5)",
                    position: "relative"
                  }}
                  className="h-full"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                </div>
                <div style={{ width: "1px", backgroundColor: "rgba(255, 255, 255, 0.3)" }} className="h-full z-10" />

                {/* Segmento Dourado Oficial Kings League Direito (58% a 78%) */}
                <div
                  style={{
                    width: "20%",
                    background: "linear-gradient(180deg, rgba(251, 191, 36, 0.9) 0%, rgba(244, 175, 35, 0.95) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                  }}
                  className="h-full"
                />
                <div style={{ width: "1px", backgroundColor: "rgba(255, 255, 255, 0.3)" }} className="h-full z-10" />

                {/* Segmento Rose Oficial Direito (78% a 100%) */}
                <div
                  style={{
                    width: "22%",
                    background: "linear-gradient(180deg, rgba(244, 63, 94, 0.85) 0%, rgba(190, 18, 60, 0.92) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                  }}
                  className="h-full"
                />

                {/* Cursor Móvel de Precisão */}
                <div
                  ref={cursorRef}
                  style={{
                    position: "absolute",
                    top: "-2px",
                    bottom: "-2px",
                    width: "3px",
                    transform: "translateX(-50%)",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.95), 0 0 6px 1px rgba(244, 175, 35, 0.8)",
                    zIndex: 30,
                    pointerEvents: "none",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    left: frozenPos !== null ? `${frozenPos}%` : "50%"
                  }}
                >
                  <div
                    style={{
                      width: "9px",
                      height: "17px",
                      borderRadius: "3px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.7)",
                      border: "1px solid rgba(0, 0, 0, 0.25)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* DOCK DE CONTROLES: ALVO SELECIONADO E BOTÃO BATER PÊNALTI */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {/* Alvo Selecionado */}
              <div className="flex items-center gap-2">
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

              {/* Botão de Cobrança Proeminente Dourado */}
              <button
                type="button"
                onClick={handleKick}
                disabled={isKicking}
                className={cn(
                  "w-full sm:w-56 h-11 bg-[#facc15] hover:bg-[#eab308] active:scale-[0.98] text-black font-black text-sm tracking-wider rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_22px_rgba(250,204,21,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                )}
              >
                <Zap className="w-4 h-4 fill-black" />
                {isKicking ? "CHUTANDO..." : "BATER PÊNALTI"}
              </button>
            </div>
          </div>
        ) : (
          /* PAINEL DE RESULTADO: CAMPO CONTINUA 100% VISÍVEL */
          <div className="p-4 sm:p-5 bg-[#07080c] border-t border-white/[0.07] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Narração e Identificação da Jogada */}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span
                    className={cn(
                      "text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                      outcome.isGoal
                        ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-400"
                        : outcome.outcomeType === "woodwork"
                        ? "bg-amber-500/15 border-amber-400/30 text-amber-400"
                        : "bg-rose-500/15 border-rose-400/30 text-rose-400"
                    )}
                  >
                    {outcome.isGoal ? "GOL!" : outcome.outcomeType === "woodwork" ? "NA TRAVE" : "DEFESA"}
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    {outcome.isGoal
                      ? `${presidentName} converteu com perfeição`
                      : outcome.outcomeType === "woodwork"
                      ? "A bola bateu no poste e saiu"
                      : `${oppGk.name} interceptou a cobrança`}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug font-medium max-w-sm">
                  {outcome.description}
                </p>
              </div>

              {/* Botão Oficial de Continuação */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
                <Button
                  variant="brand"
                  onClick={handleConfirmAndClose}
                  className="btn-press w-full sm:w-auto text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-6 shadow-lg shadow-amber-400/25"
                >
                  Continuar Partida {autoContinueSec !== null && autoContinueSec > 0 && `(${autoContinueSec}s)`}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
