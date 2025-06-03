"use client"; // If using Next.js App Router and client-side hooks

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Or 'next/router' for Pages Router
import { supabase } from "@/lib/supabase";
import { getAiraloToken } from "@/lib/airalo";
import { AiraloOrder } from "@/types/airaloOrder"; // Adjust path if necessary
import { AiraloPackage } from "@/types/airaloPackage"; // Ensure this path is correct
import { loadStripe } from "@stripe/stripe-js";
import { ChevronLeft, ChevronRight, ShoppingCart, User } from "lucide-react";


const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface TopUpInlineSectionProps {
  order: AiraloOrder;
}

type PromoCode = {
  id: number;
  code: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  times_used: number;
};

async function validateAndApplyPromoCode(code: string, packagePrice: number): Promise<{
  isValid: boolean;
  discountedPrice: number;
  error?: string;
}> {
  try {
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !promoCode) {
      return {
        isValid: false,
        discountedPrice: packagePrice,
        error: 'Code promo invalide'
      };
    }

    // Check if promo code is active
    if (!promoCode.is_active) {
      return {
        isValid: false,
        discountedPrice: packagePrice,
        error: 'Ce code promo n\'est plus actif'
      };
    }

    // Check validity dates
    const now = new Date();
    if (new Date(promoCode.valid_from) > now || new Date(promoCode.valid_until) < now) {
      return {
        isValid: false,
        discountedPrice: packagePrice,
        error: 'Ce code promo n\'est plus valide'
      };
    }

    // Check usage limit
    if (promoCode.usage_limit && promoCode.times_used >= promoCode.usage_limit) {
      return {
        isValid: false,
        discountedPrice: packagePrice,
        error: 'Ce code promo a atteint sa limite d\'utilisation'
      };
    }

    // Calculate discounted price
    let discountedPrice = packagePrice;
    if (promoCode.discount_percentage) {
      discountedPrice = packagePrice * (1 - promoCode.discount_percentage / 100);
    } else if (promoCode.discount_amount) {
      discountedPrice = Math.max(0, packagePrice - promoCode.discount_amount);
    }

    return {
      isValid: true,
      discountedPrice
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return {
      isValid: false,
      discountedPrice: packagePrice,
      error: 'Une erreur est survenue lors de la validation du code promo'
    };
  }
}

