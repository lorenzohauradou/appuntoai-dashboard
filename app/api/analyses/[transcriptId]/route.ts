import { NextRequest, NextResponse } from 'next/server';

// Funzione per gestire le richieste DELETE per un'analisi specifica
export async function DELETE(
  request: NextRequest,
  context: { params: { transcriptId: string } } 
) {
  const { transcriptId } = await context.params;

  if (!transcriptId) {
    return NextResponse.json({ detail: 'Transcript ID mancante nell\'URL' }, { status: 400 });
  }

  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
  const backendUrl = `${workerUrl}/analyses/${transcriptId}`;

  console.log(`Eliminazione analisi ${transcriptId} tramite ${backendUrl}`);

  try {
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        // Non necessario per DELETE di solito
        // 'Content-Type': 'application/json', 
      },
    });

    console.log("Risposta eliminazione analisi dal backend:", response.status, response.statusText);

    // DELETE ritorna 204 No Content in caso di successo
    if (response.status === 204) {
      // Successo senza contenuto, restituisci una risposta vuota con status 204
       return new NextResponse(null, { status: 204 });
    }

    if (response.ok) {
       const data = await response.json().catch(() => null);
       return NextResponse.json(data || { message: 'Eliminazione completata' }, { status: response.status });
    }

    // errore
    let errorDetail = `Errore dal backend: ${response.status}`;
    if (response.status === 404) {
        errorDetail = `Analisi con ID ${transcriptId} non trovata sul backend.`;
    } else {
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
            errorDetail = await response.text() || errorDetail;
        }
    }
    console.error(`Errore ${response.status} dal backend deleteAnalysis: ${errorDetail}`);
    return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });

  } catch (error: any) {
    console.error(`Errore nella API route DELETE /api/analyses/${transcriptId}:`, error);
    return NextResponse.json({ detail: error.message || 'Errore interno del server durante l\'eliminazione' }, { status: 500 });
  }
} 