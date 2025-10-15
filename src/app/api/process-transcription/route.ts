import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

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

    const backendData = {
      user_id: userId,
      file_url: file_url
    };

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    const backendUrl = `${workerUrl}/analyze`;
    console.log(`Inoltro richiesta analyze a ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    console.log("Risposta ricevuta dal backend:", response.status, response.statusText);

    if (!response.ok) {
      let errorDetail = `Errore dal backend: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        const text = await response.text();
        errorDetail = text || errorDetail;
      }
      console.error(`Errore ${response.status} dal backend analyze: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    const data = await response.json();
    console.log("Analisi completata con successo");
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore nella API route /api/process-transcription:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server durante la creazione del job' 
    }, { status: 500 });
  }
}