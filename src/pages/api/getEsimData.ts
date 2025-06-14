import { NextApiRequest, NextApiResponse } from 'next';
import { getAiraloToken } from '@/lib/airalo'; // Assuming this is where your token function is

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { iccid } = req.query;

  // Validate ICCID
  if (!iccid || typeof iccid !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'ICCID is required' 
    });
  }

  try {
    const AIRALO_API_URL = process.env.AIRALO_API_URL;
    if (!AIRALO_API_URL) {
      throw new Error('AIRALO_API_URL is not configured');
    }

    // Get Airalo token
    let airaloApiToken;
    try {
      airaloApiToken = await getAiraloToken();
      console.log("🔑 Airalo Token obtained successfully");
    } catch (error) {
      console.error("Failed to get Airalo API token:", error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to authenticate with Airalo' 
      });
    }

    const AIRALO_GET_ESIM_ENDPOINT = `${AIRALO_API_URL}/sims/${iccid}`;

    const response = await fetch(AIRALO_GET_ESIM_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${airaloApiToken}`,
        Accept: "application/json",
      },
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(`Airalo Get Esim API Error: ${response.status} - ${responseBodyText}`);
      return res.status(response.status).json({ 
        success: false, 
        error: `Airalo API request failed: ${response.status}`,
        details: responseBodyText
      });
    }

    try {
      const data = JSON.parse(responseBodyText);
      console.log("Airalo Get Esim API Response:", data);

      const success = data.meta?.message === "success" || (response.status >= 200 && response.status < 300);

      return res.status(200).json({
        success: success,
        data: {
          sharing: data.data.sharing,
        }
      });
    } catch (parseError) {
      console.error("Failed to parse Airalo Get Esim API Response:", parseError);
      console.error("Raw response body:", responseBodyText);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to parse Airalo API response' 
      });
    }
  } catch (error) {
    console.error('Unexpected error in getEsimData:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}