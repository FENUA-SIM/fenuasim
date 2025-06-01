"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase/config";
import Image from "next/image";
import { AiraloOrder } from "@/types/airaloOrder";
import { stripePromise } from "@/lib/stripe/config";

type Package = Database["public"]["Tables"]["airalo_packages"]["Row"] & {
  region_image_url?: string;
  region_description?: string;
  region_slug?: string;
};

interface TopUpModalProps {
  order: AiraloOrder;
  onClose: () => void;
}

function slugToRegionFr(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const TopUpModal: React.FC<TopUpModalProps> = ({ order, onClose }) => {
  const params = useParams();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currency, setCurrency] = useState<"EUR" | "USD" | "XPF">("EUR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    codePromo: "",
    codePartenaire: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? packages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === packages.length - 1 ? 0 : prev + 1));
  };

  function handleAcheter(pkg: Package) {
    setSelectedPackage(pkg);
    setShowRecapModal(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRecapSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email) {
      setFormError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setFormError(null);

    // Stockage des infos pour la page /success
    localStorage.setItem("packageId", selectedPackage?.id || "");
    localStorage.setItem("customerId", form.email); // ou l'ID utilisateur Supabase si connecté
    localStorage.setItem("customerEmail", form.email);
    localStorage.setItem("customerName", `${form.prenom} ${form.nom}`);

    setShowRecapModal(false);
    // Appel à l'API pour créer la session Stripe
    try {
      console.log("Appel à l'API create-checkout-session...");
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: [
            {
              id: selectedPackage?.id,
              name: selectedPackage?.name,
              description: selectedPackage?.description,
              final_price_eur: selectedPackage?.final_price_eur,
            },
          ],
        }),
      });
      console.log("Réponse de l'API:", response);
      const { sessionId } = await response.json();
      console.log("SessionId reçu:", sessionId);
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe non initialisé");
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      console.error("Erreur lors de la redirection Stripe:", err);
      setFormError(
        "Une erreur est survenue lors de la redirection vers le paiement. Veuillez réessayer."
      );
    }
  }

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!params?.region) {
          setError("Destination non trouvée");
          setLoading(false);
          return;
        }

        const regionParam = Array.isArray(params.region)
          ? params.region[0]
          : params.region;
        const regionFr = slugToRegionFr(regionParam.toLowerCase());

        const { data: pkgs, error: pkgError } = await supabase
          .from("airalo_packages")
          .select("*")
          .eq("region_fr", regionFr);

        if (pkgError) throw pkgError;
        if (!pkgs || pkgs.length === 0) {
          setError("Aucun forfait disponible pour cette destination");
          setLoading(false);
          return;
        }
        setPackages(pkgs);
        setSelectedPackage(pkgs[0]);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params?.region]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {error}
          </h2>
          <button
            onClick={() => router.push("/shop")}
            className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Top-Up eSIM</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">ICCID</div>
          <div className="font-mono text-gray-900">{order.sim_iccid}</div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Current Data Balance</div>
          <div className="font-mono text-gray-900">{order.data_balance}</div>
        </div>
        {/* Add your top-up form or options here */}
        <div className="mt-12 rounded shadow bg-gray-100 p-6">
          <h2 className="text-xl text-purple-800 sm:text-2xl font-bold mb-4 sm:mb-6 px-1">
            Forfaits disponibles
          </h2>
          <div className="relative flex items-center justify-center">
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-0 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition disabled:opacity-50"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              aria-label="Précédent"
              disabled={packages.length <= 2}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Carousel Cards */}
            {packages.length > 0 && (
              <div className="w-full max-w-2xl mx-auto flex justify-center gap-4">
                {packages.slice(currentIndex, currentIndex + 2).map((pkg) => {
                  let price = pkg.final_price_eur;
                  let symbol = "€";
                  if (currency === "USD") {
                    price = pkg.final_price_usd;
                    symbol = "$";
                  } else if (currency === "XPF") {
                    price = pkg.final_price_xpf;
                    symbol = "₣";
                  }
                  const countryCode = pkg.country
                    ? pkg.country.toLowerCase()
                    : "xx";
                  return (
                    <div
                      key={pkg.id}
                      className={`w-1/2 bg-white rounded-xl border-2 p-6 flex flex-col items-center shadow transition-all duration-200 ${
                        selectedPackage?.id === pkg.id
                          ? "border-purple-500 shadow-lg"
                          : "border-gray-100 hover:border-purple-300"
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {/* Flag and Name */}
                      <div className="flex items-center gap-3 mb-3">
                        {pkg.region_image_url ? (
                          <Image
                            src={pkg.region_image_url}
                            alt={pkg.region_fr || ""}
                            width={40}
                            height={28}
                            className="rounded object-cover border"
                          />
                        ) : (
                          <img
                            src={`https://flagcdn.com/w40/${countryCode}.png`}
                            alt={pkg.region_fr || ""}
                            width={40}
                            height={28}
                            className="rounded object-cover border"
                          />
                        )}
                        <h3 className="text-lg font-bold text-purple-800">
                          {pkg.name}
                        </h3>
                      </div>
                      {/* Data, Duration, Badges */}
                      <div className="flex flex-wrap gap-2 mb-3 justify-center">
                        <span className="text-xs sm:text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold">
                          {pkg.data_amount}{" "}
                          {pkg.data_unit === "GB"
                            ? "Go"
                            : pkg.data_unit === "MB"
                              ? "Mo"
                              : pkg.data_unit}
                        </span>
                        <span className="text-xs sm:text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-semibold">
                          {pkg.duration}{" "}
                          {pkg.duration_unit === "Days"
                            ? "jours"
                            : pkg.duration_unit}
                        </span>
                        {pkg.includes_voice && (
                          <span className="text-xs sm:text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
                            Appels inclus
                          </span>
                        )}
                        {pkg.includes_sms && (
                          <span className="text-xs sm:text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                            SMS inclus
                          </span>
                        )}
                      </div>
                      {/* Description */}
                      <div className="text-gray-700 text-sm mb-3 text-center min-h-[40px]">
                        {pkg.description}
                      </div>
                      {/* Price */}
                      <div className="text-xl font-bold text-purple-700 mb-4">
                        {price && price > 0 ? (
                          `${price} ${symbol}`
                        ) : (
                          <span className="text-gray-400">
                            Prix indisponible
                          </span>
                        )}
                      </div>
                      {/* Buy Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcheter(pkg);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-orange-600 transition-all duration-300 text-base"
                      >
                        Buy · Secure payment
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-0 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition disabled:opacity-50"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              aria-label="Suivant"
              disabled={packages.length <= 2}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {/* Carousel indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {packages.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${idx === currentIndex ? "bg-purple-600" : "bg-gray-300"}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Aller au forfait ${idx + 1}`}
                style={{ outline: "none", border: "none" }}
              />
            ))}
          </div>
        </div>
        {/* Pop-up récapitulatif + formulaire avant Stripe */}
        {showRecapModal && selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-md mx-auto relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowRecapModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700 pr-8">
                Récapitulatif de la commande
              </h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">
                    {selectedPackage.data_amount}{" "}
                    {selectedPackage.data_unit === "GB"
                      ? "Go"
                      : selectedPackage.data_unit}
                  </span>
                  {selectedPackage.operator_logo_url ? (
                    <Image
                      src={selectedPackage.operator_logo_url}
                      alt={selectedPackage.operator_name || ""}
                      width={24}
                      height={24}
                      className="rounded-full bg-white border border-gray-100"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      {selectedPackage.operator_name}
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  {selectedPackage.slug &&
                    selectedPackage.slug
                      .replace(/days?/gi, "jours")
                      .replace(/gb/gi, "Go")}
                </div>
                <div className="flex gap-1 flex-wrap text-xs mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${selectedPackage.includes_sms ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    SMS {selectedPackage.includes_sms ? "Oui" : "Non"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${selectedPackage.includes_voice ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    Appels {selectedPackage.includes_voice ? "Oui" : "Non"}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">
                  {selectedPackage.final_price_eur} €
                </div>
              </div>
              <form onSubmit={handleRecapSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom *"
                    value={form.nom}
                    onChange={handleFormChange}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 text-base"
                    style={
                      {
                        WebkitTextFillColor: "#111827",
                        color: "#111827",
                      } as React.CSSProperties
                    }
                    required
                  />
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Prénom *"
                    value={form.prenom}
                    onChange={handleFormChange}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 text-base"
                    style={{
                      WebkitTextFillColor: "#111827",
                      opacity: 1,
                      color: "#111827",
                    }}
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 text-base"
                  style={
                    {
                      WebkitTextFillColor: "#111827",
                      color: "#111827",
                    } as React.CSSProperties
                  }
                  required
                />
                <input
                  type="text"
                  name="codePromo"
                  placeholder="Code promo (optionnel)"
                  value={form.codePromo}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 text-base"
                  style={
                    {
                      WebkitTextFillColor: "#111827",
                      color: "#111827",
                    } as React.CSSProperties
                  }
                />
                <input
                  type="text"
                  name="codePartenaire"
                  placeholder="Code partenaire (optionnel)"
                  value={form.codePartenaire}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 text-base"
                  style={
                    {
                      WebkitTextFillColor: "#111827",
                      color: "#111827",
                    } as React.CSSProperties
                  }
                />
                {formError && (
                  <div className="text-red-500 text-sm mb-2">{formError}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-3 px-4 rounded-xl font-bold text-base sm:text-lg shadow-md hover:from-purple-700 hover:to-orange-600 transition"
                >
                  Payer
                </button>
              </form>
            </div>
          </div>
        )}
        <div className="text-center">
          <button
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:from-orange-600 hover:to-purple-700 transition-all duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
