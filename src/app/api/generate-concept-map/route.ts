import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript_id } = body;

    if (!transcript_id) {
      return NextResponse.json(
        { error: 'transcript_id è richiesto' },
        { status: 400 }
      );
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    
    const response = await fetch(`${workerUrl}/generate-concept-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Errore dal backend:', errorText);
      return NextResponse.json(
        { error: 'Errore nella generazione della mappa concettuale' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore nella generazione della mappa concettuale:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