const TopUpInlineSection: React.FC<TopUpInlineSectionProps> = ({ order }) => {
  const router = useRouter();
  const [originalPackageDetails, setOriginalPackageDetails] = useState<AiraloPackage | null>(null);
  const [topUpPackages, setTopUpPackages] = useState<AiraloPackage[]>([]);
  const [selectedTopUpPackage, setSelectedTopUpPackage] = useState<AiraloPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "USD" | "XPF">("EUR");
  const [currentIndex, setCurrentIndex] = useState(0); // For carousel

  const [showRecapModal, setShowRecapModal] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cur = localStorage.getItem("currency") as "EUR" | "USD" | "XPF" | null;
      if (cur) setCurrency(cur);

      // Pre-fill form if user info is available (e.g., from Supabase auth or localStorage)
      // This is an example, adjust based on how you store user info
      const storedEmail = localStorage.getItem("customerEmail");
      const storedName = localStorage.getItem("customerName");
      if (storedEmail) setForm(prev => ({ ...prev, email: storedEmail }));
      if (storedName) {
        const nameParts = storedName.split(" ");
        setForm(prev => ({ ...prev, prenom: nameParts[0] || "", nom: nameParts.slice(1).join(" ") || "" }));
      }
    }
  }, []);

  useEffect(() => {
    const fetchAiraloTopupData = async (iccid: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/topups/${iccid}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de recharge.");
        }
    
        const result = await response.json();
        const data = result.data;
    
        setTopUpPackages(data || []);
        if (data && data.length > 0) {
          setSelectedTopUpPackage(data[0]);
        }
      } catch (err: any) {
        console.error("Error fetching top-up data:", err);
        setError(err.message || "Erreur lors du chargement des forfaits de recharge.");
      } finally {
        setLoading(false);
      }
    };    

    if (order.sim_iccid) {
      fetchAiraloTopupData(order.sim_iccid);
    }
  }, [order.sim_iccid]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    const maxIndex = Math.max(0, topUpPackages.length - (topUpPackages.length === 1 ? 1 : 2));
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAcheter = (pkg: AiraloPackage) => {
    setSelectedTopUpPackage(pkg);
    setShowRecapModal(true);
  };

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopUpPackage) return;

    const result = await validateAndApplyPromoCode(promoCode, selectedTopUpPackage.price);
    if (result.isValid) {
      setDiscountedPrice(result.discountedPrice);
      setPromoCodeError(null);
      // Store promo code in localStorage for use in checkout
      localStorage.setItem('promoCode', promoCode);
    } else {
      setPromoCodeError(result.error || 'Code promo invalide');
      setDiscountedPrice(null);
      localStorage.removeItem('promoCode');
    }
  };

  async function handleRecapSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email) {
      setFormError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (!selectedTopUpPackage) {
      setFormError("Aucun forfait de recharge sélectionné.");
      return;
    }
    setFormError(null);

    // Store customer info in localStorage
    localStorage.setItem("packageId", selectedTopUpPackage.id);
    localStorage.setItem("customerId", form.email);
    localStorage.setItem("customerEmail", form.email);
    localStorage.setItem("customerName", `${form.prenom} ${form.nom}`);

    const cleanedPackagedId = selectedTopUpPackage.id.replace(/-topup$/, "");
    setShowRecapModal(false);
    try {
      const response = await fetch("/api/create-topup-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: [
            {
              id: cleanedPackagedId,
              name: selectedTopUpPackage.title,
              description: selectedTopUpPackage.shortInfo,
              price: discountedPrice || selectedTopUpPackage.price,
              currency: currency,
            },
          ],
          customer_email: form.email,
          is_top_up: true,
          sim_iccid: order.sim_iccid,
          promo_code: localStorage.getItem('promoCode'), // Add promo code to the request
        }),
      });
      const { sessionId, error: apiError } = await response.json();
      if (apiError) throw new Error(apiError);
      if (!sessionId) throw new Error("Session ID not received.");
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe non initialisé");
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err: any) {
      console.error("Erreur lors de la redirection Stripe:", err);
      setFormError(
        err.message || "Une erreur est survenue lors de la redirection vers le paiement. Veuillez réessayer."
      );
    }
  }

  const displayPackages = topUpPackages.slice(currentIndex, currentIndex + (topUpPackages.length === 1 ? 1 : 2));


  if (loading) {
    return (
      <div className="mt-4 p-4 border-t border-gray-200 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 border-t border-gray-200 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (topUpPackages.length === 0 && !loading) {
    return (
         <div className="mt-4 p-4 border-t border-gray-200 text-center text-gray-600">
            Aucun forfait de recharge disponible pour cette région actuellement.
        </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-md font-semibold text-gray-800 mb-3">
        Recharger votre eSIM (ICCID: {order.sim_iccid})
      </h4>
      <div className="mb-2">
        <span className="text-sm text-gray-600">Solde actuel: </span>
        <span className="text-sm font-medium text-gray-800">{order.data_balance}</span>
      </div>
      
      {originalPackageDetails && (
        <div className="mb-4 text-sm text-gray-500">
            Forfaits de recharge pour: {originalPackageDetails.region_fr}
        </div>
      )}

      {/* Package Carousel */}
      <div className="relative flex items-center justify-center mb-6">
        {topUpPackages.length > 2 && (
            <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ top: "50%", transform: "translateY(-50%) translateX(-50%)" }}
            aria-label="Précédent"
            >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
            </button>
        )}

        <div className={`w-full grid ${topUpPackages.length === 1 ? 'grid-cols-1 justify-center' : 'grid-cols-1 md:grid-cols-2'} gap-4 max-w-3xl mx-auto`}>
          {displayPackages.map((pkg) => {
            let price = pkg.price;
            let symbol = "€";
            if (currency === "USD") {
              price = pkg.price;
              symbol = "$";
            } else if (currency === "XPF") {
              price = pkg.price;
              symbol = "₣";
            }

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl border-2 p-4 flex flex-col items-center shadow-md transition-all duration-200 cursor-pointer ${
                  selectedTopUpPackage?.id === pkg.id
                    ? "border-purple-500 ring-2 ring-purple-500"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-lg"
                }`}
                onClick={() => setSelectedTopUpPackage(pkg)}
              >
                <div className="flex items-center gap-2 mb-2 self-start">
                  {/* {pkg.region_image_url ? (
                    <Image
                      src={pkg.region_image_url}
                      alt={pkg.region_fr || ""}
                      width={32}
                      height={20}
                      className="rounded object-cover border"
                    />
                  ) : (
                    <img
                      src={`https://flagcdn.com/w40/${countryCode}.png`}
                      alt={pkg.region_fr || ""}
                      width={32}
                      height={20}
                      className="rounded object-cover border"
                    />
                  )} */}
                  <h3 className="text-sm font-bold text-purple-800">
                    {pkg.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mb-3 justify-start self-start">
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {pkg.data_amount}{" "}
                    {pkg.data_unit === "GB" ? "Go" : pkg.data_unit}
                  </span>
                  <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                    {pkg.day}{" "}
                    {"Days"}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-800 mb-3 self-start">
                  {symbol}
                  {price.toFixed(2)}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full mb-4">
                    <form onSubmit={handlePromoCodeSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Code promo"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Appliquer
                      </button>
                    </form>
                    {promoCodeError && (
                      <p className="text-red-500 text-sm mt-1">{promoCodeError}</p>
                    )}
                    {discountedPrice && (
                      <p className="text-green-600 text-sm mt-1">
                        Prix réduit: {discountedPrice.toFixed(2)} {currency}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAcheter(pkg); }}
                    className="w-full mt-auto py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-orange-600 transition-all duration-300 text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Recharger
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {topUpPackages.length > 2 && (
            <button
            onClick={handleNext}
            disabled={currentIndex >= topUpPackages.length - (topUpPackages.length === 1 ? 1 : 2) || displayPackages.length < (topUpPackages.length === 1 ? 1 : 2) }
            className="absolute right-0 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ top: "50%", transform: "translateY(-50%) translateX(50%)" }}
            aria-label="Suivant"
            >
            <ChevronRight className="w-5 h-5 text-purple-600" />
            </button>
        )}
      </div>

      {/* Recap Modal (rendered as part of this inline section) */}
      {showRecapModal && selectedTopUpPackage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowRecapModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Vos informations</h2>
            </div>
            {formError && (
              <p className="text-red-500 text-sm mb-3">{formError}</p>
            )}
            <form onSubmit={handleRecapSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" name="prenom" id="prenom" value={form.prenom} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"/>
                </div>
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" name="nom" id="nom" value={form.nom} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"/>
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" id="email" value={form.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"/>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-orange-600 transition-all duration-300">
                  Procéder au paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpInlineSection;