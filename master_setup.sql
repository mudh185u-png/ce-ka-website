-- ==========================================
-- CE KA BAZA - MASTER DATABASE SETUP
-- ==========================================
-- This script sets up all necessary tables, policies, and functions
-- for Reviews, Orders, Admin Panel, and Product Enhancements.
-- 1. ADMIN SECURITY SYSTEM
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS admin_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Security Definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN (
        auth.jwt()->>'role' = 'service_role'
        OR auth.jwt()->>'email' IN (
            SELECT email
            FROM admin_emails
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. SITE SETTINGS & WHATSAPP
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
CREATE POLICY "Public Read Settings" ON site_settings FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Settings" ON site_settings;
CREATE POLICY "Admin Manage Settings" ON site_settings FOR ALL USING (is_admin());
-- Seed WhatsApp defaults if not exists
INSERT INTO site_settings (key, value)
VALUES (
        'whatsapp_widget',
        '{"enabled": true, "phone_number": "905550000000", "title": {"tr": "Ce & Ka", "ar": "Ce & Ka", "en": "Ce & Ka"}, "welcome_message": {"tr": "Merhaba! Size nasıl yardımcı olabiliriz?", "ar": "مرحباً! كيف يمكننا مساعدتك؟", "en": "Hello! How can we help you?"}, "online_text": {"tr": "Çevrimiçi", "ar": "متواجد الآن", "en": "Online"}, "powered_by": "Ce & Ka"}'::JSONB
    ) ON CONFLICT (key) DO NOTHING;
-- 3. PRODUCT ENHANCEMENTS
-- ------------------------------------------
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS fabrics TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS legs TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS badge TEXT,
    ADD COLUMN IF NOT EXISTS "discountPrice" NUMERIC;
-- 4. PRODUCT REVIEWS SYSTEM
-- ------------------------------------------
-- NOTE: product_id is BIGINT to match products.id type
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR
SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Anyone can submit a review" ON product_reviews;
CREATE POLICY "Anyone can submit a review" ON product_reviews FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage all reviews" ON product_reviews;
CREATE POLICY "Admins manage all reviews" ON product_reviews FOR ALL USING (is_admin());
-- 5. ORDER MANAGEMENT SYSTEM
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_sku TEXT,
    product_title JSONB,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    variant_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (is_admin());
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
-- 6. COMMON TRIGGERS
-- ------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE
UPDATE ON product_reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- ==========================================
-- SETUP COMPLETE
-- ==========================================