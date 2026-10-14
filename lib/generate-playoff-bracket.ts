import { Team, TeamStanding, PlayoffBracket, PlayoffMatch, Round } from "@/types/kings-league";

/**
 * Determina qual grupo tem a vantagem do Challenger (SC) na Kings Cup.
 * O grupo que vencer mais jogos de Challenger leva a vantagem:
 * - 1º lugar do grupo vencedor vai direto para a Semifinal
 * - 2º, 3º e 4º vão para as Quartas de Final
 * - Do outro grupo, 1º, 2º e 3º vão para as Quartas de Final
 * - 5º do grupo vencedor e 4º/5º do outro grupo são eliminados.
 */
export function determineChallengerAdvantage(
  rounds?: Round[],
  standings?: TeamStanding[],
  teams?: Record<string, Team>
): {
  advantageGroup: string;
  otherGroup: string;
  groupAWins: number;
  groupBWins: number;
  groupAPoints: number;
  groupBPoints: number;
} {
  // Verifica se a competição possui legitimamente dois grupos A e B
  const hasStandingGroups = Boolean(
    standings?.some((s) => s.groupName === "A") &&
    standings?.some((s) => s.groupName === "B")
  );
  const hasRoundGroups = Boolean(
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "A")) &&
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "B"))
  );
  const hasTwoGroups = hasStandingGroups || hasRoundGroups;

  if (!hasTwoGroups) {
    return {
      advantageGroup: "",
      otherGroup: "",
      groupAWins: 0,
      groupBWins: 0,
      groupAPoints: 0,
      groupBPoints: 0,
    };
  }

  const teamGroup: Record<string, string> = {};

  // 1. Mapear time -> grupo através dos standings
  standings?.forEach((s) => {
    const g = s.groupName || (s as any).group;
    if (g && (g === "A" || g === "B")) {
      teamGroup[s.id] = g;
    }
  });

  // 2. Mapear time -> grupo através das partidas
  rounds?.forEach((r) => {
    r.matches.forEach((m) => {
      if (m.groupName === "A" || m.groupName === "B") {
        if (!teamGroup[m.participants.homeTeamId]) teamGroup[m.participants.homeTeamId] = m.groupName;
        if (!teamGroup[m.participants.awayTeamId]) teamGroup[m.participants.awayTeamId] = m.groupName;
      }
    });
  });

  let groupAWins = 0;
  let groupBWins = 0;

  rounds?.forEach((r) => {
    r.matches.forEach((m) => {
      const homeGroup = teamGroup[m.participants.homeTeamId];
      const awayGroup = teamGroup[m.participants.awayTeamId];

      const isChallengerMatch =
        m.groupName?.toLowerCase() === "challenger" ||
        (homeGroup && awayGroup && homeGroup !== awayGroup && (homeGroup === "A" || homeGroup === "B") && (awayGroup === "A" || awayGroup === "B"));

      if (!isChallengerMatch) return;

      const { homeScore, awayScore, homeScoreP, awayScoreP } = m.scores;
      if (homeScore === null || awayScore === null) return;

      let winnerGroup: string | null = null;
      if (homeScore > awayScore) {
        winnerGroup = homeGroup || null;
      } else if (awayScore > homeScore) {
        winnerGroup = awayGroup || null;
      } else if (homeScoreP !== null && awayScoreP !== null) {
        if (homeScoreP > awayScoreP) winnerGroup = homeGroup || null;
        else if (awayScoreP > homeScoreP) winnerGroup = awayGroup || null;
      }

      if (winnerGroup === "A") groupAWins += 1;
      else if (winnerGroup === "B") groupBWins += 1;
    });
  });

  let groupAPoints = 0;
  let groupBPoints = 0;
  standings?.forEach((s) => {
    const g = s.groupName || (s as any).group || teamGroup[s.id];
    const pts = s.points ?? ((s.won ?? 0) * 3);
    if (g === "A") groupAPoints += pts;
    else if (g === "B") groupBPoints += pts;
  });

  let advantageGroup = "A";
  if (groupBWins > groupAWins) {
    advantageGroup = "B";
  } else if (groupAWins > groupBWins) {
    advantageGroup = "A";
  } else {
    // Desempate por total de pontos dos grupos
    advantageGroup = groupBPoints > groupAPoints ? "B" : "A";
  }

  const otherGroup = advantageGroup === "A" ? "B" : "A";

  return {
    advantageGroup,
    otherGroup,
    groupAWins,
    groupBWins,
    groupAPoints,
    groupBPoints,
  };
}

