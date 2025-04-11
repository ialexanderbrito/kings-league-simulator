import { NextResponse } from "next/server"
import type { PlayerStats } from "@/types/kings-league"

export async function GET(
  request: Request,
  { params }: { params: { playerId: string } }
) {
  try {
    const { playerId } = await params

    const statsResponse = await fetch(
      `https://kingsleague.pro/api/v1/competition/players/${playerId}/season-data/33/stats`,
      {
        headers: {
          referer: "https://kingsleague.pro/pt/brazil/teams",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 3600 }, 
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