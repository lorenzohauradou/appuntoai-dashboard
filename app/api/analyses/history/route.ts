import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Usa la variabile d'ambiente per l'URL del backend
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
      console.error("URL del worker non configurato (NEXT_PUBLIC_WORKER_URL)");
      return NextResponse.json({ detail: 'Configurazione server incompleta' }, { status: 500 });
    }
    const backendUrl = `${workerUrl}/analyses/history`; // URL completo

    console.log(`Recupero cronologia analisi da ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungere altri header se necessari
      },
    });

    console.log("Risposta cronologia analisi dal backend:", response.status, response.statusText);

    if (!response.ok) {
      let errorDetail = `Errore dal backend: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text() || errorDetail;
      }
      console.error(`Errore ${response.status} dal backend getAnalysisHistory: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore nella API route /api/analyses/history:", error);
    return NextResponse.json({ detail: error.message || 'Errore interno del server recuperando cronologia analisi' }, { status: 500 });
  }
} 