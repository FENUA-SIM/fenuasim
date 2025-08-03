import { Database } from '@/lib/supabase/config'
import { useRouter } from 'next/navigation'

type Package = Database['public']['Tables']['airalo_packages']['Row']

function regionFrToSlug(regionFr: string | null): string {
  if (!regionFr) return '';
  return regionFr
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getCountryCode(regionFr: string | null): string | undefined {
  if (!regionFr) return undefined;
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
  };
  if (COUNTRY_CODES[regionFr]) return COUNTRY_CODES[regionFr];
  return regionFr
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
    .slice(0, 2);
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

export default function PackageCardSimple({
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

  let symbol = '€'
  if (currency === 'XPF') {
    symbol = '₣'
  } else if (currency === 'USD') {
    symbol = '$'
  }

  const countryCode = getCountryCode(pkg.region_fr || null)
  const margin = parseFloat(localStorage.getItem('global_margin')!);
  const minPriceWithMargin = minPrice * (1 + margin);

  return (
    <div
      className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-purple-400 relative"
    >
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-1">
          {countryCode && (
            <img
              src={`https://flagcdn.com/w20/${countryCode}.png`}
              alt={pkg.region_fr || ''}
              width={20}
              height={15}
              className="rounded border border-gray-200 shadow-sm"
              style={{ minWidth: 20 }}
            />
          )}
          <span>{pkg.region_fr}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
            À partir de {minData} Go
          </span>
          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
            {minPriceWithMargin.toFixed(2)} {currency}
          </span>
          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
            de {minDays} à {maxDays} jours
          </span>
          {pkg.includes_voice && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
              Voix
            </span>
          )}
          {pkg.includes_sms && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
              SMS
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-700">
            {pkg.operator_name}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-purple-700 mt-4">
        <span>{packageCount} forfait{packageCount > 1 ? 's' : ''} disponible{packageCount > 1 ? 's' : ''}</span>
        <button
          className="ml-2 px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 shadow-md hover:from-purple-700 hover:to-orange-600 transition-all duration-300"
          style={{ fontSize: '0.95em' }}
          onClick={e => {
            e.stopPropagation();
            const slug = regionFrToSlug(pkg.region_fr || '')
            if (slug) {
              router.push(`/shop/${slug}`)
            }
          }}
        >
          Voir les forfaits →
        </button>
      </div>
    </div>
  )
}