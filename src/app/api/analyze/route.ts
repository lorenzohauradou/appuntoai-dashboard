import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    const body = await request.json();
    const { file_url } = body;

    if (!file_url) {
      return NextResponse.json({ detail: 'file_url richiesto' }, { status: 400 });
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("NEXT_PUBLIC_WORKER_URL non configurato");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    const backendUrl = `${workerUrl}/analyze`;
    console.log(`Inoltro richiesta a ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        file_url: file_url
      }),
    });

    if (!response.ok) {
      let errorDetail = `Errore backend: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        const text = await response.text();
        errorDetail = text || errorDetail;
      }
      console.error(`Errore ${response.status}: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Errore parsing JSON dalla risposta backend");
      const text = await response.text();
      console.error("Risposta raw:", text);
      return NextResponse.json({ 
        detail: `Errore formato risposta: ${text.substring(0, 100)}` 
      }, { status: 500 });
    }
    
    console.log("Analisi completata");
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore in /api/analyze:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server' 
    }, { status: 500 });
  }
}

