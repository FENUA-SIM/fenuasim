import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { serialize } from "cookie";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return res.status(200).json({ received: true });
    }

    try {
      const { packageId } = session.metadata || {};
      if (!packageId)
        throw new Error("Package ID not found in session metadata");

      const customerEmail =
        session.customer_details?.email ||
        session.metadata?.email ||
        "no-email@example.com";

      const { data: packageData, error: packageError } = await supabase
        .from("airalo_packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (packageError || !packageData) {
        throw new Error(
          `Failed to retrieve package data: ${packageError?.message || "not found"}`
        );
      }

      res.setHeader(
        "Set-Cookie",
        serialize("region", packageData.region, {
          path: "/",
          httpOnly: false, 
          maxAge: 60 * 60 * 24, 
        })
      );
      
      const edgeFunctionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-airalo-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            "x-api-key": process.env.EDGE_FUNCTION_API_KEY || "",
          },
          body: JSON.stringify({
            packageId,
            airalo_id: packageData.airalo_id,
            customerEmail,
            customerName: session.customer_details?.name || "Customer",
            customerFirstname:
              session.customer_details?.name?.split(" ")[0] || "Customer",
            quantity: 1,
            description: `Order from Stripe session ${session.id}`,
          }),
        }
      );

      if (!edgeFunctionResponse.ok) {
        const errorText = await edgeFunctionResponse.text();
        throw new Error(
          `Failed to create Airalo order: ${edgeFunctionResponse.status} - ${errorText}`
        );
      }

      const orderData = await edgeFunctionResponse.json();

      const orderToInsert = {
        stripe_session_id: session.id,
        package_id: packageId,
        email: customerEmail,
        airalo_order_id: packageData.airalo_id || "mock-order-id",
        status: "completed",
        amount: session.amount_total,
        created_at: new Date().toISOString(),
        package_name: packageData.name || "Unknown Package",
        data_amount: packageData.data_amount || 0,
        data_unit: packageData.data_unit || "GB",
        validity_days: packageData.validity_days || 0,
        price:
          packageData.final_price_eur ||
          packageData.price_eur ||
          (session.amount_total ?? 0) / 100 ||
          0,
        currency: packageData.currency || "EUR",
      };

      const { error: orderError } = await supabase
        .from("orders")
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) {
        throw new Error(
          `Failed to save order to database: ${orderError.message}`
        );
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      return res.status(200).json({
        received: true,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(200).json({ received: true });
}
