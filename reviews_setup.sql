-- 1. Create Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
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
-- 2. Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
-- 3. Policies
-- Public Read: Everyone can see APPROVED reviews
CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR
SELECT USING (status = 'approved');
-- Public Insert: Anyone can leave a review (starts as pending)
CREATE POLICY "Anyone can submit a review" ON product_reviews FOR
INSERT WITH CHECK (true);
-- Admin Full Access: Using our previously created is_admin() function
CREATE POLICY "Admins manage all reviews" ON product_reviews FOR ALL USING (is_admin());
-- 4. Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_product_reviews_updated_at BEFORE
UPDATE ON product_reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();