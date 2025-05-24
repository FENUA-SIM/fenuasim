"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase/config";
import Image from "next/image";
import { Star } from "lucide-react";

type Package = Database["public"]["Tables"]["airalo_packages"]["Row"];

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

const TOP_DESTINATIONS = [
  "France", 
  "Canada",
];

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

function DestinationCard({
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
    ? "group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
    : "group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden";

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Premium Badge pour les top destinations */}
      {isTop && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            TOP
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header avec drapeau et nom */}
        <div className="flex items-center mb-4">
          <div className="relative w-12 h-8 mr-3 rounded overflow-hidden shadow-sm">
            <Image
              src={`https://flagcdn.com/w40/${stats.countryCode.toLowerCase()}.png`}
              alt={`Drapeau ${region}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h3
              className={`font-bold ${isTop ? "text-lg text-purple-800" : "text-md text-gray-800"}`}
            >
              {region}
            </h3>
            <p className="text-sm text-gray-500">
              {stats.packageCount} forfait{stats.packageCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-3 mb-6">
          {/* Prix minimum */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">À partir de</span>
            <span
              className={`font-bold ${isTop ? "text-2xl text-purple-600" : "text-xl text-purple-500"}`}
            >
              {stats.minPrice}
              {getCurrencySymbol()}
            </span>
          </div>

          {/* Durée maximum */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Jusqu'à</span>
            <span className="text-sm font-medium text-gray-800">
              {stats.maxDays} jours
            </span>
          </div>

          {/* Opérateur */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Opérateur</span>
            <span className="text-sm font-medium text-gray-800">
              {stats.operatorName}
            </span>
          </div>
        </div>

        {/* Bouton d'action */}
        <button
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
            isTop
              ? "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          {isTop ? "Découvrir" : "Voir les forfaits"}
        </button>
      </div>

      {/* Effet de gradient en overlay pour les top destinations */}
      {isTop && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-orange-50/20 pointer-events-none" />
      )}
    </div>
  );
}

export default function Shop() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "XPF" | "USD">("EUR");

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from("airalo_packages")
          .select("*")
          .order("final_price_eur", { ascending: true });

        if (error) throw error;
        
        // Filter packages with valid prices for at least one currency
        const validPackages = (data || []).filter((pkg) => {
          const hasValidEur = pkg.final_price_eur != null && pkg.final_price_eur > 0;
          const hasValidUsd = pkg.final_price_usd != null && pkg.final_price_usd > 0;
          const hasValidXpf = pkg.final_price_xpf != null && pkg.final_price_xpf > 0;
          return hasValidEur || hasValidUsd || hasValidXpf;
        });

        setPackages(validPackages);
      } catch (err) {
        setError("Erreur lors du chargement des forfaits");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cur = localStorage.getItem("currency") as
        | "EUR"
        | "USD"
        | "XPF"
        | null;
      if (cur) setCurrency(cur);
    }
  }, []);

  // Helper function to get price based on currency
  const getPrice = (pkg: Package, currency: string): number => {
    switch (currency) {
      case "USD":
        return pkg.final_price_usd || 0;
      case "XPF":
        return pkg.final_price_xpf || 0;
      default:
        return pkg.final_price_eur || 0;
    }
  };

  // Group packages by region and calculate stats
  const packagesByRegion = packages.reduce((acc, pkg) => {
    // Use region_fr if available, otherwise fallback to region
    const region = pkg.region_fr || pkg.region || "Autres";
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(pkg);
    return acc;
  }, {} as Record<string, Package[]>);

  // Calculate statistics for each region
  const regionStats = Object.entries(packagesByRegion).reduce(
    (acc, [region, pkgs]) => {
      // Get all valid prices for current currency
      const prices = pkgs
        .map((p) => getPrice(p, currency))
        .filter((price) => price > 0);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxDays = Math.max(...pkgs.map((p) => p.validity_days || 0));
      
      // Get unique operators
      const operatorNames = Array.from(
        new Set(pkgs.map((p) => p.operator_name).filter(Boolean))
      );
      const mainOperator = operatorNames[0] || "Airalo";

      // Get country code from the first package
      const countryCode = pkgs[0]?.country || "xx";

      acc[region] = {
        minPrice,
        maxDays,
        packageCount: pkgs.length,
        operatorName: mainOperator,
        countryCode,
      };
      return acc;
    },
    {} as Record<string, RegionStats>
  );

  // Sort regions by minimum price
  const regions = Object.keys(packagesByRegion).sort(
    (a, b) => regionStats[a].minPrice - regionStats[b].minPrice
  );

  // Separate top destinations from others
  const topDestinations = regions.filter((region) =>
    TOP_DESTINATIONS.some(topDest => 
      topDest.toLowerCase() === region.toLowerCase()
    )
  ).slice(0, 5);

  const otherDestinations = regions.filter(
    (region) => !TOP_DESTINATIONS.some(topDest => 
      topDest.toLowerCase() === region.toLowerCase()
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Connectez-vous partout dans le monde
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez nos forfaits eSIM pour voyager sans contraintes.
            Activation instantanée, couverture mondiale.
          </p>

          {/* Sélecteur de devise */}
          <div className="flex justify-center mb-8">
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as "EUR" | "XPF" | "USD");
                localStorage.setItem("currency", e.target.value);
              }}
              className="border border-purple-300 text-purple-800 bg-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md font-semibold"
            >
              <option value="EUR">€ EUR</option>
              <option value="XPF">₣ XPF</option>
              <option value="USD">$ USD</option>
            </select>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      {topDestinations.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                🥇 Destinations populaires
              </h2>
              <p className="text-lg text-gray-600">
                Nos destinations les plus demandées avec les meilleurs tarifs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {topDestinations.map((region) => (
                <DestinationCard
                  key={region}
                  region={region}
                  stats={regionStats[region]}
                  currency={currency}
                  isTop={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Destinations */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🌍 {otherDestinations.length > 0 ? "Nos autres destinations" : "Toutes nos destinations"}
            </h2>
            <p className="text-lg text-gray-600">
              Explorez toutes nos destinations disponibles ({regions.length} pays)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(otherDestinations.length > 0 ? otherDestinations : regions).map((region) => (
              <DestinationCard
                key={region}
                region={region}
                stats={regionStats[region]}
                currency={currency}
                isTop={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {regions.length}
              </div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {packages.length}
              </div>
              <div className="text-gray-600">Forfaits</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.min(...Object.values(regionStats).map(s => s.minPrice).filter(p => p > 0))}
                {currency === "USD" ? "$" : currency === "XPF" ? "₣" : "€"}
              </div>
              <div className="text-gray-600">Prix minimum</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.max(...Object.values(regionStats).map(s => s.maxDays))}
              </div>
              <div className="text-gray-600">Jours max</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Prêt à voyager connecté ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Choisissez votre destination et activez votre eSIM en quelques
            secondes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Voir toutes les destinations
            </button>
            <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300">
              Comment ça marche ?
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}