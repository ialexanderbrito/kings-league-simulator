import { Player } from "@/types/kings-league";
import { getPlayerOverall } from "./utils";

export interface ShootoutKick {
  id: string;
  round: number;
  teamId: string;
  teamName: string;
  player: Player | null;
  isGoal: boolean;
  scoreAfter: { home: number; away: number };
  description: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  player: Player | null; // null if it's an "unknown" player from a generic opponent
  type: "goal" | "escalonado" | "shootout" | "dado" | "carta" | "penalti_presidente" | "matchball" | "info";
  teamId: string;
  metadata?: string; // Informação extra (ex: "3v3", "Matchball")
  description?: string; // Narrativa imersiva do lance a lance
  cardType?: "Gol Dobrado" | "Pênalti" | "Shootout" | "Suspensão" | "Pênalti Reverso" | "Coringa";
  presidentName?: string;
  isSuccess?: boolean;
  pointsAdded?: number;
  scoreSnapshot?: { home: number; away: number };
}

export interface DetailedMatchResult {
  homeScore: number;
  awayScore: number;
  homeEvents: MatchEvent[];
  awayEvents: MatchEvent[];
  homeShootoutScore?: number;
  awayShootoutScore?: number;
  shootoutKicks?: ShootoutKick[];
  winner: "home" | "away" | "draw";
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  competition?: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface SimulatedTeam {
  id: string;
  name: string;
  competition?: string;
  logo?: string;
  overall: number;
  players: Player[];
  playStyle?: "Defensivo" | "Equilibrado" | "Ofensivo";
  attackScore?: number;
  defenseScore?: number;
  presidents?: string;
}

export interface MatchPrediction {
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  ratingAdvantage: number;
  tacticalAdvantage: string;
  keyStrengths: string[];
}

// Retorna o goleiro titular e seu overall, ou deduz com base na defesa
export function getTeamGoalkeeper(team: SimulatedTeam): { player: Player | null; ovr: number } {
  const gk = team.players?.find(p => p.role === "goalkeeper");
  if (gk) return { player: gk, ovr: getPlayerOverall(gk) };
  return { player: null, ovr: team.defenseScore || team.overall || 75 };
}

// Retorna gols de bola rolando usando algoritmo exato de Poisson (Knuth)
// Goleiros de alto nível e defesas sólidas reduzem ativamente as chances de gol
function calculateGoals(attackScore: number, defenseScore: number, oppGkScore: number = 75): number {
  const diff = attackScore - defenseScore;
  const gkImpact = ((oppGkScore - 75) * 0.025); // Goleiros de elite reduzem média de gols sofridos
  
  // Lambda: em média 1.85 gols de jogo corrido em 40 minutos de Kings League
  // Sensibilidade calibrada para balancear favoritismo sem anular a competitividade
  let lambda = 1.85 + (diff * 0.050) - gkImpact;
  if (lambda < 0.6) lambda = 0.6;
  if (lambda > 3.8) lambda = 3.8;
  
  // Algoritmo exato de Poisson de Donald Knuth
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 12);
  
  return Math.max(0, k - 1);
}

function pickRandomScorer(players: Player[]): Player | null {
  if (!players || players.length === 0) return null;
  
  const weights: Record<string, number> = {
    "forward": 10,
    "midfielder": 5,
    "defender": 1,
    "goalkeeper": 0.1
  };

  const weightedPlayers = players.map(p => ({
    player: p,
    weight: (weights[p.role] || 1) * (getPlayerOverall(p) / 70)
  }));

  const totalWeight = weightedPlayers.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const wp of weightedPlayers) {
    if (random < wp.weight) return wp.player;
    random -= wp.weight;
  }
  
  return players[0];
}

