import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://kingsleague.pro/api/v1/competition/seasons/33/match-center-data?lang=pt", {
      headers: {
        referer: "https://kingsleague.pro/en/brazil/matches",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Falha ao buscar dados diretamente da API da Kings League",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