/**
 * Mescla dados de partidas oficiais dos playoffs (já realizadas ou agendadas) no chaveamento.
 */
export function applyOfficialPlayoffsToBracket(
  bracket: PlayoffBracket,
  officialPlayoffs: unknown[]
): PlayoffBracket {
  if (!bracket || !Array.isArray(officialPlayoffs) || officialPlayoffs.length === 0) {
    return bracket;
  }

  const updatedBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;

  let qfOfficial: any[] = [];
  let playInOfficial: any[] = [];
  const playInTurns: any[][] = [];
  let sfOfficial: any[] = [];
  let finalOfficial: any | null = null;

  for (const turn of officialPlayoffs as any[]) {
    const turnName = String(turn?.name || turn?.turnName || turn?.displayName || "").toLowerCase();
    const matches = Array.isArray(turn?.matches) ? turn.matches : [];

    if (/(quarta|cuart|quarter|qf)/i.test(turnName)) {
      qfOfficial = matches;
    } else if (turnName.includes("play") || turnName.includes("repesc")) {
      playInOfficial = [...playInOfficial, ...matches];
      playInTurns.push(matches);
    } else if (/(semi|sf)/i.test(turnName)) {
      sfOfficial = matches;
    } else if (turnName.includes("final")) {
      finalOfficial = matches[0] || null;
    }
  }

  const getPosition = (m: any, fallback: number) => {
    try {
      if (m?.metaInformation?.bracket_config) {
        const cfg = typeof m.metaInformation.bracket_config === "string"
          ? JSON.parse(m.metaInformation.bracket_config)
          : m.metaInformation.bracket_config;
        if (cfg?.position_in_turn !== undefined) return Number(cfg.position_in_turn);
      }
    } catch {
      // Ignora erro de JSON parse
    }
    return fallback;
  };

  qfOfficial.sort((a, b) => getPosition(a, 0) - getPosition(b, 0));
  sfOfficial.sort((a, b) => getPosition(a, 0) - getPosition(b, 0));

  const fillMatch = (targetMatch: PlayoffMatch | undefined, officialMatch: any) => {
    if (!targetMatch || !officialMatch) return;

    const homeId = (officialMatch.participants?.homeTeamId ?? officialMatch.homeTeamId)
      ? String(officialMatch.participants?.homeTeamId ?? officialMatch.homeTeamId)
      : null;
    const awayId = (officialMatch.participants?.awayTeamId ?? officialMatch.awayTeamId)
      ? String(officialMatch.participants?.awayTeamId ?? officialMatch.awayTeamId)
      : null;

    if (homeId) targetMatch.homeTeamId = homeId;
    if (awayId) targetMatch.awayTeamId = awayId;

    const score = officialMatch.scores ?? officialMatch.score ?? officialMatch.result ?? {};
    const hs = score.homeScore ?? score.home;
    const as = score.awayScore ?? score.away;
    const hp = score.homeScoreP ?? score.homePenalty;
    const ap = score.awayScoreP ?? score.awayPenalty;

    if (hs !== null && hs !== undefined) targetMatch.homeScore = Number(hs);
    if (as !== null && as !== undefined) targetMatch.awayScore = Number(as);
    if (hp !== null && hp !== undefined) targetMatch.homeScoreP = Number(hp);
    if (ap !== null && ap !== undefined) targetMatch.awayScoreP = Number(ap);

    // Determina o vencedor oficial da partida
    let winner: string | null = null;
    if (hs !== null && as !== null && hs !== undefined && as !== undefined) {
      if (hs > as) winner = homeId;
      else if (as > hs) winner = awayId;
      else if (hp !== null && ap !== null && hp !== undefined && ap !== undefined) {
        winner = hp > ap ? homeId : ap > hp ? awayId : null;
      }
    }
    if (winner) targetMatch.winnerId = winner;

    targetMatch.youtubeUrl = officialMatch.metaInformation?.youtube_url || officialMatch.metaInformation?.live_link || undefined;
    const hasOfficialScore = hs !== null && hs !== undefined && as !== null && as !== undefined;
    targetMatch.status = officialMatch.status || (hasOfficialScore ? "ended" : undefined);
  };

  if (updatedBracket.quarterfinals) {
    qfOfficial.forEach((match, index) => fillMatch(updatedBracket.quarterfinals[index], match));
  }
  if (updatedBracket.playIns) {
    const officialCount = playInOfficial.length;
    while (updatedBracket.playIns.length < officialCount) {
      const index = updatedBracket.playIns.length + 1;
      updatedBracket.playIns.push({
        id: `pi${index}`,
        stage: "playin",
        matchNumber: index,
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: null,
        order: index,
      });
    }
    playInOfficial.forEach((match, index) => fillMatch(updatedBracket.playIns[index], match));
    updatedBracket.playInRounds = playInTurns.length > 0
      ? splitPlayInMatches(updatedBracket.playIns, playInTurns)
      : [updatedBracket.playIns];
  }

  if (updatedBracket.semifinals) {
    if (sfOfficial[0]) fillMatch(updatedBracket.semifinals[0], sfOfficial[0]);
    if (sfOfficial[1]) fillMatch(updatedBracket.semifinals[1], sfOfficial[1]);
  }

  if (updatedBracket.final && finalOfficial) {
    fillMatch(updatedBracket.final, finalOfficial);
  }

  return updatedBracket;
}

