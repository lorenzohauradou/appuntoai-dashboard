import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeInstance } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';

const STRIPE_PRICE_ID_TO_PLAN: { [key: string]: string } = {
    [process.env.STRIPE_PRO_PRICE_ID || '']: 'pro',
    [process.env.STRIPE_BUSINESS_PRICE_ID || '']: 'business',
};

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook Stripe ricevuto!');
  const stripe = getStripeInstance();
  const body = await req.text(); 
  const signature = (await headers()).get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  if (!signature || !webhookSecret) {
    console.error('❌ Errore: Firma o segreto mancante');
    return NextResponse.json({ error: 'Firma o segreto webhook mancante.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Evento verificato: ${event.type}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error(`❌ Errore verifica firma: ${errorMessage}`);
    return NextResponse.json({ error: `Errore verifica webhook: ${errorMessage}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id; 
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        
        if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
          console.error('❌ Dati mancanti nel checkout');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ['items.data.price'],
        });

        const priceId = subscription.items.data[0]?.price?.id;
        const planStatus = priceId ? (STRIPE_PRICE_ID_TO_PLAN[priceId] || 'free') : 'free';

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionStatus: planStatus,
            limitResetDate: new Date(),
            monthlyAnalysesCount: 0,
          },
        });
        
        console.log(`✅ Utente ${userId} aggiornato a piano ${planStatus} con contatore resettato`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        const newStripeStatus = subscription.status;
        
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlanStatus = priceId ? (STRIPE_PRICE_ID_TO_PLAN[priceId] || 'free') : 'free';

        const user = await prisma.user.findUnique({
           where: { stripeSubscriptionId },
        });

        if (user) {
           let newDbStatus = newPlanStatus;
           
           if (newStripeStatus === 'canceled' || newStripeStatus === 'incomplete_expired') {
              newDbStatus = 'free';
           } else if (newStripeStatus !== 'active') {
              newDbStatus = 'past_due';
           }

           await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionStatus: newDbStatus },
           });
           
           console.log(`✅ Abbonamento aggiornato: ${user.id} → ${newDbStatus}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
         const subscription = event.data.object as Stripe.Subscription;
         const user = await prisma.user.findUnique({
           where: { stripeSubscriptionId: subscription.id },
         });

         if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'free',
                stripeSubscriptionId: null,
              },
            });
            console.log(`✅ Abbonamento cancellato: ${user.id} → free`);
         }
         break;
      }

      default:
        console.log(`Evento non gestito: ${event.type}`);
    }
  } catch (error) {
      console.error('❌ Errore gestione webhook:', error);
      return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
