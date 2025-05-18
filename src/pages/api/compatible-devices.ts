import type { NextApiRequest, NextApiResponse } from 'next'
import { AIRALO_API_URL, AIRALO_CLIENT_ID, AIRALO_CLIENT_SECRET } from '@/lib/airalo/config'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true });
} 