import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'File audio non fornito' },
        { status: 400 }
      )
    }

    const backendFormData = new FormData()
    backendFormData.append('audio', audioFile)
    backendFormData.append('user_id', session.user.id || 'anonymous')

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL

    const response = await fetch(`${workerUrl}/analyze-live`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Errore dal backend:', errorText)
      return NextResponse.json(
        { error: 'Errore durante l\'analisi della registrazione' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nell\'analisi live:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

