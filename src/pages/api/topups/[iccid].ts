import type { NextApiRequest, NextApiResponse } from "next";
import { getAiraloToken } from "@/lib/airalo";

const AIRALO_API_URL = "https://sandbox-partners-api.airalo.com/v2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { iccid } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!iccid || typeof iccid !== "string") {
    return res.status(400).json({ message: "Invalid ICCID" });
  }

  try {
    const token = await getAiraloToken();

    const topupRes = await fetch(`${AIRALO_API_URL}/sims/${iccid}/topups`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!topupRes.ok) {
      console.error("Topup fetch error:", await topupRes.text());
      return res.status(500).json({ message: "Failed to fetch top-up data" });
    }

    const data = await topupRes.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
