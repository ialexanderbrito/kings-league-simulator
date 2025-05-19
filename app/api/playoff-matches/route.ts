import { NextResponse } from "next/server";
import { PlayoffBracket, PlayoffMatch } from "@/types/kings-league";

// Simular um banco de dados com um chaveamento de playoffs inicial
let playoffMatchesDB: PlayoffBracket | null = null;

/**
 * Mapeia os IDs de partidas da API de direct-matches para o formato de playoffs
 * IDs atualizados com base nos dados reais da API
 */
const MATCH_ID_MAP: Record<string, { 
  id: string, 
  stage: 'quarterfinal' | 'semifinal' | 'final',
  matchNumber: number,
  order: number,
  nextMatchId: string | null,
  youtubeUrl?: string 
}> = {
  // Quartas de final - IDs obtidos da API real
  "1833": { 
    id: "qf1", 
    stage: "quarterfinal", 
    matchNumber: 1, 
    order: 1, 
    nextMatchId: "sf1",
    youtubeUrl: "https://www.youtube.com/watch?v=kQ0Tmk6Uf-I"
  }, // Pinos Kings vs Los Troncos
  "1835": { 
    id: "qf2", 
    stage: "quarterfinal", 
    matchNumber: 2, 
    order: 2, 
    nextMatchId: "sf2",
    youtubeUrl: "https://www.youtube.com/watch?v=hQUFkzpKq80"
  }, // Aniquiladores vs El Barrio
  "1834": { 
    id: "qf3", 
    stage: "quarterfinal", 
    matchNumber: 3, 
    order: 3, 
    nextMatchId: "sf2",
    youtubeUrl: "https://www.youtube.com/watch?v=ZK9NiUa5MPk"
  }, // xBuyer Team vs Jijantes FC
  
  // Semifinais
  "1836": { 
    id: "sf1", 
    stage: "semifinal", 
    matchNumber: 1, 
    order: 1, 
    nextMatchId: "final",
    youtubeUrl: "https://www.youtube.com/watch?v=qCzUSR_PbTM"
  }, // Saiyans FC vs Pinos Kings
  "1837": { 
    id: "sf2", 
    stage: "semifinal", 
    matchNumber: 2, 
    order: 2, 
    nextMatchId: "final",
    youtubeUrl: "https://www.youtube.com/watch?v=Jav3G3PmXE8"
  }, // El Barrio vs Jijantes FC
  
  // Final
  "1840": { 
    id: "final", 
    stage: "final", 
    matchNumber: 1, 
    order: 1, 
    nextMatchId: null,
    youtubeUrl: "https://www.youtube.com/watch?v=J8MzzS8_9QM"
  } // Saiyans FC vs Jijantes FC
};

/**
 * Converte o formato de bracket para o formato de turnos,
 * similar à estrutura da API direct-matches
 */
