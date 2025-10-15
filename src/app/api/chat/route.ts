import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    const body = await request.json();
    const { transcript_id, message } = body;

    if (!transcript_id || !message) {
      return NextResponse.json({ detail: 'transcript_id e message richiesti' }, { status: 400 });
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("NEXT_PUBLIC_WORKER_URL non configurato");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    const backendUrl = `${workerUrl}/chat`;
    console.log(`Inoltro richiesta chat a ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript_id,
        message,
        user_id: userId
      }),
    });

    const text = await response.text();
    
    if (!response.ok) {
      let errorDetail = `Errore backend: ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = text || errorDetail;
      }
      console.error(`Errore ${response.status}: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("Errore parsing JSON dalla risposta chat");
      console.error("Risposta raw:", text.substring(0, 200));
      return NextResponse.json({ 
        detail: `Errore formato risposta: ${text.substring(0, 100)}` 
      }, { status: 500 });
    }
    
    console.log("Chat risposta completata");
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore in /api/chat:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server' 
    }, { status: 500 });
  }
}

