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

    const data = await response.json();
    console.log("Chat risposta completata");
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore in /api/chat:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server' 
    }, { status: 500 });
  }
}

