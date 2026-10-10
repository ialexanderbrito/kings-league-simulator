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

    const clientIfNoneMatch = request.headers.get("if-none-match")

    const upstreamHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    if (clientIfNoneMatch) {
      upstreamHeaders["If-None-Match"] = clientIfNoneMatch
    }

    const response = await fetch(url, {
      headers: upstreamHeaders,
    })

    if (response.status === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400, immutable",
          "CDN-Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
          "Vercel-CDN-Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
        },
      })
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const upstreamEtag = response.headers.get("etag")

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400, immutable",
      "CDN-Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    }

    if (upstreamEtag) {
      headers["ETag"] = upstreamEtag
      const cleanClient = clientIfNoneMatch?.replace(/^W\//, "").replace(/"/g, "").trim()
      const cleanUpstream = upstreamEtag.replace(/^W\//, "").replace(/"/g, "").trim()
      if (cleanClient && (cleanClient === cleanUpstream || cleanClient === "*")) {
        return new NextResponse(null, { status: 304, headers })
      }
    }

    // Retorna streaming do corpo da imagem diretamente evitando alocação excessiva em memória
    return new NextResponse(response.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
