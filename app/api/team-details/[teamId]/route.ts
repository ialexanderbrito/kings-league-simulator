import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = await params

    const teamDetailsResponse = await fetch(`https://kingsleague.pro/api/v1/competition/teams/${teamId}`, {
      headers: {
        referer: "https://kingsleague.pro/pt/brazil/teams",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, 
    })

    if (!teamDetailsResponse.ok) {
      throw new Error(`Falha ao buscar detalhes do time: ${teamDetailsResponse.status} ${teamDetailsResponse.statusText}`)
    }

    const teamDetails = await teamDetailsResponse.json()

    const staffResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/teams/${teamId}/season-data/33/staffs`,
      {
        headers: {
          referer: "https://kingsleague.pro/pt/brazil/teams",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 3600 },
      }
    )

    const playersResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/teams/${teamId}/season-data/33/players`,
      {
        headers: {
          referer: "https://kingsleague.pro/pt/brazil/teams",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 3600 },
      }
    )

    let staffData = { staffs: [] };
    if (staffResponse.ok) {
      try {
        staffData = await staffResponse.json();
      } catch (error) {
        console.error("Erro ao processar dados do staff:", error);
      }
    } else {
      console.warn(`Erro na resposta do staff: ${staffResponse.status}`);
    }

    let playersData = [];
    if (playersResponse.ok) {
      try {
        playersData = await playersResponse.json();
        
        if (!Array.isArray(playersData)) {
          console.warn("Dados de jogadores não estão em formato de array:", playersData);
          playersData = [];
        }
        
        playersData = playersData.map(player => ({
          ...player,
          role: player.role || 'midfielder', 
          height: player.height || 175, 
          stats: null, 
          metaInformation: player.metaInformation || {} 
        }));
      } catch (error) {
        console.error("Erro ao processar dados dos jogadores:", error);
      }
    } else {
      console.warn(`Erro na resposta dos jogadores: ${playersResponse.status}`);
    }

    const response = {
      ...teamDetails,
      staff: staffData.staffs || [],
      players: playersData || [],
    }

  

    return new NextResponse(JSON.stringify(response), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("Erro na API de detalhes do time:", error);
    return NextResponse.json(
      {
        error: "Falha ao carregar detalhes do time",
        message: error.message,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}