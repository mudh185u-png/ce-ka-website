-- 1. Force enable the WhatsApp widget in the database
UPDATE site_settings
SET value = value || '{"enabled": true}'::JSONB
WHERE key = 'whatsapp_widget';
-- 2. If it doesn't exist for some reason, insert it as enabled
INSERT INTO site_settings (key, value)
VALUES (
        'whatsapp_widget',
        '{"enabled": true, "phone_number": "905550000000", "title": {"tr": "Ce & Ka", "ar": "Ce & Ka", "en": "Ce & Ka"}, "welcome_message": {"tr": "Merhaba! Size nasıl yardımcı olabiliriz?", "ar": "مرحباً! كيف يمكننا مساعدتك؟", "en": "Hello! How can we help you?"}, "online_text": {"tr": "Çevrimiçi", "ar": "متواجد الآن", "en": "Online"}, "powered_by": "Ce & Ka"}'::JSONB
    ) ON CONFLICT (key) DO
UPDATE
SET value = site_settings.value || '{"enabled": true}'::JSONB;
-- 3. Ensure the current user is an admin (Optional but helpful)
-- Replace 'YOUR_EMAIL' with your actual email if you want to be sure
-- INSERT INTO admin_emails (email) VALUES ('your-email@example.com') ON CONFLICT (email) DO NOTHING;