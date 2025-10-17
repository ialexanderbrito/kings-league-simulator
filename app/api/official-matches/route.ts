import { NextResponse } from "next/server"

export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId") || "1913"
    // competitionId fixo 17
    const url = `https://kingsleague.pro/api/v1/competition/matches/${matchId}?live=false&competitionId=17`
    const res = await fetch(url, {
      headers: {
        "accept": "/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "referer": "https://kingsleague.pro/pt/brazil/jogos/"
      },
      cache: "no-store"
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao buscar dados oficiais", status: res.status }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro desconhecido" }, { status: 500 })
  }
}
