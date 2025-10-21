import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("La variabile d'ambiente STRIPE_SECRET_KEY non è configurata.");
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
      typescript: true
    });
  }
  return stripeInstance;
}