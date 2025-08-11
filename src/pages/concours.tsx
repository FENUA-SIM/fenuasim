import { useState } from "react";
import { supabase } from "@/utils/supabaseClient"; // ⚠️ Adapte le chemin si nécessaire
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
// ⚠️ Assure-toi d'importer le style une seule fois (par ex. dans _app.tsx) :
// import 'react-phone-number-input/style.css'

function ParticipationForm({ concoursKey = "esim-monde-2025" }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "", // format E.164 recommandé (ex: +689XXXXXXXX)
    consent: false,
    website: "", // honeypot anti-spam (ne doit PAS être rempli)
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
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email);
    if (!emailOk) return "Email invalide.";
    // Validation internationale via libphonenumber (react-phone-number-input)
    if (!isValidPhoneNumber(form.telephone)) return "Numéro de téléphone invalide (format international requis).";
    if (!form.consent) return "Vous devez accepter le traitement des données.";
    if (form.website) return "Détection anti-spam : soumission refusée.";
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
      // on stocke en E.164 pour compat international
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
              defaultCountry="PF" // Tahiti (Polynésie française)
              placeholder="Ex: +689 XXXXXXXX"
              value={form.telephone}
              onChange={onPhoneChange}
              limitMaxLength
              numberInputProps={{ className: "w-full py-1 px-2 outline-none bg-transparent" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Format E.164 (ex: +33612345678). Sélectionnez le pays si besoin.</p>
        </div>
      </div>

      {/* Honeypot invisible */}
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

      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">🎉 Grand Concours FENUA SIM</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Gagnez une eSIM Monde pour rester connecté partout !</h2>
          <p className="text-gray-600 text-lg">Participez et tentez de remporter une <strong>eSIM Monde 20 Go – 200 SMS – 200 min – 365 jours</strong>, utilisable dans plus de 100 pays 🌍.</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-purple-700">🏆 Concours en cours</h3>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ACTIF</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">"Voyagez Connecté"</h4>
              <p className="text-gray-600 mb-3">Partagez votre plus belle

