import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("La variabile d'ambiente STRIPE_SECRET_KEY non è configurata.");
    }

    console.log("Inizializzazione istanza Stripe...");
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
      appInfo: { 
        name: "AppuntoAI Dashboard",
        version: "0.1.0",
      }
    });
  }
  return stripeInstance;
}