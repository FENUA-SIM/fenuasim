import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface RegionStats {
  minPrice: number;
  maxDays: number;
  packageCount: number;
  operatorName: string;
  countryCode: string;
}

interface DestinationCardProps {
  region: string;
  stats: RegionStats;
  currency: "EUR" | "USD" | "XPF";
  isTop?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function DestinationCard({
  region,
  stats,
  currency,
  isTop = false,
}: DestinationCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    const slug = generateSlug(region);
    router.push(`/shop/${slug}`);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case "USD":
        return "$";
      case "XPF":
        return "₣";
      default:
        return "€";
    }
  };

  const cardClasses = isTop
    ? "group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 transform hover:-translate-y-2 cursor-pointer overflow-hidden w-full"
    : "group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden w-full";

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Premium Badge pour les top destinations */}
      {isTop && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">TOP</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Header avec drapeau et nom */}
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="relative w-8 h-6 sm:w-12 sm:h-8 mr-2 sm:mr-3 rounded overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src={`https://flagcdn.com/w40/${stats.countryCode.toLowerCase()}.png`}
              alt={`Drapeau ${region}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold truncate ${isTop ? "text-base sm:text-lg text-purple-800" : "text-sm sm:text-base text-gray-800"}`}>
              {region}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {stats.packageCount} forfait{stats.packageCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {/* Prix minimum */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">À partir de</span>
            <span className={`font-bold ${isTop ? "text-lg sm:text-2xl text-purple-600" : "text-base sm:text-xl text-purple-500"}`}>
              {stats.minPrice}
              {getCurrencySymbol()}
            </span>
          </div>

          {/* Durée maximum */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">Jusqu'à</span>
            <span className="text-xs sm:text-sm font-medium text-gray-800">
              {stats.maxDays} jours
            </span>
          </div>

          {/* Opérateur */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">Opérateur</span>
            <span className="text-xs sm:text-sm font-medium text-gray-800 truncate ml-2 max-w-20 sm:max-w-none">
              {stats.operatorName}
            </span>
          </div>
        </div>

        {/* Bouton d'action */}
        <button
          className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            isTop
              ? "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <span className="hidden xs:inline">{isTop ? "Découvrir" : "Voir les forfaits"}</span>
          <span className="xs:hidden">Voir</span>
        </button>
      </div>

      {/* Effet de gradient en overlay pour les top destinations */}
      {isTop && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-orange-50/20 pointer-events-none" />
      )}
    </div>
  );
}