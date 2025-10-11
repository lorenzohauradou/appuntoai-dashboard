import { getStripeInstance } from '@/src/lib/stripe';
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL; 

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_PRICE_ID,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    console.log("Tentativo creazione checkout non autorizzato.");
    return NextResponse.json({ error: 'Autenticazione richiesta.' }, { status: 401 });
  }
  const userId = session.user.id;
  const userEmail = session.user.email;
  console.log(`Richiesta checkout da user: ${userId} (${userEmail})`);

  const stripe = getStripeInstance();

  try {
    const { plan } = await req.json();
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];

    if (!plan || !priceId) { 
      console.error(`Piano non valido o ID Prezzo non trovato per il piano: ${plan}`);
      return NextResponse.json(
        { error: `Configurazione piano non valida per '${plan}'. ID Prezzo mancante.` }, 
        { status: 400 }
      );
    }

    let stripeCustomerId: string | null = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });
      stripeCustomerId = user?.stripeCustomerId ?? null;
      console.log(`Stripe Customer ID per ${userId}: ${stripeCustomerId}`);
    } catch (dbError) {
      console.error(`Errore DB nel recupero stripeCustomerId per user ${userId}:`, dbError);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId, 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${DOMAIN}/dashboard?success=true`, 
      cancel_url: `${DOMAIN}/prezzi?canceled=true`,   
      automatic_tax: { enabled: true }, 
      allow_promotion_codes: true,     
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
      customer: stripeCustomerId || undefined,
      customer_email: !stripeCustomerId ? userEmail || undefined : undefined,
    });

    console.log(`Sessione checkout creata: ${checkoutSession.id} per user ${userId}`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(`Errore durante la creazione della sessione Stripe per user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json(
      { error: 'Errore interno durante la creazione della sessione di checkout.', details: errorMessage },
      { status: 500 }
    );
  }
}