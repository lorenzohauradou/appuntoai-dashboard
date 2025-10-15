import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transcriptId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    const { transcriptId } = await params;

    if (!transcriptId) {
      return NextResponse.json({ detail: 'transcriptId richiesto' }, { status: 400 });
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("NEXT_PUBLIC_WORKER_URL non configurato");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    const backendUrl = `${workerUrl}/transcript/${transcriptId}`;
    console.log(`Recupero trascrizione da ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.log("Trascrizione recuperata");
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore in /api/transcript:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server' 
    }, { status: 500 });
  }
}

