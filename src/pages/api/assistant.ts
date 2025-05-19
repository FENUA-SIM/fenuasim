import type { NextApiRequest, NextApiResponse } from 'next'
// @ts-ignore
import OpenAI from 'openai'
import { createPayment } from '@/lib/createPayment'
import { getPlans, getPlanById } from '@/utils/gptFunctions'

const openai = new (OpenAI as any)({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  const { message, email } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const messages = [
    {
      role: 'system',
      content: `Tu es un assistant virtuel spécialisé dans la vente d'eSIM pour FENUA SIM. 
      Tu dois aider les clients à choisir le meilleur forfait pour leurs besoins.
      Tu dois toujours demander le pays de destination et la durée du séjour.
      Tu dois proposer les forfaits les plus adaptés en fonction de leurs besoins.
      Tu dois toujours vérifier que le client a bien reçu son eSIM par email après le paiement.
      Tu dois être poli, professionnel et concis.`
    },
    {
      role: 'user',
      content: message
    }
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    functions: [
      {
        name: 'getPlans',
        description: 'Récupère la liste des forfaits eSIM disponibles',
        parameters: {
          type: 'object',
          properties: {
            country: {
              type: 'string',
              description: 'Code pays ISO (ex: FR, US)'
            }
          },
          required: ['country']
        }
      },
      {
        name: 'getPlanById',
        description: 'Récupère les détails d\'un forfait spécifique',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID du forfait'
            }
          },
          required: ['planId']
        }
      },
      {
        name: 'createPayment',
        description: 'Crée un paiement pour un forfait',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID du forfait'
            },
            email: {
              type: 'string',
              description: 'Email du client'
            }
          },
          required: ['planId', 'email']
        }
      }
    ],
    function_call: 'auto'
  })

  const response = completion.choices[0].message

  if (response.function_call) {
    const { name, arguments: args } = response.function_call
    const parsedArgs = JSON.parse(args)

    switch (name) {
      case 'getPlans':
        const plans = await getPlans(parsedArgs.country)
        return res.status(200).json({ plans })

      case 'getPlanById':
        const plan = await getPlanById(parsedArgs.planId)
        return res.status(200).json({ plan })

      case 'createPayment':
        if (!email) {
          return res.status(400).json({ error: 'Email is required for payment' })
        }
        const paymentUrl = await createPayment(parsedArgs.planId, email)
        return res.status(200).json({ paymentUrl })

      default:
        return res.status(400).json({ error: 'Invalid function call' })
    }
  }

  return res.status(200).json({ message: response.content })
} 