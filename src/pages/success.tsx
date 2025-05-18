import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Success() {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { session_id } = router.query
    if (!session_id) return

    const packageId = localStorage.getItem('packageId')
    const customerId = localStorage.getItem('customerId')
    const customerEmail = localStorage.getItem('customerEmail')
    const customerName = localStorage.getItem('customerName')

    if (!packageId || !customerId || !customerEmail) {
      setError('Impossible de retrouver les informations de la commande.')
      setLoading(false)
      return
    }

    fetch('/api/stripe-success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id,
        packageId,
        customerId,
        customerEmail,
        customerName,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setOrder(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur lors de la récupération de la commande.')
        setLoading(false)
      })
  }, [router.query])

  if (loading) return <p className="text-center py-12">Chargement...</p>
  if (error) return <p className="text-center text-red-500 py-12">{error}</p>
  if (!order) return <p className="text-center text-red-500 py-12">Aucune commande trouvée.</p>

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-purple-700">Merci pour votre achat !</h1>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Votre eSIM est prête</h2>
        <p className="mb-2">Un email de confirmation a été envoyé à <span className="font-semibold">{order.email}</span>.</p>
        <div className="flex flex-col items-center my-6">
          {order.order?.qr_code_url && (
            <img src={order.order.qr_code_url} alt="QR code eSIM" className="w-48 h-48 mb-2" />
          )}
          <span className="text-gray-600 text-sm">Scannez ce QR code pour installer votre eSIM</span>
        </div>
        <div className="text-sm text-gray-700">
          <div><span className="font-semibold">Nom :</span> {order.name}</div>
          <div><span className="font-semibold">Email :</span> {order.email}</div>
          <div><span className="font-semibold">Numéro eSIM :</span> {order.order?.iccid || '...'}</div>
          <div><span className="font-semibold">Statut :</span> {order.order?.status || '...'}</div>
        </div>
      </div>
      <div className="text-center">
        <a href="/dashboard" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">Accéder à mon espace client</a>
      </div>
    </div>
  )
} 