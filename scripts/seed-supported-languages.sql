-- Seed supported_languages (languages the platform teaches).
-- Run once after migrations, e.g. psql $DATABASE_URL -f scripts/seed-supported-languages.sql
INSERT INTO supported_languages (code, name, native_name, flag_emoji, is_active, sort_order)
VALUES
  ('en', 'English', 'English', '🇬🇧', true, 0),
  ('pt', 'Portuguese', 'Português', '🇵🇹', true, 1),
  ('es', 'Spanish', 'Español', '🇪🇸', true, 2),
  ('fr', 'French', 'Français', '🇫🇷', true, 3),
  ('it', 'Italian', 'Italiano', '🇮🇹', true, 4),
  ('de', 'German', 'Deutsch', '🇩🇪', true, 5)
ON CONFLICT (code) DO NOTHING;