export function simulateDetailedMatch(
  homeTeam: SimulatedTeam,
  awayTeam: SimulatedTeam,
  options?: {
    userTeamId?: string;
    difficultyMultiplier?: number;
    difficultyMode?: string;
  }
): DetailedMatchResult {
  
  // Extrair atributos ou usar overall como fallback
  let homeAtt = homeTeam.attackScore || homeTeam.overall;
  let homeDef = homeTeam.defenseScore || homeTeam.overall;
  let awayAtt = awayTeam.attackScore || awayTeam.overall;
  let awayDef = awayTeam.defenseScore || awayTeam.overall;

  const homeGkInfo = getTeamGoalkeeper(homeTeam);
  const awayGkInfo = getTeamGoalkeeper(awayTeam);
  const homeGkOvr = homeGkInfo.ovr;
  const awayGkOvr = awayGkInfo.ovr;

  // Aplicar Dificuldade Justa e Equilibrada (Se for jogo do usuário)
  if (options?.userTeamId) {
    const isLendas = options.difficultyMode === "Lendas";
    const diffMult = options.difficultyMultiplier || 1.0;
    
    let totalMachineBonus = 0;
    if (isLendas) {
      // Modo Lendas (Hardcore): desafio de altíssimo nível (+3 a +10)
      const baseBonus = 3;
      const progressiveBonus = Math.max(0, (diffMult - 1) * 10);
      totalMachineBonus = baseBonus + progressiveBonus;
    } else {
      // Modo Clássico (Padrão):
      if (diffMult <= 1.20) {
        // Fase regular: leve competitividade progressiva (+0 a +1)
        totalMachineBonus = Math.max(0, (diffMult - 1) * 5);
      } else {
        // Mata-Mata (Playoffs): os adversários jogam com intensidade máxima de decisão
        // Quartas (+3), Semifinal (+5), Grande Final (+7)
        if (diffMult <= 1.28) totalMachineBonus = 3;
        else if (diffMult <= 1.40) totalMachineBonus = 5;
        else totalMachineBonus = 7;
      }
    }

    if (homeTeam.id === options.userTeamId && awayTeam.id !== options.userTeamId) {
      // Usuário é Mandante, Máquina é Visitante
      awayAtt = Math.min(99, awayAtt + totalMachineBonus);
      awayDef = Math.min(99, awayDef + totalMachineBonus);
    } else if (awayTeam.id === options.userTeamId && homeTeam.id !== options.userTeamId) {
      // Usuário é Visitante, Máquina é Mandante
      homeAtt = Math.min(99, homeAtt + totalMachineBonus);
      homeDef = Math.min(99, homeDef + totalMachineBonus);
    }
  }

  // Aplicar modificadores de Estilo de Jogo
  if (homeTeam.playStyle === "Ofensivo") {
    homeAtt += 4;
    homeDef -= 3;
  } else if (homeTeam.playStyle === "Defensivo") {
    homeDef += 4;
    homeAtt -= 3;
  } else {
    homeAtt += 1;
    homeDef += 1;
  }

  if (awayTeam.playStyle === "Ofensivo") {
    awayAtt += 4;
    awayDef -= 3;
  } else if (awayTeam.playStyle === "Defensivo") {
    awayDef += 4;
    awayAtt -= 3;
  } else {
    awayAtt += 1;
    awayDef += 1;
  }

  // Cap máximo de segurança para não quebrar a distribuição
  homeAtt = Math.min(homeAtt, 99);
  homeDef = Math.min(homeDef, 99);
  awayAtt = Math.min(awayAtt, 99);
  awayDef = Math.min(awayDef, 99);

  let homeBaseGoals = calculateGoals(homeAtt, awayDef, awayGkOvr);
  let awayBaseGoals = calculateGoals(awayAtt, homeDef, homeGkOvr);

  const rawEvents: MatchEvent[] = [];
  const finalHomeEvents: MatchEvent[] = [];
  const finalAwayEvents: MatchEvent[] = [];

  // Rastreador de minutos para evitar sobreposição exata de eventos especiais
  const usedMinutes = new Set<number>();
  function getUniqueMinute(min: number, max: number) {
    let m = Math.floor(Math.random() * (max - min + 1)) + min;
    let attempts = 0;
    while (usedMinutes.has(m) && attempts < 50) {
      m = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;
    }
    usedMinutes.add(m);
    return m;
  }

  // O Dado da Liga (Min 18)
  const formatDado = ["1v1", "2v2", "3v3", "4v4", "5v5"];
  const dadoSorteado = formatDado[Math.floor(Math.random() * formatDado.length)];
  usedMinutes.add(18);
  rawEvents.push({ 
    id: `dado-18`, 
    minute: 18, 
    player: null, 
    type: "dado", 
    teamId: homeTeam.id, 
    metadata: `Dado da Liga: ${dadoSorteado} (Até os 20')`,
    description: `Dado da Liga sorteou o formato ${dadoSorteado}! Até os 20 minutos, o jogo terá formato reduzido em campo.`
  });
  
  // Cartas Secretas (Minutos 20 ao 36)
  const allCards = ["Pênalti", "Shootout", "Suspensão", "Gol Dobrado", "Pênalti Reverso", "Coringa"] as const;
  const getCard = () => allCards[Math.floor(Math.random() * allCards.length)];
  
  rawEvents.push({ id: `h-carta-init`, minute: getUniqueMinute(20, 36), player: null, type: "carta", teamId: homeTeam.id, metadata: getCard() });
  rawEvents.push({ id: `a-carta-init`, minute: getUniqueMinute(20, 36), player: null, type: "carta", teamId: awayTeam.id, metadata: getCard() });

  // Pênalti do Presidente (100% de chance para cada time no 2º tempo)
  const homePresName = homeTeam.presidents || (homeTeam.id === options?.userTeamId ? "Presidente" : homeTeam.name);
  const awayPresName = awayTeam.presidents || (awayTeam.id === options?.userTeamId ? "Presidente" : awayTeam.name);

  rawEvents.push({ id: `h-pres-init`, minute: getUniqueMinute(20, 36), player: null, type: "penalti_presidente", teamId: homeTeam.id });
  rawEvents.push({ id: `a-pres-init`, minute: getUniqueMinute(20, 36), player: null, type: "penalti_presidente", teamId: awayTeam.id });

  // Ordenar cronologicamente
  rawEvents.sort((a, b) => a.minute - b.minute);

  let homeGoals = 0;
  let awayGoals = 0;
  let homeDoubleGoalUntil = 0;
  let awayDoubleGoalUntil = 0;
  let homeSuspendedUntil = 0;
  let awaySuspendedUntil = 0;

  // Processar minuto a minuto (1 ao 37)
  for (let m = 1; m <= 37; m++) {
    // Verificar gols de punição numérica (Suspensão)
    if (homeSuspendedUntil >= m && Math.random() < 0.15) { // 15% de chance de gol por minuto para o visitante
      const val = awayDoubleGoalUntil >= m ? 2 : 1;
      awayGoals += val;
      const scorer = pickRandomScorer(awayTeam.players);
      finalAwayEvents.push({ 
        id: `a-susp-goal-${m}`, 
        minute: m, 
        player: scorer, 
        type: "goal", 
        teamId: awayTeam.id, 
        metadata: val === 2 ? "Vantagem Numérica + Gol Dobrado" : "Vantagem Numérica",
        description: `${scorer?.shortName || "Atacante"} aproveitou a vantagem numérica da suspensão e marcou para o ${awayTeam.name}!`
      });
    }
    if (awaySuspendedUntil >= m && Math.random() < 0.15) {
      const val = homeDoubleGoalUntil >= m ? 2 : 1;
      homeGoals += val;
      const scorer = pickRandomScorer(homeTeam.players);
      finalHomeEvents.push({ 
        id: `h-susp-goal-${m}`, 
        minute: m, 
        player: scorer, 
        type: "goal", 
        teamId: homeTeam.id, 
        metadata: val === 2 ? "Vantagem Numérica + Gol Dobrado" : "Vantagem Numérica",
        description: `${scorer?.shortName || "Atacante"} aproveitou a vantagem numérica da suspensão e marcou para o ${homeTeam.name}!`
      });
    }

    const eventsThisMinute = rawEvents.filter(e => e.minute === m);
    for (const ev of eventsThisMinute) {
      const isHome = ev.teamId === homeTeam.id;
      const tTeam = isHome ? homeTeam : awayTeam;
      const eTargetEvents = isHome ? finalHomeEvents : finalAwayEvents;
      
      const doubleActive = isHome ? (homeDoubleGoalUntil >= m) : (awayDoubleGoalUntil >= m);
      const goalVal = doubleActive ? 2 : 1;
      const doubleMeta = doubleActive ? " (Gol Dobrado)" : "";

      if (ev.type === "dado") {
        eTargetEvents.push({
          ...ev,
          description: `Dado da Liga sorteou formato ${dadoSorteado}! Dois minutos intensos em campo reduzido.`
        });
        // Chance de gol logo após o dado (ambos os lados podem aproveitar dependendo da pressão)
        if (Math.random() < 0.42) {
          const homeDadoChance = homeAtt / (homeAtt + awayDef);
          const isHomeDadoGoal = Math.random() < homeDadoChance;
          const scoringTeam = isHomeDadoGoal ? homeTeam : awayTeam;
          const scoringTargetEvents = isHomeDadoGoal ? finalHomeEvents : finalAwayEvents;
          const doubleActive = isHomeDadoGoal ? (homeDoubleGoalUntil >= m) : (awayDoubleGoalUntil >= m);
          const val = doubleActive ? 2 : 1;

          if (isHomeDadoGoal) homeGoals += val; else awayGoals += val;
          const scorer = pickRandomScorer(scoringTeam.players);
          scoringTargetEvents.push({ 
            id: `dado-goal-${m}-${isHomeDadoGoal ? 'h' : 'a'}`, 
            minute: m, 
            player: scorer, 
            type: "goal", 
            teamId: scoringTeam.id, 
            metadata: doubleActive ? `Gol no Dado (${dadoSorteado} - Dobrado)` : `Gol no Dado (${dadoSorteado})`,
            description: `${scorer?.shortName || "Jogador"} aproveitou o espaço aberto no ${dadoSorteado} e marcou com oportunismo para o ${scoringTeam.name}!`
          });
        }
      } 
      else if (ev.type === "carta") {
        let carta = ev.metadata as any;
        if (carta === "Coringa") carta = allCards.filter(c => c !== "Coringa")[Math.floor(Math.random() * 5)];
        
        let success = false;
        if (carta === "Pênalti" || carta === "Shootout") {
          const defendingGkOvr = isHome ? awayGkOvr : homeGkOvr;
          const defendingGkName = (isHome ? awayGkInfo.player?.shortName : homeGkInfo.player?.shortName) || "O arqueiro";
          const gkSaveBonus = ((defendingGkOvr - 75) * 0.008);
          const baseSuccess = carta === "Shootout" ? 0.65 : 0.72;
          const successChance = Math.max(0.40, Math.min(0.85, baseSuccess - gkSaveBonus));

          success = Math.random() < successChance;
          const shooter = pickRandomScorer(tTeam.players);
          if (success) {
            if (isHome) homeGoals += goalVal; else awayGoals += goalVal;
            eTargetEvents.push({ 
              id: `carta-${m}`, 
              minute: m, 
              player: shooter, 
              type: "carta", 
              teamId: ev.teamId, 
              cardType: carta,
              isSuccess: true,
              metadata: `${carta} convertido${doubleMeta}`,
              description: carta === "Shootout"
                ? `Arma Secreta: ${shooter?.shortName || "Atacante"} arrancou do meio-campo e converteu o Shootout no mano a mano!`
                : `Arma Secreta: Pênalti convertido com categoria por ${shooter?.shortName || "Cobrador"}!`
            });
          } else {
            eTargetEvents.push({ 
              id: `carta-err-${m}`, 
              minute: m, 
              player: shooter, 
              type: "info", 
              teamId: ev.teamId, 
              cardType: carta,
              isSuccess: false,
              metadata: `${carta} defendido`,
              description: carta === "Shootout"
                ? `Arma Secreta: ${defendingGkName} fechou o ângulo no mano a mano e salvou com uma defesa espetacular!`
                : `Arma Secreta: Pênalti defendido! ${defendingGkName} voou no canto e espalmou a cobrança.`
            });
          }
        } 
        else if (carta === "Pênalti Reverso") {
          success = Math.random() > 0.32; // 68% de chance do ADVERSÁRIO errar
          const shooter = pickRandomScorer(tTeam.players);
          if (success) {
            if (isHome) homeGoals += goalVal; else awayGoals += goalVal;
            eTargetEvents.push({ 
              id: `carta-${m}`, 
              minute: m, 
              player: shooter, 
              type: "carta", 
              teamId: ev.teamId, 
              cardType: "Pênalti Reverso",
              isSuccess: true,
              metadata: `Pênalti Reverso: Adv. Errou = Gol${doubleMeta}`,
              description: `Pênalti Reverso ativado! O adversário errou sob pressão e ${tTeam.name} converteu a penalidade!`
            });
          } else {
            eTargetEvents.push({ 
              id: `carta-err-${m}`, 
              minute: m, 
              player: null, 
              type: "info", 
              teamId: ev.teamId, 
              cardType: "Pênalti Reverso",
              isSuccess: false,
              metadata: `Pênalti Reverso: Adv. Marcou (Desperdiçado)`,
              description: `Pênalti Reverso ativado, mas o adversário conseguiu converter a cobrança.`
            });
          }
        } 
        else if (carta === "Gol Dobrado") {
          if (isHome) homeDoubleGoalUntil = m + 4; else awayDoubleGoalUntil = m + 4;
          eTargetEvents.push({ 
            id: `carta-${m}`, 
            minute: m, 
            player: null, 
            type: "carta", 
            teamId: ev.teamId, 
            cardType: "Gol Dobrado",
            isSuccess: true,
            metadata: `Arma Secreta: Gol Dobrado (Até ${m+4}')`,
            description: `${tTeam.name} ativou Gol Dobrado! Cada gol marcado até o minuto ${m+4}' valerá por 2!`
          });
        } 
        else if (carta === "Suspensão") {
          if (isHome) awaySuspendedUntil = m + 4; else homeSuspendedUntil = m + 4;
          eTargetEvents.push({ 
            id: `carta-${m}`, 
            minute: m, 
            player: null, 
            type: "carta", 
            teamId: ev.teamId, 
            cardType: "Suspensão",
            isSuccess: true,
            metadata: `Arma Secreta: Adv. Suspenso (Até ${m+4}')`,
            description: `Arma Secreta de Suspensão! O adversário joga com um a menos por 2 minutos.`
          });
        }
      } 
      else if (ev.type === "penalti_presidente") {
        const presName = isHome ? homePresName : awayPresName;
        const defGkOvr = isHome ? awayGkOvr : homeGkOvr;
        const defGkName = (isHome ? awayGkInfo.player?.shortName : homeGkInfo.player?.shortName) || "o goleiro";

        // Conversão base de 68%, calibrada pelo nível do goleiro adversário (-0.8% por ponto de overall do goleiro acima de 75)
        const gkFactor = ((defGkOvr - 75) * 0.008);
        const presSuccessProb = Math.max(0.38, Math.min(0.85, 0.68 - gkFactor));
        const success = Math.random() < presSuccessProb;

        if (success) {
          if (isHome) homeGoals += goalVal; else awayGoals += goalVal;
          eTargetEvents.push({ 
            id: `pres-${m}`, 
            minute: m, 
            player: null, 
            type: "penalti_presidente", 
            teamId: ev.teamId, 
            presidentName: presName,
            isSuccess: true,
            pointsAdded: goalVal,
            metadata: `Pênalti do Presidente (GOL)${doubleMeta}`,
            description: `${presName} foi para a marca da cal, bateu firme no canto e fez a festa!`
          });
        } else {
          eTargetEvents.push({ 
            id: `pres-err-${m}`, 
            minute: m, 
            player: null, 
            type: "penalti_presidente", 
            teamId: ev.teamId, 
            presidentName: presName,
            isSuccess: false,
            pointsAdded: 0,
            metadata: `Pênalti do Presidente (ERROU)`,
            description: `${presName} assumiu a cobrança de pênalti, mas ${defGkName} operou uma defesa espetacular!`
          });
        }
      }
    }
  }

  // Integrar Gols Normais após rodar as Cartas para evitar placares super-inflacionados
  const homeNormalGoals = Math.max(0, homeBaseGoals - homeGoals);
  const awayNormalGoals = Math.max(0, awayBaseGoals - awayGoals);

  for (let i = 0; i < homeNormalGoals; i++) {
    const min = getUniqueMinute(2, 37);
    homeGoals++;
    const scorer = pickRandomScorer(homeTeam.players);
    finalHomeEvents.push({ 
      id: `h-goal-base-${i}`, 
      minute: min, 
      player: scorer, 
      type: "goal", 
      teamId: homeTeam.id,
      description: `Golaço de ${scorer?.shortName || "Atacante"} para o ${homeTeam.name} após jogada envolvente!`
    });
  }

  for (let i = 0; i < awayNormalGoals; i++) {
    const min = getUniqueMinute(2, 37);
    awayGoals++;
    const scorer = pickRandomScorer(awayTeam.players);
    finalAwayEvents.push({ 
      id: `a-goal-base-${i}`, 
      minute: min, 
      player: scorer, 
      type: "goal", 
      teamId: awayTeam.id,
      description: `Golaço de ${scorer?.shortName || "Atacante"} para o ${awayTeam.name} finalizando com precisão!`
    });
  }

  // Re-ordenar eventos baseados no tempo real
  finalHomeEvents.sort((a, b) => a.minute - b.minute);
  finalAwayEvents.sort((a, b) => a.minute - b.minute);

  // ═══════════════════════════════════════════════════════════════
  // REGRAS OFICIAIS DA KINGS LEAGUE AOS 38 MINUTOS:
  //
  // 1. SE O JOGO ESTIVER EMPATADO AOS 38' (ex: 2x2, 1x1, 0x0):
  //    NÃO TEM MATCHBALL! O jogo vai DIRETO para os Shootouts de desempate!
  //
  // 2. SE NÃO ESTIVER EMPATADO AOS 38' (ex: 1x5, 3x2, 2x1):
  //    MATCHBALL ATIVADO! Alvo = MAX(placar) + 1.
  //    Gols valem APENAS 1 (NÃO É GOL DOBRADO).
  //    Desescalonado a cada minuto: 5v5 → 4v4 → 3v3 → 2v2 → 1v1 (com goleiro).
  //    NÃO EXISTE MATCHBALL ESGOTADO E NÃO TEM SHOOTOUTS!
  //    A partida é jogada até uma equipe atingir a quantidade de gols do alvo.
  // ═══════════════════════════════════════════════════════════════
  
  // Qualquer efeito anterior de gol dobrado expira aos 38 minutos
  homeDoubleGoalUntil = 0;
  awayDoubleGoalUntil = 0;

  const getBestOutfield = (players: Player[]): Player | null => {
    if (!players || players.length === 0) return null;
    const outfield = players.filter(p => p.role !== "goalkeeper");
    const candidates = outfield.length > 0 ? outfield : players;
    return [...candidates].sort((a, b) => getPlayerOverall(b) - getPlayerOverall(a))[0];
  };

  let winner: "home" | "away" | "draw" = "draw";
  let homeShootoutScore: number | undefined;
  let awayShootoutScore: number | undefined;
  let shootoutKicks: ShootoutKick[] | undefined;

  const isTiedAt38 = homeGoals === awayGoals;

  if (isTiedAt38) {
    // ───────────────────────────────────────────────────────────
    // CASO 1: EMPATE AOS 38' → VAI DIRETO PARA OS SHOOTOUTS!
    // ───────────────────────────────────────────────────────────
    finalHomeEvents.push({
      id: `so-start-38`,
      minute: 38,
      player: null,
      type: "info",
      teamId: homeTeam.id,
      metadata: `38' Empate (${homeGoals}x${awayGoals}) → Shootouts`,
      description: `⏱️ Tempo regulamentar encerrado em empate (${homeGoals}x${awayGoals}) aos 38 minutos! A decisão vai diretamente para a disputa de Shootouts (1v1 contra o goleiro)!`
    });

    homeShootoutScore = 0;
    awayShootoutScore = 0;
    shootoutKicks = [];
    const soRounds = 5;

    for (let i = 1; i <= soRounds; i++) {
      // Home kick vs Away GK
      const hKicker = homeTeam.players[(i - 1) % (homeTeam.players.length || 1)] || pickRandomScorer(homeTeam.players);
      const hKickerOvr = hKicker ? getPlayerOverall(hKicker) : 75;
      const hShooterBonus = (hKickerOvr - 75) * 0.010;
      const aGkPenalty = (awayGkOvr - 75) * 0.010;
      const hSuccessProb = Math.max(0.18, Math.min(0.82, 0.48 + hShooterBonus - aGkPenalty));
      const hSuccess = Math.random() < hSuccessProb;
      if (hSuccess) homeShootoutScore++;
      shootoutKicks.push({
        id: `so-h-${i}`,
        round: i,
        teamId: homeTeam.id,
        teamName: homeTeam.name,
        player: hKicker,
        isGoal: hSuccess,
        scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
        description: hSuccess
          ? `Shootout 1v1: ${hKicker?.shortName || "Cobrador"} arrancou do meio-campo no 1v1 e bateu no canto de ${awayGkInfo.player?.shortName || "o goleiro"}!`
          : `Shootout 1v1: ${hKicker?.shortName || "Cobrador"} tentou a finalização no mano a mano, mas ${awayGkInfo.player?.shortName || "o goleiro"} fechou o gol!`
      });

      // Checar se a disputa já foi decidida matematicamente após cobrança do mandante
      const awayRemainingAfterHome = 5 - (i - 1);
      const homeRemainingAfterHome = 5 - i;
      if (homeShootoutScore > awayShootoutScore + awayRemainingAfterHome ||
          awayShootoutScore > homeShootoutScore + homeRemainingAfterHome) {
        break;
      }

      // Away kick vs Home GK
      const aKicker = awayTeam.players[(i - 1) % (awayTeam.players.length || 1)] || pickRandomScorer(awayTeam.players);
      const aKickerOvr = aKicker ? getPlayerOverall(aKicker) : 75;
      const aShooterBonus = (aKickerOvr - 75) * 0.010;
      const hGkPenalty = (homeGkOvr - 75) * 0.010;
      const aSuccessProb = Math.max(0.18, Math.min(0.82, 0.48 + aShooterBonus - hGkPenalty));
      const aSuccess = Math.random() < aSuccessProb;
      if (aSuccess) awayShootoutScore++;
      shootoutKicks.push({
        id: `so-a-${i}`,
        round: i,
        teamId: awayTeam.id,
        teamName: awayTeam.name,
        player: aKicker,
        isGoal: aSuccess,
        scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
        description: aSuccess
          ? `Shootout 1v1: ${aKicker?.shortName || "Cobrador"} arrancou no 1v1 e superou ${homeGkInfo.player?.shortName || "o goleiro"}!`
          : `Shootout 1v1: ${aKicker?.shortName || "Cobrador"} tentou o drible, mas foi travado pela muralha de ${homeGkInfo.player?.shortName || "o goleiro"}!`
      });

      // Checar se a disputa foi decidida matematicamente após cobrança do visitante
      const remainingBoth = 5 - i;
      if (homeShootoutScore > awayShootoutScore + remainingBoth ||
          awayShootoutScore > homeShootoutScore + remainingBoth) {
        break;
      }
    }

    // Morte súbita se empatado após 5 rodadas
    let suddenRound = 6;
    while (homeShootoutScore === awayShootoutScore && suddenRound <= 12) {
      const hKicker = homeTeam.players[(suddenRound - 1) % (homeTeam.players.length || 1)] || pickRandomScorer(homeTeam.players);
      const hKickerOvr = hKicker ? getPlayerOverall(hKicker) : 75;
      const hSuccessProb = Math.max(0.18, Math.min(0.82, 0.50 + ((hKickerOvr - 75) * 0.008) - ((awayGkOvr - 75) * 0.008)));
      const hSuccess = Math.random() < hSuccessProb;
      if (hSuccess) homeShootoutScore++;
      shootoutKicks.push({
        id: `so-h-${suddenRound}`,
        round: suddenRound,
        teamId: homeTeam.id,
        teamName: homeTeam.name,
        player: hKicker,
        isGoal: hSuccess,
        scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
        description: hSuccess
          ? `Morte Súbita: ${hKicker?.shortName || "Cobrador"} converteu com autoridade!`
          : `Morte Súbita: ${hKicker?.shortName || "Cobrador"} parou na muralha defensiva do goleiro!`
      });

      const aKicker = awayTeam.players[(suddenRound - 1) % (awayTeam.players.length || 1)] || pickRandomScorer(awayTeam.players);
      const aKickerOvr = aKicker ? getPlayerOverall(aKicker) : 75;
      const aSuccessProb = Math.max(0.18, Math.min(0.82, 0.50 + ((aKickerOvr - 75) * 0.008) - ((homeGkOvr - 75) * 0.008)));
      const aSuccess = Math.random() < aSuccessProb;
      if (aSuccess) awayShootoutScore++;
      shootoutKicks.push({
        id: `so-a-${suddenRound}`,
        round: suddenRound,
        teamId: awayTeam.id,
        teamName: awayTeam.name,
        player: aKicker,
        isGoal: aSuccess,
        scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
        description: aSuccess
          ? `Morte Súbita: ${aKicker?.shortName || "Cobrador"} marcou no mano a mano!`
          : `Morte Súbita: ${aKicker?.shortName || "Cobrador"} desperdiçou a penalidade!`
      });

      suddenRound++;
    }

    if (homeShootoutScore === awayShootoutScore) {
      if (Math.random() > 0.5) homeShootoutScore++; else awayShootoutScore++;
    }

    winner = homeShootoutScore > awayShootoutScore ? "home" : "away";

  } else {
    // ───────────────────────────────────────────────────────────
    // CASO 2: NÃO EMPATADO AOS 38' → MODO MATCHBALL ATIVADO!
    // Alvo = MAX(placar) + 1.
    // É JOGADO ATÉ UMA EQUIPE ATINGIR O ALVO!
    // NÃO EXISTE SHOOTOUT! NÃO EXISTE MATCHBALL ESGOTADO!
    // Gol vale APENAS 1.
    // ───────────────────────────────────────────────────────────
    const matchballTarget = Math.max(homeGoals, awayGoals) + 1;

    finalHomeEvents.push({ 
      id: `mb-start-38`, 
      minute: 38, 
      player: null, 
      type: "info", 
      teamId: homeTeam.id, 
      metadata: `Matchball! Alvo: ${matchballTarget} gols`,
      description: `🔥 MATCHBALL ATIVADO! Quem fizer o ${matchballTarget}º gol primeiro vence a partida! Gol vale apenas 1. A cada minuto sai 1 jogador até 1v1 com goleiro.`
    });

    let matchballWinner: "home" | "away" | null = null;
    let mbMinute = 38;
    const formatSchedule = ["5v5", "4v4", "3v3", "2v2"];

    // Roda até alguém atingir o alvo: 5v5 → 4v4 → 3v3 → 2v2 → 1v1 com goleiro contínuo
    while (!matchballWinner && mbMinute < 55) {
      mbMinute++;
      const stageIdx = mbMinute - 39;
      const is1v1 = stageIdx >= formatSchedule.length;
      const format = is1v1 ? "1v1" : formatSchedule[stageIdx];
      const formatLabel = is1v1 ? "1v1 (com Goleiro no Gol)" : format;

      let homeGoalProb: number;
      let awayGoalProb: number;

      if (is1v1) {
        // 1v1 COM GOLEIRO NO GOL: espaço máximo, 1 de linha contra 1 de linha + goleiros nas metas
        const hAtt = getBestOutfield(homeTeam.players);
        const aAtt = getBestOutfield(awayTeam.players);
        const hAttOvr = hAtt ? getPlayerOverall(hAtt) : homeAtt;
        const aAttOvr = aAtt ? getPlayerOverall(aAtt) : awayAtt;

        homeGoalProb = Math.max(0.20, Math.min(0.65, 0.42 + ((hAttOvr - 75) * 0.010) - ((awayGkOvr - 75) * 0.010)));
        awayGoalProb = Math.max(0.20, Math.min(0.65, 0.42 + ((aAttOvr - 75) * 0.010) - ((homeGkOvr - 75) * 0.010)));

        if (stageIdx === formatSchedule.length) {
          finalHomeEvents.push({
            id: `mb-format-${mbMinute}`,
            minute: mbMinute,
            player: null,
            type: "info",
            teamId: homeTeam.id,
            metadata: formatLabel,
            description: `⚡ 1v1 COM GOLEIRO NO GOL! ${hAtt?.shortName || "Craque"} (${homeTeam.name}) vs ${aAtt?.shortName || "Craque"} (${awayTeam.name}), com os goleiros fechando as metas! Disputa contínua até o ${matchballTarget}º gol!`
          });
        }
      } else {
        const playersOnField = 5 - stageIdx;
        const spaceMultiplier = 1.0 + ((5 - playersOnField) * 0.12);
        const awayGkPenalty = (awayGkOvr - 75) * 0.005;
        const homeGkPenalty = (homeGkOvr - 75) * 0.005;

        homeGoalProb = Math.max(0.12, Math.min(0.55, (homeAtt / 100) * 0.22 * spaceMultiplier - awayGkPenalty));
        awayGoalProb = Math.max(0.12, Math.min(0.55, (awayAtt / 100) * 0.22 * spaceMultiplier - homeGkPenalty));

        finalHomeEvents.push({
          id: `mb-format-${mbMinute}`,
          minute: mbMinute,
          player: null,
          type: "info",
          teamId: homeTeam.id,
          metadata: `Matchball ${format}`,
          description: `${format} em campo! Cada vez menos jogadores. Gol vale 1. Alvo: ${matchballTarget} gols.`
        });
      }

      // Alternância justa de ataque no minuto do Matchball
      const homeAttacksFirst = Math.random() < 0.5;

      const runHomeAttack = () => {
        if (Math.random() < homeGoalProb) {
          homeGoals += 1;
          const scorer = is1v1 ? (getBestOutfield(homeTeam.players) || pickRandomScorer(homeTeam.players)) : pickRandomScorer(homeTeam.players);
          finalHomeEvents.push({
            id: `h-mb-${mbMinute}`,
            minute: mbMinute,
            player: scorer,
            type: "matchball",
            teamId: homeTeam.id,
            pointsAdded: 1,
            metadata: `Matchball ${format} (Gol +1) → ${homeGoals}x${awayGoals}`,
            description: is1v1
              ? `⚽ MATCHBALL NO 1v1! ${scorer?.shortName || "Atacante"} driblou no mano a mano e tocou na saída do goleiro! Gol vale 1. Placar: ${homeGoals}x${awayGoals}`
              : `⚽ MATCHBALL! ${scorer?.shortName || "Atacante"} marca no ${format} para o ${homeTeam.name}! Gol vale 1. Placar: ${homeGoals}x${awayGoals}`
          });

          if (homeGoals >= matchballTarget) {
            matchballWinner = "home";
            finalHomeEvents.push({
              id: `mb-win-h-${mbMinute}`,
              minute: mbMinute,
              player: null,
              type: "info",
              teamId: homeTeam.id,
              metadata: `${homeTeam.name} VENCE pelo Matchball!`,
              description: `🏆 FIM DE JOGO! ${homeTeam.name} alcançou a marca de ${matchballTarget} gols no Matchball e vence a partida!`
            });
            return true;
          }
        }
        return false;
      };

      const runAwayAttack = () => {
        if (Math.random() < awayGoalProb) {
          awayGoals += 1;
          const scorer = is1v1 ? (getBestOutfield(awayTeam.players) || pickRandomScorer(awayTeam.players)) : pickRandomScorer(awayTeam.players);
          finalAwayEvents.push({
            id: `a-mb-${mbMinute}`,
            minute: mbMinute,
            player: scorer,
            type: "matchball",
            teamId: awayTeam.id,
            pointsAdded: 1,
            metadata: `Matchball ${format} (Gol +1) → ${homeGoals}x${awayGoals}`,
            description: is1v1
              ? `⚽ MATCHBALL NO 1v1! ${scorer?.shortName || "Atacante"} superou a marcação no mano a mano e balançou as redes! Gol vale 1. Placar: ${homeGoals}x${awayGoals}`
              : `⚽ MATCHBALL! ${scorer?.shortName || "Atacante"} marca no ${format} para o ${awayTeam.name}! Gol vale 1. Placar: ${homeGoals}x${awayGoals}`
          });

          if (awayGoals >= matchballTarget) {
            matchballWinner = "away";
            finalAwayEvents.push({
              id: `mb-win-a-${mbMinute}`,
              minute: mbMinute,
              player: null,
              type: "info",
              teamId: awayTeam.id,
              metadata: `${awayTeam.name} VENCE pelo Matchball!`,
              description: `🏆 FIM DE JOGO! ${awayTeam.name} alcançou a marca de ${matchballTarget} gols no Matchball e vence a partida!`
            });
            return true;
          }
        }
        return false;
      };

      if (homeAttacksFirst) {
        if (runHomeAttack()) break;
        if (runAwayAttack()) break;
      } else {
        if (runAwayAttack()) break;
        if (runHomeAttack()) break;
      }
    }

    // Trava de segurança para garantir vencedor
    if (!matchballWinner) {
      if (homeGoals >= awayGoals) {
        homeGoals = matchballTarget;
        matchballWinner = "home";
      } else {
        awayGoals = matchballTarget;
        matchballWinner = "away";
      }
    }

    winner = matchballWinner;
  }

  finalHomeEvents.sort((a, b) => a.minute - b.minute);
  finalAwayEvents.sort((a, b) => a.minute - b.minute);

  return {
    homeScore: homeGoals,
    awayScore: awayGoals,
    homeEvents: finalHomeEvents,
    awayEvents: finalAwayEvents,
    homeShootoutScore,
    awayShootoutScore,
    shootoutKicks,
    winner
  };
}

