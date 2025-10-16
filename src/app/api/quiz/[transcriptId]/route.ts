import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transcriptId: string }> }
) {
  try {
    const { transcriptId } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/generate-flashcards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript_id: transcriptId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Errore nella generazione del quiz');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore API quiz:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione del quiz' },
      { status: 500 }
    );
  }
}

