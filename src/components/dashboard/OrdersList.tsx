import { useEffect, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrdersList() {
  const { orders, loading, error, fetchOrders } = useOrders();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        <p>Une erreur est survenue lors du chargement des commandes.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col h-screen text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Aucune commande</h3>
        <p className="mt-2 text-gray-500">Vous n'avez pas encore passé de commande.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mes commandes</h2>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forfait
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.package}</div>
                    <div className="text-sm text-gray-500">
                      {order.data.toString().slice(0, -2)} Go
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status.slug === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status.slug === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.slug === 'completed' ? 'Terminée' :
                       order.status.slug === 'pending' ? 'En cours' :
                       order.status.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.price} {order.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination simple */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={orders.length < 10}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
} 