function convertBracketToTurns(bracket: PlayoffBracket): any[] {
  const result = [];

  // Quartas de final
  if (bracket.quarterfinals.length > 0) {
    const quartersMatches = bracket.quarterfinals.map(match => {
      const matchId = Object.entries(MATCH_ID_MAP).find(
        ([_, info]) => info.id === match.id
      )?.[0];
      
      return {
        id: parseInt(matchId || "0"),
        date: new Date().toISOString(), // Data placeholder
        seasonId: 33,
        phaseId: 76,
        groupId: 79,
        turnId: 361,
        status: match.winnerId ? "ended" : "scheduled",
        stadiumId: 345,
        currentMinute: match.winnerId ? 44 : 0,
        participants: {
          homeTeamId: match.homeTeamId ? parseInt(match.homeTeamId) : null,
          awayTeamId: match.awayTeamId ? parseInt(match.awayTeamId) : null
        },
        scores: {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeScore1T: null,
          awayScore1T: null,
          homeScore2T: null,
          awayScore2T: null,
          homeScore3T: null,
          awayScore3T: null,
          homeScoreP: match.homeScoreP,
          awayScoreP: match.awayScoreP
        },
        goals: [],
        cards: [],
        durations: {
          duration: null,
          duration1T: 20,
          duration2T: 20,
          duration3T: null,
          durationP: null
        },
        weapons: [],
        dices: [],
        halfs: {
          halfNumber: 2,
          halfDuration: 20,
          halfExtraTimeNumber: null,
          halfExtraTimeDuration: null
        },
        metaInformation: {
          youtube_url: match.youtubeUrl
        },
        referees: [],
        groupName: "Playoffs"
      };
    });
    
    result.push({
      id: 361,
      turnName: "Quartas-de-final",
      matches: quartersMatches,
      startDate: new Date().toISOString(),
      finishDate: new Date().toISOString(),
      ended: true
    });
  }

  // Semifinais
  if (bracket.semifinals.length > 0) {
    const semisMatches = bracket.semifinals.map(match => {
      const matchId = Object.entries(MATCH_ID_MAP).find(
        ([_, info]) => info.id === match.id
      )?.[0];
      
      return {
        id: parseInt(matchId || "0"),
        date: new Date().toISOString(), // Data placeholder
        seasonId: 33,
        phaseId: 76,
        groupId: 79,
        turnId: 362,
        status: match.winnerId ? "ended" : "scheduled",
        stadiumId: 345,
        currentMinute: match.winnerId ? 44 : 0,
        participants: {
          homeTeamId: match.homeTeamId ? parseInt(match.homeTeamId) : null,
          awayTeamId: match.awayTeamId ? parseInt(match.awayTeamId) : null
        },
        scores: {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeScore1T: null,
          awayScore1T: null,
          homeScore2T: null,
          awayScore2T: null,
          homeScore3T: null,
          awayScore3T: null,
          homeScoreP: match.homeScoreP,
          awayScoreP: match.awayScoreP
        },
        goals: [],
        cards: [],
        durations: {
          duration: null,
          duration1T: 20,
          duration2T: 20,
          duration3T: null,
          durationP: null
        },
        weapons: [],
        dices: [],
        halfs: {
          halfNumber: 2,
          halfDuration: 20,
          halfExtraTimeNumber: null,
          halfExtraTimeDuration: null
        },
        metaInformation: {
          youtube_url: match.youtubeUrl
        },
        referees: [],
        groupName: "Playoffs"
      };
    });
    
    result.push({
      id: 362,
      turnName: "Semifinais",
      matches: semisMatches,
      startDate: new Date().toISOString(),
      finishDate: new Date().toISOString(),
      ended: true
    });
  }

  // Final
  if (bracket.final) {
    const match = bracket.final;
    const matchId = Object.entries(MATCH_ID_MAP).find(
      ([_, info]) => info.id === match.id
    )?.[0];
    
    result.push({
      id: 363,
      turnName: "Final",
      matches: [
        {
          id: parseInt(matchId || "0"),
          date: new Date().toISOString(), // Data placeholder
          seasonId: 33,
          phaseId: 76,
          groupId: 79,
          turnId: 363,
          status: match.winnerId ? "ended" : "scheduled",
          stadiumId: 345,
          currentMinute: match.winnerId ? 44 : 0,
          participants: {
            homeTeamId: match.homeTeamId ? parseInt(match.homeTeamId) : null,
            awayTeamId: match.awayTeamId ? parseInt(match.awayTeamId) : null
          },
          scores: {
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeScore1T: null,
            awayScore1T: null,
            homeScore2T: null,
            awayScore2T: null,
            homeScore3T: null,
            awayScore3T: null,
            homeScoreP: match.homeScoreP,
            awayScoreP: match.awayScoreP
          },
          goals: [],
          cards: [],
          durations: {
            duration: null,
            duration1T: 20,
            duration2T: 20,
            duration3T: null,
            durationP: null
          },
          weapons: [],
          dices: [],
          halfs: {
            halfNumber: 2,
            halfDuration: 20,
            halfExtraTimeNumber: null,
            halfExtraTimeDuration: null
          },
          metaInformation: {
            youtube_url: match.youtubeUrl
          },
          referees: [],
          groupName: "Playoffs"
        }
      ],
      startDate: new Date().toISOString(),
      finishDate: new Date().toISOString(),
      ended: true
    });
  }

  return result;
}

