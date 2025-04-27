import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Usa la variabile d'ambiente per l'URL del backend
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    const backendUrl = `${workerUrl}/analyses/history`;


    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });


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