import { NextRequest, NextResponse } from 'next/server';

// Funzione per gestire le richieste GET per la cronologia chat
export async function GET(
  request: NextRequest,
  { params }: { params: { transcriptId: string } }
) {
  // Workaround: Introduce an await before accessing params
  await Promise.resolve(); 
  
  const transcriptId = params.transcriptId;

  // Verifica se transcriptId è presente
  if (!transcriptId) {
    return NextResponse.json({ detail: 'Transcript ID mancante nell\'URL' }, { status: 400 });
  }

  // Recupera l'URL del worker dalle variabili d'ambiente
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL; // O variabile server-side
  if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
  }

  console.log(`Recupero cronologia per ${transcriptId} da ${workerUrl}/chat/history/${transcriptId}`);

  try {
    // Chiama l'endpoint del backend worker per la cronologia con GET
    const response = await fetch(`${workerUrl}/chat/history/${transcriptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        
      },
    });

    // Controlla se la risposta dal worker è OK
    if (!response.ok) {
      // Caso specifico: Cronologia non trovata (404)
      if (response.status === 404) {
          console.log(`Nessuna cronologia trovata dal worker per transcriptId: ${transcriptId}. Restituisco struttura vuota.`);
          // Restituisce una struttura dati vuota ma valida con status 200
          return NextResponse.json({ messages: [], chat_id: null, sources: [] }, { status: 200 });
      }

      // Altri errori dal worker
      let errorDetail = `Errore dal worker recuperando cronologia: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
         // Fallback se la risposta d'errore del worker non è JSON
         errorDetail = await response.text() || errorDetail;
      }
      console.error(`Errore dal worker (${response.status}) fetch history: ${errorDetail}`);
      // Restituisci l'errore al client con lo status code del worker se possibile
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    // Se la risposta dal worker è OK (es. 200), inoltra il JSON al frontend
    const historyData = await response.json();
    console.log(`Cronologia recuperata con successo per ${transcriptId}`);
    return NextResponse.json(historyData, { status: 200 });

  } catch (error: any) {
    console.error(`Errore nell'API route /api/chat/history/${transcriptId}:`, error);
    // Errore generico del server (es. network error nel chiamare il worker)
    return NextResponse.json({ detail: error.message || 'Errore interno del server durante il recupero della cronologia' }, { status: 500 });
  }
} 