/**
 * Cria um bracket de playoffs vazio com estrutura básica inicializada
 */
function createEmptyPlayoffBracket(): PlayoffBracket {
  return {
    quarterfinals: [
      {
        id: "qf1",
        stage: "quarterfinal",
        matchNumber: 1,
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf1",
        order: 1,
        youtubeUrl: undefined
      },
      {
        id: "qf2",
        stage: "quarterfinal",
        matchNumber: 2,
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf2",
        order: 2,
        youtubeUrl: undefined
      },
      {
        id: "qf3",
        stage: "quarterfinal",
        matchNumber: 3,
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "sf2",
        order: 3,
        youtubeUrl: undefined
      }
    ],
    semifinals: [
      {
        id: "sf1",
        stage: "semifinal",
        matchNumber: 1,
        homeTeamId: "50", // ID do Saiyans FC (primeiro colocado)
        awayTeamId: null,
        homeScore: null,
        awayScore: null,
        homeScoreP: null,
        awayScoreP: null,
        winnerId: null,
        nextMatchId: "final",
        order: 1,
        youtubeUrl: undefined
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
        order: 2,
        youtubeUrl: undefined
      }
    ],
    final: {
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
    }
  };
}

/**
 * GET /api/playoff-matches
 * Retorna os jogos dos playoffs
 * Busca dados do endpoint direct-matches ou diretamente da API externa
 */
