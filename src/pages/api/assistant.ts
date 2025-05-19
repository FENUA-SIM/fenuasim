import OpenAI from "openai";
const openai = new (OpenAI as any)({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.4
    });
    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("Erreur assistant GPT:", err);
    res.status(500).json({ error: "Erreur GPT" });
  }
} 