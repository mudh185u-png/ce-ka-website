-- 1. Create a dedicated table for admin emails to break recursion
CREATE TABLE IF NOT EXISTS admin_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Create recursion-free is_admin function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN (
        auth.jwt()->>'role' = 'service_role'
        OR auth.jwt()->>'email' IN (
            SELECT email
            FROM admin_emails
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Reset site_settings RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Manage Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Insert Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Update Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Delete Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin All Settings" ON site_settings;
-- Public Read ANYONE can see it (Restore the widget!)
CREATE POLICY "Public Read Settings" ON site_settings FOR
SELECT USING (true);
-- Admin Write (Only admins can change settings)
CREATE POLICY "Admin Manage Settings" ON site_settings FOR ALL USING (is_admin());
-- 4. Update orders Table Policy (Fix orders dashboard)
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (is_admin());
-- 5. Seed default data for WhatsApp if missing
INSERT INTO site_settings (key, value)
VALUES (
        'whatsapp_widget',
        '{"enabled": true, "phone_number": "905550000000", "title": {"tr": "Ce & Ka", "ar": "Ce & Ka", "en": "Ce & Ka"}, "welcome_message": {"tr": "Merhaba! Size nasıl yardımcı olabiliriz?", "ar": "مرحباً! كيف يمكننا مساعدتك؟", "en": "Hello! How can we help you?"}, "online_text": {"tr": "Çevrimiçi", "ar": "متواجد الآن", "en": "Online"}, "powered_by": "Ce & Ka"}'::JSONB
    ) ON CONFLICT (key) DO NOTHING;
-- 6. Migrate existing admin users if table exists
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM site_settings
    WHERE key = 'admin_users'
) THEN
INSERT INTO admin_emails (email)
SELECT (val->>'email')::text
FROM site_settings,
    jsonb_array_elements(value) as val
WHERE key = 'admin_users' ON CONFLICT (email) DO NOTHING;
END IF;
END $$;