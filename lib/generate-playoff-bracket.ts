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
  } else if (homeScoreP !== null && homeScoreP !== undefined && awayScoreP !== null && awayScoreP !== undefined) {
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
      // Determinar qual posição específica deve ser atualizada baseado na partida de origem
      let targetPosition: 'home' | 'away' | null = null;
      
      if (match.stage === 'quarterfinal') {
        const qfNumber = parseInt(matchId.replace('qf', ''));
        if (qfNumber === 1) {
          targetPosition = 'away'; // QF1 → SF1 away
        } else if (qfNumber === 2) {
          targetPosition = 'home'; // QF2 → SF2 home
        } else if (qfNumber === 3) {
          targetPosition = 'away'; // QF3 → SF2 away
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
        if (match.stage === 'quarterfinal') {
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
        
        // Atualizar recursivamente a final se necessário
        if (nextMatch.nextMatchId === 'final' && newBracket.final) {
          const finalMatch = newBracket.final;
          
          // Se o vencedor anterior está na final, remover
          if (finalMatch.homeTeamId === previousWinnerId || finalMatch.awayTeamId === previousWinnerId) {
            if (finalMatch.homeTeamId === previousWinnerId) {
              finalMatch.homeTeamId = null;
            }
            if (finalMatch.awayTeamId === previousWinnerId) {
              finalMatch.awayTeamId = null;
            }
            
            // Se há um novo vencedor, colocar na final
            if (newWinnerId) {
              if (finalMatch.homeTeamId === null) {
                finalMatch.homeTeamId = newWinnerId;
              } else if (finalMatch.awayTeamId === null) {
                finalMatch.awayTeamId = newWinnerId;
              }
            }
            
            // Resetar apenas o vencedor da final, preservando os scores
            finalMatch.winnerId = null;
          }
        }
      }
    }
  }
  
  return newBracket;
}