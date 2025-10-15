import { NextResponse } from "next/server"

const GOOGLE_FORM_URL = process.env.GOOGLE_FORM_URL;
const GOOGLE_RESULTS_URL = process.env.GOOGLE_RESULTS_URL || GOOGLE_FORM_URL;

export async function GET() {
  try {
    if (!GOOGLE_RESULTS_URL) {
      throw new Error('URL para buscar resultados não configurada no servidor');
    }

    const response = await fetch(GOOGLE_RESULTS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar resultados: ${response.status}`);
    }

    // Obter os dados brutos
    const data = await response.json();
    
    // Retornar os dados diretamente, sem colocá-los em um objeto "results"
    // Isso permite que o front-end processe os dados no formato que você mostrou
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({
      error: "Falha ao buscar resultados",
      message: error.message,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leagues } = body;

    if (!leagues) {
      return NextResponse.json(
        { error: "Parâmetro 'leagues' é obrigatório" },
        { status: 400 }
      );
    }

    if (!GOOGLE_FORM_URL) {
      throw new Error('URL para envio de sugestões não configurada no servidor');
    }

    const response = await fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leagues }),
      mode: 'cors'
    });

    if (!response.ok && response.status !== 0) { 
      throw new Error(`Erro ao enviar para o Google Form: ${response.status}`);
    }

    return new NextResponse(JSON.stringify({ 
      success: true, 
      message: "Sugestão registrada com sucesso" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({
      error: "Falha ao processar sugestão",
      message: error.message,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}