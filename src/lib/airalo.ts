const AIRALO_API_URL = "https://sandbox-partners-api.airalo.com/api/v2";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAiraloToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const res = await fetch(`${AIRALO_API_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.AIRALO_CLIENT_ID,
      client_secret: process.env.AIRALO_CLIENT_SECRET,
    }),
  });
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // marge de 1 min
  return cachedToken;
}

export async function getAiraloPackages(countryCode: string) {
  const token = await getAiraloToken();
  const res = await fetch(`${AIRALO_API_URL}/packages?country_code=${countryCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function createAiraloOrder({ packageId, email }: { packageId: string, email: string }) {
  const token = await getAiraloToken();
  const res = await fetch(`${AIRALO_API_URL}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      package_id: packageId,
      email,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error("Erreur Airalo: " + error);
  }
  return await res.json();
}

export async function getAiraloOrder(orderId: string) {
  const token = await getAiraloToken();
  const res = await fetch(`${AIRALO_API_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
} 