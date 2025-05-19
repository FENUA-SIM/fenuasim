import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'
import { createPayment } from '@/lib/createPayment'
import { getPlans, getPlanById } from '@/utils/gptFunctions'

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  const { messages, email } = req.body
  if (!messages || !email) return res.status(400).json({ error: 'messages et email requis' })

  // Définir les fonctions utilisables par GPT
  const functions = [
    {
      name: 'getPlans',
      description: 'Liste les forfaits eSIM disponibles pour un pays',
      parameters: {
        type: 'object',
        properties: {
          country: { type: 'string', description: 'Nom du pays' },
        },
        required: ['country'],
      },
    },
    {
      name: 'createPayment',
      description: 'Crée un paiement Stripe pour un plan eSIM',
      parameters: {
        type: 'object',
        properties: {
          plan_id: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['plan_id', 'email'],
      },
    },
  ]

  // Appel OpenAI avec Function Calling
  const completion = await openai.createChatCompletion({
    model: 'gpt-4-0613',
    messages,
    functions,
    function_call: 'auto',
  })

  const response = completion.data.choices[0].message

  // Si GPT veut appeler une fonction
  if (response.function_call) {
    const { name, arguments: args } = response.function_call
    if (name === 'getPlans') {
      const { country } = JSON.parse(args)
      const plans = await getPlans(country)
      return res.status(200).json({ role: 'function', name, data: plans })
    }
    if (name === 'createPayment') {
      const { plan_id } = JSON.parse(args)
      const payment = await createPayment(plan_id, email)
      return res.status(200).json({ role: 'function', name, data: payment })
    }
  }

  // Sinon, simple réponse textuelle
  return res.status(200).json({ role: 'assistant', content: response.content })
} 