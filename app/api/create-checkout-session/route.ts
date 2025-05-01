import { getStripeInstance } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL; 

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_PRICE_ID,
};

export async function POST(req: Request) {
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

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId, 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      //  http://localhost:3000/dashboard?success=true (o il valore di NEXT_PUBLIC_APP_URL)
      success_url: `${DOMAIN}/dashboard?success=true`, 
      cancel_url: `${DOMAIN}/prezzi?canceled=true`,   
      automatic_tax: { enabled: true }, 
      allow_promotion_codes: true,     
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Errore durante la creazione della sessione Stripe:', error); 
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json(
      { error: 'Errore interno durante la creazione della sessione di checkout.', details: errorMessage },
      { status: 500 }
    );
  }
}