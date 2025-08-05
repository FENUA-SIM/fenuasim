import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const systemPrompt = {
  role: 'system',
  content: `Tu es un assistant virtuel spécialisé dans la vente d'eSIM pour FENUA SIM.
Tu dois aider les clients à choisir le meilleur forfait pour leurs besoins.
Tu dois toujours demander le pays de destination et la durée du séjour.
Tu dois proposer les forfaits les plus adaptés en fonction de leurs besoins.
Tu dois toujours vérifier que le client a bien reçu son eSIM par email après le paiement.
Tu dois être poli, professionnel et concis.`
};

// === Fonctions Supabase et Stripe ===

async function getPlans(country: string) {
  const { data, error } = await supabase
    .from('airalo_packages')
    .select('*')
    .ilike('region_fr', `%${country}%`)
    .order('final_price_eur', { ascending: true });

  if (error) throw error;
  return data;
}

async function getPlanById(planId: string) {
  const { data, error } = await supabase
    .from('airalo_packages')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) throw error;
  return data;
}

async function createPayment(planId: string, email: string) {
  const plan = await getPlanById(planId);
  if (!plan) throw new Error('Forfait introuvable');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: plan.name,
          description: plan.description || '',
        },
        unit_amount: Math.round(plan.final_price_eur * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
    customer_email: email,
    metadata: {
      plan_id: planId,
      email: email,
    },
  });

  return session.url;
}

// === Handler principal ===

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Le tableau 'messages' est requis" });
    }

    const fullMessages = [systemPrompt, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: fullMessages,
      temperature: 0.4,
      tools: [
        {
          type: "function",
          function: {
            name: 'getPlans',
            description: 'Récupère les forfaits eSIM pour un pays donné',
            parameters: {
              type: 'object',
              properties: {
                country: { type: 'string', description: 'Nom du pays de destination' }
              },
              required: ['country']
            }
          }
        },
        {
          type: "function",
          function: {
            name: 'getPlanById',
            description: 'Récupère les détails d’un forfait spécifique',
            parameters: {
              type: 'object',
              properties: {
                planId: { type: 'string', description: 'ID du forfait' }
              },
              required: ['planId']
            }
          }
        },
        {
          type: "function",
          function: {
            name: 'createPayment',
            description: 'Crée un paiement Stripe pour un forfait',
            parameters: {
              type: 'object',
              properties: {
                planId: { type: 'string', description: 'ID du forfait' },
                email: { type: 'string', description: 'Email du client' }
              },
              required: ['planId', 'email']
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    const response = completion.choices[0].message;
    console.log("GPT Response:", JSON.stringify(response, null, 2));

    if (response.tool_calls) {
      for (const toolCall of response.tool_calls) {
        const { function: func } = toolCall;
        const args = JSON.parse(func.arguments);

        switch (func.name) {
          case 'getPlans': {
            const plans = await getPlans(args.country);
            if (!plans || plans.length === 0) {
              return res.status(200).json({
                reply: `Aucun forfait trouvé pour le pays "${args.country}". Veuillez vérifier l'orthographe ou essayer un autre pays.`
              });
            }
            return res.status(200).json({ plans });
          }

          case 'getPlanById': {
            const plan = await getPlanById(args.planId);
            return res.status(200).json({ plan });
          }

          case 'createPayment': {
            if (!args.email) {
              return res.status(400).json({ error: 'Email requis pour le paiement' });
            }
            const paymentUrl = await createPayment(args.planId, args.email);
            return res.status(200).json({ paymentUrl });
          }

          default:
            return res.status(400).json({ error: 'Fonction inconnue' });
        }
      }
    }

    const reply = response.content || "Je n'ai pas bien compris votre demande. Pouvez-vous me préciser le pays de destination et la durée de votre séjour ?";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Erreur assistant GPT:", err);
    return res.status(500).json({ error: "Erreur du serveur assistant GPT" });
  }
}
