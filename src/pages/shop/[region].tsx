"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase/config";
import Image from "next/image";
import { Camera, Globe, Video, MessageSquare } from "lucide-react";
import React from "react";
import OrderSummary from "@/components/checkout/OrderSummary";
import { stripePromise } from "@/lib/stripe/config";

// Types

type Package = Database["public"]["Tables"]["airalo_packages"]["Row"] & {
  region_image_url?: string;
  region_description?: string;
  region_slug?: string;
};

type DataTip = {
  photo: string;
  web: string;
  video: string;
  chat: string;
  calls: string;
};

function getDataTip(amount: number, unit: string): DataTip {
  // Conversion en Go
  let go = unit.toLowerCase() === "mo" ? amount / 1024 : amount;
  return {
    photo: Math.floor(go * 500).toLocaleString(), // 500 photos/Go
    web: Math.floor(go / 0.06) + "h", // 60 Mo/h => 0.06 Go/h
    video: Math.floor(go / 1) + "h", // 1 Go/h
    chat: Math.floor(go * 3333).toLocaleString(), // 3333 messages/Go
    calls: Math.floor(go / 0.036) + "h", // 36 Mo/h => 0.036 Go/h
  };
}

function deburr(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getCountryCode(region: string | null): string {
  if (!region) return "xx";

  const cleaned = region.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const words = cleaned.trim().split(/\s+/);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toLowerCase();
  } else {
    return words[0].slice(0, 2).toLowerCase();
  }
}

const REGION_SLUGS = {
  fr: "France",
  us: "États-Unis",
  jp: "Japon",
  // etc.
};

