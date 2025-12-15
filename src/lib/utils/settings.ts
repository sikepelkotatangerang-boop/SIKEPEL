import { db } from '@/lib/db';

export async function getSetting(key: string): Promise<string | null> {
    try {
        const result = await db.queryOne<{ setting_value: string }>(
            'SELECT setting_value FROM app_settings WHERE setting_key = $1',
            [key]
        );
        return result?.setting_value || null;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
    }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
    try {
        await db.query(
            `INSERT INTO app_settings (setting_key, setting_value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, value]
        );
        return true;
    } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
        return false;
    }
}

export async function getAllSettings(): Promise<Record<string, string>> {
    try {
        const result = await db.query<{ setting_key: string; setting_value: string }>(
            'SELECT setting_key, setting_value FROM app_settings'
        );

        const settings: Record<string, string> = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        return settings;
    } catch (error) {
        console.error('Error fetching all settings:', error);
        return {};
    }
}
