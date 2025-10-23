import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { getStripeInstance } from '@/src/lib/stripe';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    console.log("Tentativo di cancellazione abbonamento non autorizzato.");
    return NextResponse.json({ error: 'Autenticazione richiesta.' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(`Richiesta cancellazione abbonamento da user: ${userId}`);

  const stripe = getStripeInstance();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeSubscriptionId: true,
        subscriptionStatus: true,
      },
    });

    if (!user?.stripeSubscriptionId) {
      console.log(`User ${userId} non ha un abbonamento attivo da cancellare.`);
      return NextResponse.json(
        { error: 'Nessun abbonamento attivo trovato.' }, 
        { status: 400 }
      );
    }

    if (user.subscriptionStatus === 'free') {
      console.log(`User ${userId} ha già un piano free.`);
      return NextResponse.json(
        { error: 'Non hai un abbonamento attivo.' }, 
        { status: 400 }
      );
    }

    // Cancella l'abbonamento su Stripe (alla fine del periodo di fatturazione)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    console.log(`Abbonamento ${user.stripeSubscriptionId} programmato per cancellazione`);

    return NextResponse.json({ 
      success: true,
      message: 'Abbonamento cancellato con successo. Resterà attivo fino alla fine del periodo di fatturazione.',
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toLocaleDateString('it-IT') : null,
    });

  } catch (error) {
    console.error(`Errore durante la cancellazione dell'abbonamento per user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json(
      { error: 'Errore durante la cancellazione dell\'abbonamento.', details: errorMessage },
      { status: 500 }
    );
  }
}

