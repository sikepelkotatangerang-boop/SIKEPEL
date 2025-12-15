import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const kelurahanId = searchParams.get('kelurahan_id');
        const viewMode = searchParams.get('view_mode') || 'bulan-ini'; // hari-ini, bulan-ini, tahun-ini

        console.log('📊 Statistik API called:');
        console.log('   - kelurahan_id:', kelurahanId || 'ALL (Admin)');
        console.log('   - view_mode:', viewMode);

        const hasKelurahanFilter = !!kelurahanId;
        const params: any[] = kelurahanId ? [kelurahanId] : [];

        // 1. Get statistics per jenis dokumen based on view mode
        let dateFilter = '';
        switch (viewMode) {
            case 'hari-ini':
                dateFilter = "DATE(created_at) = CURRENT_DATE";
                break;
            case 'bulan-ini':
                dateFilter = "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
                break;
            case 'tahun-ini':
                dateFilter = "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
                break;
        }

        // Build WHERE clause properly
        let whereConditions = [];
        if (hasKelurahanFilter) {
            whereConditions.push('kelurahan_id = $1');
        }
        if (dateFilter) {
            whereConditions.push(dateFilter);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const perJenisQuery = `
      SELECT 
        jenis_dokumen,
        COUNT(*) as jumlah
      FROM document_archives
      ${whereClause}
      GROUP BY jenis_dokumen
      ORDER BY jumlah DESC
    `;

        const perJenisResult = await db.query<any>(perJenisQuery, params);

        // 2. Get trend data based on view mode
        let trendQuery = '';
        let trendDateFilter = '';
        
        switch (viewMode) {
            case 'hari-ini':
                trendDateFilter = "DATE(created_at) = CURRENT_DATE";
                break;
            case 'bulan-ini':
                trendDateFilter = "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
                break;
            case 'tahun-ini':
                trendDateFilter = "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)";
                break;
        }

        // Build WHERE clause for trend query
        let trendWhereConditions = [];
        if (hasKelurahanFilter) {
            trendWhereConditions.push('kelurahan_id = $1');
        }
        if (trendDateFilter) {
            trendWhereConditions.push(trendDateFilter);
        }
        const trendWhereClause = trendWhereConditions.length > 0 ? `WHERE ${trendWhereConditions.join(' AND ')}` : '';

        switch (viewMode) {
            case 'hari-ini':
                // Per jam untuk hari ini
                trendQuery = `
          SELECT 
            TO_CHAR(created_at, 'HH24:00') as label,
            COUNT(*) as jumlah
          FROM document_archives
          ${trendWhereClause}
          GROUP BY TO_CHAR(created_at, 'HH24:00')
          ORDER BY label
        `;
                break;
            case 'bulan-ini':
                // Per hari untuk bulan ini
                trendQuery = `
          SELECT 
            TO_CHAR(created_at, 'DD Mon') as label,
            COUNT(*) as jumlah
          FROM document_archives
          ${trendWhereClause}
          GROUP BY DATE(created_at), TO_CHAR(created_at, 'DD Mon')
          ORDER BY DATE(created_at)
        `;
                break;
            case 'tahun-ini':
                // Per bulan untuk tahun ini
                trendQuery = `
          SELECT 
            TO_CHAR(created_at, 'Month') as label,
            COUNT(*) as jumlah
          FROM document_archives
          ${trendWhereClause}
          GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Month')
          ORDER BY DATE_TRUNC('month', created_at)
        `;
                break;
        }

        const trendResult = await db.query<any>(trendQuery, params);

        // 3. Get total statistics
        // Build WHERE clause for total query (only kelurahan filter, no date filter)
        const totalWhereClause = hasKelurahanFilter ? 'WHERE kelurahan_id = $1' : '';
        
        const totalQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)) as total_tahun_ini,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as total_bulan_ini,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as total_hari_ini
      FROM document_archives
      ${totalWhereClause}
    `;

        const totalResult = await db.queryOne<any>(totalQuery, params);

        return NextResponse.json({
            success: true,
            data: {
                perJenis: perJenisResult.rows.map(row => ({
                    jenis: row.jenis_dokumen,
                    jumlah: parseInt(row.jumlah)
                })),
                trend: trendResult.rows.map(row => ({
                    label: row.label.trim(),
                    jumlah: parseInt(row.jumlah)
                })),
                totals: {
                    tahun_ini: parseInt(totalResult?.total_tahun_ini || '0'),
                    bulan_ini: parseInt(totalResult?.total_bulan_ini || '0'),
                    hari_ini: parseInt(totalResult?.total_hari_ini || '0')
                }
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
