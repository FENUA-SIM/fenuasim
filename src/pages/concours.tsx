'use client';

import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabaseClient"; // ⚠️ Remplace par chemin relatif si l'alias @ n'est pas configuré
import { isValidPhoneNumber } from "react-phone-number-input";

// ⚠️ IMPORTANT: importer le CSS dans _app.tsx ou app/layout.tsx :
// import 'react-phone-number-input/style.css'

// Chargement du PhoneInput uniquement côté client
const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });

function ParticipationForm({ concoursKey = "esim-monde-2025" }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    consent: false,
    website: "", // honeypot
  });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onPhoneChange = (value) => {
    setForm((prev) => ({ ...prev, telephone: value || "" }));
  };

  const validate = () => {
    if (!form.nom || !form.prenom || !form.email || !form.telephone) {
      return "Tous les champs sont requis.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return "Email invalide.";
    if (!isValidPhoneNumber(form.telephone)) return "Numéro de téléphone invalide (format international requis).";
    if (!form.consent) return "Vous devez accepter le traitement des données.";
    if (form.website) return "Détection anti-spam.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: null, msg: "" });

    const err = validate();
    if (err) {
      setStatus({ loading: false, ok: false, msg: err });
      return;
    }

    const payload = {
      concours_key: concoursKey,
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone.trim(),
    };

    const { error } = await supabase
      .from("participations")
      .upsert([payload], { onConflict: "concours_key,email", ignoreDuplicates: true });

    if (error) {
      setStatus({ loading: false, ok: false, msg: "Erreur: " + error.message });
    } else {
      setStatus({ loading: false, ok: true, msg: "Participation enregistrée 🎉" });
      setForm({ nom: "", prenom: "", email: "", telephone: "", consent: false, website: "" });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded-lg border border-purple-200">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input name="nom" value={form.nom} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input name="prenom" value={form.prenom} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (international)</label>
          <div className="w-full border rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-purple-500">
            <PhoneInput
              international
              defaultCountry="PF"
              placeholder="Ex: +689 XXXXXXXX"
              value={form.telephone}
              onChange={onPhoneChange}
              limitMaxLength
              numberInputProps={{ className: "w-full py-1 px-2 outline-none bg-transparent" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Format E.164 (ex: +33612345678).</p>
        </div>
      </div>

      {/* Honeypot */}
      <div className="hidden">
        <label>Votre site web</label>
        <input name="website" value={form.website} onChange={onChange} />
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-600">
        <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} className="mt-1" required />
        <span>J'accepte que FENUA SIM traite ces données pour la gestion du concours.</span>
      </label>

      <button type="submit" disabled={status.loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
        {status.loading ? "Envoi..." : "Participer"}
      </button>

      {status.msg && <p className={`text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.msg}</p>}

      <p className="text-xs text-gray-500">Vous pouvez demander la suppression de vos données à tout moment via contact@fenuasim.com.</p>
    </form>
  );
}

export default function Concours() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="flex justify-center mb-6">
        <a href="/">
          <img src="/logo.png" alt="Fenua SIM" className="h-20 w-auto hover:scale-105 transition-transform" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
        🎉 Grand Concours FENUA SIM
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            Gagnez une eSIM Monde pour rester connecté partout !
          </h2>
          <p className="text-gray-600 text-lg">
            Participez et tentez de remporter une <strong>eSIM Monde 20 Go – 200 SMS – 200 min – 365 jours</strong>, utilisable dans plus de 100 pays 🌍.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-purple-700">🏆 Concours en cours</h3>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ACTIF</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">"Voyagez Connecté"</h4>
              <p className="text-gray-600 mb-3">
                Partagez votre plus belle photo de voyage et remportez notre eSIM Monde <strong>20 Go – 200 SMS – 200 min – 365 jours</strong>.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📅 <strong>Date limite :</strong> 07 septembre 2025 à 00h00 (heure de Tahiti)</p>
                <p>🎁 <strong>Prix :</strong> eSIM Monde 20 Go – 200 SMS – 200 min – 365 jours</p>
                <p>🌍 <strong>Validité :</strong> Plus de 100 pays</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Inscription au tirage :</h5>
              <ParticipationForm concoursKey="esim-monde-2025" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200 mt-6">
            <h5 className="font-semibold text-purple-700 mb-3">Comment participer sur Facebook :</h5>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Aimez la page Facebook <strong>@fenuasim</strong></li>
              <li>Partagez votre photo de voyage en commentaire du post concours</li>
              <li>Ajoutez le hashtag <strong>#FenuaSIMVoyage</strong></li>
              <li>Invitez vos amis à aimer et commenter votre participation</li>
            </ol>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">📋 Règles générales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Conditions de participation :</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Être majeur (18 ans et plus)</li>
                <li>• Avoir un compte Facebook public</li>
                <li>• Respecter les règles de participation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Prix et validité :</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• eSIM valable 12 mois</li>
                <li>• Activation possible dans plus de 100 pays</li>
                <li>• Support technique inclus</li>
                <li>• Non échangeable et non remboursable</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-purple-700 mb-4">Prêt à tenter votre chance ?</h3>
          <p className="text-gray-600 mb-6">Rejoignez notre communauté Facebook et participez maintenant pour gagner votre eSIM Monde 20 Go !</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.facebook.com/fenuasim" target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">📱 Suivre sur Facebook</a>
            <a href="/contact" className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300">💬 Nous contacter</a>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">ℹ️ Informations légales</h3>
        <p className="text-sm text-gray-600 mb-4">Ce concours est organisé par FENUA SIM SASU, 58 rue Monceau 75008 Paris. Les règles complètes sont disponibles sur demande.</p>
        <p className="text-sm text-gray-600">
          Pour toute question concernant notre concours, contactez-nous à
          <a href="mailto:contact@fenuasim.com" className="text-purple-600 hover:underline ml-1">contact@fenuasim.com</a>
        </p>
      </div>
    </div>
  );
}
