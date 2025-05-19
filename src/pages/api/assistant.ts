import type { NextApiRequest, NextApiResponse } from 'next'
// @ts-ignore
import OpenAI from 'openai'
import { createPayment } from '@/lib/createPayment'
import { getPlans, getPlanById } from '@/utils/gptFunctions'

const openai = new (OpenAI as any)({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ info: 'Assistant eSIM API. Utilisez POST pour discuter.' })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  try {
    const { messages } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

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
          if (!parsedArgs.email) {
            return res.status(400).json({ error: 'Email is required for payment' })
          }
          const paymentUrl = await createPayment(parsedArgs.planId, parsedArgs.email)
          return res.status(200).json({ paymentUrl })

        default:
          return res.status(400).json({ error: 'Invalid function call' })
      }
    }

    return res.status(200).json({ message: response.content })
  } catch (error) {
    console.error('Error:', error)
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
} 