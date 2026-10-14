"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getProxyImageUrl, cn } from "@/lib/utils";
import {
  Trophy,
  Swords,
  HeartCrack,
  Loader2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Dices,
  Shield,
  Check,
  X,
  Zap,
  Filter,
  BarChart3,
  RotateCcw,
  Crown,
  Share2,
  Flame,
  ArrowRight,
  Target,
  Award,
  Medal
} from 'lucide-react';
import KingsLeagueLogo from "@/components/kings-league-logo";
import { AppleEmoji } from "@/components/ui/apple-emoji";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/locale-context";
import {
  SimulatedTeam,
  TeamStanding,
  generateSchedule,
  createInitialStandings,
  updateStandingsWithMatch,
  sortStandings,
  simulateDetailedMatch,
  DetailedMatchResult,
  ShootoutKick,
  MatchEvent
} from "@/lib/match-simulator";

export type SimMode = "manual" | "auto";
export type SimSpeed = "normal" | "fast" | "ultra" | "slow";

interface CampaignUIProps {
  userTeam: SimulatedTeam;
  otherTeams: SimulatedTeam[];
  difficulty: string;
  onResetToDraft?: () => void;
}

type CampaignPhase = "overview" | "match" | "standings" | "playoffs_overview" | "playoffs_match" | "eliminated" | "champion";
type PlayoffStage = "quarterfinals" | "semifinals" | "final" | null;

interface MatchResultDisplay {
  roundLabel: string;
  result: DetailedMatchResult;
  opponent: SimulatedTeam;
  isHome: boolean;
}

const TeamLogo = ({ logo, className }: { logo?: string, className?: string }) => {
  if (!logo) return null;
  if (typeof logo === 'string' && logo.startsWith('<svg')) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: logo }} />;
  }
  return <img src={getProxyImageUrl(logo)} alt="" className={className} />;
};

