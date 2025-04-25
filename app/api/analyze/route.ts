import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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

    // Usa la variabile d'ambiente per l'URL del backend
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }
    const backendUrl = `${workerUrl}/analyze`; // Costruisci l'URL completo

    console.log(`Inoltro richiesta analyze a ${backendUrl}`);

    // Chiama il backend worker
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
      // Non impostare Content-Type quando usi FormData, il browser/fetch lo fa automaticamente
      // con il boundary corretto.
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