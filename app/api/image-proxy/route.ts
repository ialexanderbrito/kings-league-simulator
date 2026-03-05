import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 })
  }

  try {
    // Verificar se é uma URL válida de imagem
    const parsedUrl = new URL(url)
    
    // Lista de domínios permitidos (Kings League e CDNs conhecidos)
    const allowedDomains = [
      "kingsleague.pro",
      "cdn.kingsleague.pro",
      "images.kingsleague.pro",
      "api.kingsleague.pro",
      "kingsleague-cdn.kama.football",
      "kama.football",
      "res.cloudinary.com",
      "s3.amazonaws.com",
    ]

    const isAllowed = allowedDomains.some(domain => 
      parsedUrl.hostname.endsWith(domain) || parsedUrl.hostname === domain
    )

    if (!isAllowed) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403 })
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
