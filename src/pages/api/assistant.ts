import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = {
  role: 'system',
  content: `Tu es un assistant virtuel spécialisé dans la vente d'eSIM pour FENUA SIM. 
  Tu dois aider les clients à choisir le meilleur forfait pour leurs besoins.
  Tu dois toujours demander le pays de destination et la durée du séjour.
  Tu dois proposer les forfaits les plus adaptés en fonction de leurs besoins.
  Tu dois toujours vérifier que le client a bien reçu son eSIM par email après le paiement.
  Tu dois être poli, professionnel et concis.`
};

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
      return res.status(400).json({ error: "messages array required" });
    }
    const fullMessages = [systemPrompt, ...messages];
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: fullMessages,
      temperature: 0.4
    });
    const reply = completion.choices[0]?.message?.content || "Je n'ai pas compris votre demande.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur assistant GPT:", err);
    res.status(500).json({ error: "Erreur GPT" });
  }
} 