export async function GET() {
  try {
    // Primeiro, verificar se temos dados locais armazenados em memória
    if (playoffMatchesDB) {
      console.log("Retornando dados de playoffs já existentes em memória");
      
      // Converter para o formato de turnos, compatível com a API direct-matches
      const cachedTurns = convertBracketToTurns(playoffMatchesDB);
      
      return NextResponse.json(cachedTurns, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Se não há dados em memória, tentar buscar da API
    try {
      console.log("Buscando dados da API externa...");
      const externalApiResponse = await fetch(
        "https://kingsleague.pro/api/v1/competition/seasons/33/match-center-data?lang=pt", 
        {
          headers: {
            referer: "https://kingsleague.pro/en/brazil/matches",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          cache: "no-store",
          next: { revalidate: 60 }, // Revalidar a cada 1 minuto
        }
      );

      if (!externalApiResponse.ok) {
        throw new Error(`Falha ao buscar jogos da API externa: ${externalApiResponse.status}`);
      }

      const matchesData = await externalApiResponse.json();
      
      console.log(`API externa retornou ${matchesData.length} rodadas`);
      
      if (!Array.isArray(matchesData) || matchesData.length === 0) {
        throw new Error("API externa retornou dados em formato inválido ou vazio");
      }
      
      // Converter os dados para o formato de playoffs
      const playoffBracket = convertMatchesToPlayoffBracket(matchesData);
      
      // Armazenar em memória para futuras requisições
      playoffMatchesDB = playoffBracket;
      
      // Converter para o formato de turnos, compatível com a API direct-matches
      const turnsFormat = convertBracketToTurns(playoffBracket);
      
      return NextResponse.json(turnsFormat, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (apiError) {
      console.error("Erro ao buscar dados da API externa:", apiError);
      
      // Se não conseguimos dados da API externa, retornar um bracket vazio
      // mas ainda com a estrutura inicializada para que a UI não quebre
      const emptyBracket = createEmptyPlayoffBracket();
      
      // Converter para o formato de turnos, compatível com a API direct-matches
      const emptyTurns = convertBracketToTurns(emptyBracket);
      
      return NextResponse.json(emptyTurns, { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Falha ao buscar jogos dos playoffs",
        message: error.message,
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}


/**
 * OPTIONS /api/playoff-matches
 * Suporte a CORS
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

/**
 * POST /api/playoff-matches
 * Salva os resultados dos playoffs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bracket } = body;

    if (!bracket) {
      return NextResponse.json(
        {
          error: "Dados do bracket são obrigatórios",
        },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Se temos dados existentes, vamos preservar os URLs do YouTube
    if (playoffMatchesDB) {
      // Preservar URLs do YouTube para quartas de final
      if (Array.isArray(bracket.quarterfinals) && Array.isArray(playoffMatchesDB.quarterfinals)) {
        for (let i = 0; i < bracket.quarterfinals.length; i++) {
          const match = bracket.quarterfinals[i];
          const existingMatch = playoffMatchesDB.quarterfinals.find(m => m.id === match.id);
          if (existingMatch && existingMatch.youtubeUrl && !match.youtubeUrl) {
            match.youtubeUrl = existingMatch.youtubeUrl;
          }
        }
      }

      // Preservar URLs do YouTube para semifinais
      if (Array.isArray(bracket.semifinals) && Array.isArray(playoffMatchesDB.semifinals)) {
        for (let i = 0; i < bracket.semifinals.length; i++) {
          const match = bracket.semifinals[i];
          const existingMatch = playoffMatchesDB.semifinals.find(m => m.id === match.id);
          if (existingMatch && existingMatch.youtubeUrl && !match.youtubeUrl) {
            match.youtubeUrl = existingMatch.youtubeUrl;
          }
        }
      }

      // Preservar URL do YouTube para final
      if (bracket.final && playoffMatchesDB.final && playoffMatchesDB.final.youtubeUrl && !bracket.final.youtubeUrl) {
        bracket.final.youtubeUrl = playoffMatchesDB.final.youtubeUrl;
      }
    }

    // Atualizar os dados em memória
    playoffMatchesDB = bracket;

    // Converter para o formato de turnos para manter consistência nas respostas
    const turnsFormat = convertBracketToTurns(bracket);

    return NextResponse.json(
      turnsFormat,
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Falha ao salvar resultados dos playoffs",
        message: error.message,
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

/**
 * Converte os dados da API de partidas para o formato de playoffs
 */
function convertMatchesToPlayoffBracket(matchesData: any[]): PlayoffBracket {
  // Inicializar o bracket com estrutura padrão vazia
  const bracket: PlayoffBracket = {
    quarterfinals: [],
    semifinals: [],
    final: {
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
    }
  };
  
  // Pré-inicializar o array de quartas de final para evitar erros quando não há partidas
  bracket.quarterfinals = [
    {
      id: "qf1",
      stage: "quarterfinal",
      matchNumber: 1,
      homeTeamId: null,
      awayTeamId: null,
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
      homeTeamId: null,
      awayTeamId: null,
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
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      homeScoreP: null,
      awayScoreP: null,
      winnerId: null,
      nextMatchId: "sf2",
      order: 3
    }
  ];

  // Pré-inicializar o array de semifinais para evitar erros quando não há partidas
  bracket.semifinals = [
    {
      id: "sf1",
      stage: "semifinal",
      matchNumber: 1,
      homeTeamId: null,
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

  // Procurar especificamente as rodadas dos playoffs
  const playoffRounds = matchesData.filter(round => 
    round.turnName === "Quartas-de-final" || 
    round.turnName === "Semifinais" || 
    round.turnName === "Final"
  );

  // Percorrer todas as rodadas de playoffs
  for (const round of playoffRounds) {
    console.log(`Processando rodada: ${round.turnName}`);
    
    // Verificar se a rodada tem partidas
    if (!Array.isArray(round.matches)) {
      console.log(`Rodada ${round.turnName} não tem partidas em formato de array`);
      continue;
    }
    
    // Percorrer as partidas da rodada
    for (const match of round.matches) {
      // Verificar se esta partida pertence aos playoffs
      const playoffInfo = MATCH_ID_MAP[match.id.toString()];
      
      if (!playoffInfo) {
        console.log(`Partida ID ${match.id} não mapeada nos playoffs`);
        continue;
      }
      
      console.log(`Encontrada partida playoff: ${match.id} -> ${playoffInfo.id} (${playoffInfo.stage})`);
      
      // Converter a partida para o formato de playoffs
      const playoffMatch: PlayoffMatch = {
        id: playoffInfo.id,
        stage: playoffInfo.stage,
        matchNumber: playoffInfo.matchNumber,
        homeTeamId: match.participants?.homeTeamId?.toString() || null,
        awayTeamId: match.participants?.awayTeamId?.toString() || null,
        homeScore: match.scores?.homeScore !== undefined ? match.scores.homeScore : null,
        awayScore: match.scores?.awayScore !== undefined ? match.scores.awayScore : null,
        homeScoreP: match.scores?.homeScoreP !== undefined ? match.scores.homeScoreP : null,
        awayScoreP: match.scores?.awayScoreP !== undefined ? match.scores.awayScoreP : null,
        winnerId: determineWinner(match),
        nextMatchId: playoffInfo.nextMatchId,
        order: playoffInfo.order,
        // Usar o URL do YouTube da API se disponível, caso contrário usar o do mapa
        youtubeUrl: match.metaInformation?.youtube_url || playoffInfo.youtubeUrl
      };
      
      // Adicionar a partida no local correto do bracket
      if (playoffInfo.stage === 'quarterfinal') {
        // Substituir a partida de quartas de final pré-inicializada pela versão com dados reais
        const qfIndex = playoffInfo.matchNumber - 1;
        if (qfIndex >= 0 && qfIndex < bracket.quarterfinals.length) {
          bracket.quarterfinals[qfIndex] = playoffMatch;
        } else {
          // Se o índice estiver fora dos limites, adicionar como uma nova partida
          bracket.quarterfinals.push(playoffMatch);
        }
      } else if (playoffInfo.stage === 'semifinal') {
        // Substituir a semifinal pré-inicializada pela versão com dados reais
        const sfIndex = playoffInfo.matchNumber - 1;
 
        if (sfIndex >= 0 && sfIndex < bracket.semifinals.length) {
          bracket.semifinals[sfIndex] = playoffMatch;
        }
      } else if (playoffInfo.stage === 'final') {
        bracket.final = playoffMatch;
      }
    }
  }
  
  // Garantir que as partidas estão ordenadas corretamente
  bracket.quarterfinals.sort((a, b) => a.order - b.order);
  bracket.semifinals.sort((a, b) => a.order - b.order);

  // Processar as relações entre as partidas
  updateBracketRelations(bracket);

  // Adicionar o primeiro colocado (Saiyans) diretamente à semifinal 1
  if (bracket.semifinals[0] && !bracket.semifinals[0].homeTeamId) {
    console.log("Adicionando time da casa na semifinal 1 (Saiyans FC - primeiro colocado)");
    bracket.semifinals[0].homeTeamId = "50"; // ID do Saiyans FC (primeiro colocado)
  }

  // Verificar se temos dados adequados para retornar
  console.log("Bracket montado:", {
    quarterfinals: bracket.quarterfinals.length,
    semifinals: bracket.semifinals.length,
    semifinal1: {
      id: bracket.semifinals[0]?.id,
      homeTeam: bracket.semifinals[0]?.homeTeamId,
      awayTeam: bracket.semifinals[0]?.awayTeamId
    },
    semifinal2: {
      id: bracket.semifinals[1]?.id,
      homeTeam: bracket.semifinals[1]?.homeTeamId,
      awayTeam: bracket.semifinals[1]?.awayTeamId
    },
    final: {
      id: bracket.final?.id,
      homeTeam: bracket.final?.homeTeamId,
      awayTeam: bracket.final?.awayTeamId
    }
  });
  
  // Armazenar em memória para uso futuro
  playoffMatchesDB = bracket;
  
  return bracket;
}

/**
 * Determina o vencedor de uma partida com base nos placares
 */
function determineWinner(match: any): string | null {
  // Verificar se os scores existem
  if (!match.scores) return null;
  
  const homeScore = match.scores.homeScore;
  const awayScore = match.scores.awayScore;
  const homeScoreP = match.scores.homeScoreP;
  const awayScoreP = match.scores.awayScoreP;
  
  // Se não tiver resultado, não há vencedor
  if (homeScore === null || homeScore === undefined || 
      awayScore === null || awayScore === undefined) {
    return null;
  }
  
  // Verificar o vencedor pelo placar normal
  if (homeScore > awayScore) {
    return match.participants.homeTeamId?.toString() || null;
  } 
  else if (awayScore > homeScore) {
    return match.participants.awayTeamId?.toString() || null;
  } 
  // Em caso de empate, verificar pênaltis
  else if (homeScoreP !== null && awayScoreP !== null) {
    if (homeScoreP > awayScoreP) {
      return match.participants.homeTeamId?.toString() || null;
    } 
    else if (awayScoreP > homeScoreP) {
      return match.participants.awayTeamId?.toString() || null;
    }
  }
  
  // Se chegou aqui, não há vencedor definido
  return null;
}

/**
 * Atualiza as relações entre as partidas do bracket
 * (ex: vencedores das quartas indo para suas respectivas semifinais)
 */
function updateBracketRelations(bracket: PlayoffBracket): void {
  console.log("Atualizando relações do bracket");
  
  // Vamos evitar criar relações que já estão definidas pela API
  // e apenas completar algumas que possam estar faltando
  
  // Verificar se temos dados já definidos nas semifinais/finais
  const semifinal1 = bracket.semifinals[0];
  const semifinal2 = bracket.semifinals[1];
  const final = bracket.final;
  
  // Só atualizar as relações se os dados estiverem indefinidos
  
  // Quartas de final para semifinais
  // Time da casa na semifinal 1 já deve ser o Saiyans (primeiro colocado direto)
  // Os outros times vêm dos confrontos de quartas
  
  // Atualizar semifinais com base nos vencedores das quartas
  for (const qf of bracket.quarterfinals) {
    if (qf.winnerId && qf.nextMatchId) {
      const semifinal = bracket.semifinals.find(sf => sf.id === qf.nextMatchId);
      
      if (semifinal) {
        // Não sobrescrever dados que já estão definidos
        if (qf.id === "qf1" && !semifinal.awayTeamId) {
          console.log(`Semifinal 1 recebendo time visitante: ${qf.winnerId} (vencedor de QF1)`);
          semifinal.awayTeamId = qf.winnerId;
        } else if (qf.id === "qf2" && !semifinal.homeTeamId) {
          console.log(`Semifinal 2 recebendo time da casa: ${qf.winnerId} (vencedor de QF2)`);
          semifinal.homeTeamId = qf.winnerId;
        } else if (qf.id === "qf3" && !semifinal.awayTeamId) {
          console.log(`Semifinal 2 recebendo time visitante: ${qf.winnerId} (vencedor de QF3)`);
          semifinal.awayTeamId = qf.winnerId;
        }
      }
    }
  }
  
  // Atualizar final com base nos vencedores das semifinais
  if (bracket.final) {
    const final = bracket.final;
    for (const sf of bracket.semifinals) {
      if (sf.winnerId && sf.nextMatchId === "final") {
        // Não sobrescrever dados que já estão definidos
        if (sf.id === "sf1" && !final.homeTeamId) {
          console.log(`Final recebendo time da casa: ${sf.winnerId} (vencedor de SF1)`);
          final.homeTeamId = sf.winnerId;
        } else if (sf.id === "sf2" && !final.awayTeamId) {
          console.log(`Final recebendo time visitante: ${sf.winnerId} (vencedor de SF2)`);
          final.awayTeamId = sf.winnerId;
        }
      }
    }
  }
}