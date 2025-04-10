import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = params.teamId

    // Buscar detalhes do time
    const teamDetailsResponse = await fetch(`https://kingsleague.pro/api/v1/competition/teams/${teamId}`, {
      headers: {
        referer: "https://kingsleague.pro/pt/brazil/teams",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Revalidar a cada hora
    })

    if (!teamDetailsResponse.ok) {
      throw new Error(`Falha ao buscar detalhes do time: ${teamDetailsResponse.status} ${teamDetailsResponse.statusText}`)
    }

    const teamDetails = await teamDetailsResponse.json()

    // Buscar staff (presidente, treinadores)
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

    // Buscar jogadores
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

    // Compilar todos os dados
    const staffData = staffResponse.ok ? await staffResponse.json() : { staffs: [] }
    const playersData = playersResponse.ok ? await playersResponse.json() : []

    // Formatar resposta
    const response = {
      ...teamDetails,
      staff: staffData.staffs || [],
      players: playersData || [],
    }

    // Configurar cabeçalhos CORS
    return new NextResponse(JSON.stringify(response), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
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

// Adicionar suporte para preflight OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}