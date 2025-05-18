import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OrderParams {
  customerEmail: string;
  customerName?: string;
  customerFirstname?: string;
  packageId: string;
  airaloResponse?: any;
}

interface AiraloResponse {
  data: {
    id: string;
    status?: string;
    activated_at?: string;
    expires_at?: string;
    data_balance?: string;
    sims?: Array<{
      iccid?: string;
      qrcode_url?: string;
      direct_apple_installation_url?: string;
    }>;
  };
}

// Interface pour la réponse d'authentification Airalo
interface AiraloAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Interface pour la réponse de création de commande Airalo
interface AiraloOrderResponse {
  data: {
    id: string;
    status?: string;
    activated_at?: string;
    expires_at?: string;
    data_balance?: string;
    sims?: Array<{
      iccid?: string;
      qrcode_url?: string;
      direct_apple_installation_url?: string;
    }>;
  };
}

// Obtenir le token d'authentification Airalo
async function getAiraloToken(): Promise<string> {
  try {
    console.log("🔑 Obtention du token Airalo...");
    const apiUrl = 'https://api.airalo.com/api/v2/auth';
    console.log("URL:", apiUrl);
    
    if (!process.env.AIRALO_EMAIL || !process.env.AIRALO_PASSWORD) {
      throw new Error("Identifiants Airalo manquants dans les variables d'environnement");
    }

    console.log("Email:", process.env.AIRALO_EMAIL);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fenuasim/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.AIRALO_EMAIL,
        password: process.env.AIRALO_PASSWORD,
      }),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Réponse d'erreur:", errorText);
      throw new Error(`Erreur d'authentification Airalo: ${response.statusText} - ${errorText}`);
    }

    const data: AiraloAuthResponse = await response.json();
    console.log("✅ Token Airalo obtenu avec succès");
    return data.access_token;
  } catch (error) {
    console.error("❌ Erreur lors de l'obtention du token Airalo:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }
    throw error;
  }
}

// Créer une commande Airalo
async function createAiraloOrder(params: OrderParams, token: string): Promise<AiraloOrderResponse> {
  try {
    console.log("📦 Création de la commande Airalo...");
    const apiUrl = 'https://api.airalo.com/api/v2/orders';
    console.log("URL:", apiUrl);
    console.log("Token:", token.substring(0, 10) + "...");
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Fenuasim/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        package_id: params.packageId,
        email: params.customerEmail,
        first_name: params.customerFirstname,
        last_name: params.customerName,
      }),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Réponse d'erreur:", errorText);
      throw new Error(`Erreur lors de la création de la commande Airalo: ${response.statusText} - ${errorText}`);
    }

    const data: AiraloOrderResponse = await response.json();
    console.log("✅ Commande Airalo créée avec succès");
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la commande Airalo:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification des variables d'environnement
    console.log("🔍 Vérification des variables d'environnement...");
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Présent" : "❌ Manquant");
    console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Présent" : "❌ Manquant");
    console.log("AIRALO_EMAIL:", process.env.AIRALO_EMAIL ? "✅ Présent" : "❌ Manquant");
    console.log("AIRALO_PASSWORD:", process.env.AIRALO_PASSWORD ? "✅ Présent" : "❌ Manquant");

    const params = await req.body;
    console.log("📥 Params reçus :", JSON.stringify(params, null, 2));

    // Vérification des champs obligatoires
    if (!params.packageId || !params.customerEmail) {
      return res.status(400).json({ error: "Package ID et email client requis" });
    }

    // Obtenir le token Airalo
    const token = await getAiraloToken();

    // Créer la commande Airalo
    const airaloResponse = await createAiraloOrder(params, token);

    // Enregistrer la commande dans la base de données
    const orderId = await saveOrderToDatabase(params, airaloResponse);

    res.status(200).json({ 
      success: true,
      orderId,
      airaloOrder: airaloResponse.data 
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création de la commande:", error);
    res.status(500).json({ 
      error: "Erreur lors de la création de la commande",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

// Enregistrer la commande dans la base de données
async function saveOrderToDatabase(params: OrderParams, airaloResponse: AiraloOrderResponse) {
  try {
    console.log("Enregistrement de la commande dans la base de données...");
    const orderData = airaloResponse.data;
    const sim = orderData.sims && orderData.sims.length > 0 ? orderData.sims[0] : {};

    // Vérification des champs obligatoires
    if (!orderData.id || !params.customerEmail || !params.packageId) {
      throw new Error("Données manquantes pour l'enregistrement de la commande.");
    }

    const { data, error } = await supabase.from('airalo_orders').insert({
      order_id: orderData.id,
      email: params.customerEmail,
      package_id: params.packageId,
      sim_iccid: sim.iccid || null,
      qr_code_url: sim.qrcode_url || null,
      apple_installation_url: sim.direct_apple_installation_url || null,
      status: orderData.status || null,
      activated_at: orderData.activated_at || null,
      expires_at: orderData.expires_at || null,
      data_balance: orderData.data_balance || null,
      nom: params.customerName || null,
      prenom: params.customerFirstname || null
    }).select('id').single();

    if (error) {
      console.error("Erreur lors de l'enregistrement de la commande:", error);
      throw error;
    }
    console.log("Commande enregistrée avec ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la commande:", error);
    throw error;
  }
}