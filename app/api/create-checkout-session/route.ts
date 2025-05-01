import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL; 

const PRICE_IDS = {
  pro: 'price_1RJzpNCizsqrQc7ssksDW3hm',
  business: 'price_1RJzr8CizsqrQc7sfMcKRTDO',
};

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    
    if (!plan || !PRICE_IDS[plan as keyof typeof PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Piano non valido' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
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