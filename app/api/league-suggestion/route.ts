import {
  createSuccessResponse,
  createErrorResponse,
  createJsonResponse,
  createOptionsHandler,
} from "@/lib/api"

const GOOGLE_FORM_URL = process.env.GOOGLE_FORM_URL
const GOOGLE_RESULTS_URL = process.env.GOOGLE_RESULTS_URL || GOOGLE_FORM_URL

export async function GET() {
  try {
    if (!GOOGLE_RESULTS_URL) {
      return createErrorResponse(
        "Configuração ausente",
        new Error("URL para buscar resultados não configurada no servidor"),
        { status: 500, allowPost: true }
      )
    }

    const response = await fetch(GOOGLE_RESULTS_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar resultados: ${response.status}`)
    }

    const data = await response.json()

    return createSuccessResponse(data, { allowPost: true })
  } catch (error) {
    return createErrorResponse("Falha ao buscar resultados", error, { allowPost: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leagues } = body

    if (!leagues) {
      return createJsonResponse(
        { erro: "Parâmetro 'leagues' é obrigatório" },
        { status: 400, allowPost: true }
      )
    }

    if (!GOOGLE_FORM_URL) {
      return createErrorResponse(
        "Configuração ausente",
        new Error("URL para envio de sugestões não configurada no servidor"),
        { status: 500, allowPost: true }
      )
    }

    const response = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagues }),
      mode: "cors",
    })

    // Status 0 pode ocorrer em algumas configurações CORS do Google Forms
    if (!response.ok && response.status !== 0) {
      throw new Error(`Erro ao enviar para o Google Form: ${response.status}`)
    }

    return createJsonResponse(
      { sucesso: true, mensagem: "Sugestão registrada com sucesso" },
      { allowPost: true }
    )
  } catch (error) {
    return createErrorResponse("Falha ao processar sugestão", error, { allowPost: true })
  }
}

export const OPTIONS = createOptionsHandler(true)