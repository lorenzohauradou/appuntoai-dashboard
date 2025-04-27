import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { transcriptId: string } }
) {

  // Attendi direttamente l'oggetto params come richiesto da Next.js 15
  const { transcriptId } = await params;

  if (!transcriptId) {
    return NextResponse.json({ detail: 'Transcript ID mancante nell\'URL' }, { status: 400 });
  }

  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
  if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
  }

  console.log(`Recupero cronologia per ${transcriptId} da ${workerUrl}/chat/history/${transcriptId}`);

  try {
    const response = await fetch(`${workerUrl}/chat/history/${transcriptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      console.log(`Nessuna cronologia trovata dal worker per transcriptId: ${transcriptId}. Restituisco struttura vuota.`);
      return NextResponse.json({ messages: [], chat_id: null, sources: [] }, { status: 200 });
    }

    if (!response.ok) {
      let errorDetail = `Errore dal worker recuperando cronologia: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
         errorDetail = await response.text() || errorDetail;
      }
      console.error(`Errore dal worker (${response.status}) fetch history: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    const historyData = await response.json();
    console.log(`Cronologia recuperata con successo per ${transcriptId}`);
    return NextResponse.json(historyData, { status: 200 });

  } catch (error: any) {
    console.error(`Errore nell'API route /api/chat/history/${transcriptId}:`, error);
    return NextResponse.json({ detail: error.message || 'Errore interno del server durante il recupero della cronologia' }, { status: 500 });
  }
} 