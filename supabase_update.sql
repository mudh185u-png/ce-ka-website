-- 1. Add SKU column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
-- 2. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    -- pending, processing, shipped, delivered, cancelled
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_sku TEXT,
    product_title JSONB,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    variant_info JSONB,
    -- size, fabric, leg details
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Enable RLS for orders and order_items
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- 5. Policies for Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
    auth.jwt()->>'role' = 'service_role'
    OR auth.jwt()->>'email' IN (
        SELECT value->>'email'
        FROM site_settings
        WHERE key = 'admin_users'
    )
);
-- 6. Policies for Order Items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM orders
            WHERE orders.id = order_items.order_id
                AND orders.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
CREATE POLICY "Users can create their own order items" ON order_items FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM orders
            WHERE orders.id = order_items.order_id
                AND orders.user_id = auth.uid()
        )
    );
-- 7. Add variants columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS fabrics TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS legs TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS badge TEXT,
    ADD COLUMN IF NOT EXISTS discountPrice NUMERIC;
-- 8. Add Public Access and Storage Policies (Optional but recommended)
-- Only run these if you need storage bucket access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true) ON CONFLICT (id) DO NOTHING;
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'content');
-- DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
-- CREATE POLICY "Admins can upload" ON storage.objects FOR ALL USING (bucket_id = 'content');