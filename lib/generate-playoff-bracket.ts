import { Team, TeamStanding, PlayoffBracket, PlayoffMatch } from "@/types/kings-league";

/**
 * Gera o chaveamento dos playoffs com base na classificação atual
 * 1º lugar vai direto para a semifinal
 * 2º ao 7º disputam as quartas de final
 * Formato atualizado conforme regras de 16.04.2025
 */
export function generatePlayoffBracket(standings: TeamStanding[], teams: Record<string, Team>): PlayoffBracket {
  if (standings.length < 7) {
    throw new Error("É necessário ter pelo menos 7 times na classificação para gerar os playoffs");
  }

  // Obter os times que vão para os playoffs
  const firstPlace = standings[0];
  const secondPlace = standings[1];
  const thirdPlace = standings[2];
  const fourthPlace = standings[3];
  const fifthPlace = standings[4];
  const sixthPlace = standings[5];
  const seventhPlace = standings[6];

  // Criar os jogos das quartas de final de acordo com as regras atualizadas
  // Quartas 1: 4º vs 5º (Semifinalista 1)
  // Quartas 2: 3º vs 6º (Semifinalista 2)
  // Quartas 3: 2º vs 7º (Semifinalista 3)
  const quarterfinals: PlayoffMatch[] = [
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

  // Criar as semifinais de acordo com as regras atualizadas
  // Semifinal 1: 1º lugar vs Vencedor de Quartas 1 (4º vs 5º)
  // Semifinal 2: Vencedor de Quartas 2 (3º vs 6º) vs Vencedor de Quartas 3 (2º vs 7º)
  const semifinals: PlayoffMatch[] = [
    {
      id: "sf1",
      stage: "semifinal",
      matchNumber: 1,
      homeTeamId: firstPlace.id,
      awayTeamId: null, // Será definido após a simulação das quartas (vencedor de 4º vs 5º)
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
      homeTeamId: null, // Será definido após a simulação das quartas (vencedor de 3º vs 6º)
      awayTeamId: null, // Será definido após a simulação das quartas (vencedor de 2º vs 7º)
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "final",
      order: 2
    }
  ];

  // Criar a final
  const final: PlayoffMatch = {
    id: "final",
    stage: "final",
    matchNumber: 1,
    homeTeamId: null, // Será definido após a simulação das semifinais
    awayTeamId: null, // Será definido após a simulação das semifinais
    homeScore: null,
    awayScore: null,
    homeScoreP: null,
    awayScoreP: null,
    winnerId: null,
    nextMatchId: null,
    order: 1
  };

  return {
    quarterfinals,
    semifinals,
    final
  };
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
  awayScoreP?: number | null
): PlayoffBracket {
  const newBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;
  
  // Encontrar a partida a ser atualizada
  let match: PlayoffMatch | undefined;
  let stage: 'quarterfinals' | 'semifinals' | 'final' | undefined;
  
  if (matchId.startsWith('qf')) {
    match = newBracket.quarterfinals.find(m => m.id === matchId);
    stage = 'quarterfinals';
  } else if (matchId.startsWith('sf')) {
    match = newBracket.semifinals.find(m => m.id === matchId);
    stage = 'semifinals';
  } else if (matchId === 'final') {
    match = newBracket.final;
    stage = 'final';
  }
  
  if (!match || !stage) {
    throw new Error(`Partida não encontrada: ${matchId}`);
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
  } else if (homeScoreP !== null && awayScoreP !== null) {
    // Desempate nos pênaltis
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
      newBracket.semifinals.find(m => m.id === nextMatchId) || 
      (nextMatchId === 'final' ? newBracket.final : undefined);
    
    if (nextMatch) {
      // Remover o time anterior da próxima partida
      if (nextMatch.homeTeamId === previousWinnerId) {
        nextMatch.homeTeamId = null;
      } else if (nextMatch.awayTeamId === previousWinnerId) {
        nextMatch.awayTeamId = null;
      }
      
      // Adicionar o novo vencedor na próxima partida, se houver
      if (newWinnerId) {
        // Verificar se há algum slot vazio
        if (nextMatch.homeTeamId === null) {
          nextMatch.homeTeamId = newWinnerId;
        } else if (nextMatch.awayTeamId === null) {
          nextMatch.awayTeamId = newWinnerId;
        } else {
          // Se não houver slot vazio, o vencedor substituirá o que veio do mesmo jogo
          // Isso geralmente não deve acontecer, mas é uma precaução
          if (match.stage === 'quarterfinal') {
            const qfNumber = parseInt(matchId.replace('qf', ''));
            if (qfNumber === 1) {
              nextMatch.awayTeamId = newWinnerId; // Vencedor de QF1 vai para a posição away da SF1
            } else if (qfNumber === 2) {
              nextMatch.homeTeamId = newWinnerId; // Vencedor de QF2 vai para a posição home da SF2
            } else if (qfNumber === 3) {
              nextMatch.awayTeamId = newWinnerId; // Vencedor de QF3 vai para a posição away da SF2
            }
          } else if (match.stage === 'semifinal') {
            const sfNumber = parseInt(matchId.replace('sf', ''));
            if (sfNumber === 1) {
              nextMatch.homeTeamId = newWinnerId; // Vencedor de SF1 vai para a posição home da Final
            } else if (sfNumber === 2) {
              nextMatch.awayTeamId = newWinnerId; // Vencedor de SF2 vai para a posição away da Final
            }
          }
        }
      }
      
      // Se os times mudaram, resetar o placar da próxima partida
      if (previousWinnerId !== newWinnerId) {
        nextMatch.homeScore = null;
        nextMatch.awayScore = null;
        nextMatch.homeScoreP = null;
        nextMatch.awayScoreP = null;
        nextMatch.winnerId = null;
        
        // Se a próxima partida também tiver uma próxima partida, atualizar recursivamente
        if (nextMatch.nextMatchId) {
          const nextWinnerId = nextMatch.winnerId;
          const finalMatch = newBracket.final;
          
          if (finalMatch.homeTeamId === nextWinnerId) {
            finalMatch.homeTeamId = null;
          } else if (finalMatch.awayTeamId === nextWinnerId) {
            finalMatch.awayTeamId = null;
          }
          
          // Resetar o placar e o vencedor da final
          finalMatch.homeScore = null;
          finalMatch.awayScore = null;
          finalMatch.homeScoreP = null;
          finalMatch.awayScoreP = null;
          finalMatch.winnerId = null;
        }
      }
    }
  }
  
  return newBracket;
}