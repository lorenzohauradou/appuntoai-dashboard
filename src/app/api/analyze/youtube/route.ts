import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkUsageLimit, incrementUsageCount } from '@/src/lib/usage-limit';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const usageCheck = await checkUsageLimit(session.user.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.message,
          currentCount: usageCheck.currentCount,
          limit: usageCheck.limit,
          subscriptionStatus: usageCheck.subscriptionStatus
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { youtube_url } = body;

    if (!youtube_url) {
      return NextResponse.json(
        { error: 'URL YouTube mancante' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/analyze-youtube`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url,
          user_id: session.user.id,
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Errore durante l\'analisi del video' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    await incrementUsageCount(session.user.id);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore API analyze/youtube:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

