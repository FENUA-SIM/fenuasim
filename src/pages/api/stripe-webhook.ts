import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Log the event type to help debug
  console.log('Webhook event type:', event.type)

  // In your webhook handler file
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Verify that the payment is actually completed
    if (session.payment_status !== 'paid') {
      console.log(`Session ${session.id} not yet paid, status: ${session.payment_status}`);
      return res.status(200).json({ received: true });
    }

    try {
      console.log('=== STARTING ORDER PROCESSING ===');
      console.log('Processing completed checkout session:', session.id);
      console.log('Session metadata:', session.metadata);
      console.log('Payment status:', session.payment_status);
      console.log('Customer details:', session.customer_details);

      // Get package ID from session metadata
      const { packageId } = session.metadata || {};

      if (!packageId) {
        console.error('ERROR: Package ID not found in session metadata');
        throw new Error('Package ID not found in session metadata');
      }

      console.log('Package ID:', packageId);

      // Get customer email - use fallbacks to ensure we have a value
      const customerEmail = session.customer_details?.email ||
        session.metadata?.email ||
        'no-email@example.com';
      console.log('Customer email:', customerEmail);

      // Retrieve package data from Supabase
      console.log('Retrieving package data from Supabase...');
      const { data: packageData, error: packageError } = await supabase
        .from('airalo_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('ERROR: Failed to retrieve package data:', packageError);
        throw new Error(`Failed to retrieve package data: ${packageError.message}`);
      }

      if (!packageData) {
        console.error('ERROR: Package not found for ID:', packageId);
        throw new Error('Package not found');
      }

      console.log('Package data retrieved successfully:', packageData);

      // Call the edge function to create the Airalo order
      console.log('=== CALLING EDGE FUNCTION ===');
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-airalo-order`;
      console.log('Edge function URL:', edgeFunctionUrl);

      const edgeFunctionPayload = {
        packageId,
        customerEmail,
        customerName: session.customer_details?.name || 'Customer',
        customerFirstname: session.customer_details?.name?.split(' ')[0] || 'Customer',
        quantity: 1,
        description: `Order from Stripe session ${session.id}`,
      };
      console.log('Edge function payload:', edgeFunctionPayload);

      console.log('Making edge function request...');
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'x-api-key': process.env.EDGE_FUNCTION_API_KEY || '',
        },
        body: JSON.stringify(edgeFunctionPayload),
      });

      console.log('Edge function response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ERROR: Edge function failed:', errorText);
        throw new Error(`Failed to create Airalo order: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Edge function response text:', responseText);

      let orderData;
      try {
        orderData = JSON.parse(responseText);
        console.log('Parsed order data:', orderData);
      } catch (e) {
        console.error('ERROR: Failed to parse response:', e);
        throw new Error('Invalid response from create-airalo-order function');
      }

      // Prepare order data for insertion
      console.log('=== PREPARING ORDER FOR DATABASE ===');
      const orderToInsert = {
        stripe_session_id: session.id,
        package_id: packageId,
        email: customerEmail,
        airalo_order_id: orderData.airaloOrder?.id || orderData.orderId || 'mock-order-id',
        status: 'completed',
        amount: session.amount_total,
        created_at: new Date().toISOString(),
        package_name: packageData.name || 'Unknown Package',
        data_amount: packageData.data_amount || 0,
        data_unit: packageData.data_unit || 'GB',
        validity_days: packageData.validity_days || 0,
        price: packageData.final_price_eur || packageData.price_eur || (session.amount_total?? 0) / 100 || 0,
        currency: packageData.currency || 'EUR'
      };
      console.log('Order data prepared for insertion:', orderToInsert);

      // Insert the order into the database
      console.log('=== INSERTING ORDER INTO DATABASE ===');
      console.log('Executing database insert operation...');

      try {
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderToInsert)
          .select()
          .single();

        if (orderError) {
          console.error('DATABASE ERROR:', orderError);
          console.error('Error code:', orderError.code);
          console.error('Error message:', orderError.message);
          console.error('Error details:', orderError.details);
          throw new Error(`Failed to save order to database: ${orderError.message}`);
        }

        if (!insertedOrder) {
          console.error('ERROR: No order data returned after insertion');
        } else {
          console.log('ORDER CREATED SUCCESSFULLY:', insertedOrder);
          console.log('Order ID:', insertedOrder.id);
        }
      } catch (dbError) {
        console.error('CRITICAL DATABASE ERROR:', dbError);
        throw new Error(`Database operation failed: ${dbError}`);
      }

      console.log('=== ORDER PROCESSING COMPLETED SUCCESSFULLY ===');
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('=== ERROR PROCESSING WEBHOOK ===', error);
      // Don't throw the error to Stripe, just log it
      return res.status(200).json({
        received: true,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }

  // Handle other webhook events if needed
  console.log(`Unhandled webhook event type: ${event.type}`)

  return res.status(200).json({ received: true })
}