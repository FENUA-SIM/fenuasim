'use client'

import { Database } from '@/lib/supabase/config'
import { supabase } from '@/hooks/useSupabase'
import { useEffect, useState } from 'react'
import { stripePromise } from '@/lib/stripe/config'

type Package = Database['public']['Tables']['airalo_packages']['Row']

interface OrderSummaryProps {
  pkg: Package
}

export default function OrderSummary({ pkg: initialPkg }: OrderSummaryProps) {
  const [pkg, setPkg] = useState(initialPkg)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase.channel('package-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'airalo_packages',
          filter: `id=eq.${pkg.id}`,
        },
        (payload) => {
          setPkg(payload.new as Package)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pkg.id])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: [{
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            final_price_eur: pkg.price,
          }],
        }),
      })

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe non initialisé')

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Erreur checkout:', err)
      setError('Une erreur est survenue lors du paiement. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const margin = parseFloat(localStorage.getItem('global_margin')!);
  const priceWithMargin = pkg.price! * (1 + margin);

  return (
    <form onSubmit={handlePay} className="bg-white rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Forfait</span>
          <span className="font-semibold">{pkg.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Données</span>
          <span className="font-semibold">
            {pkg.data_amount} {pkg.data_unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Durée</span>
          <span className="font-semibold">
            {pkg.duration} {pkg.duration_unit}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
          <span>Total</span>
          <span>{priceWithMargin.toFixed(2)} {pkg.currency}</span>
        </div>
      </div>
      <button
        type="submit"
        className="btn-gradient w-full py-3 rounded-full text-lg font-semibold shadow-md mt-6 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Redirection..." : "Payer"}
      </button>
    </form>
  )
}