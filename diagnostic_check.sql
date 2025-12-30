-- ==========================================
-- REVIEWS DIAGNOSTIC CHECK
-- ==========================================
-- 1. Check if table exists and has rows
SELECT 'product_reviews count' as label,
    count(*) as value
FROM product_reviews
UNION ALL
SELECT 'admin_emails count' as label,
    count(*) as value
FROM admin_emails;
-- 2. Check current status of RLS
SELECT tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN (
        'product_reviews',
        'admin_emails',
        'site_settings'
    );
-- 3. Check specific reviews and their raw data (Limit 5)
SELECT id,
    product_id,
    user_name,
    status,
    created_at
FROM product_reviews
LIMIT 5;
-- 4. Check if any admin emails are set
SELECT email
FROM admin_emails;
-- 5. Verify if the is_admin() function is working as expected (Security Definer)
-- Run this as your user to see if it returns TRUE
-- SELECT is_admin();