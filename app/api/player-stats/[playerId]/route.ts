import { NextResponse } from "next/server"
import type { PlayerStats } from "@/types/kings-league"

const SEASON_ID = process.env.KINGS_LEAGUE_SEASON_ID

export async function GET(
  request: Request,
  { params }: { params: { playerId: string } }
) {
  try {
    const { playerId } = await params

    const statsResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/players/${playerId}/season-data/${SEASON_ID}/stats`,
      {
        headers: {
          referer: "https://kingsleague.pro/pt/brazil/teams",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        // Revalidar a cada 12 horas (43200 segundos)
        next: { revalidate: 43200 }, 
      }
    )

    if (!statsResponse.ok) {
      throw new Error(`Falha ao buscar estatísticas do jogador: ${statsResponse.status} ${statsResponse.statusText}`)
    }

    const playerStats = await statsResponse.json()

    return new NextResponse(JSON.stringify(playerStats), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // 6 horas para cliente, 12 horas para CDN
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Falha ao carregar estatísticas do jogador",
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