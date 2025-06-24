-- Add promo_code and partner_code columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS partner_code text;

-- Create index on promo_code for faster lookups
CREATE INDEX IF NOT EXISTS orders_promo_code_idx ON orders(promo_code);

-- Create index on partner_code for faster lookups
CREATE INDEX IF NOT EXISTS orders_partner_code_idx ON orders(partner_code); 