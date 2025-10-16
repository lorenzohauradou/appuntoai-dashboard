import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { feedback } = body;

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback vuoto' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email || 'unknown';
    const userName = session.user.name || 'Utente Anonimo';

    const emailResult = await resend.emails.send({
      from: 'Appuntoai <onboarding@resend.dev>',
      to: 'lorenzooradu@gmail.com',
      subject: `🎯 Nuovo Feedback da ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Nuovo Feedback Ricevuto</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Da:</strong> ${userName}</p>
            <p style="margin: 0 0 10px 0;"><strong>User ID:</strong> ${session.user.id}</p>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Messaggio:</h3>
            <p style="color: #6b7280; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
          </div>
        </div>
      `,
    });

    console.log('Email inviata con successo:', emailResult);
    return NextResponse.json({ success: true, emailId: emailResult.data?.id });
  } catch (error) {
    console.error('Errore invio feedback:', error);
    return NextResponse.json(
      { error: 'Errore invio feedback' },
      { status: 500 }
    );
  }
}

