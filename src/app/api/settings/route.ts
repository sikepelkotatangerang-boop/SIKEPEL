import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting, getAllSettings } from '@/lib/utils/settings';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
        const value = await getSetting(key);
        return NextResponse.json({ [key]: value });
    }

    const settings = await getAllSettings();
    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const success = await setSetting(key, value);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
