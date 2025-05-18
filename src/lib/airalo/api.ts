import { AIRALO_API_URL } from './config'

export async function createOrder(token: string, packageId: string) {
  const response = await fetch(`${AIRALO_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      package_id: packageId,
    }),
  })
  const data = await response.json()
  return data.data
}

export async function getOrderStatus(token: string, orderId: string) {
  const response = await fetch(`${AIRALO_API_URL}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data.data
}

export async function getPackageDetails(token: string, packageId: string) {
  const response = await fetch(`${AIRALO_API_URL}/packages/${packageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data.data
}

export async function topupEsim(token: string, esimId: string, packageId: string) {
  const response = await fetch(`${AIRALO_API_URL}/topup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      esim_id: esimId,
      package_id: packageId,
    }),
  })
  const data = await response.json()
  return data.data
}

export async function getBalance(token: string) {
  const response = await fetch(`${AIRALO_API_URL}/balance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const data = await response.json()
  return data.data
} 