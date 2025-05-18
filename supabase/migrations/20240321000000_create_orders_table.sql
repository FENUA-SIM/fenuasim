-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    stripe_session_id text NOT NULL,
    package_id text NOT NULL,
    email text NOT NULL,
    airalo_order_id text,
    status text NOT NULL,
    amount integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT orders_package_id_fkey FOREIGN KEY (package_id) REFERENCES airalo_packages(id)
);

-- Create index on stripe_session_id for faster lookups
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(email);

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own orders
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (email = auth.jwt() ->> 'email');

-- Allow service role to insert orders
CREATE POLICY "Service role can insert orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Allow service role to update orders
CREATE POLICY "Service role can update orders"
    ON orders FOR UPDATE
    USING (true); 