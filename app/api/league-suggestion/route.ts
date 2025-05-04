import { NextResponse } from "next/server"

const GOOGLE_FORM_URL = process.env.GOOGLE_FORM_URL;

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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}