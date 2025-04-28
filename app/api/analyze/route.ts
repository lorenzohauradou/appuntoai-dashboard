import { NextRequest, NextResponse } from 'next/server';
// Importa auth per recuperare la sessione
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // --- Recupera la sessione e l'ID utente ---
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      // Se l'utente non è loggato, restituisci errore
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }
    // --- Fine recupero sessione ---

    // Estrai FormData dalla richiesta
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentType = formData.get('content_type') as string | null;

    if (!file) {
      return NextResponse.json({ detail: 'File mancante' }, { status: 400 });
    }

    // Ricrea FormData per inoltrarlo al backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    if (contentType) {
      backendFormData.append('content_type', contentType);
      console.log(`Inoltro al backend con content_type: ${contentType}`);
    } else {
       console.log("Inoltro al backend senza content_type specificato.");
    }
    // --- Aggiungi user_id al FormData ---
    backendFormData.append('user_id', userId);
    console.log(`Inoltro al backend con user_id: ${userId}`);
    // --- Fine aggiunta user_id ---

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }
    const backendUrl = `${workerUrl}/analyze`;

    console.log(`Inoltro richiesta analyze a ${backendUrl}`);

    // Chiama il backend worker
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
    });

    console.log("Risposta ricevuta dal backend:", response.status, response.statusText);

    // Gestisci la risposta dal backend
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

    // Inoltra la risposta di successo al frontend
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore nella API route /api/analyze:", error);
    return NextResponse.json({ detail: error.message || 'Errore interno del server durante l\'analisi' }, { status: 500 });
  }
} 