import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeInstance } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const STRIPE_PRICE_ID_TO_PLAN: { [key: string]: string } = {
    [process.env.STRIPE_PRO_PRICE_ID || '']: 'pro',
    [process.env.STRIPE_BUSINESS_PRICE_ID || '']: 'business',
};

export async function POST(req: NextRequest) {
  console.log('Webhook Stripe ricevuto!');
  const stripe = getStripeInstance();
  
  // 1. Ottieni il corpo RAW della richiesta (NECESSARIO per la verifica firma)
  //    Next.js di default parsa il JSON, dobbiamo accedere al buffer grezzo.
  const body = await req.text(); 
  
  // 2. Ottieni la firma dall'header 'stripe-signature'
  const signature = (await headers()).get('stripe-signature');

  // 3. Ottieni il tuo segreto del webhook dalle variabili d'ambiente
  //    DEVI creare questo segreto nel Dashboard Stripe e aggiungerlo a .env.local/Vercel
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; 

  if (!signature || !webhookSecret) {
    console.error('Errore webhook: Firma o segreto mancante.');
    return NextResponse.json({ error: 'Firma o segreto webhook mancante.' }, { status: 400 });
  }

  let event: Stripe.Event;

  // 4. Verifica la firma e costruisci l'oggetto evento
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    console.log(`Evento Stripe verificato: ${event.type} (ID: ${event.id})`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error(`Errore verifica firma webhook: ${errorMessage}`);
    return NextResponse.json({ error: `Errore verifica webhook: ${errorMessage}` }, { status: 400 });
  }

  // 5. Gestisci l'evento specifico
  try {
    switch (event.type) {
      // --- GESTIONE NUOVO ABBONAMENTO ---
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout Session Completed per session ID: ${session.id}`);

        // Recupera l'ID utente che abbiamo passato durante la creazione della sessione
        const userId = session.client_reference_id; 
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        
        if (!userId) {
          console.error(`Errore checkout.session.completed: client_reference_id (userId) mancante nella sessione ${session.id}`);
          break;
        }
        if (!stripeCustomerId) {
           console.error(`Errore checkout.session.completed: customer ID mancante nella sessione ${session.id}`);
           break;
        }
         if (!stripeSubscriptionId) {
           console.error(`Errore checkout.session.completed: subscription ID mancante nella sessione ${session.id}`);
           break;
         }
        
        console.log(`Utente ID: ${userId}, Stripe Customer ID: ${stripeCustomerId}, Stripe Subscription ID: ${stripeSubscriptionId}`);

        // Recupera i dettagli dell'abbonamento per ottenere l'ID del prezzo
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ['items.data.price'],
        });

        // Trova l'ID del prezzo effettivo pagato
        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
             console.error(`Errore: Impossibile trovare priceId nell'abbonamento ${stripeSubscriptionId}`);
             break;
        }

        // Determina il piano corrispondente all'ID Prezzo
        const planStatus = STRIPE_PRICE_ID_TO_PLAN[priceId] || 'unknown'; // Usa la mappa definita sopra
        if (planStatus === 'unknown') {
             console.warn(`Attenzione: ID Prezzo ${priceId} non mappato a un piano conosciuto.`);
             // Decidi come gestire piani sconosciuti (magari logga e basta, o assegna uno status di default)
        }

        console.log(`Piano determinato per ${userId}: ${planStatus} (basato su priceId: ${priceId})`);

        // Aggiorna il record utente nel tuo database
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId,
            subscriptionStatus: planStatus,
            // Potresti voler resettare il limite qui o basarti sulla data del prossimo rinnovo
            limitResetDate: new Date(), // Resetta il conteggio all'attivazione? (Opzionale)
          },
        });
        console.log(`Utente ${userId} aggiornato nel DB con stato ${planStatus}`);
        break;
      }

      // --- GESTIONE AGGIORNAMENTI/CANCELLAZIONI ABBONAMENTO ---
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription Updated per ID: ${subscription.id}, Stato Stripe: ${subscription.status}`);
        
        const stripeSubscriptionId = subscription.id;
        const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const newStripeStatus = subscription.status; // Es: "active", "past_due", "canceled", "incomplete_expired"
        
        // Trova l'ID del prezzo effettivo
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlanStatus = priceId ? (STRIPE_PRICE_ID_TO_PLAN[priceId] || 'unknown') : 'unknown';

        // Trova l'utente tramite l'ID abbonamento
        const user = await prisma.user.findUnique({
           where: { stripeSubscriptionId: stripeSubscriptionId },
        });

        if (user) {
           let newDbStatus = user.subscriptionStatus; // Mantieni lo stato attuale di default

            // Mappa lo stato Stripe al tuo stato interno
            if (newStripeStatus === 'active') {
              newDbStatus = newPlanStatus; // Aggiorna al piano corrente se attivo
            } else if (newStripeStatus === 'canceled' || newStripeStatus === 'incomplete_expired') {
               newDbStatus = 'canceled';
            } else if (newStripeStatus === 'past_due' || newStripeStatus === 'incomplete') {
               newDbStatus = 'past_due';
            } // Aggiungi altri stati Stripe se necessario

           await prisma.user.update({
              where: { id: user.id },
              data: {
                 subscriptionStatus: newDbStatus,
              },
           });
           console.log(`Utente ${user.id} aggiornato per subscription update: nuovo stato DB ${newDbStatus}`);
        } else {
             console.warn(`Ricevuto customer.subscription.updated per sub ID ${stripeSubscriptionId} non trovato nel DB.`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
         // Simile a 'updated', ma imposta lo stato a 'canceled' o 'free'
         const subscription = event.data.object as Stripe.Subscription;
         console.log(`Subscription Deleted per ID: ${subscription.id}`);
         
         const stripeSubscriptionId = subscription.id;
         const user = await prisma.user.findUnique({
           where: { stripeSubscriptionId: stripeSubscriptionId },
         });

         if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'free', // Riporta a free dopo cancellazione
                stripeSubscriptionId: null, // Rimuovi l'ID abbonamento cancellato
              },
            });
            console.log(`Utente ${user.id} impostato a 'free' per subscription deletion.`);
         } else {
             console.warn(`Ricevuto customer.subscription.deleted per sub ID ${stripeSubscriptionId} non trovato nel DB.`);
         }
         break;
      }

      // ... gestisci altri eventi importanti se necessario (es. invoice.payment_failed)

      default:
        console.log(`Evento Stripe non gestito: ${event.type}`);
    }
  } catch (error) {
      console.error('Errore durante la gestione del webhook:', error);
      return NextResponse.json({ error: 'Errore interno del server durante la gestione del webhook.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
