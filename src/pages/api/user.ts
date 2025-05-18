import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error

    return res.status(200).json(user)
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
} 