import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Recupera la sessione e l'ID utente
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({ detail: 'Job ID richiesto' }, { status: 400 });
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    // Costruisci l'URL per controllare lo stato del job
    const statusUrl = `${workerUrl}/status/${jobId}?user_id=${userId}`;
    console.log(`Controllo stato job: ${statusUrl}`);

    // Chiama il backend per lo stato del job
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Risposta stato job ricevuta:", response.status, response.statusText);

    if (!response.ok) {
      let errorDetail = `Errore dal backend: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text() || errorDetail;
      }
      console.error(`Errore ${response.status} nel controllo stato job: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    // Inoltra la risposta del job al frontend
    const data = await response.json();
    console.log(`Stato job ${jobId}: ${data.status} (${data.progress}%)`);
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore nella API route /api/job-status:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server durante il controllo dello stato del job' 
    }, { status: 500 });
  }
} 