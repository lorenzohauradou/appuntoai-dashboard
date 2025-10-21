import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { checkUsageLimit, incrementUsageCount } from "@/src/lib/usage-limit";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ detail: 'Autenticazione richiesta' }, { status: 401 });
    }

    const usageCheck = await checkUsageLimit(userId);
    if (!usageCheck.allowed) {
      return NextResponse.json({ 
        detail: usageCheck.message,
        currentCount: usageCheck.currentCount,
        limit: usageCheck.limit,
        subscriptionStatus: usageCheck.subscriptionStatus
      }, { status: 403 });
    }

    const body = await request.json();
    const { file_url } = body;

    if (!file_url) {
      return NextResponse.json({ detail: 'file_url richiesto' }, { status: 400 });
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;

    const backendUrl = `${workerUrl}/analyze-upload`;
    console.log(`Inoltro richiesta a ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        file_url: file_url
      }),
    });

    const text = await response.text();
    
    if (!response.ok) {
      let errorDetail = `Errore backend: ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = text || errorDetail;
      }
      console.error(`Errore ${response.status}: ${errorDetail}`);
      return NextResponse.json({ detail: errorDetail }, { status: response.status || 500 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("Errore parsing JSON dalla risposta backend");
      console.error("Risposta raw:", text.substring(0, 200));
      return NextResponse.json({ 
        detail: `Errore formato risposta: ${text.substring(0, 100)}` 
      }, { status: 500 });
    }
    
    console.log("Analisi completata");
    
    await incrementUsageCount(userId);
    
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Errore in /api/analyze/upload:", error);
    return NextResponse.json({ 
      detail: error.message || 'Errore interno del server' 
    }, { status: 500 });
  }
}

