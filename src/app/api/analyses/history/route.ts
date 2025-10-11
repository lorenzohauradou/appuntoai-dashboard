import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ detail: "Non autorizzato" }, { status: 401 });
  }

  console.log(`Recupero cronologia per utente: ${userId}`);

  try {
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl) {
        throw new Error("URL worker non configurato");
    }
    const backendUrl = `${workerUrl}/analyses/history?user_id=${encodeURIComponent(userId)}`;

    console.log(`Chiamata backend Python a: ${backendUrl}`);

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
      console.error(`Errore ${response.status} dal backend getAnalysisHistory per user ${userId}: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    const data = await response.json();
    console.log(`Dati cronologia ricevuti da Python per user ${userId}`);
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error(`Errore API route /api/analyses/history per user ${userId}:`, error);
    return NextResponse.json({ detail: error.message || 'Errore interno del server recuperando cronologia analisi' }, { status: 500 });
  }
} 