function slugToRegionFr(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function RegionPage() {
  const router = useRouter();
  const params = useParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    codePromo: "",
    codePartenaire: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // console.log(packages);

  // Panier stocké dans le localStorage
  const [cart, setCart] = useState<Package[]>([]);

  // Récupérer la devise choisie (localStorage)
  const [currency, setCurrency] = useState<"EUR" | "USD" | "XPF">("EUR");
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
    // Charger le panier depuis le localStorage au montage
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    // Sauvegarder le panier à chaque modification
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => router.push("/shop")}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  // Utiliser les infos de la région depuis le premier forfait trouvé
  const regionImage = packages[0]?.region_image_url || "";
  const regionParam = Array.isArray(params.region)
    ? params.region[0]
    : params.region;
  const regionName =
    REGION_SLUGS[regionParam as keyof typeof REGION_SLUGS] || regionParam;
  const regionDescription = packages[0]?.region_description || "";

  // Fonction d'ajout au panier
  function handleAddToCart(pkg: Package) {
    setCart((prev) => [...prev, pkg]);
    setShowCartModal(true);
  }

  function handleAcheter(pkg: Package) {
    setSelectedPackage(pkg);
    setShowSimulator(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Bloc 1 : Présentation destination (2 colonnes) */}
      <section className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Image ou drapeau à gauche */}
        <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow">
          {packages[0]?.region_image_url ? (
            <Image
              src={packages[0].region_image_url}
              alt={packages[0]?.region_fr || ""}
              fill
              className="object-cover"
            />
          ) : (
            (() => {
              const region = packages[0]?.region_fr || "";
              const code = packages[0]?.country?.toLowerCase() || "";
              return (
                <img
                  src={`https://flagcdn.com/w160/${code}.png`}
                  alt={region}
                  width={160}
                  height={120}
                  className="rounded shadow object-cover"
                  style={{ maxHeight: 140, maxWidth: 180 }}
                />
              );
            })()
          )}
        </div>
        {/* Titre + description à droite */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-purple-800">
            {packages[0]?.region_fr}
          </h1>
          <p className="text-purple-700 text-lg leading-relaxed">
            {packages[0]?.region_description ||
              "Découvrez nos forfaits eSIM pour cette destination."}
          </p>
        </div>
      </section>

      {/* Bloc 2 : Forfaits disponibles, vignettes horizontales */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Forfaits disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {packages
            .filter((pkg) => {
              let price = pkg.final_price_eur;
              if (currency === "USD") price = pkg.final_price_usd;
              if (currency === "XPF") price = pkg.final_price_xpf;
              return price && price > 0;
            })
            .map((pkg) => {
              let price = pkg.final_price_eur;
              let symbol = "€";
              if (currency === "USD") {
                price = pkg.final_price_usd;
                symbol = "$";
              } else if (currency === "XPF") {
                price = pkg.final_price_xpf;
                symbol = "₣";
              }
              return (
                <div
                  key={pkg.id}
                  className={`min-w-[260px] max-w-xs bg-white rounded-xl border-2 p-6 flex flex-col justify-between transition-all duration-200 ${
                    selectedPackage?.id === pkg.id
                      ? "border-purple-500 shadow-lg"
                      : "border-gray-100 hover:border-purple-300"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 text-purple-800">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                        {pkg.data_amount}{" "}
                        {pkg.data_unit === "GB" ? "Go" : pkg.data_unit}
                      </span>
                      <span className="text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                        {pkg.duration}{" "}
                        {pkg.duration_unit === "Days"
                          ? "jours"
                          : pkg.duration_unit}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-purple-700 mb-2">
                      {price && price > 0 ? (
                        `${price} ${symbol}`
                      ) : (
                        <span className="text-gray-400">Prix indisponible</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcheter(pkg);
                    }}
                    className="w-full py-2 mt-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-orange-600 transition-all duration-300"
                  >
                    Acheter
                  </button>
                </div>
              );
            })}
        </div>
      </section>

      {/* Bloc 3 : Que faire avec XX Go ? */}
      {selectedPackage &&
      typeof selectedPackage.data_amount === "number" &&
      selectedPackage.data_unit ? (
        <section className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">
            Que faire avec {selectedPackage.data_amount}{" "}
            {selectedPackage.data_unit?.toLowerCase() === "gb"
              ? "Go"
              : selectedPackage.data_unit || "Go"}{" "}
            ?
          </h2>
          {(() => {
            const tips = getDataTip(
              selectedPackage.data_amount,
              selectedPackage.data_unit
            );
            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-1">Photos</h3>
                  <p className="text-purple-700">{tips.photo} photos</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-1">Navigation</h3>
                  <p className="text-purple-700">{tips.web} heures</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-xl p-6 text-center">
                  <Video className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-1">Vidéo</h3>
                  <p className="text-purple-700">{tips.video} heures</p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-1">Messages</h3>
                  <p className="text-purple-700">{tips.chat} messages</p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-6 text-center">
                  <svg
                    className="w-8 h-8 mx-auto mb-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <h3 className="font-semibold mb-1">Appels</h3>
                  <p className="text-purple-700">{tips.calls} heures</p>
                  <p className="text-xs text-purple-700 mt-1">
                    WhatsApp/Messenger
                  </p>
                </div>
              </div>
            );
          })()}
        </section>
      ) : null}

      {/* Bloc 4 : Comment activer ma eSIM ? */}
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">Comment activer ma eSIM ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Scanner le QR code</h3>
            <p className="text-purple-700">
              Scannez le QR code reçu par email.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Aller dans les réglages</h3>
            <p className="text-purple-700">
              Ouvrez les réglages de votre téléphone.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Activer la ligne eSIM</h3>
            <p className="text-purple-700">
              Ajoutez et activez la ligne eSIM dans les réglages.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-purple-600">4</span>
            </div>
            <h3 className="font-semibold mb-2">Confirmation</h3>
            <p className="text-purple-700">
              Votre eSIM est prête à être utilisée !
            </p>
          </div>
        </div>
      </section>

      {/* Modal panier */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">
              Ajouté au panier !
            </h2>
            <p className="mb-6">
              Le forfait{" "}
              <span className="font-semibold">
                {selectedPackage?.data_amount} {selectedPackage?.data_unit}
              </span>{" "}
              a bien été ajouté à votre panier.
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
                onClick={() => router.push("/cart")}
              >
                Voir le panier
              </button>
              <button
                className="w-full border border-purple-200 text-purple-700 py-3 px-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
                onClick={() => setShowCartModal(false)}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up récapitulatif + formulaire avant Stripe */}
      {showRecapModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowRecapModal(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-purple-700">
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
                  className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                />
                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom *"
                  value={form.prenom}
                  onChange={handleFormChange}
                  className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="text"
                name="codePromo"
                placeholder="Code promo (optionnel)"
                value={form.codePromo}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="codePartenaire"
                placeholder="Code partenaire (optionnel)"
                value={form.codePartenaire}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {formError && (
                <div className="text-red-500 text-sm mb-2">{formError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-3 px-4 rounded-xl font-bold text-lg shadow-md hover:from-purple-700 hover:to-orange-600 transition"
              >
                Payer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
