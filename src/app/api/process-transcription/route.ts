import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // Recupera la sessione e l'ID utente
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    // Estrai i dati JSON dalla richiesta
    const body = await request.json();
    const { file_path, original_file_name, content_type, text_content } = body;

    // Valida i dati richiesti
    if (!content_type) {
      return NextResponse.json({ detail: 'Tipo di contenuto richiesto' }, { status: 400 });
    }

    if (!file_path && !text_content) {
      return NextResponse.json({ detail: 'file_path o text_content richiesti' }, { status: 400 });
    }

    if (file_path && !original_file_name) {
      return NextResponse.json({ detail: 'original_file_name richiesto con file_path' }, { status: 400 });
    }

    // Prepara i dati per il backend
    const backendData = {
      user_id: userId,
      content_type: content_type,
      file_path: file_path || null,
      original_file_name: original_file_name || null,
      text_content: text_content || null
    };

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }

    const backendUrl = `${workerUrl}/analyze`;
    console.log(`Inoltro richiesta analyze a ${backendUrl}`);

    // Chiama il backend worker (ora restituisce un job_id)
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
        errorDetail = await response.text() || errorDetail;
      }
      console.error(`Errore ${response.status} dal backend analyze: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    // Inoltra la risposta del job al frontend
    const data = await response.json();
    console.log("Job creato con successo:", data.job_id);
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore nella API route /api/process-transcription:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server durante la creazione del job' 
    }, { status: 500 });
  }
}