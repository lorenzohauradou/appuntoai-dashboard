import { NextRequest, NextResponse } from 'next/server'
import { ratelimit } from '@/src/lib/rate-limit'

function getIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (xff) {
    return xff.split(',')[0].trim()
  }
  if (realIp) {
    return realIp.trim()
  }
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIP(request)

    const { success, limit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Troppe richieste. Riprova tra qualche minuto.',
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }

    const body = await request.json()
    const { youtube_url } = body

    if (!youtube_url) {
      return NextResponse.json(
        { error: 'URL YouTube mancante' },
        { status: 400 }
      )
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL
    
    const response = await fetch(`${workerUrl}/public-transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtube_url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Errore durante la trascrizione' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    })

  } catch (error) {
    console.error('Errore trascrizione pubblica:', error)
    return NextResponse.json(
      { error: 'Errore durante la trascrizione' },
      { status: 500 }
    )
  }
}

