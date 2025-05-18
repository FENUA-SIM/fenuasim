'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PackageCard from '@/components/shop/PackageCard'
import type { Database } from '@/lib/supabase/config'
import CurrencyModal from '@/components/shop/CurrencyModal'
import PackageCardSimple from '@/components/shop/PackageCardSimple'

type Package = Database['public']['Tables']['airalo_packages']['Row']

interface RegionStats {
  minData: number
  maxData: number
  minDays: number
  maxDays: number
  minPrice: number
  packageCount: number
  isRechargeable: boolean
}

const TOP_DESTINATIONS = ['États-Unis', 'France', 'Japon', 'Australie', 'Canada']

export default function Shop() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currency, setCurrency] = useState<'EUR' | 'XPF' | 'USD'>('EUR')
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from('airalo_packages')
          .select('*')
          .order('price', { ascending: true })

        if (error) throw error
        const validPackages = (data || []).filter(pkg =>
          pkg.price != null
        )
        setPackages(validPackages)
      } catch (err) {
        setError('Erreur lors du chargement des forfaits')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cur = localStorage.getItem('currency') as 'EUR' | 'USD' | 'XPF' | null
      if (cur) setCurrency(cur)
    }
  }, [])

  const handleCurrencySelect = (cur: 'EUR' | 'XPF' | 'USD') => {
    setCurrency(cur)
    localStorage.setItem('currency', cur)
    setShowCurrencyModal(false)
  }

  // Grouper les forfaits par région localisée (region_fr)
  const packagesByRegion = packages.reduce((acc, pkg) => {
    const region = pkg.region_fr || 'Autres'
    if (!acc[region]) {
      acc[region] = []
    }
    acc[region].push(pkg)
    return acc
  }, {} as Record<string, Package[]>)

  // Calculer les statistiques pour chaque région
  const regionStats = Object.entries(packagesByRegion).reduce((acc, [region, pkgs]) => {
    let minPrice = Infinity;
    if (currency === 'EUR') {
      const prices = pkgs
        .map(p => typeof p.final_price_eur === 'number' && p.final_price_eur > 0 ? p.final_price_eur : undefined)
        .filter((p): p is number => typeof p === 'number' && p > 0);
      if (prices.length > 0) minPrice = Math.min(...prices);
    } else if (currency === 'USD') {
      const prices = pkgs
        .map(p => typeof p.final_price_usd === 'number' && p.final_price_usd > 0 ? p.final_price_usd : undefined)
        .filter((p): p is number => typeof p === 'number' && p > 0);
      if (prices.length > 0) minPrice = Math.min(...prices);
    } else if (currency === 'XPF') {
      const prices = pkgs
        .map(p => typeof p.final_price_xpf === 'number' && p.final_price_xpf > 0 ? p.final_price_xpf : undefined)
        .filter((p): p is number => typeof p === 'number' && p > 0);
      if (prices.length > 0) minPrice = Math.min(...prices);
    }
    acc[region] = {
      minData: Math.min(...pkgs.map(p => p.data_amount || 0)),
      maxData: Math.max(...pkgs.map(p => p.data_amount || 0)),
      minDays: Math.min(...pkgs.map(p => p.duration || 0)),
      maxDays: Math.max(...pkgs.map(p => p.duration || 0)),
      minPrice,
      packageCount: pkgs.length,
      isRechargeable: pkgs.some(p => p.available_topup)
    }
    return acc
  }, {} as Record<string, RegionStats & { isRechargeable: boolean }>)

  // Obtenir la liste unique des régions triée par prix minimum
  const regions = Object.keys(packagesByRegion).sort((a, b) => 
    regionStats[a].minPrice - regionStats[b].minPrice
  )

  // Filtrer les régions en fonction de la recherche
  const filteredRegions = regions.filter(region => 
    region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Séparer les destinations principales des autres
  const topDestinations = TOP_DESTINATIONS.filter(region => 
    packagesByRegion[region] && 
    (selectedRegion === 'all' || region === selectedRegion) &&
    region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const otherDestinations = filteredRegions
    .filter(region => 
      !TOP_DESTINATIONS.includes(region) && 
      (selectedRegion === 'all' || region === selectedRegion)
    )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showCurrencyModal && (
        <CurrencyModal onSelect={handleCurrencySelect} />
      )}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Forfaits eSIM</h1>
        <p className="text-gray-600 mb-8">Découvrez nos forfaits eSIM pour voyager en toute sérénité</p>

        {/* Sélecteur de devise */}
        <div className="flex justify-end mb-4">
          <select
            value={currency}
            onChange={e => {
              setCurrency(e.target.value as 'EUR' | 'XPF' | 'USD')
              localStorage.setItem('currency', e.target.value)
            }}
            className="border border-purple-300 text-purple-800 bg-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md font-semibold"
          >
            <option value="EUR">€ EUR</option>
            <option value="XPF">₣ XPF</option>
            <option value="USD">$ USD</option>
          </select>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher une destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 19L14.65 14.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <label htmlFor="region-filter" className="text-sm font-medium text-gray-700">
                  Filtre par destination
                </label>
              </div>
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2.5 pl-4 border border-purple-300 text-purple-800 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md font-semibold"
              >
                <option value="all">Toutes les destinations</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destinations principales */}
        {topDestinations.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Destinations populaires</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-medium rounded-full">
                  Top 5
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {topDestinations.map((region) => {
                  const representativePackage = packagesByRegion[region][0]
                  return (
                    <PackageCardSimple
                      key={region}
                      pkg={representativePackage}
                      {...regionStats[region]}
                      isPopular={true}
                      currency={currency}
                      isRechargeable={regionStats[region].isRechargeable}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Autres destinations */}
        {otherDestinations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-black">Toutes nos destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherDestinations.map((region) => {
                const representativePackage = packagesByRegion[region][0]
                return (
                  <PackageCardSimple
                    key={region}
                    pkg={representativePackage}
                    {...regionStats[region]}
                    isPopular={false}
                    currency={currency}
                    isRechargeable={regionStats[region].isRechargeable}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {filteredRegions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune destination trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
} 