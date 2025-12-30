-- ==========================================
-- AUTO-APPROVE REVIEWS & ADMIN SYNC
-- ==========================================
-- 1. Change default status to 'approved' for future reviews
ALTER TABLE product_reviews
ALTER COLUMN status
SET DEFAULT 'approved';
-- 2. Update existing reviews to 'approved' if any were missed
UPDATE product_reviews
SET status = 'approved'
WHERE status = 'pending';
-- 3. Ensure mudh185u@gmail.com is in admin_emails table
INSERT INTO admin_emails (email)
VALUES ('mudh185u@gmail.com') ON CONFLICT (email) DO NOTHING;
-- 4. Verify RLS for submission (double check)
DROP POLICY IF EXISTS "Anyone can submit a review" ON product_reviews;
CREATE POLICY "Anyone can submit a review" ON product_reviews FOR
INSERT WITH CHECK (true);
-- 5. Verify RLS for admin view
DROP POLICY IF EXISTS "Admins manage all reviews" ON product_reviews;
CREATE POLICY "Admins manage all reviews" ON product_reviews FOR ALL USING (is_admin());