export function CampaignUI({ userTeam, otherTeams, difficulty, onResetToDraft }: CampaignUIProps) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<CampaignPhase>("overview");
  const [currentRound, setCurrentRound] = useState(1);
  const [standings, setStandings] = useState<Record<string, TeamStanding>>({});
  const [schedule, setSchedule] = useState<{ round: number; matches: { home: SimulatedTeam; away: SimulatedTeam }[] }[]>([]);

  const [playedMatches, setPlayedMatches] = useState<MatchResultDisplay[]>([]);
  const [expandedMatchIndex, setExpandedMatchIndex] = useState<number | null>(null);

  const [playoffStage, setPlayoffStage] = useState<PlayoffStage>(null);
  const [playoffOpponent, setPlayoffOpponent] = useState<SimulatedTeam | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [finalViewTab, setFinalViewTab] = useState<"summary" | "standings">("summary");

  const [simMode, setSimMode] = useState<SimMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("simulator_sim_mode");
      if (saved === "manual" || saved === "auto") return saved as SimMode;
    }
    return "manual";
  });

  const [simSpeed, setSimSpeed] = useState<SimSpeed>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("simulator_sim_speed");
      if (saved === "ultra" || saved === "fast" || saved === "normal" || saved === "slow") return saved as SimSpeed;
    }
    return "normal";
  });

  const handleSimModeChange = (mode: SimMode) => {
    setSimMode(mode);
    localStorage.setItem("simulator_sim_mode", mode);
  };

  const handleSimSpeedChange = (speed: SimSpeed) => {
    setSimSpeed(speed);
    localStorage.setItem("simulator_sim_speed", speed);
  };

  useEffect(() => {
    if (playedMatches.length > 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [playedMatches, phase]);

  useEffect(() => {
    const allTeams = [userTeam, ...otherTeams];
    setStandings(createInitialStandings(allTeams));
    setSchedule(generateSchedule(allTeams));
  }, [userTeam, otherTeams]);

  const simulateNextRound = () => {
    if (currentRound > schedule.length) {
      setExpandedMatchIndex(null);
      setIsPlayingBack(false);
      setPhase("standings");
      return;
    }

    setIsSimulating(true);
    setIsPlayingBack(simSpeed !== "ultra");

    const simDelay = simSpeed === "ultra" ? 80 : 500;

    setTimeout(() => {
      const roundData = schedule[currentRound - 1];
      const newStandings = { ...standings };

      let userMatchDetails: MatchResultDisplay | null = null;

      for (const match of roundData.matches) {
        // Bônus da IA progressivo conforme o campeonato avança (2% por rodada)
        const diffMultiplier = 1.0 + ((currentRound - 1) * 0.02);

        const result = simulateDetailedMatch(match.home, match.away, {
          userTeamId: userTeam.id,
          difficultyMultiplier: diffMultiplier,
          difficultyMode: difficulty
        });
        updateStandingsWithMatch(newStandings, match.home.id, match.away.id, result);

        if (match.home.id === userTeam.id) {
          userMatchDetails = { roundLabel: `RODADA ${currentRound}`, result, opponent: match.away, isHome: true };
        } else if (match.away.id === userTeam.id) {
          userMatchDetails = { roundLabel: `RODADA ${currentRound}`, result, opponent: match.home, isHome: false };
        }
      }

      setStandings(newStandings);
      if (userMatchDetails) {
        setPlayedMatches(prev => {
          setExpandedMatchIndex(prev.length);
          return [...prev, userMatchDetails as MatchResultDisplay];
        });
      }
      setCurrentRound(prev => prev + 1);
      if (simSpeed === "ultra") {
        setIsPlayingBack(false);
      }
      setIsSimulating(false);
    }, simDelay);
  };

  const handleTransitionToPlayoffs = () => {
    const sorted = sortStandings(standings);
    const userPos = sorted.findIndex(r => r.teamId === userTeam.id) + 1;

    if (userPos === 1) {
      setPlayoffStage("semifinals");
      generatePlayoffOpponent("semifinals", sorted);
      setPhase("playoffs_overview");
    } else if (userPos >= 2 && userPos <= 7) {
      setPlayoffStage("quarterfinals");
      generatePlayoffOpponent("quarterfinals", sorted);
      setPhase("playoffs_overview");
    } else {
      setExpandedMatchIndex(null);
      setPhase("eliminated");
    }
  };

  const generatePlayoffOpponent = (stage: PlayoffStage, sortedTable?: TeamStanding[]) => {
    const table = sortedTable || sortStandings(standings);
    let opponentId = "";

    if (stage === "quarterfinals") {
      const userPos = table.findIndex(r => r.teamId === userTeam.id) + 1;
      const opponentPos = 9 - userPos;
      opponentId = table[opponentPos - 1]?.teamId;
    } else if (stage === "semifinals") {
      // Na semifinal, o adversário é um dos 4 primeiros colocados da fase regular
      const valid = table.slice(0, 4).filter(t => t.teamId !== userTeam.id);
      opponentId = (valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : table[0])?.teamId;
    } else if (stage === "final") {
      // Na grande final, o adversário é o outro finalista do topo da tabela
      const valid = table.slice(0, 3).filter(t => t.teamId !== userTeam.id);
      opponentId = valid[0]?.teamId || table[0]?.teamId;
    }

    const opponent = otherTeams.find(t => t.id === opponentId) || otherTeams[0];
    setPlayoffOpponent(opponent);
  };

  const simulatePlayoffMatch = () => {
    if (!playoffOpponent || !playoffStage) return;

    setIsSimulating(true);
    setIsPlayingBack(simSpeed !== "ultra");

    const simDelay = simSpeed === "ultra" ? 80 : 600;

    setTimeout(() => {
      // No Mata-Mata, a dificuldade é ainda maior dependendo da fase
      const diffMultiplier = playoffStage === "quarterfinals" ? 1.25 : playoffStage === "semifinals" ? 1.35 : 1.50;
      let result = simulateDetailedMatch(userTeam, playoffOpponent, {
        userTeamId: userTeam.id,
        difficultyMultiplier: diffMultiplier,
        difficultyMode: difficulty
      });

      const matchDisplay: MatchResultDisplay = {
        roundLabel: playoffStage === "quarterfinals" ? "QUARTAS DE FINAL" : playoffStage === "semifinals" ? "SEMIFINAL" : "GRANDE FINAL",
        result,
        opponent: playoffOpponent,
        isHome: true
      };

      setPlayedMatches(prev => {
        setExpandedMatchIndex(prev.length);
        return [...prev, matchDisplay];
      });
      setPhase("playoffs_match");
      if (simSpeed === "ultra") {
        setIsPlayingBack(false);
      }
      setIsSimulating(false);
    }, simDelay);
  };

  const handleNextPlayoff = () => {
    const lastMatch = playedMatches[playedMatches.length - 1];
    const isWin = lastMatch ? lastMatch.result.winner === (lastMatch.isHome ? "home" : "away") : false;

    if (!isWin) {
      setExpandedMatchIndex(null);
      setPhase("eliminated");
      return;
    }

    if (playoffStage === "quarterfinals") {
      setPlayoffStage("semifinals");
      generatePlayoffOpponent("semifinals");
      setPhase("playoffs_overview");
    } else if (playoffStage === "semifinals") {
      setPlayoffStage("final");
      generatePlayoffOpponent("final");
      setPhase("playoffs_overview");
    } else if (playoffStage === "final") {
      setExpandedMatchIndex(null);
      setPhase("champion");
    }
  };

  const playoffMatchesSummary = useMemo(() => {
    return playedMatches
      .filter(m => m.roundLabel.includes("QUARTAS") || m.roundLabel.includes("SEMIFINAL") || m.roundLabel.includes("FINAL"))
      .map(m => {
        const myScore = m.isHome ? m.result.homeScore : m.result.awayScore;
        const opScore = m.isHome ? m.result.awayScore : m.result.homeScore;
        const soText = m.result.homeShootoutScore !== undefined
          ? ` (${m.isHome ? m.result.homeShootoutScore : m.result.awayShootoutScore}-${m.isHome ? m.result.awayShootoutScore : m.result.homeShootoutScore} SO)`
          : '';
        return {
          roundLabel: m.roundLabel.includes("QUARTAS") ? "Quartas" : m.roundLabel.includes("SEMIFINAL") ? "Semi" : "Final",
          score: `${myScore}x${opScore}${soText}`,
          opponentName: m.opponent.name
        };
      });
  }, [playedMatches]);

  const sortedTable = sortStandings(standings);
  const userRankIndex = sortedTable.findIndex(r => r.teamId === userTeam.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;
  const isDirectSemi = userRank === 1;
  const isQualified = userRank <= 7;

  const handleRestartCampaign = () => {
    const allTeams = [userTeam, ...otherTeams];
    setStandings(createInitialStandings(allTeams));
    setSchedule(generateSchedule(allTeams));
    setPlayedMatches([]);
    setCurrentRound(1);
    setExpandedMatchIndex(null);
    setPlayoffStage(null);
    setPlayoffOpponent(null);
    setIsSimulating(false);
    setIsPlayingBack(false);
    setFinalViewTab("summary");
    setPhase("overview");
  };

  return (
    <div className="liquid-glass-panel rounded-3xl p-6 md:p-8 relative flex flex-col font-sans w-full mx-auto shadow-2xl min-h-[700px] border border-white/[0.08]">
      <header className="border-b border-white/[0.08] pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[11px] font-black tracking-wider uppercase text-white">
              {phase === "playoffs_overview" || phase === "playoffs_match"
                ? `${t.page.campaign.phasePlayoffs} • ${playoffStage === "quarterfinals" ? t.playoffs.quarterfinals : playoffStage === "semifinals" ? t.playoffs.semiAbbr : t.playoffs.grandFinal}`
                : phase === "standings"
                  ? t.page.campaign.phaseStandings
                  : phase === "champion"
                    ? t.page.campaign.phaseChampion
                    : phase === "eliminated"
                      ? t.page.campaign.phaseEliminated
                      : t.page.campaign.phaseGroupRound
                        .replace("{current}", String(Math.min(currentRound, schedule.length || 9)))
                        .replace("{total}", String(schedule.length || 9))}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 text-[11px] font-black text-amber-300 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{userTeam.name}</span>
          </div>
        </div>

        {/* Dock Minimalista Liquid Glass de Controles de Simulação */}
        <div className="flex items-center gap-2 bg-[#090a0f]/90 border border-white/[0.08] rounded-2xl p-1.5 backdrop-blur-xl shadow-lg w-full md:w-auto overflow-x-auto scrollbar-none">
          {/* Segmented: Modo Manual / Auto */}
          <div className="flex items-center bg-black/40 border border-white/[0.06] rounded-xl p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSimModeChange("manual")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all select-none active:scale-95",
                simMode === "manual"
                  ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.14]"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => handleSimModeChange("auto")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all select-none active:scale-95",
                simMode === "auto"
                  ? "bg-amber-400 text-black shadow-sm font-black"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Auto
            </button>
          </div>

          <div className="w-px h-4 bg-white/10 shrink-0" />

          {/* Segmented: Ritmo (Ultra / Rápido / Normal / Lento) */}
          <div className="flex items-center bg-black/40 border border-white/[0.06] rounded-xl p-0.5 shrink-0">
            <button
              type="button"
              title="Resultado Instantâneo"
              onClick={() => handleSimSpeedChange("ultra")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all select-none active:scale-95 flex items-center gap-1",
                simSpeed === "ultra"
                  ? "bg-amber-400 text-black font-black shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Zap className="w-3 h-3" /> Ultra
            </button>
            <button
              type="button"
              onClick={() => handleSimSpeedChange("fast")}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all select-none active:scale-95",
                simSpeed === "fast"
                  ? "bg-white/[0.12] text-white border border-white/[0.14]"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Rápido
            </button>
            <button
              type="button"
              onClick={() => handleSimSpeedChange("normal")}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all select-none active:scale-95",
                simSpeed === "normal"
                  ? "bg-white/[0.12] text-white border border-white/[0.14]"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => handleSimSpeedChange("slow")}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all select-none active:scale-95",
                simSpeed === "slow"
                  ? "bg-white/[0.12] text-white border border-white/[0.14]"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Lento
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative z-10 w-full space-y-6 pb-12">
        {playedMatches.length > 0 && (
          <div className="space-y-4">
            {playedMatches.map((m, idx) => (
              <MatchBox
                key={idx}
                match={m}
                userTeam={userTeam}
                isExpanded={expandedMatchIndex === idx}
                onToggle={() => setExpandedMatchIndex(expandedMatchIndex === idx ? null : idx)}
                simSpeed={simSpeed}
                onPlaybackComplete={idx === playedMatches.length - 1 ? () => {
                  setIsPlayingBack(false);
                  if (simMode === "auto" && phase !== "standings" && phase !== "champion" && phase !== "eliminated") {
                    setTimeout(() => {
                      if (phase === "overview") simulateNextRound();
                      else if (phase === "playoffs_overview" || phase === "playoffs_match") handleNextPlayoff();
                    }, simSpeed === "ultra" ? 0 : 1000);
                  }
                } : undefined}
              />
            ))}
          </div>
        )}

        {phase === "overview" && (
          <div className="flex justify-center pt-6">
            <Button
              variant="brand"
              onClick={() => {
                setIsPlayingBack(false);
                simulateNextRound();
              }}
              disabled={isSimulating}
              className="btn-press inline-flex items-center justify-center gap-2 px-8 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl disabled:opacity-50 h-12 w-full md:w-auto shadow-lg shadow-[var(--team-primary,#F4AF23)]/25 relative z-10"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> SIMULANDO...
                </>
              ) : (
                currentRound <= schedule.length ? `REVELAR ${currentRound}º JOGO` : "VER TABELA FINAL"
              )}
            </Button>
          </div>
        )}

        {phase === "standings" && (
          <div className="animate-in fade-in duration-500 w-full space-y-6">
            <StandingsTableFinal
              standings={sortedTable}
              userTeam={userTeam}
              userRank={userRank}
            />

            {/* Cartão de Ação e Status da Classificação */}
            <div>
              {isDirectSemi ? (
                <div className="liquid-glass-gold rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-400/30 shadow-2xl">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <Crown className="w-7 h-7 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          LÍDER ISOLADO • 1º LUGAR
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                        VAGA DIRETA NA SEMIFINAL!
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                        Campanha histórica! Como líder geral da primeira fase, sua equipe pula as quartas de final e avança diretamente para a semifinal dos playoffs.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="brand"
                    onClick={handleTransitionToPlayoffs}
                    className="btn-press px-8 py-3.5 h-12 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/25 shrink-0 w-full md:w-auto"
                  >
                    <Swords className="w-4 h-4 mr-2" /> AVANÇAR PARA A SEMIFINAL
                  </Button>
                </div>
              ) : isQualified ? (
                <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/[0.08] shadow-2xl">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                      <Swords className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                          {userRank}º LUGAR • CLASSIFICADO G-7
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                        VAGA GARANTIDA NOS PLAYOFFS!
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                        Sua equipe encerrou o campeonato na zona de classificação e disputará as Quartas de Final em confronto eliminatório único.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="brand"
                    onClick={handleTransitionToPlayoffs}
                    className="btn-press px-8 py-3.5 h-12 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/25 shrink-0 w-full md:w-auto"
                  >
                    <Swords className="w-4 h-4 mr-2" /> JOGAR QUARTAS DE FINAL
                  </Button>
                </div>
              ) : (
                <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-rose-500/20 bg-rose-500/[0.02] shadow-2xl">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <HeartCrack className="w-7 h-7 text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {userRank}º LUGAR • FORA DO G-7
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                        CAMPANHA ENCERRADA NA FASE DE GRUPOS
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                        Sua equipe lutou com bravura, mas não alcançou a pontuação para os playoffs. Veja o raio-x completo do seu desempenho.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                    <Button
                      variant="brand"
                      onClick={() => {
                        setFinalViewTab("summary");
                        setPhase("eliminated");
                      }}
                      className="btn-press px-6 py-3.5 h-12 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl w-full sm:w-auto shadow-lg shadow-amber-400/20"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> VER RESUMO DA CAMPANHA
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "playoffs_overview" && (
          <div className="animate-in fade-in duration-500 w-full space-y-6">
            <PlayoffStageTracker currentStage={playoffStage} isCompleted={false} />
            <PlayoffArenaCard
              stage={playoffStage}
              userTeam={userTeam}
              opponent={playoffOpponent}
              playedMatches={playedMatches}
              isSimulating={isSimulating}
              onSimulate={simulatePlayoffMatch}
            />
          </div>
        )}

        {phase === "playoffs_match" && (
          <div className="animate-in fade-in duration-500 w-full space-y-6">
            <PlayoffStageTracker currentStage={playoffStage} isCompleted={false} />
            {isPlayingBack ? (
              <div className="liquid-glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400/25 bg-amber-400/[0.02] shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Partida Eliminatória em Andamento...
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Acompanhe os lances na linha do tempo acima para descobrir o resultado!
                    </span>
                  </div>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    handleSimSpeedChange("ultra");
                    setIsPlayingBack(false);
                  }}
                  className="btn-press text-[10px] font-bold uppercase tracking-wider h-8 px-3 border border-white/10"
                >
                  <Zap className="w-3 h-3 mr-1 text-amber-400" /> Pular Animação
                </Button>
              </div>
            ) : (
              <PlayoffPostMatchCard
                stage={playoffStage}
                lastMatch={playedMatches[playedMatches.length - 1]}
                isSimulating={isSimulating}
                onContinue={() => {
                  setIsPlayingBack(false);
                  handleNextPlayoff();
                }}
              />
            )}
          </div>
        )}

        {(phase === "champion" || phase === "eliminated") && (
          <div className="animate-in fade-in duration-500 w-full space-y-8">
            {/* Header Hero Pod */}
            {phase === "champion" ? (
              <div className="liquid-glass-gold rounded-3xl p-8 sm:p-12 md:p-16 text-center border-2 border-amber-400/50 relative overflow-hidden shadow-2xl bg-gradient-to-b from-amber-400/[0.12] via-amber-500/[0.04] to-black/80">
                {/* Efeitos de Luz e Resplendor da Taça */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-400/30 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Troféu com Halo Radiante */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-amber-300/40 via-amber-500/25 to-black/80 border-2 border-amber-400/70 flex items-center justify-center shadow-[0_0_70px_rgba(244,175,35,0.5)]">
                      <Trophy className="w-14 h-14 sm:w-20 sm:h-20 text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]" />
                      <Crown className="w-8 h-8 text-amber-400 absolute -top-3 -right-1 drop-shadow animate-pulse" />
                    </div>
                  </div>

                  {/* Emblema com Estrela do Campeão */}
                  <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/70 border border-amber-400/50 mb-4 backdrop-blur-md shadow-lg">
                    {userTeam?.logo && (
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] p-1 flex items-center justify-center shrink-0">
                        <TeamLogo logo={userTeam.logo} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>★</span>
                      <span>{userTeam.name}</span>
                      <span>★</span>
                    </span>
                    {userTeam?.presidents && (
                      <span className="text-[10px] text-zinc-400 hidden sm:inline border-l border-white/10 pl-2">
                        Pres. {userTeam.presidents}
                      </span>
                    )}
                  </div>

                  {/* Badge de Glória */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black uppercase tracking-widest mb-3">
                    <Crown className="w-3.5 h-3.5" />
                    TÍTULO SUPREMO DA KINGS LEAGUE
                  </div>

                  {/* Tipografia de Ouro */}
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 uppercase tracking-tight mb-4 drop-shadow-[0_4px_25px_rgba(244,175,35,0.35)]">
                    CAMPEÃO DA KINGS LEAGUE!
                  </h2>

                  <p className="text-xs sm:text-base text-zinc-200 max-w-xl font-medium leading-relaxed mb-6">
                    Glória suprema! O <span className="text-amber-400 font-bold">{userTeam.name}</span> superou todas as batalhas e conquistou a taça mais cobiçada.
                  </p>

                  {/* Caminho no Mata-Mata */}
                  {playoffMatchesSummary.length > 0 && (
                    <div className="w-full max-w-xl mt-2 p-3 sm:p-4 rounded-2xl bg-black/60 border border-amber-400/25 backdrop-blur-md">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-bold block mb-2.5">
                        Trajetória Vencedora no Mata-Mata
                      </span>
                      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                        {playoffMatchesSummary.map((pm, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                            <span className="text-amber-400/80 font-bold">{pm.roundLabel}:</span>
                            <span className="text-white font-mono font-black">{pm.score}</span>
                            <span className="text-[10px] text-zinc-400">vs {pm.opponentName}</span>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 text-center border border-white/[0.08] relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08] text-xs font-black uppercase tracking-widest mb-3">
                    {playoffStage === "final" ? "VICE-CAMPEÃO" : playoffStage === "semifinals" ? "SEMIFINALISTA" : playoffStage === "quarterfinals" ? "QUARTAS DE FINAL" : "FASE DE GRUPOS"}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
                    FIM DA CAMPANHA NO 12 A 0
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                    Confira abaixo o resumo completo do desempenho da sua equipe na competição.
                  </p>
                </div>
              </div>
            )}

            {/* Segmented Liquid Switch */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-black/60 border border-white/[0.08] rounded-2xl p-1.5 backdrop-blur-xl shadow-lg">
                <button
                  type="button"
                  onClick={() => setFinalViewTab("summary")}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none active:scale-95 flex items-center gap-2",
                    finalViewTab === "summary"
                      ? "bg-amber-400 text-black shadow-md font-black"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Resumo da Campanha
                </button>
                <button
                  type="button"
                  onClick={() => setFinalViewTab("standings")}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none active:scale-95 flex items-center gap-2",
                    finalViewTab === "standings"
                      ? "bg-amber-400 text-black shadow-md font-black"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Tabela da Fase de Grupos
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {finalViewTab === "summary" ? (
              <CampaignSummary
                playedMatches={playedMatches}
                userTeam={userTeam}
                isChampion={phase === "champion"}
                playoffStage={playoffStage}
                groupRank={userRank}
                onRestart={handleRestartCampaign}
                onResetToDraft={onResetToDraft}
                onViewStandings={() => setFinalViewTab("standings")}
              />
            ) : (
              <StandingsTableFinal
                standings={sortedTable}
                userTeam={userTeam}
                userRank={userRank}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const BallIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.5" fill="#f4f4f5" stroke="#27272a" strokeWidth="1" />
    <polygon points="12 7.5 15.3 9.9 14 13.8 10 13.8 8.7 9.9" fill="#18181b" stroke="#18181b" strokeWidth="0.5" />
    <line x1="12" y1="2.5" x2="12" y2="7.5" stroke="#18181b" strokeWidth="1" />
    <line x1="21.1" y1="9.1" x2="15.3" y2="9.9" stroke="#18181b" strokeWidth="1" />
    <line x1="17.7" y1="19.7" x2="14" y2="13.8" stroke="#18181b" strokeWidth="1" />
    <line x1="6.3" y1="19.7" x2="10" y2="13.8" stroke="#18181b" strokeWidth="1" />
    <line x1="2.9" y1="9.1" x2="8.7" y2="9.9" stroke="#18181b" strokeWidth="1" />
  </svg>
);

const CrownIcon = ({ className = "w-3.5 h-3.5 text-amber-400" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM5 18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V17H5V18Z" />
  </svg>
);

const StarCardIcon = ({ className = "w-3.5 h-3.5 text-emerald-400" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

const RedCardBadge = () => (
  <span className="w-2.5 h-3.5 rounded-[1.5px] bg-rose-600 border border-rose-400/40 shadow-sm inline-block shrink-0" />
);

const YellowCardBadge = () => (
  <span className="w-2.5 h-3.5 rounded-[1.5px] bg-amber-400 border border-amber-300/40 shadow-sm inline-block shrink-0" />
);

function renderTimelineIcon(ev: MatchEvent) {
  if (ev.type === "goal") {
    if (ev.metadata?.includes("Gol Dobrado") || ev.pointsAdded === 2) {
      return <span className="text-[10px] font-black font-mono text-emerald-400 leading-none">2x</span>;
    }
    return <BallIcon className="w-3.5 h-3.5" />;
  }
  if (ev.type === "matchball") {
    return <BallIcon className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (ev.type === "penalti_presidente") {
    return <CrownIcon className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (ev.type === "carta") {
    return <StarCardIcon className="w-3.5 h-3.5 text-emerald-400" />;
  }
  if (ev.metadata?.includes("Cartão Vermelho") || ev.metadata?.includes("Expulsão")) {
    return <RedCardBadge />;
  }
  if (ev.metadata?.includes("Cartão Amarelo")) {
    return <YellowCardBadge />;
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />;
}

function MatchBox({ match, userTeam, isExpanded, onToggle, simSpeed, onPlaybackComplete }: { match: MatchResultDisplay; userTeam: SimulatedTeam; isExpanded: boolean; onToggle: () => void; simSpeed: SimSpeed; onPlaybackComplete?: () => void }) {
  const { t } = useLocale();
  const { result, opponent, isHome, roundLabel } = match;

  const allEvents = useMemo(() => [...result.homeEvents, ...result.awayEvents].sort((a, b) => a.minute - b.minute), [result]);

  const maxMinute = useMemo(() => {
    if (allEvents.length === 0) return 40;
    return Math.max(40, ...allEvents.map(e => e.minute));
  }, [allEvents]);

  const [currentMinute, setCurrentMinute] = useState(simSpeed === "ultra" ? maxMinute + 1 : 0);
  const [isPlaybackComplete, setIsPlaybackComplete] = useState(simSpeed === "ultra");
  const [activeFilter, setActiveFilter] = useState<"all" | "goals" | "cards" | "presidents" | "shootout">("all");
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (simSpeed === "ultra") {
      setCurrentMinute(maxMinute + 1);
      setIsPlaybackComplete(true);
      if (onPlaybackComplete) onPlaybackComplete();
      return;
    }

    if (currentMinute <= maxMinute) {
      let delay = 100;
      if (simSpeed === "fast") delay = 35;
      else if (simSpeed === "normal") delay = 100;
      else if (simSpeed === "slow") delay = 350;

      const timer = setTimeout(() => {
        setCurrentMinute(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (!isPlaybackComplete) {
      const finalDelay = simSpeed === "fast" ? 200 : 500;
      const timer = setTimeout(() => {
        setIsPlaybackComplete(true);
        if (onPlaybackComplete) onPlaybackComplete();
      }, finalDelay);
      return () => clearTimeout(timer);
    }
  }, [currentMinute, maxMinute, simSpeed, isPlaybackComplete, onPlaybackComplete]);

  useEffect(() => {
    if ((!isExpanded || simSpeed === "ultra") && !isPlaybackComplete) {
      setCurrentMinute(maxMinute + 1);
      setIsPlaybackComplete(true);
      if (onPlaybackComplete) onPlaybackComplete();
    }
  }, [isExpanded, isPlaybackComplete, maxMinute, simSpeed, onPlaybackComplete]);

  const visibleEvents = allEvents.filter(ev => ev.minute <= currentMinute);

  useEffect(() => {
    if (isExpanded && eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = eventsContainerRef.current.scrollHeight;
    }
  }, [visibleEvents.length, isExpanded]);

  let currentHomeScore = 0;
  let currentAwayScore = 0;
  const homeId = isHome ? userTeam.id : opponent.id;

  visibleEvents.forEach(ev => {
    if (ev.type === "goal" || ev.type === "matchball" || (ev.type === "carta" && (ev.metadata?.includes("convertido") || ev.metadata?.includes("Adv. Errou = Gol"))) || (ev.type === "penalti_presidente" && ev.metadata?.includes("(GOL)"))) {
      const val = ev.pointsAdded !== undefined ? ev.pointsAdded : (ev.metadata?.includes("Gol Dobrado") ? 2 : 1);
      if (ev.teamId === homeId) {
        currentHomeScore += val;
      } else {
        currentAwayScore += val;
      }
    }
  });

  const finalMyScore = isHome ? result.homeScore : result.awayScore;
  const finalOpScore = isHome ? result.awayScore : result.homeScore;

  const displayMyScore = isPlaybackComplete ? finalMyScore : (isHome ? currentHomeScore : currentAwayScore);
  const displayOpScore = isPlaybackComplete ? finalOpScore : (isHome ? currentAwayScore : currentHomeScore);

  let myShootoutScore: number | undefined;
  let opShootoutScore: number | undefined;

  if (isPlaybackComplete && result.homeShootoutScore !== undefined && result.awayShootoutScore !== undefined) {
    myShootoutScore = isHome ? result.homeShootoutScore : result.awayShootoutScore;
    opShootoutScore = isHome ? result.awayShootoutScore : result.homeShootoutScore;
  }

  const hasShootout = isPlaybackComplete && result.shootoutKicks && result.shootoutKicks.length > 0;

  let outcome: "win" | "loss" | "draw" | "playing" = "playing";
  if (isPlaybackComplete) {
    if (myShootoutScore !== undefined && opShootoutScore !== undefined) {
      if (myShootoutScore > opShootoutScore) outcome = "win";
      else if (myShootoutScore < opShootoutScore) outcome = "loss";
    } else {
      if (finalMyScore > finalOpScore) outcome = "win";
      else if (finalMyScore < finalOpScore) outcome = "loss";
      else outcome = "draw";
    }
  }

  const outcomeBadgeStyles = {
    win: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    loss: "text-rose-400 bg-rose-500/10 border-rose-500/25",
    draw: "text-zinc-400 bg-zinc-500/10 border-zinc-500/25",
    playing: "text-amber-400 bg-amber-500/10 border-amber-500/25"
  };

  const outcomeColors = {
    win: "text-emerald-400",
    loss: "text-rose-400",
    draw: "text-zinc-400",
    playing: "text-amber-400"
  };

  // Filter visible events based on active tab
  const filteredEvents = useMemo(() => {
    if (activeFilter === "goals") {
      return visibleEvents.filter(ev =>
        ev.type === "goal" ||
        ev.type === "matchball" ||
        (ev.type === "penalti_presidente" && (ev.isSuccess || ev.metadata?.includes("GOL"))) ||
        (ev.type === "carta" && (ev.isSuccess || ev.metadata?.includes("convertido") || ev.metadata?.includes("Gol")))
      );
    }
    if (activeFilter === "cards") {
      return visibleEvents.filter(ev => ev.type === "carta");
    }
    if (activeFilter === "presidents") {
      return visibleEvents.filter(ev => ev.type === "penalti_presidente");
    }
    return visibleEvents;
  }, [visibleEvents, activeFilter]);

  // Counts for filters
  const goalsCount = visibleEvents.filter(ev =>
    ev.type === "goal" ||
    ev.type === "matchball" ||
    (ev.type === "penalti_presidente" && (ev.isSuccess || ev.metadata?.includes("GOL"))) ||
    (ev.type === "carta" && (ev.isSuccess || ev.metadata?.includes("convertido") || ev.metadata?.includes("Gol")))
  ).length;
  const cardsCount = visibleEvents.filter(ev => ev.type === "carta").length;
  const presCount = visibleEvents.filter(ev => ev.type === "penalti_presidente").length;

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 w-full transition-all ${!isExpanded ? "opacity-90 hover:opacity-100" : ""}`}>
      <div className={`bg-[#0a0b0f]/85 backdrop-blur-xl border ${isExpanded ? "border-white/[0.14] shadow-xl shadow-black/50" : "border-white/[0.06] shadow-md shadow-black/20"} rounded-2xl overflow-hidden transition-all`}>
        {/* MATCH HEADER */}
        <div
          className={`px-4 sm:px-5 py-3 flex justify-between items-center ${isExpanded ? "bg-white/[0.02]" : "bg-transparent"} hover:bg-white/[0.03] transition-colors cursor-pointer select-none`}
          onClick={onToggle}
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest shrink-0">{roundLabel}</span>
            <div className="w-px h-5 bg-white/10 shrink-0"></div>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <TeamLogo logo={opponent.logo} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow shrink-0" />
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight leading-none truncate">
                  {opponent.name}
                </h2>
                {opponent.presidents && (
                  <span className="text-[9px] font-medium text-zinc-400 leading-tight mt-0.5 truncate max-w-[120px] sm:max-w-xs">
                    Pres: {opponent.presidents}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className={`text-xl sm:text-2xl font-black tabular-nums ${outcomeColors[outcome]}`}>{displayMyScore}</span>
                <div className="flex flex-col items-center justify-center w-6 sm:w-8">
                  {outcome === "playing" && currentMinute > 0 && currentMinute <= maxMinute ? (
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-400 animate-pulse">{currentMinute}'</span>
                  ) : (
                    <span className="text-white/20 text-lg font-light">-</span>
                  )}
                </div>
                <span className={`text-xl sm:text-2xl font-black tabular-nums ${outcomeColors[outcome]}`}>{displayOpScore}</span>
              </div>
              {myShootoutScore !== undefined && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-300 font-bold tracking-wider uppercase">
                  <span>SO: {myShootoutScore}-{opShootoutScore}</span>
                </div>
              )}
            </div>

            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border ${outcomeBadgeStyles[outcome]} text-xs font-black uppercase transition-transform active:scale-95`}>
              {outcome === "playing" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : outcome === "win" ? "V" : outcome === "loss" ? "D" : "E"}
            </div>

            <div className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* ACCORDION CONTENT: LANCE A LANCE & SHOOTOUTS */}
        {isExpanded && (
          <div className="px-3.5 sm:px-5 py-3 border-t border-white/[0.06] bg-black/25 animate-in slide-in-from-top-1 duration-200 space-y-3">

            {/* FILTER BAR (Segmented Liquid Glass Pills) */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-white/[0.05]">
              <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] rounded-xl p-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all select-none active:scale-95",
                    activeFilter === "all"
                      ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.14]"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  Todos ({visibleEvents.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("goals")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all select-none active:scale-95",
                    activeFilter === "goals"
                      ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.14]"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  Gols ({goalsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("cards")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all select-none active:scale-95",
                    activeFilter === "cards"
                      ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.14]"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {t.page.campaign.weapons} ({cardsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter("presidents")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all select-none active:scale-95",
                    activeFilter === "presidents"
                      ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.14]"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {t.page.campaign.team} ({presCount})
                </button>

                {hasShootout && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("shootout")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all select-none active:scale-95",
                      activeFilter === "shootout"
                        ? "bg-amber-400 text-black font-black shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    Shootouts ({result.homeShootoutScore}x{result.awayShootoutScore})
                  </button>
                )}
              </div>

              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">
                Tempo Real
              </span>
            </div>


            {/* VERTICAL MATCH TIMELINE (Inspired by Kings League Official Axis) */}
            {/* VERTICAL MATCH TIMELINE (Inspired by Kings League Official Axis) */}
            <div className="space-y-1.5">
              {/* Column Guide Bar: Meu Time (Left) vs Adversário (Right) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] select-none mb-1">
                <div className="flex items-center justify-end gap-2 text-right min-w-0 pr-1">
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-[11px] sm:text-xs font-black uppercase text-white truncate max-w-[110px] sm:max-w-[180px]">
                      {userTeam.name}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                      Meu Time
                    </span>
                  </div>
                  <TeamLogo logo={userTeam.logo} className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0 drop-shadow" />
                </div>

                <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono font-black text-zinc-400 shrink-0">
                  VS
                </div>

                <div className="flex items-center justify-start gap-2 text-left min-w-0 pl-1">
                  <TeamLogo logo={opponent.logo} className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0 drop-shadow" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] sm:text-xs font-black uppercase text-zinc-200 truncate max-w-[110px] sm:max-w-[180px]">
                      {opponent.name}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                      Adversário
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical Timeline Axis Container */}
              <div
                ref={eventsContainerRef}
                className="relative max-h-[360px] overflow-y-auto overscroll-contain pr-1 sm:pr-2 py-2 scrollbar-minimal select-none"
              >
                {/* Central Continuous Spine Line */}
                <div className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-px bg-white/15 pointer-events-none" />

                {filteredEvents.length === 0 && activeFilter !== "shootout" ? (
                  <div className="text-center py-6 text-xs text-zinc-500 italic border border-dashed border-white/10 rounded-xl relative z-10 bg-black/40">
                    Nenhum lance registrado para esta categoria.
                  </div>
                ) : null}

                {/* TEMPO REGULAMENTAR (0' até 40') */}
                {activeFilter !== "shootout" && filteredEvents.length > 0 && (
                  <>
                    {/* 0' Início de Jogo */}
                    <div className="relative z-10 flex items-center justify-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-px w-4 sm:w-6 bg-white/15" />
                        <div className="px-2 py-0.5 rounded bg-black/90 border border-white/15 text-[9px] font-mono text-zinc-400 font-bold tracking-wider">
                          0' INÍCIO
                        </div>
                        <div className="h-px w-4 sm:w-6 bg-white/15" />
                      </div>
                    </div>

                    {filteredEvents.map((ev, i) => {
                      const isUserTeamEvent = ev.teamId === userTeam.id;
                      const isNeutral = ev.type === "dado" || (ev.type === "info" && ev.player === null && !ev.metadata?.includes("Desperdiçada"));

                      const prevEv = i > 0 ? filteredEvents[i - 1] : null;
                      const showHalftime = (prevEv && prevEv.minute <= 20 && ev.minute > 20) || (i === 0 && ev.minute > 20);

                      let eventTitle = "Gol";
                      if (ev.type === "matchball") {
                        eventTitle = "Matchball";
                      } else if (ev.type === "goal") {
                        eventTitle = ev.metadata?.includes("Gol Dobrado") ? "Gol Dobrado" : "Gol";
                      } else if (ev.type === "penalti_presidente") {
                        eventTitle = t.page.campaign.presidentPenalty;
                      } else if (ev.type === "carta") {
                        eventTitle = ev.cardType ? `Arma: ${ev.cardType}` : "Arma Secreta";
                      } else if (ev.metadata?.includes("Cartão Vermelho") || ev.metadata?.includes("Expulsão")) {
                        eventTitle = "Expulsão";
                      } else if (ev.metadata?.includes("Cartão Amarelo")) {
                        eventTitle = "Cartão Amarelo";
                      } else {
                        eventTitle = "Lance";
                      }

                      const playerName = ev.player?.shortName || (ev.type === "penalti_presidente" ? ev.presidentName : null);
                      const detailText = ev.description || ev.metadata;
                      const points = ev.pointsAdded !== undefined ? ev.pointsAdded : (ev.type === "matchball" ? 1 : (ev.metadata?.includes("Gol Dobrado") ? 2 : 1));

                      return (
                        <React.Fragment key={ev.id || i}>
                          {/* HT Marker (Intervalo aos 20') exatamente como na imagem de referência */}
                          {showHalftime && (
                            <div className="relative z-10 flex items-center justify-center my-3 group">
                              <div className="flex items-center gap-2">
                                <div className="h-px w-8 sm:w-16 bg-white/20" />
                                <div className="px-2.5 py-0.5 rounded bg-black border border-white/25 text-[10px] font-mono font-black text-white tracking-widest flex items-center gap-1.5 shadow-sm">
                                  <span className="text-zinc-200">HT</span>
                                  <span className="text-white/20">•</span>
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">INTERVALO</span>
                                </div>
                                <div className="h-px w-8 sm:w-16 bg-white/20" />
                              </div>
                            </div>
                          )}

                          {/* Evento Neutro Centralizado na Linha (Dado da Liga / Matchball) */}
                          {isNeutral ? (
                            <div className="relative z-10 flex items-center justify-center my-2">
                              <div className="flex items-center gap-1.5">
                                <div className="h-px w-4 sm:w-6 bg-white/15" />
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/90 border border-white/15 text-[9px] font-mono text-zinc-300 shadow-sm">
                                  <span className="font-bold text-white">{ev.minute}'</span>
                                  <span className="text-white/20">•</span>
                                  <span className="font-semibold text-zinc-300">
                                    {ev.type === "dado" ? (ev.metadata ? `DADO: ${ev.metadata}` : "DADO DA LIGA") : (ev.metadata || ev.description || "MATCHBALL")}
                                  </span>
                                </div>
                                <div className="h-px w-4 sm:w-6 bg-white/15" />
                              </div>
                            </div>
                          ) : (
                            /* Evento de Time com Galho/Tick conectado à espinha central */
                            <div className="relative flex items-center w-full py-1.5 sm:py-2 group hover:bg-white/[0.02] rounded-lg transition-colors">
                              {/* LADO ESQUERDO: MEU TIME */}
                              <div className="w-1/2 flex items-center justify-end min-w-0 pr-0">
                                {isUserTeamEvent ? (
                                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pr-0">
                                    {/* Texto Escrito: Nome do Jogador e Detalhe */}
                                    <div className="flex flex-col items-end min-w-0 max-w-[120px] sm:max-w-[200px]">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {(ev.type === "goal" || ev.type === "matchball") && points > 0 && (
                                          <span className="text-[10px] font-mono font-bold text-zinc-300 shrink-0">
                                            +{points}
                                          </span>
                                        )}
                                        <span className="text-xs font-bold text-white truncate">
                                          {playerName || eventTitle}
                                        </span>
                                      </div>
                                      {detailText && (
                                        <span className="text-[10px] text-zinc-400 truncate leading-tight">
                                          {playerName ? eventTitle : detailText}
                                        </span>
                                      )}
                                    </div>

                                    {/* Minuto */}
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 shrink-0">
                                      {ev.minute}'
                                    </span>

                                    {/* Ícone do Lance em Nó Circular Mínimo */}
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0d0e14] border border-white/20 flex items-center justify-center shrink-0 shadow-sm group-hover:border-white/40 transition-colors">
                                      {renderTimelineIcon(ev)}
                                    </div>

                                    {/* Tick horizontal conectando diretamente na linha central */}
                                    <div className="w-3 sm:w-5 h-px bg-white/30 shrink-0" />
                                  </div>
                                ) : (
                                  <div className="w-full" />
                                )}
                              </div>

                              {/* LADO DIREITO: ADVERSÁRIO */}
                              <div className="w-1/2 flex items-center justify-start min-w-0 pl-0">
                                {!isUserTeamEvent ? (
                                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pl-0">
                                    {/* Tick horizontal conectando diretamente na linha central */}
                                    <div className="w-3 sm:w-5 h-px bg-white/30 shrink-0" />

                                    {/* Ícone do Lance em Nó Circular Mínimo */}
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0d0e14] border border-white/20 flex items-center justify-center shrink-0 shadow-sm group-hover:border-white/40 transition-colors">
                                      {renderTimelineIcon(ev)}
                                    </div>

                                    {/* Minuto */}
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 shrink-0">
                                      {ev.minute}'
                                    </span>

                                    {/* Texto Escrito: Nome do Jogador e Detalhe */}
                                    <div className="flex flex-col items-start min-w-0 max-w-[120px] sm:max-w-[200px]">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-xs font-bold text-white truncate">
                                          {playerName || eventTitle}
                                        </span>
                                        {(ev.type === "goal" || ev.type === "matchball") && points > 0 && (
                                          <span className="text-[10px] font-mono font-bold text-zinc-300 shrink-0">
                                            +{points}
                                          </span>
                                        )}
                                      </div>
                                      {detailText && (
                                        <span className="text-[10px] text-zinc-400 truncate leading-tight">
                                          {playerName ? eventTitle : detailText}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full" />
                                )}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Marcador de Fim do Tempo Regulamentar */}
                    {(currentMinute >= 40 || isPlaybackComplete) && (
                      <div className="relative z-10 flex items-center justify-center mt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-px w-4 sm:w-8 bg-white/15" />
                          <div className="px-3 py-1 rounded-full bg-black/90 border border-white/20 text-[9px] font-mono text-zinc-300 font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
                            {hasShootout ? (
                              <>
                                <span className="text-white font-bold">38' EMPATE</span>
                                <span className="text-white/20">•</span>
                                <span className="text-amber-400 font-bold">DECISÃO NOS SHOOTOUTS</span>
                              </>
                            ) : (
                              "FIM DE JOGO"
                            )}
                          </div>
                          <div className="h-px w-4 sm:w-8 bg-white/15" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* DISPUTA DE SHOOTOUTS NA MESMA LINHA DO TEMPO */}
                {hasShootout && (activeFilter === "all" || activeFilter === "shootout") && (currentMinute >= 40 || isPlaybackComplete) && (
                  <>
                    {/* Divisor de Shootouts no Eixo Central */}
                    <div className="relative z-10 flex items-center justify-center my-3.5 group">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-6 sm:w-14 bg-amber-400/30" />
                        <div className="px-3 py-1 rounded-full bg-[#0c0d12] border border-amber-400/40 text-[10px] font-mono font-black text-amber-300 tracking-wider flex items-center gap-1.5 shadow-sm">
                          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>DECISÃO POR SHOOTOUTS (1v1)</span>
                          <span className="text-white/20">•</span>
                          <span className="text-white font-bold">{isHome ? result.homeShootoutScore : result.awayShootoutScore}x{isHome ? result.awayShootoutScore : result.homeShootoutScore}</span>
                        </div>
                        <div className="h-px w-6 sm:w-14 bg-amber-400/30" />
                      </div>
                    </div>

                    {/* Cobranças de Shootouts no mesmo design da Timeline */}
                    {result.shootoutKicks?.map((kick, sIdx) => {
                      const isUserTeamKick = kick.teamId === userTeam.id;
                      const playerName = kick.player?.shortName || (kick.player as any)?.fullName || (kick.player as any)?.name || kick.description.split(" converteu")[0].split(" errou")[0];
                      const currentSO = isHome
                        ? `${kick.scoreAfter.home}-${kick.scoreAfter.away}`
                        : `${kick.scoreAfter.away}-${kick.scoreAfter.home}`;

                      return (
                        <div key={kick.id || sIdx} className="relative flex items-center w-full py-1.5 sm:py-2 group hover:bg-white/[0.02] rounded-lg transition-colors">
                          {/* LADO ESQUERDO: MEU TIME */}
                          <div className="w-1/2 flex items-center justify-end min-w-0 pr-0">
                            {isUserTeamKick ? (
                              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pr-0">
                                {/* Texto Escrito: Nome do Jogador e Detalhe */}
                                <div className="flex flex-col items-end min-w-0 max-w-[120px] sm:max-w-[200px]">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {kick.isGoal && (
                                      <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                                        +1
                                      </span>
                                    )}
                                    <span className="text-xs font-bold text-white truncate">
                                      {playerName}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-zinc-400 truncate leading-tight">
                                    {kick.isGoal ? "Converteu" : "Defendido / Errou"} • Placar {currentSO}
                                  </span>
                                </div>

                                {/* Marcador do Round */}
                                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400/90 shrink-0">
                                  R{kick.round}
                                </span>

                                {/* Ícone do Lance em Nó Circular Mínimo */}
                                <div className={cn(
                                  "w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0d0e14] border flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                  kick.isGoal
                                    ? "border-emerald-500/40 text-emerald-400"
                                    : "border-rose-500/40 text-rose-400"
                                )}>
                                  {kick.isGoal ? (
                                    <BallIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <span className="text-[11px] font-black leading-none text-rose-400">✕</span>
                                  )}
                                </div>

                                {/* Tick horizontal conectando diretamente na linha central */}
                                <div className="w-3 sm:w-5 h-px bg-white/30 shrink-0" />
                              </div>
                            ) : (
                              <div className="w-full" />
                            )}
                          </div>

                          {/* LADO DIREITO: ADVERSÁRIO */}
                          <div className="w-1/2 flex items-center justify-start min-w-0 pl-0">
                            {!isUserTeamKick ? (
                              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pl-0">
                                {/* Tick horizontal conectando diretamente na linha central */}
                                <div className="w-3 sm:w-5 h-px bg-white/30 shrink-0" />

                                {/* Ícone do Lance em Nó Circular Mínimo */}
                                <div className={cn(
                                  "w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0d0e14] border flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                  kick.isGoal
                                    ? "border-emerald-500/40 text-emerald-400"
                                    : "border-rose-500/40 text-rose-400"
                                )}>
                                  {kick.isGoal ? (
                                    <BallIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <span className="text-[11px] font-black leading-none text-rose-400">✕</span>
                                  )}
                                </div>

                                {/* Marcador do Round */}
                                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400/90 shrink-0">
                                  R{kick.round}
                                </span>

                                {/* Texto Escrito: Nome do Jogador e Detalhe */}
                                <div className="flex flex-col items-start min-w-0 max-w-[120px] sm:max-w-[200px]">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-xs font-bold text-white truncate">
                                      {playerName}
                                    </span>
                                    {kick.isGoal && (
                                      <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                                        +1
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-400 truncate leading-tight">
                                    {kick.isGoal ? "Converteu" : "Defendido / Errou"} • Placar {currentSO}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Marcador de Resultado Final dos Shootouts no Eixo Central */}
                    <div className="relative z-10 flex items-center justify-center my-3">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-6 sm:w-12 bg-white/15" />
                        <div className={cn(
                          "px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-md bg-black/90",
                          (isHome && result.winner === "home") || (!isHome && result.winner === "away")
                            ? "border-emerald-500/40 text-emerald-300"
                            : "border-white/20 text-zinc-300"
                        )}>
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {(isHome && result.winner === "home") || (!isHome && result.winner === "away")
                              ? `VITÓRIA NOS SHOOTOUTS (${userTeam.name} +2 PTS)`
                              : `DERROTA NOS SHOOTOUTS (${opponent.name} +2 PTS)`}
                          </span>
                        </div>
                        <div className="h-px w-6 sm:w-12 bg-white/20" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export function StandingsTableFinal({
  standings,
  userTeam,
  userRank,
}: {
  standings: TeamStanding[];
  userTeam: SimulatedTeam;
  userRank: number;
}) {
  const { t } = useLocale();
  return (
    <div className="liquid-glass-panel rounded-3xl p-5 sm:p-7 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              {t.page.campaign.finalStandingsTitle}
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
              {t.page.campaign.finalStandingsSubtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold text-zinc-300">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">{t.page.campaign.position}:</span>
          <span className={cn(
            "font-black uppercase",
            userRank === 1 ? "text-emerald-400" : userRank <= 7 ? "text-amber-400" : "text-rose-400"
          )}>
            {userRank}º {t.page.campaign.position} {userRank === 1 ? `(${t.page.campaign.directSemifinal})` : userRank <= 7 ? `(${t.page.campaign.playoffs})` : `(${t.page.campaign.eliminated})`}
          </span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto scrollbar-none -mx-5 sm:mx-0 px-5 sm:px-0">
        <div className="min-w-[620px]">
          {/* Header row */}
          <div className="grid grid-cols-[36px_1fr_64px_44px_44px_52px_120px] items-center gap-2 px-4 py-2.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/[0.06] bg-black/30 rounded-xl mb-1">
            <div className="text-center">Pos</div>
            <div>Time</div>
            <div className="text-center" title="Vitórias - Derrotas">V - D</div>
            <div className="text-center" title="Gols Pró">GP</div>
            <div className="text-center" title="Gols Contra">GC</div>
            <div className="text-center" title="Saldo de Gols">SG</div>
            <div className="text-center">Status</div>
          </div>

          {/* Table rows */}
          <div className="space-y-1">
            {standings.map((row, index) => {
              const isUser = row.teamId === userTeam.id;
              const pos = index + 1;

              return (
                <div
                  key={row.teamId}
                  className={cn(
                    "grid grid-cols-[36px_1fr_64px_44px_44px_52px_120px] items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors",
                    pos === 1
                      ? "border-l-4 border-l-emerald-500"
                      : pos <= 7
                        ? "border-l-4 border-l-amber-400"
                        : "border-l-4 border-l-rose-500",
                    isUser
                      ? pos === 1
                        ? "bg-emerald-500/[0.12] border-emerald-500/50 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.25)]"
                        : pos <= 7
                          ? "bg-amber-400/[0.12] border-amber-400/50 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.25)]"
                          : "bg-rose-500/[0.12] border-rose-500/50 shadow-[inset_0_1px_0_0_rgba(244,63,94,0.25)]"
                      : pos === 1
                        ? "bg-emerald-500/[0.03] border-white/[0.04] hover:bg-emerald-500/[0.08]"
                        : pos <= 7
                          ? "bg-amber-400/[0.03] border-white/[0.04] hover:bg-amber-400/[0.08]"
                          : "bg-rose-500/[0.02] border-white/[0.04] hover:bg-rose-500/[0.06]"
                  )}
                >
                  {/* Position Badge */}
                  <div className="flex justify-center">
                    {pos === 1 ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-emerald-500/30">
                        1
                      </div>
                    ) : pos <= 7 ? (
                      <div className="w-6 h-6 rounded-lg bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/30 border border-amber-300">
                        {pos}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-rose-500/30">
                        {pos}
                      </div>
                    )}
                  </div>

                  {/* Club info */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <TeamLogo logo={row.logo} className="w-7 h-7 object-contain drop-shadow shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "text-xs sm:text-sm uppercase tracking-wide truncate",
                          isUser
                            ? pos === 1
                              ? "text-emerald-300 font-black"
                              : pos <= 7
                                ? "text-amber-300 font-black"
                                : "text-rose-300 font-black"
                            : pos === 1
                              ? "text-emerald-200/90 font-bold"
                              : pos <= 7
                                ? "text-zinc-100 font-semibold"
                                : "text-zinc-300 font-medium"
                        )}>
                          {isUser ? userTeam.name : row.teamName}
                        </span>
                        {isUser && (
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border shrink-0",
                            pos === 1
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : pos <= 7
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          )}>
                            VOCÊ
                          </span>
                        )}
                      </div>
                      {row.competition && !isUser && (
                        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider truncate">
                          {row.competition}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* V - D */}
                  <div className="text-center font-black tabular-nums text-xs">
                    <span className="text-emerald-400">{row.won}</span>
                    <span className="text-zinc-600 mx-1">-</span>
                    <span className="text-rose-400">{row.lost}</span>
                  </div>

                  {/* GP */}
                  <div className="text-center text-xs font-semibold tabular-nums text-zinc-300">
                    {row.goalsFor}
                  </div>

                  {/* GC */}
                  <div className="text-center text-xs font-semibold tabular-nums text-zinc-400">
                    {row.goalsAgainst}
                  </div>

                  {/* SG */}
                  <div className={cn(
                    "text-center text-xs font-black tabular-nums",
                    row.goalDifference > 0 ? "text-emerald-400" : row.goalDifference < 0 ? "text-rose-400" : "text-zinc-400"
                  )}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {pos === 1 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Semifinal Direta
                      </span>
                    ) : pos <= 7 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black shadow-sm">
                        Playoffs
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                        {t.page.campaign.eliminated}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3 text-[10px] font-bold text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-zinc-200">1º Lugar: Vaga Direta na Semifinal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <span className="text-zinc-200 font-semibold">2º ao 7º: Playoffs (Quartas de Final)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="text-zinc-200">{t.page.campaign.eliminated}</span>
          </div>
        </div>

        <span className="text-zinc-500 font-mono text-[9px]">
          Regulamento Oficial Kings League
        </span>
      </div>
    </div>
  );
}

function PlayoffStageTracker({
  currentStage,
  isCompleted = false
}: {
  currentStage: PlayoffStage;
  isCompleted?: boolean;
}) {
  const stages = [
    { id: "groups", label: "Fase de Grupos", isPast: true },
    { id: "quarterfinals", label: "Quartas", isCurrent: currentStage === "quarterfinals" && !isCompleted, isPast: currentStage === "semifinals" || currentStage === "final" || isCompleted },
    { id: "semifinals", label: "Semifinal", isCurrent: currentStage === "semifinals" && !isCompleted, isPast: currentStage === "final" || isCompleted },
    { id: "final", label: "Grande Final", isCurrent: currentStage === "final" && !isCompleted, isPast: isCompleted },
  ];

  return (
    <div className="flex items-center justify-center w-full py-1">
      <div className="flex items-center gap-1 sm:gap-2 bg-black/50 border border-white/[0.08] rounded-2xl p-1.5 backdrop-blur-xl shadow-lg max-w-full overflow-x-auto scrollbar-none">
        {stages.map((st, i) => (
          <React.Fragment key={st.id}>
            {i > 0 && (
              <div className="w-3 sm:w-5 h-px bg-white/10 shrink-0" />
            )}
            <div
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-colors",
                st.isCurrent
                  ? "bg-amber-400 text-black shadow-sm font-black"
                  : st.isPast
                    ? "bg-white/[0.06] text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-500"
              )}
            >
              {st.isPast && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
              <span>{st.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function PlayoffArenaCard({
  stage,
  userTeam,
  opponent,
  playedMatches,
  isSimulating,
  onSimulate,
}: {
  stage: PlayoffStage;
  userTeam: SimulatedTeam;
  opponent: SimulatedTeam | null;
  playedMatches: MatchResultDisplay[];
  isSimulating: boolean;
  onSimulate: () => void;
}) {
  const { t } = useLocale();
  const stageTitle = stage === "quarterfinals" ? "Quartas de Final" : stage === "semifinals" ? "Semifinal" : "Grande Final";

  const userWins = playedMatches.filter(m => (m.isHome && m.result.winner === "home") || (!m.isHome && m.result.winner === "away")).length;
  const userLosses = playedMatches.length - userWins;

  return (
    <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-white/[0.08] relative overflow-hidden w-full max-w-3xl mx-auto shadow-2xl">
      {/* Top stage header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" />
          <span>{stageTitle}</span>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
          {t.page.campaign.shootoutFinal}
        </span>
      </div>

      {/* Versus Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-6 my-2">
        {/* User Team */}
        <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center border border-white/[0.08]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-2 mb-3 shadow-inner">
            <TeamLogo logo={userTeam.logo} className="w-full h-full object-contain drop-shadow" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25 mb-1.5">
            SEU TIME
          </span>
          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate max-w-full">
            {userTeam.name}
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 tabular-nums mt-1">
            Campanha: {userWins}V - {userLosses}D
          </span>
        </div>

        {/* Center VS */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-zinc-400 font-black italic text-lg shadow-xl shadow-black/80">
            VS
          </div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-2">
            MATA-MATA
          </span>
        </div>

        {/* Opponent Team */}
        <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center border border-white/[0.08]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-2 mb-3 shadow-inner">
            <TeamLogo logo={opponent?.logo} className="w-full h-full object-contain drop-shadow" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 mb-1.5">
            ADVERSÁRIO
          </span>
          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate max-w-full">
            {opponent?.name || "Adversário"}
          </h3>
          {opponent?.presidents && (
            <span className="text-[10px] text-zinc-400 truncate max-w-full mt-1">
              Pres: {opponent.presidents}
            </span>
          )}
        </div>
      </div>

      {/* Button */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="brand"
          onClick={onSimulate}
          disabled={isSimulating}
          className="btn-press px-8 py-3.5 h-12 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xl shadow-amber-400/25 w-full sm:w-auto"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> SIMULANDO CONFRONTO...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 mr-2" /> SIMULAR PARTIDA DECISIVA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function PlayoffPostMatchCard({
  stage,
  lastMatch,
  isSimulating,
  onContinue
}: {
  stage: PlayoffStage;
  lastMatch: MatchResultDisplay;
  isSimulating: boolean;
  onContinue: () => void;
}) {
  if (!lastMatch) return null;

  const myScore = lastMatch.isHome ? lastMatch.result.homeScore : lastMatch.result.awayScore;
  const opScore = lastMatch.isHome ? lastMatch.result.awayScore : lastMatch.result.homeScore;
  const hasShootout = lastMatch.result.homeShootoutScore !== undefined;
  const myShootout = lastMatch.isHome ? lastMatch.result.homeShootoutScore : lastMatch.result.awayShootoutScore;
  const opShootout = lastMatch.isHome ? lastMatch.result.awayShootoutScore : lastMatch.result.homeShootoutScore;

  let isWin = false;
  if (hasShootout && myShootout !== undefined && opShootout !== undefined) {
    isWin = myShootout > opShootout;
  } else {
    isWin = myScore > opScore;
  }

  const nextStageText = stage === "quarterfinals" ? "A SEMIFINAL" : stage === "semifinals" ? "A GRANDE FINAL" : "O TÍTULO";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto pt-2">
      <div className={cn(
        "liquid-glass-panel rounded-3xl p-6 sm:p-8 w-full border text-center shadow-2xl",
        isWin
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "border-rose-500/30 bg-rose-500/[0.03]"
      )}>
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg border",
            isWin
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20"
              : "bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-rose-500/20"
          )}>
            {isWin ? <Trophy className="w-7 h-7" /> : <HeartCrack className="w-7 h-7" />}
          </div>

          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2",
            isWin ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border-rose-500/30"
          )}>
            {isWin ? "CLASSIFICAÇÃO CONFIRMADA" : "ELIMINAÇÃO NO MATA-MATA"}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
            {isWin
              ? stage === "final"
                ? "É CAMPEÃO DA KINGS LEAGUE!"
                : "VITÓRIA HISTÓRICA NO MATA-MATA!"
              : "FIM DA LINHA NOS PLAYOFFS"}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mb-6">
            {isWin
              ? stage === "final"
                ? "Sua equipe venceu a final e levantou a taça de campeão!"
                : `Grande triunfo! O time assegurou a classificação e segue para ${nextStageText}.`
              : "Sua equipe foi superada neste duelo eliminatório. Veja o resumo completo da campanha."}
          </p>

          <Button
            variant="brand"
            onClick={onContinue}
            disabled={isSimulating}
            className="btn-press px-8 py-3.5 h-12 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xl shadow-amber-400/25 w-full sm:w-auto"
          >
            {isWin ? (
              stage === "final" ? (
                <>
                  <Crown className="w-4 h-4 mr-2" /> VER COROAÇÃO DO CAMPEÃO
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" /> AVANÇAR PARA {nextStageText}
                </>
              )
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" /> VER RESUMO DA CAMPANHA
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CampaignSummary({
  playedMatches,
  userTeam,
  isChampion = false,
  playoffStage = null,
  groupRank,
  onRestart,
  onResetToDraft,
  onViewStandings,
}: {
  playedMatches: MatchResultDisplay[];
  userTeam?: SimulatedTeam;
  isChampion?: boolean;
  playoffStage?: PlayoffStage;
  groupRank?: number;
  onRestart?: () => void;
  onResetToDraft?: () => void;
  onViewStandings?: () => void;
}) {
  const { toast } = useToast();
  const { t } = useLocale();

  const wins = playedMatches.filter(m => (m.isHome && m.result.winner === "home") || (!m.isHome && m.result.winner === "away")).length;
  const totalMatches = playedMatches.length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  let goalsFor = 0;
  let goalsAgainst = 0;
  let presGoals = 0;
  let presMisses = 0;

  playedMatches.forEach(m => {
    if (m.isHome) {
      goalsFor += m.result.homeScore;
      goalsAgainst += m.result.awayScore;
      m.result.homeEvents.forEach(ev => {
        if (ev.type === "penalti_presidente") {
          if (ev.metadata?.includes("GOL") || ev.isSuccess) presGoals++;
          if (ev.metadata?.includes("ERROU") || (ev.isSuccess === false)) presMisses++;
        }
      });
    } else {
      goalsFor += m.result.awayScore;
      goalsAgainst += m.result.homeScore;
      m.result.awayEvents.forEach(ev => {
        if (ev.type === "penalti_presidente") {
          if (ev.metadata?.includes("GOL") || ev.isSuccess) presGoals++;
          if (ev.metadata?.includes("ERROU") || (ev.isSuccess === false)) presMisses++;
        }
      });
    }
  });

  const goalDiff = goalsFor - goalsAgainst;
  const avgGoalsFor = totalMatches > 0 ? (goalsFor / totalMatches).toFixed(1) : "0.0";
  const avgGoalsAgainst = totalMatches > 0 ? (goalsAgainst / totalMatches).toFixed(1) : "0.0";
  const presTotal = presGoals + presMisses;
  const presRate = presTotal > 0 ? Math.round((presGoals / presTotal) * 100) : 0;

  // Placement label
  let placementLabel = t.common.regularPhase;
  let placementBadgeClass = "bg-white/[0.06] text-zinc-400 border-white/10";
  let PlacementIcon = Shield;

  if (isChampion) {
    placementLabel = t.ui.champion;
    placementBadgeClass = "bg-amber-400/20 text-amber-300 border-amber-400/30";
    PlacementIcon = Crown;
  } else if (playoffStage === "final") {
    placementLabel = t.playoffs.finalAbbr;
    placementBadgeClass = "bg-zinc-300/20 text-zinc-200 border-zinc-300/30";
    PlacementIcon = Medal;
  } else if (playoffStage === "semifinals") {
    placementLabel = t.playoffs.semiAbbr;
    placementBadgeClass = "bg-amber-500/15 text-amber-300 border-amber-500/25";
    PlacementIcon = Award;
  } else if (playoffStage === "quarterfinals") {
    placementLabel = t.playoffs.quarterfinals;
    placementBadgeClass = "bg-amber-400/10 text-amber-300 border-amber-400/20";
    PlacementIcon = Swords;
  } else if (groupRank) {
    placementLabel = `${groupRank}º ${t.page.campaign.position} (${t.common.regularPhase})`;
    placementBadgeClass = "bg-rose-500/15 text-rose-300 border-rose-500/30";
    PlacementIcon = Shield;
  }

  const handleShare = () => {
    const text = `👑 Kings League - 12a0:
⚽ ${t.page.campaign.team}: ${userTeam?.name || t.page.campaign.yourTeam}
🏆 ${t.standings.officialTable}: ${placementLabel}
📊 ${t.teamPage.winRate}: ${wins} - ${losses} (${winRate}%)
🎯 ${t.teamPage.goalsAndDiff}: ${goalsFor} / ${goalsAgainst} (${goalDiff > 0 ? `+${goalDiff}` : goalDiff})
👑 ${t.page.campaign.presidentPenalty}: ${presGoals}/${presTotal} (${presRate}%)
${t.page.campaign.quickSim}: https://kings-league-simulator.vercel.app/12a0`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: t.page.campaign.copied,
        description: t.page.campaign.copiedDescription,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Overview Card */}
      <div className={cn(
        "liquid-glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border relative overflow-hidden shadow-2xl",
        isChampion ? "border-amber-400/30 bg-gradient-to-b from-amber-400/[0.04] to-transparent" : "border-white/[0.08]"
      )}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border mb-3",
              placementBadgeClass
            )}>
              <PlacementIcon className="w-3.5 h-3.5" />
              <span>{placementLabel}</span>
            </div>

            <div className="flex items-center gap-3">
              {userTeam?.logo && (
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-2 shrink-0">
                  <TeamLogo logo={userTeam.logo} className="w-full h-full object-contain drop-shadow" />
                </div>
              )}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {userTeam?.name || t.page.campaign.yourTeam}
                </h3>
                {userTeam?.presidents && (
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    {t.page.campaign.presidents}: {userTeam.presidents}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Record Pill */}
          <div className="liquid-glass-pill rounded-2xl px-6 py-4 flex flex-col items-center text-center border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              {t.home.officialSeason}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              <span className="text-emerald-400">{wins}{t.standings.wonTooltip.slice(0, 1)}</span>
              <span className="text-zinc-600 mx-2">-</span>
              <span className="text-rose-400">{losses}{t.standings.lostTooltip.slice(0, 1)}</span>
            </div>
            <span className="text-[11px] font-bold text-amber-400 mt-1 uppercase tracking-wider">
              {winRate}% {t.teamPage.winRate}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Win Rate */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {t.teamPage.winRate}
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white tabular-nums mb-1">
              {winRate}%
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {t.teamPage.winRate}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-400">{wins} {t.ui.wins}</span>
            <span className="text-rose-400">{losses} {t.ui.losses}</span>
          </div>
        </div>

        {/* Card 2: Saldo de Gols */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {t.teamPage.goalsAndDiff}
              </span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={cn(
              "text-3xl font-black tabular-nums mb-1",
              goalDiff > 0 ? "text-emerald-400" : goalDiff < 0 ? "text-rose-400" : "text-white"
            )}>
              {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {t.standings.gdTooltip}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold">
            <span className="text-zinc-300">{goalsFor} {t.standings.gfTooltip.slice(0, 2)} ({avgGoalsFor}/j)</span>
            <span className="text-zinc-500">{goalsAgainst} {t.standings.gaTooltip.slice(0, 2)}</span>
          </div>
        </div>

        {/* Card 3: Pênaltis do Presidente */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {t.page.campaign.presidentPenalty}
              </span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300 tabular-nums mb-1">
              {presGoals}<span className="text-lg text-zinc-500 font-bold">/{presTotal}</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {presRate}% {t.teamPage.soConversion}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>{presGoals} {t.teamPage.matchWin}</span>
            <span>{presMisses} {t.teamPage.matchDefeat}</span>
          </div>
        </div>

        {/* Card 4: Total de Jogos */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {t.ui.matches}
              </span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-3xl font-black text-white tabular-nums mb-1">
              {totalMatches}
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {t.matches.matches}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>0 {t.page.campaign.draws}</span>
            <span className="text-amber-400">{t.page.campaign.rules}</span>
          </div>
        </div>
      </div>

      {/* Action Dock */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {!isChampion && (
          <Button
            variant="brand"
            onClick={onRestart ? onRestart : () => window.location.reload()}
            className="btn-press px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/25 h-12 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t.page.campaign.drawAgain}
          </Button>
        )}

        {onResetToDraft && (
          <Button
            variant={isChampion ? "brand" : "glass"}
            onClick={onResetToDraft}
            className={cn(
              "btn-press px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl h-12 w-full sm:w-auto",
              isChampion ? "shadow-lg shadow-amber-400/25" : "border border-white/10 hover:bg-white/[0.08]"
            )}
          >
            <Shield className="w-4 h-4 mr-2" />
            {t.page.campaign.toastNewDraft}
          </Button>
        )}

        {onViewStandings && (
          <Button
            variant="glass"
            onClick={onViewStandings}
            className="btn-press px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl border border-white/10 hover:bg-white/[0.08] h-12 w-full sm:w-auto"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {t.standings.officialTable}
          </Button>
        )}

        <Button
          variant="glass"
          onClick={handleShare}
          className="btn-press px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl border border-white/10 hover:bg-white/[0.08] h-12 w-full sm:w-auto"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isChampion ? `${t.tier.share} 🏆` : t.tier.share}
        </Button>
      </div>
    </div>
  );
}
