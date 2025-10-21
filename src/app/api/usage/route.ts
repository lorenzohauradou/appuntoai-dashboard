import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserUsageInfo } from '@/src/lib/usage-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const usageInfo = await getUserUsageInfo(session.user.id);

    if (!usageInfo) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(usageInfo);
  } catch (error) {
    console.error('Errore nel recupero delle info di utilizzo:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

