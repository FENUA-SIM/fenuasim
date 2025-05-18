import { loadStripe } from '@stripe/stripe-js'

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

if (typeof window !== 'undefined') {
  // Côté client : on vérifie seulement la clé publique
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Missing Stripe publishable key')
  }
} else {
  // Côté serveur : on peut vérifier toutes les clés
  if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing Stripe environment variables')
  }
}

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublicKey) {
  throw new Error('Missing Stripe environment variables');
}
export const stripePromise = loadStripe(stripePublicKey);

export interface StripeCheckoutSession {
  id: string
  amount_total: number
  currency: string
  customer: string
  payment_status: string
  status: string
  metadata: {
    package_id: string
    customer_id: string
  }
} 