export function createInitialStandings(teams: SimulatedTeam[]): Record<string, TeamStanding> {
  const standings: Record<string, TeamStanding> = {};
  for (const t of teams) {
    standings[t.id] = {
      teamId: t.id,
      teamName: t.name,
      competition: t.competition,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  }
  return standings;
}

export function updateStandingsWithMatch(
  standings: Record<string, TeamStanding>,
  homeTeamId: string,
  awayTeamId: string,
  result: DetailedMatchResult
) {
  const home = standings[homeTeamId];
  const away = standings[awayTeamId];

  if (!home || !away) return;

  home.played++;
  away.played++;

  home.goalsFor += result.homeScore;
  home.goalsAgainst += result.awayScore;
  home.goalDifference = home.goalsFor - home.goalsAgainst;

  away.goalsFor += result.awayScore;
  away.goalsAgainst += result.homeScore;
  away.goalDifference = away.goalsFor - away.goalsAgainst;

  if (result.winner === "home") {
    if (result.homeShootoutScore !== undefined) {
      // Vitòria no Shootout = 2 pontos, Derrota no SO = 1 ponto
      home.drawn++; // Conta como empate no tempo normal para estatísticas
      away.drawn++;
      home.points += 2;
      away.points += 1;
    } else {
      home.won++;
      home.points += 3;
      away.lost++;
    }
  } else if (result.winner === "away") {
    if (result.awayShootoutScore !== undefined) {
      // Vitòria no Shootout = 2 pontos, Derrota no SO = 1 ponto
      away.drawn++;
      home.drawn++;
      away.points += 2;
      home.points += 1;
    } else {
      away.won++;
      away.points += 3;
      home.lost++;
    }
  }
}

export function reverseStandingsWithMatch(
  standings: Record<string, TeamStanding>,
  homeTeamId: string,
  awayTeamId: string,
  result: DetailedMatchResult
) {
  const home = standings[homeTeamId];
  const away = standings[awayTeamId];

  if (!home || !away) return;

  home.played = Math.max(0, home.played - 1);
  away.played = Math.max(0, away.played - 1);

  home.goalsFor -= result.homeScore;
  home.goalsAgainst -= result.awayScore;
  home.goalDifference = home.goalsFor - home.goalsAgainst;

  away.goalsFor -= result.awayScore;
  away.goalsAgainst -= result.homeScore;
  away.goalDifference = away.goalsFor - away.goalsAgainst;

  if (result.winner === "home") {
    if (result.homeShootoutScore !== undefined) {
      home.drawn = Math.max(0, home.drawn - 1);
      away.drawn = Math.max(0, away.drawn - 1);
      home.points -= 2;
      away.points -= 1;
    } else {
      home.won = Math.max(0, home.won - 1);
      home.points -= 3;
      away.lost = Math.max(0, away.lost - 1);
    }
  } else if (result.winner === "away") {
    if (result.awayShootoutScore !== undefined) {
      away.drawn = Math.max(0, away.drawn - 1);
      home.drawn = Math.max(0, home.drawn - 1);
      away.points -= 2;
      home.points -= 1;
    } else {
      away.won = Math.max(0, away.won - 1);
      away.points -= 3;
      home.lost = Math.max(0, home.lost - 1);
    }
  }
}

export function sortStandings(standings: Record<string, TeamStanding>): TeamStanding[] {
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// Gera um calendário simples Round-Robin (todos contra todos)
export function generateSchedule(teams: SimulatedTeam[]) {
  const schedule: { round: number; matches: { home: SimulatedTeam; away: SimulatedTeam }[] }[] = [];
  
  const ids = teams.map(t => t.id);
  if (ids.length % 2 !== 0) ids.push("BYE");

  const numRounds = ids.length - 1;
  const half = ids.length / 2;

  const getTeamById = (id: string) => teams.find(t => t.id === id)!;

  for (let r = 0; r < numRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const homeId = ids[i];
      const awayId = ids[ids.length - 1 - i];
      if (homeId !== "BYE" && awayId !== "BYE") {
        // Alterne mandante/visitante
        if (i % 2 === 0) {
          roundMatches.push({ home: getTeamById(homeId), away: getTeamById(awayId) });
        } else {
          roundMatches.push({ home: getTeamById(awayId), away: getTeamById(homeId) });
        }
      }
    }
    schedule.push({ round: r + 1, matches: roundMatches });

    // Rotate
    const last = ids.pop()!;
    ids.splice(1, 0, last);
  }

  return schedule;
}

// Calcula probabilidades matemáticas analíticas para previsão pré-jogo e transparência de balanceamento
export function predictMatchProbability(
  homeTeam: SimulatedTeam,
  awayTeam: SimulatedTeam,
  difficultyMode: string = "Clássico"
): MatchPrediction {
  const homeAtt = homeTeam.attackScore || homeTeam.overall || 75;
  const homeDef = homeTeam.defenseScore || homeTeam.overall || 75;
  const awayAtt = awayTeam.attackScore || awayTeam.overall || 75;
  const awayDef = awayTeam.defenseScore || awayTeam.overall || 75;

  const homeGkInfo = getTeamGoalkeeper(homeTeam);
  const awayGkInfo = getTeamGoalkeeper(awayTeam);

  // Diferença setorial ponderada: Ataque vs Defesa adversária (40%) + Defesa vs Ataque adversário (35%) + Goleiros (25%)
  const attDiff = homeAtt - awayDef;
  const defDiff = homeDef - awayAtt;
  const gkDiff = homeGkInfo.ovr - awayGkInfo.ovr;
  const totalPowerDiff = (attDiff * 0.40) + (defDiff * 0.35) + (gkDiff * 0.25);

  let rawWinProb = 0.46 + (totalPowerDiff * 0.026);
  if (difficultyMode === "Lendas") rawWinProb -= 0.05;

  let homeWinProb = Math.max(0.08, Math.min(0.88, rawWinProb));
  let drawProb = Math.max(0.07, Math.min(0.18, 0.16 - Math.abs(totalPowerDiff) * 0.004));
  let awayWinProb = Math.max(0.05, 1.0 - homeWinProb - drawProb);

  const total = homeWinProb + drawProb + awayWinProb;
  const hPct = Math.round((homeWinProb / total) * 100);
  const dPct = Math.round((drawProb / total) * 100);
  const aPct = 100 - hPct - dPct;

  const expHome = Math.max(1.0, 1.8 + (attDiff * 0.07) - ((awayGkInfo.ovr - 75) * 0.025) + 0.9);
  const expAway = Math.max(0.8, 1.8 - (defDiff * 0.07) - ((homeGkInfo.ovr - 75) * 0.025) + 0.9);

  const keyStrengths: string[] = [];
  if (attDiff >= 5) keyStrengths.push(`Superioridade Ofensiva (+${attDiff} sobre a zaga adversária)`);
  if (defDiff >= 5) keyStrengths.push(`Solidez Defensiva (+${defDiff} sobre o ataque adversário)`);
  if (homeGkInfo.ovr >= 85) keyStrengths.push(`Goleiro de Elite (${homeGkInfo.player?.shortName || "Goleiro"} ${homeGkInfo.ovr})`);
  if (homeTeam.playStyle === "Ofensivo") keyStrengths.push("Postura Agressiva em Campo Aberto");
  if (homeTeam.playStyle === "Defensivo") keyStrengths.push("Muralha Tática Compacta");

  let tacticalAdvantage = "Confronto equilibrado sem favoritismo claro.";
  if (totalPowerDiff >= 8) tacticalAdvantage = "Amplo favoritismo com superioridade em todos os setores.";
  else if (totalPowerDiff >= 3) tacticalAdvantage = "Ligeira vantagem técnica e maior poder de finalização.";
  else if (totalPowerDiff <= -8) tacticalAdvantage = "Desafio de alto risco: adversário possui elenco superior.";
  else if (totalPowerDiff <= -3) tacticalAdvantage = "Adversário ligeiramente superior nos atributos.";

  return {
    homeWinProb: hPct,
    awayWinProb: aPct,
    drawProb: dPct,
    expectedHomeGoals: Number(expHome.toFixed(1)),
    expectedAwayGoals: Number(expAway.toFixed(1)),
    ratingAdvantage: Math.round(totalPowerDiff),
    tacticalAdvantage,
    keyStrengths: keyStrengths.length > 0 ? keyStrengths : ["Equilíbrio Coletivo"]
  };
}

export interface PresidentPenaltyResolution {
  isGoal: boolean;
  outcomeType: "goal" | "saved" | "woodwork";
  shotZone: string;
  shotStyle: "colocada" | "bomba" | "cavadinha";
  description: string;
}

export function runQuickShootouts(homeTeam: SimulatedTeam, awayTeam: SimulatedTeam): {
  homeScore: number;
  awayScore: number;
  winner: "home" | "away";
  kicks: ShootoutKick[];
} {
  const homeGkInfo = getTeamGoalkeeper(homeTeam);
  const awayGkInfo = getTeamGoalkeeper(awayTeam);
  const homeGkOvr = homeGkInfo.ovr;
  const awayGkOvr = awayGkInfo.ovr;

  let homeShootoutScore = 0;
  let awayShootoutScore = 0;
  const kicks: ShootoutKick[] = [];
  const soRounds = 5;

  for (let i = 1; i <= soRounds; i++) {
    const hKicker = homeTeam.players[(i - 1) % (homeTeam.players.length || 1)] || pickRandomScorer(homeTeam.players);
    const hKickerOvr = hKicker ? getPlayerOverall(hKicker) : 75;
    const hShooterBonus = (hKickerOvr - 75) * 0.010;
    const aGkPenalty = (awayGkOvr - 75) * 0.010;
    const hSuccessProb = Math.max(0.18, Math.min(0.82, 0.48 + hShooterBonus - aGkPenalty));
    const hSuccess = Math.random() < hSuccessProb;
    if (hSuccess) homeShootoutScore++;
    kicks.push({
      id: `so-h-${i}`,
      round: i,
      teamId: homeTeam.id,
      teamName: homeTeam.name,
      player: hKicker,
      isGoal: hSuccess,
      scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
      description: hSuccess
        ? `Shootout 1v1: ${hKicker?.shortName || "Cobrador"} arrancou do meio-campo no 1v1 e superou ${awayGkInfo.player?.shortName || "o goleiro"}!`
        : `Shootout 1v1: ${hKicker?.shortName || "Cobrador"} tentou a finalização no mano a mano, mas ${awayGkInfo.player?.shortName || "o goleiro"} fechou o gol!`
    });

    // Checar se a disputa já foi decidida matematicamente após cobrança do mandante
    const awayRemainingAfterHome = 5 - (i - 1);
    const homeRemainingAfterHome = 5 - i;
    if (homeShootoutScore > awayShootoutScore + awayRemainingAfterHome ||
        awayShootoutScore > homeShootoutScore + homeRemainingAfterHome) {
      break;
    }

    const aKicker = awayTeam.players[(i - 1) % (awayTeam.players.length || 1)] || pickRandomScorer(awayTeam.players);
    const aKickerOvr = aKicker ? getPlayerOverall(aKicker) : 75;
    const aShooterBonus = (aKickerOvr - 75) * 0.010;
    const hGkPenalty = (homeGkOvr - 75) * 0.010;
    const aSuccessProb = Math.max(0.18, Math.min(0.82, 0.48 + aShooterBonus - hGkPenalty));
    const aSuccess = Math.random() < aSuccessProb;
    if (aSuccess) awayShootoutScore++;
    kicks.push({
      id: `so-a-${i}`,
      round: i,
      teamId: awayTeam.id,
      teamName: awayTeam.name,
      player: aKicker,
      isGoal: aSuccess,
      scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
      description: aSuccess
        ? `Shootout 1v1: ${aKicker?.shortName || "Cobrador"} arrancou no 1v1 e superou ${homeGkInfo.player?.shortName || "o goleiro"}!`
        : `Shootout 1v1: ${aKicker?.shortName || "Cobrador"} tentou o drible, mas foi travado pela muralha de ${homeGkInfo.player?.shortName || "o goleiro"}!`
    });

    // Checar se a disputa foi decidida matematicamente após cobrança do visitante
    const remainingBoth = 5 - i;
    if (homeShootoutScore > awayShootoutScore + remainingBoth ||
        awayShootoutScore > homeShootoutScore + remainingBoth) {
      break;
    }
  }

  let suddenRound = 6;
  while (homeShootoutScore === awayShootoutScore && suddenRound <= 12) {
    const hKicker = homeTeam.players[(suddenRound - 1) % (homeTeam.players.length || 1)] || pickRandomScorer(homeTeam.players);
    const hKickerOvr = hKicker ? getPlayerOverall(hKicker) : 75;
    const hSuccessProb = Math.max(0.18, Math.min(0.82, 0.50 + ((hKickerOvr - 75) * 0.008) - ((awayGkOvr - 75) * 0.008)));
    const hSuccess = Math.random() < hSuccessProb;
    if (hSuccess) homeShootoutScore++;
    kicks.push({
      id: `so-h-${suddenRound}`,
      round: suddenRound,
      teamId: homeTeam.id,
      teamName: homeTeam.name,
      player: hKicker,
      isGoal: hSuccess,
      scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
      description: hSuccess
        ? `Morte Súbita: ${hKicker?.shortName || "Cobrador"} converteu com autoridade!`
        : `Morte Súbita: ${hKicker?.shortName || "Cobrador"} parou na muralha defensiva do goleiro!`
    });

    const aKicker = awayTeam.players[(suddenRound - 1) % (awayTeam.players.length || 1)] || pickRandomScorer(awayTeam.players);
    const aKickerOvr = aKicker ? getPlayerOverall(aKicker) : 75;
    const aSuccessProb = Math.max(0.18, Math.min(0.82, 0.50 + ((aKickerOvr - 75) * 0.008) - ((homeGkOvr - 75) * 0.008)));
    const aSuccess = Math.random() < aSuccessProb;
    if (aSuccess) awayShootoutScore++;
    kicks.push({
      id: `so-a-${suddenRound}`,
      round: suddenRound,
      teamId: awayTeam.id,
      teamName: awayTeam.name,
      player: aKicker,
      isGoal: aSuccess,
      scoreAfter: { home: homeShootoutScore, away: awayShootoutScore },
      description: aSuccess
        ? `Morte Súbita: ${aKicker?.shortName || "Cobrador"} marcou no mano a mano!`
        : `Morte Súbita: ${aKicker?.shortName || "Cobrador"} desperdiçou a penalidade!`
    });

    suddenRound++;
  }

  if (homeShootoutScore === awayShootoutScore) {
    if (Math.random() > 0.5) homeShootoutScore++; else awayShootoutScore++;
  }

  return {
    homeScore: homeShootoutScore,
    awayScore: awayShootoutScore,
    winner: homeShootoutScore > awayShootoutScore ? "home" : "away",
    kicks
  };
}

export function applyUserPresidentPenaltyResult(
  currentResult: DetailedMatchResult,
  homeTeam: SimulatedTeam,
  awayTeam: SimulatedTeam,
  userTeamId: string,
  resolution: PresidentPenaltyResolution
): DetailedMatchResult {
  const isHome = homeTeam.id === userTeamId;
  const homeEvents = currentResult.homeEvents.map(e => ({ ...e }));
  const awayEvents = currentResult.awayEvents.map(e => ({ ...e }));
  const targetEvents = isHome ? homeEvents : awayEvents;

  const presEvIndex = targetEvents.findIndex(e => e.type === "penalti_presidente" && e.teamId === userTeamId);
  if (presEvIndex === -1) return currentResult;

  const oldEv = targetEvents[presEvIndex];
  const wasSuccess = oldEv.isSuccess ?? false;
  const isNowSuccess = resolution.isGoal;

  const points = oldEv.pointsAdded !== undefined && oldEv.pointsAdded > 0
    ? oldEv.pointsAdded
    : (oldEv.metadata?.includes("Gol Dobrado") ? 2 : 1);

  targetEvents[presEvIndex] = {
    ...oldEv,
    isSuccess: isNowSuccess,
    pointsAdded: isNowSuccess ? points : 0,
    metadata: isNowSuccess
      ? `Pênalti do Presidente (GOL)${points === 2 ? " (GOL DOBRADO)" : ""}`
      : resolution.outcomeType === "woodwork"
        ? `Pênalti do Presidente (NA TRAVE)`
        : `Pênalti do Presidente (ERROU)`,
    description: resolution.description
  };

  let newHomeScore = currentResult.homeScore;
  let newAwayScore = currentResult.awayScore;

  if (wasSuccess !== isNowSuccess) {
    const delta = isNowSuccess ? points : -points;
    if (isHome) {
      newHomeScore = Math.max(0, newHomeScore + delta);
    } else {
      newAwayScore = Math.max(0, newAwayScore + delta);
    }
  }

  let winner = currentResult.winner;
  let homeShootoutScore = currentResult.homeShootoutScore;
  let awayShootoutScore = currentResult.awayShootoutScore;
  let shootoutKicks = currentResult.shootoutKicks;

  // Se o jogo NÃO está mais empatado aos 38'
  if (newHomeScore !== newAwayScore) {
    winner = newHomeScore > newAwayScore ? "home" : "away";
    homeShootoutScore = undefined;
    awayShootoutScore = undefined;
    shootoutKicks = undefined;
    const cleanHomeEvents = homeEvents.filter(e => !e.id.startsWith("so-"));
    const cleanAwayEvents = awayEvents.filter(e => !e.id.startsWith("so-"));
    return {
      ...currentResult,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      winner,
      homeEvents: cleanHomeEvents,
      awayEvents: cleanAwayEvents,
      homeShootoutScore,
      awayShootoutScore,
      shootoutKicks
    };
  } else {
    // Se o jogo ficou EMPATADO aos 38'
    if (!shootoutKicks || shootoutKicks.length === 0) {
      const soResult = runQuickShootouts(homeTeam, awayTeam);
      homeShootoutScore = soResult.homeScore;
      awayShootoutScore = soResult.awayScore;
      shootoutKicks = soResult.kicks;
      winner = soResult.winner;
      homeEvents.push({
        id: `so-start-38`,
        minute: 38,
        player: null,
        type: "info",
        teamId: homeTeam.id,
        metadata: `38' Empate (${newHomeScore}x${newAwayScore}) → Shootouts`,
        description: `⏱️ Tempo regulamentar encerrado em empate (${newHomeScore}x${newAwayScore}) aos 38 minutos! A decisão vai para os Shootouts!`
      });
    }
    return {
      ...currentResult,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      winner,
      homeEvents,
      awayEvents,
      homeShootoutScore,
      awayShootoutScore,
      shootoutKicks
    };
  }
}

