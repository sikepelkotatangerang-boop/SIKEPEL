INSERT INTO app_settings (setting_key, setting_value, description, is_encrypted)
VALUES ('CONVERTAPI_SECRET', '', 'Secret key for ConvertAPI', false)
ON CONFLICT (setting_key) DO NOTHING;
