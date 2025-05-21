'use client'

import { Database } from '@/lib/supabase/config'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { Zap, Repeat, Calendar, Globe2 } from 'lucide-react'

type Package = Database['public']['Tables']['airalo_packages']['Row']

// Mapping manuel pour les cas particuliers ou noms non standards
const COUNTRY_CODES: Record<string, string> = {
  'États-Unis': 'us',
  'Royaume-Uni': 'gb',
  'Corée du Sud': 'kr',
  'Émirats arabes unis': 'ae',
  'République tchèque': 'cz',
  'Hong Kong': 'hk',
  'Taïwan': 'tw',
  'Japon': 'jp',
  'Australie': 'au',
  'Canada': 'ca',
  'France': 'fr',
  'Nouvelle-Calédonie': 'nc',
  'Polynésie française': 'pf',
  // Ajoute ici d'autres cas si besoin
};

// Fonction pour obtenir le code ISO à partir du nom du pays
function getCountryCode(regionFr: string | null): string | undefined {
  if (!regionFr) return undefined;
  if (COUNTRY_CODES[regionFr]) return COUNTRY_CODES[regionFr];
  // Fallback : prend les 2 premières lettres (ex: "France" => "fr")
  return regionFr
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
    .slice(0, 2);
}

function regionFrToSlug(regionFr: string | null): string {
  if (!regionFr) return '';
  return regionFr
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // retire caractères spéciaux
    .trim()
    .replace(/\s+/g, '-'); // espaces en tirets
}

interface PackageCardProps {
  pkg: Package
  minData: number
  maxData: number
  minDays: number
  maxDays: number
  minPrice: number
  packageCount: number
  isPopular?: boolean
  currency: 'EUR' | 'XPF' | 'USD'
  isRechargeable: boolean
}

export default function PackageCard({
  pkg,
  minData,
  maxData,
  minDays,
  maxDays,
  minPrice,
  packageCount,
  isPopular = false,
  currency,
  isRechargeable
}: PackageCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    const slug = regionFrToSlug(pkg.region_fr || '')
    if (slug) {
      router.push(`/shop/${slug}`)
    }
  }

  // console.log('pkggg',pkg)

  // Prix dynamique selon la devise
  let price = pkg.final_price_eur
  let symbol = '€'
  if (currency === 'XPF') {
    price = pkg.final_price_xpf
    symbol = '₣'
  } else if (currency === 'USD') {
    price = pkg.final_price_usd
    symbol = '$'
  }

  const countryCode = getCountryCode(pkg.region_fr || null)

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-white border-2 rounded-3xl shadow-lg p-0 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden
        ${isHovered ? 'border-purple-500 shadow-2xl scale-[1.025]' : 'border-purple-100'}
      `}
      style={{ minHeight: 320 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          {countryCode && (
            <img
              src={`https://flagcdn.com/w40/${countryCode}.png`}
              alt={pkg.region_fr || ''}
              width={32}
              height={24}
              className="rounded border border-gray-200 shadow-sm"
              style={{ minWidth: 32 }}
            />
          )}
          <span className="text-lg font-bold text-purple-700 leading-tight">
            {pkg.region_fr}
          </span>
        </div>
        {isPopular && (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            <Zap className="w-4 h-4" /> Populaire
          </span>
        )}
      </div>

      {/* Infos principales */}
      <div className="flex-1 flex flex-col justify-center items-center gap-2 px-6">
        <div className="flex gap-3 w-full justify-center mb-2">
          <div className="flex flex-col items-center flex-1">
            <span className="flex items-center gap-1 text-purple-700 font-semibold text-base">
              <Globe2 className="w-4 h-4" /> {pkg.data_amount} {pkg.data_unit}
            </span>
            <span className="text-xs text-purple-400 font-medium">Data</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="flex items-center gap-1 text-purple-700 font-semibold text-base">
              <Calendar className="w-4 h-4" /> {pkg.duration} {pkg.duration_unit}
            </span>
            <span className="text-xs text-purple-400 font-medium">Durée</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            {pkg.operator_logo_url ? (
              <Image
                src={pkg.operator_logo_url}
                alt={pkg.operator_name || ''}
                width={28}
                height={28}
                className="rounded-full bg-white border border-gray-100 mb-1"
              />
            ) : (
              <span className="flex items-center gap-1 text-purple-700 font-semibold text-base">
                <Globe2 className="w-4 h-4" />
              </span>
            )}
            <span className="text-xs text-purple-400 font-medium">Opérateur</span>
          </div>
        </div>
        <div className="w-full flex justify-center mb-2">
          <span className="text-2xl font-extrabold text-purple-700">
            {price} {symbol}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        {isRechargeable && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
            <Repeat className="w-4 h-4" /> Rechargeable
          </span>
        )}
        <button
          className="flex-1 ml-auto py-3 px-0 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-2xl shadow-md hover:from-purple-700 hover:to-orange-600 transition-all duration-300 text-lg tracking-wide outline-none border-0 focus:ring-2 focus:ring-purple-400"
          style={{ minWidth: 120 }}
        >
          Acheter
        </button>
      </div>
      {/* Effet de sélection (bordure animée) possible à ajouter ici si besoin */}
    </div>
  )
} 