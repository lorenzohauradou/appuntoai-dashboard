import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ transcriptId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { transcriptId } = await params

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/analyses/${transcriptId}?user_id=${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Errore backend:', errorText)
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nell\'eliminazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

