import { useEffect, useState } from 'react';
import { useDataUsage } from '@/hooks/useDataUsage';
import { useSims } from '@/hooks/useSims';
import { Activity, Plus } from 'lucide-react';

interface SimCard {
  id: string;
  iccid: string;
  name: string;
  status: string;
}

export default function DataUsage() {
  const { usage, loading: usageLoading, error: usageError, fetchUsage, formatDataUsage } = useDataUsage();
  const { sims, loading: simsLoading, error: simsError, fetchSims } = useSims();
  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null);
  const [showAddSimModal, setShowAddSimModal] = useState(false);
  const [newSim, setNewSim] = useState({ iccid: '', name: '' });

  useEffect(() => {
    fetchSims();
  }, [fetchSims]);

  useEffect(() => {
    if (selectedSim) {
      fetchUsage(selectedSim.iccid);
    }
  }, [selectedSim, fetchUsage]);

  const handleAddSim = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'ajout de SIM
    setShowAddSimModal(false);
  };

  if (simsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (simsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        <p>Une erreur est survenue lors du chargement des SIMs.</p>
        <p className="text-sm mt-2">{simsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Consommation data</h2>
        <button
          onClick={() => setShowAddSimModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une SIM
        </button>
      </div>

      {/* Sélecteur de SIM */}
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une SIM
        </label>
        <select
          value={selectedSim?.iccid || ''}
          onChange={(e) => {
            const sim = sims.find(s => s.iccid === e.target.value);
            setSelectedSim(sim || null);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          <option value="">Choisir une SIM</option>
          {sims.map((sim) => (
            <option key={sim.id} value={sim.iccid}>
              {sim.name}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage de la consommation */}
      {selectedSim && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedSim.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              selectedSim.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {selectedSim.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Data consommée</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {usageLoading ? (
                      <div className="animate-pulse">Chargement...</div>
                    ) : usageError ? (
                      <span className="text-red-500">Erreur</span>
                    ) : (
                      formatDataUsage(usage)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {usage && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Dernière mise à jour</p>
                <p className="text-sm text-gray-900">
                  {new Date(usage.last_updated).toLocaleString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal d'ajout de SIM */}
      {showAddSimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter une SIM</h3>
            <form onSubmit={handleAddSim} className="space-y-4">
              <div>
                <label htmlFor="iccid" className="block text-sm font-medium text-gray-700">
                  ICCID
                </label>
                <input
                  type="text"
                  id="iccid"
                  value={newSim.iccid}
                  onChange={(e) => setNewSim(prev => ({ ...prev, iccid: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de la SIM
                </label>
                <input
                  type="text"
                  id="name"
                  value={newSim.name}
                  onChange={(e) => setNewSim(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddSimModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 