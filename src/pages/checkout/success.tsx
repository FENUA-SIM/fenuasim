import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function SuccessPage() {
  const router = useRouter()
  const { session_id } = router.query
  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    if (!session_id) return

    const checkOrderStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            airalo_packages (
              name,
              description,
              data_amount,
              data_unit,
              validity_days,
              price,
              currency
            )
          `)
          .eq('stripe_session_id', session_id)
          .maybeSingle()
    
        if (error) throw error
    
        if (data) {
          setOrderDetails(data)
          setOrderStatus('success')
        } else {
          setOrderStatus('error')
        }
      } catch (error) {
        setOrderStatus('error')
      }
    }

    checkOrderStatus()
  }, [session_id])

  if (orderStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Traitement de votre commande...</h1>
          <p>Veuillez patienter pendant que nous finalisons votre commande.</p>
        </div>
      </div>
    )
  }

  if (orderStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p>Une erreur est survenue lors du traitement de votre commande.</p>
          <button
            onClick={() => router.push('/shop')}
            className="mt-4 px-6 py-2 bg-fenua-purple text-white rounded-lg hover:opacity-90"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600">Votre eSIM est en cours de préparation</p>
        </div>

        {orderDetails && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Détails de votre commande</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Forfait</p>
                  <p className="font-medium">{orderDetails.package_name || (orderDetails.airalo_packages && orderDetails.airalo_packages.name)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Données</p>
                  <p className="font-medium">{orderDetails.data_amount || (orderDetails.airalo_packages && orderDetails.airalo_packages.data_amount)} {orderDetails.data_unit || (orderDetails.airalo_packages && orderDetails.airalo_packages.data_unit) || 'GB'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Validité</p>
                  <p className="font-medium">{orderDetails.validity_days || (orderDetails.airalo_packages && orderDetails.airalo_packages.validity_days)} jours</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{orderDetails.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Prochaines étapes</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Vous recevrez un email avec les instructions d'installation</li>
                <li>Installez l'eSIM sur votre appareil</li>
                <li>Activez votre forfait</li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={() => router.push('/shop')}
                className="w-full px-6 py-3 bg-fenua-purple text-white rounded-lg hover:opacity-90"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}