function splitPlayInMatches(
  playIns: PlayoffMatch[],
  turns: any[][]
): PlayoffMatch[][] {
  const rounds: PlayoffMatch[][] = [];
  let offset = 0;

  for (const turn of turns) {
    const size = Array.isArray(turn) ? turn.length : 0;
    if (size > 0) {
      rounds.push(playIns.slice(offset, offset + size));
      offset += size;
    }
  }

  if (offset < playIns.length) {
    rounds.push(playIns.slice(offset));
  }

  return rounds.length > 0 ? rounds : [playIns];
}

/**
 * Gera o chaveamento dos playoffs com base na classificação atual.
 * Suporta o formato oficial Kings Cup com 2 grupos e vantagem de Challenger (SC),
 * com fallback para formato de tabela única quando aplicável.
 */
export function generatePlayoffBracket(
  standings: TeamStanding[],
  teams: Record<string, Team>,
  rounds?: Round[],
  officialPlayoffs?: unknown[]
): PlayoffBracket {
  if (standings.length < 7) {
    throw new Error("É necessário ter pelo menos 7 times na classificação para gerar os playoffs");
  }

  // Verifica se é formato Kings Cup com 2 grupos (Grupos A e B)
  const hasStandingGroups = Boolean(
    standings.some((s) => s.groupName === "A") &&
    standings.some((s) => s.groupName === "B")
  );
  const hasRoundGroups = Boolean(
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "A")) &&
    rounds?.some((r) => r.matches?.some((m) => m.groupName === "B"))
  );
  const isKingsCupGroupFormat = hasStandingGroups || hasRoundGroups;

  if (isKingsCupGroupFormat) {
    const groupA = standings.filter((s) => s.groupName === "A" || (s as any).group === "A");
    const groupB = standings.filter((s) => s.groupName === "B" || (s as any).group === "B");

    // Regra Kings Cup:
    // O grupo que vencer mais no Challenger (SC) leva a vantagem:
    // - 1º do grupo com vantagem vai DIRETO para a Semifinal 1
    // - 2º, 3º e 4º do grupo com vantagem vão para as Quartas
    // - 1º, 2º e 3º do outro grupo vão para as Quartas
    // Confrontos das Quartas:
    // QF1: 4º do Grupo Vencedor vs 1º do Outro Grupo (vencedor enfrenta o 1º na Semifinal 1)
    // QF2: 3º do Grupo Vencedor vs 2º do Outro Grupo (vai para a Semifinal 2)
    // QF3: 2º do Grupo Vencedor vs 3º do Outro Grupo (vai para a Semifinal 2)
    const { advantageGroup, otherGroup } = determineChallengerAdvantage(rounds, standings, teams);

    const sortGroup = (arr: TeamStanding[]) =>
      arr.slice().sort((a, b) => {
        const rankA = Number(a.rank || 0);
        const rankB = Number(b.rank || 0);
        if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB;
        const ptsA = a.points ?? ((a.won ?? 0) * 3);
        const ptsB = b.points ?? ((b.won ?? 0) * 3);
        if (ptsB !== ptsA) return ptsB - ptsA;
        const gdA = a.goalDifference ?? ((a.goalsFor ?? 0) - (a.goalsAgainst ?? 0));
        const gdB = b.goalDifference ?? ((b.goalsFor ?? 0) - (b.goalsAgainst ?? 0));
        if (gdB !== gdA) return gdB - gdA;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });

    const groupAdv = sortGroup(advantageGroup === "A" ? groupA : groupB);
    const groupOth = sortGroup(otherGroup === "A" ? groupA : groupB);

    const adv1 = groupAdv[0];
    const adv2 = groupAdv[1];
    const adv3 = groupAdv[2];
    const adv4 = groupAdv[3];

    const oth1 = groupOth[0];
    const oth2 = groupOth[1];
    const oth3 = groupOth[2];

    const quarterfinals: PlayoffMatch[] = [
      {
        id: "qf1",
        stage: "quarterfinal",
        matchNumber: 1,
        homeTeamId: adv4?.id || null,
        awayTeamId: oth1?.id || null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf1",
        order: 1
      },
      {
        id: "qf2",
        stage: "quarterfinal",
        matchNumber: 2,
        homeTeamId: adv3?.id || null,
        awayTeamId: oth2?.id || null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf2",
        order: 2
      },
      {
        id: "qf3",
        stage: "quarterfinal",
        matchNumber: 3,
        homeTeamId: adv2?.id || null,
        awayTeamId: oth3?.id || null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf2",
        order: 3
      }
    ];

    const semifinals: PlayoffMatch[] = [
      {
        id: "sf1",
        stage: "semifinal",
        matchNumber: 1,
        homeTeamId: adv1?.id || null,
        awayTeamId: null, // Vencedor de QF1 (4º Adv vs 1º Oth)
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "final",
        order: 1
      },
      {
        id: "sf2",
        stage: "semifinal",
        matchNumber: 2,
        homeTeamId: null, // Vencedor de QF2 (3º Adv vs 2º Oth)
        awayTeamId: null, // Vencedor de QF3 (2º Adv vs 3º Oth)
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "final",
        order: 2
      }
    ];

    const final: PlayoffMatch = {
      id: "final",
      stage: "final",
      matchNumber: 1,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: null,
      order: 1
    };

    const baseBracket = {
      playIns: [],
      quarterfinals,
      semifinals,
      final
    };

    if (officialPlayoffs && Array.isArray(officialPlayoffs) && officialPlayoffs.length > 0) {
      return applyOfficialPlayoffsToBracket(baseBracket, officialPlayoffs);
    }

    return baseBracket;
  }

  // Formato oficial de tabela única (Split da Kings League Brasil)
  const sortedStandings = [...standings].sort((a, b) => {
    const rankA = Number(a.rank || 0);
    const rankB = Number(b.rank || 0);
    if (rankA > 0 && rankB > 0 && rankA !== rankB) return rankA - rankB;
    const ptsA = a.points ?? ((a.won ?? 0) * 3);
    const ptsB = b.points ?? ((b.won ?? 0) * 3);
    if (ptsB !== ptsA) return ptsB - ptsA;
    const gdA = a.goalDifference ?? ((a.goalsFor ?? 0) - (a.goalsAgainst ?? 0));
    const gdB = b.goalDifference ?? ((b.goalsFor ?? 0) - (b.goalsAgainst ?? 0));
    if (gdB !== gdA) return gdB - gdA;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  const firstPlace = sortedStandings[0];
  const secondPlace = sortedStandings[1];
  const thirdPlace = sortedStandings[2];
  const fourthPlace = sortedStandings[3];
  const fifthPlace = sortedStandings[4];
  const sixthPlace = sortedStandings[5];
  const seventhPlace = sortedStandings[6];
  // A liga pode ter 10 ou mais times e ainda assim não usar repescagem.
  // O formato deve vir da fase oficial, não da quantidade de clubes.
  const hasPlayIn = Array.isArray(officialPlayoffs) && officialPlayoffs.some((turn: any) => {
    const name = String(turn?.name || turn?.turnName || turn?.displayName || "").toLowerCase();
    return name.includes("play-in") || name.includes("play in") || name.includes("playin") || name.includes("repesc");
  });
  const playInMatches: PlayoffMatch[] = hasPlayIn
    ? [
      {
        id: "pi1", stage: "playin", matchNumber: 1, homeTeamId: sortedStandings[6].id, awayTeamId: sortedStandings[9].id,
        homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null,
        nextMatchId: "qf1", order: 1,
      },
      {
        id: "pi2", stage: "playin", matchNumber: 2, homeTeamId: sortedStandings[7].id, awayTeamId: sortedStandings[8].id,
        homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null,
        nextMatchId: "qf1", order: 2,
      },
    ]
    : [];

  const quarterfinals: PlayoffMatch[] = hasPlayIn
    ? [
    {
      id: "qf1", stage: "quarterfinal", matchNumber: 1, homeTeamId: secondPlace.id, awayTeamId: null,
      homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null, nextMatchId: "sf1", order: 1
    },
    {
      id: "qf2", stage: "quarterfinal", matchNumber: 2, homeTeamId: thirdPlace.id, awayTeamId: sixthPlace.id,
      homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null, nextMatchId: "sf1", order: 2
    },
    {
      id: "qf3", stage: "quarterfinal", matchNumber: 3, homeTeamId: fourthPlace.id, awayTeamId: fifthPlace.id,
      homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null, nextMatchId: "sf2", order: 3
    },
    {
      id: "qf4", stage: "quarterfinal", matchNumber: 4, homeTeamId: null, awayTeamId: firstPlace.id,
      homeScore: null, awayScore: null, homeScoreP: null, awayScoreP: null, winnerId: null, nextMatchId: "sf2", order: 4
    },
  ]
    : [
    {
      id: "qf1",
      stage: "quarterfinal",
      matchNumber: 1,
      homeTeamId: fourthPlace.id,
      awayTeamId: fifthPlace.id,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "sf1",
      order: 1
    },
    {
      id: "qf2",
      stage: "quarterfinal",
      matchNumber: 2,
      homeTeamId: thirdPlace.id,
      awayTeamId: sixthPlace.id,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "sf2",
      order: 2
    },
    {
      id: "qf3",
      stage: "quarterfinal",
      matchNumber: 3,
      homeTeamId: secondPlace.id,
      awayTeamId: seventhPlace.id,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "sf2",
      order: 3
    }
  ];

  const semifinals: PlayoffMatch[] = [
    {
      id: "sf1",
      stage: "semifinal",
      matchNumber: 1,
      homeTeamId: firstPlace.id,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "final",
      order: 1
    },
    {
      id: "sf2",
      stage: "semifinal",
      matchNumber: 2,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "final",
      order: 2
    }
  ];

  const final: PlayoffMatch = {
    id: "final",
    stage: "final",
    matchNumber: 1,
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    homeScoreP: null,
    awayScoreP: null,
    winnerId: null,
    nextMatchId: null,
    order: 1
  };

  const baseBracket = {
    playIns: playInMatches,
    playInRounds: hasPlayIn ? [playInMatches] : [],
    quarterfinals,
    semifinals,
    final
  };

  if (officialPlayoffs && Array.isArray(officialPlayoffs) && officialPlayoffs.length > 0) {
    const officialBracket = applyOfficialPlayoffsToBracket(baseBracket, officialPlayoffs);
    if (hasPlayIn) {
      return keepTopSeedOutOfQuarterfinals(officialBracket, firstPlace.id);
    }
    return officialBracket;
  }

  if (hasPlayIn) {
    return keepTopSeedOutOfQuarterfinals(baseBracket, firstPlace.id);
  }

  return baseBracket;
}

function keepTopSeedOutOfQuarterfinals(
  bracket: PlayoffBracket,
  topSeedId: string
): PlayoffBracket {
  const sanitized = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;

  sanitized.quarterfinals = sanitized.quarterfinals.filter(
    (match) => match.homeTeamId !== topSeedId && match.awayTeamId !== topSeedId
  );

  const semifinalOne = sanitized.semifinals.find((match) => match.id === "sf1");
  if (semifinalOne) {
    semifinalOne.homeTeamId = topSeedId;
  }

  return sanitized;
}

/**
 * Atualiza o chaveamento dos playoffs com base no resultado de uma partida
 */
export function updatePlayoffBracket(
  bracket: PlayoffBracket,
  matchId: string,
  homeScore: number,
  awayScore: number,
  homeScoreP?: number | null,
  awayScoreP?: number | null,
  leagueId?: string
): PlayoffBracket {
  const newBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;
  
  // Encontrar a partida a ser atualizada
  let match: PlayoffMatch | undefined;
  let stage: 'playIns' | 'quarterfinals' | 'semifinals' | 'final' | undefined;

  match = newBracket.playIns?.find(m => m.id === matchId);
  if (match) stage = 'playIns';

  if (!match && matchId.startsWith('qf')) {
    match = newBracket.quarterfinals.find(m => m.id === matchId);
    stage = 'quarterfinals';
  } else if (!match && matchId.startsWith('sf')) {
    match = newBracket.semifinals.find(m => m.id === matchId);
    stage = 'semifinals';
  } else if (!match && matchId === 'final') {
    match = newBracket.final;
    stage = 'final';
  }
  
  if (!match || !stage) {
    throw new Error(`Partida não encontrada: ${matchId}`);
  }

  // No México, as quartas ficam bloqueadas quando todos os confrontos oficiais estão definidos.
  if (isMexicoQuarterfinalsLocked(newBracket, matchId, leagueId)) {
    throw new Error("As quartas de final do México já foram definidas e não podem ser alteradas.");
  }

  // Guardar o vencedor anterior e seu próximo jogo
  const previousWinnerId = match.winnerId;
  const nextMatchId = match.nextMatchId;
  
  // Atualizar o placar
  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.homeScoreP = homeScoreP !== undefined ? homeScoreP : null;
  match.awayScoreP = awayScoreP !== undefined ? awayScoreP : null;
  
  // Determinar o novo vencedor
  let newWinnerId: string | null = null;
  
  if (homeScore > awayScore) {
    newWinnerId = match.homeTeamId;
  } else if (awayScore > homeScore) {
    newWinnerId = match.awayTeamId;
  } else if (homeScoreP !== null && homeScoreP !== undefined && awayScoreP !== null && awayScoreP !== undefined) {
    // Desempate no Shootout
    if (homeScoreP > awayScoreP) {
      newWinnerId = match.homeTeamId;
    } else if (awayScoreP > homeScoreP) {
      newWinnerId = match.awayTeamId;
    }
  }
  
  // Atualizar o vencedor
  match.winnerId = newWinnerId;
  
  // Se o vencedor mudou e há um próximo jogo, atualizar a próxima partida
  if (previousWinnerId !== newWinnerId && nextMatchId) {
    const nextMatch = 
      newBracket.quarterfinals.find(m => m.id === nextMatchId) ||
      newBracket.semifinals.find(m => m.id === nextMatchId) || 
      (nextMatchId === 'final' ? newBracket.final : undefined);
    
    if (nextMatch) {
      const nextMatchPreviousWinnerId = nextMatch.winnerId;

      // Determinar qual posição específica deve ser atualizada baseado na partida de origem
      let targetPosition: 'home' | 'away' | null = null;
      
      if (match.stage === 'playin') {
        targetPosition = matchId === "pi1" ? "away" : "home";
      } else if (match.stage === 'quarterfinal') {
        const qfNumber = parseInt(matchId.replace('qf', ''));
        if (qfNumber === 1) {
          targetPosition = 'away'; // QF1 → SF1 away
        } else if (qfNumber === 2) {
          targetPosition = 'home'; // QF2 → SF2 home
        } else if (qfNumber === 3) {
          targetPosition = 'away'; // QF3 → SF2 away
        } else if (qfNumber === 4) {
          targetPosition = 'home'; // QF4 → SF2 home
        }
      } else if (match.stage === 'semifinal') {
        const sfNumber = parseInt(matchId.replace('sf', ''));
        if (sfNumber === 1) {
          targetPosition = 'home'; // SF1 → Final home
        } else if (sfNumber === 2) {
          targetPosition = 'away'; // SF2 → Final away
        }
      }
      
      // Remover o vencedor anterior APENAS da posição específica
      if (targetPosition === 'home' && nextMatch.homeTeamId === previousWinnerId) {
        nextMatch.homeTeamId = null;
      } else if (targetPosition === 'away' && nextMatch.awayTeamId === previousWinnerId) {
        nextMatch.awayTeamId = null;
      }
      
      // Adicionar o novo vencedor na próxima partida, se houver
      if (newWinnerId) {
        // Determinar a posição correta baseado na partida de origem (sem remover times já posicionados)
        if (match.stage === 'playin') {
          if (matchId === "pi1") nextMatch.awayTeamId = newWinnerId;
          if (matchId === "pi2") nextMatch.homeTeamId = newWinnerId;
        } else if (match.stage === 'quarterfinal') {
          const qfNumber = parseInt(matchId.replace('qf', ''));
          
          if (qfNumber === 1) {
            // Vencedor de QF1 vai para SF1 awayTeamId (enfrenta o 1º colocado que está em homeTeamId)
            // Apenas atualizar a posição away, SEM TOCAR no homeTeamId
            nextMatch.awayTeamId = newWinnerId;
          } else if (qfNumber === 2) {
            // Vencedor de QF2 vai para SF2 homeTeamId
            nextMatch.homeTeamId = newWinnerId;
          } else if (qfNumber === 3) {
            // Vencedor de QF3 vai para SF2 awayTeamId
            nextMatch.awayTeamId = newWinnerId;
          } else if (qfNumber === 4) {
            nextMatch.homeTeamId = newWinnerId;
          }
        } else if (match.stage === 'semifinal') {
          const sfNumber = parseInt(matchId.replace('sf', ''));
          
          if (sfNumber === 1) {
            // Vencedor de SF1 vai para Final homeTeamId
            nextMatch.homeTeamId = newWinnerId;
          } else if (sfNumber === 2) {
            // Vencedor de SF2 vai para Final awayTeamId
            nextMatch.awayTeamId = newWinnerId;
          }
        }
      }
      
      // IMPORTANTE: NÃO limpar os placares da próxima partida
      // Isso permite que o usuário simule as semifinais e finais independentemente
      // Os placares são preservados para permitir edição múltiplas vezes
      // Apenas os times são atualizados quando o vencedor muda
      
      // Se um dos times foi substituído, apenas resetar o vencedor (não os scores)
      if (previousWinnerId !== newWinnerId) {
        nextMatch.winnerId = null;

        // Se alteramos uma partida que alimenta uma semifinal, invalidar a vaga
        // correspondente da final APENAS quando havia um vencedor prévio da semifinal.
        if (nextMatch.stage === 'semifinal' && newBracket.final && nextMatchPreviousWinnerId) {
          const finalMatch = newBracket.final;

          if (nextMatch.id === 'sf1' && finalMatch.homeTeamId === nextMatchPreviousWinnerId) {
            finalMatch.homeTeamId = null;
            finalMatch.winnerId = null;
          }

          if (nextMatch.id === 'sf2' && finalMatch.awayTeamId === nextMatchPreviousWinnerId) {
            finalMatch.awayTeamId = null;
            finalMatch.winnerId = null;
          }
        }
      }
    }
  }
  
  return newBracket;
}

export function isPlayoffMatchFinished(match: PlayoffMatch): boolean {
  const status = String(match.status || "").toLowerCase();
  return /^(ended|finished|complete|completed|final|after[_ -]?penalties)$/.test(status)
    || Boolean(match.winnerId);
}

export function isMexicoQuarterfinalsLocked(
  bracket: PlayoffBracket,
  matchId: string,
  leagueId?: string
): boolean {
  if (leagueId !== "mexico" || !matchId.startsWith("qf")) return false;
  return bracket.quarterfinals.length > 0 && bracket.quarterfinals.every(
    (match) => Boolean(match.homeTeamId && match.awayTeamId)
  );
}
