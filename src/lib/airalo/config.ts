export const AIRALO_API_URL = 'https://sandbox-partners-api.airalo.com/v2'
export const AIRALO_CLIENT_ID = process.env.AIRALO_CLIENT_ID
export const AIRALO_CLIENT_SECRET = process.env.AIRALO_CLIENT_SECRET

if (!AIRALO_CLIENT_ID || !AIRALO_CLIENT_SECRET) {
  throw new Error('Missing Airalo environment variables')
}

export interface AiraloPackage {
  id: string
  name: string
  description: string
  data_amount: number
  data_unit: string
  duration: number
  duration_unit: string
  price: number
  currency: string
  region: string
}

export interface AiraloTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AiraloOrderResponse {
  id: string
  status: string
  activation_code: string
  qr_code_url: string
  expires_at: string
} 