import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * API untuk generate nomor surat otomatis berdasarkan jenis dokumen
 * Format:
 * - SKTM: B/(nomor)/400.3.8.8/(bulan romawi)/(tahun)
 * - Belum Memiliki Rumah: B/(nomor)/648/(bulan romawi)/(tahun)
 * - Keterangan Suami Istri: B/(nomor)/400.8.2.7/(bulan romawi)/(tahun)
 * - Surat Keterangan Usaha: B/(nomor)/500.3.3/(bulan romawi)/(tahun)
 * - Keterangan Belum Menikah: B/(nomor)/400.12.3.2/(bulan romawi)/(tahun)
 * - Surat Keterangan Umum: B/(nomor)/400.8.2.2/(bulan romawi)/(tahun)
 * - Formulir KTP: B/(nomor)/400.8.2.3/(bulan romawi)/(tahun)
 * - Pengantar Nikah: B/(nomor)/400.8.2.7/(bulan romawi)/(tahun)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jenisDokumen = searchParams.get('jenis');
    const kelurahanId = searchParams.get('kelurahanId');

    if (!jenisDokumen) {
      return NextResponse.json(
        { error: 'Parameter jenis dokumen diperlukan' },
        { status: 400 }
      );
    }

    // Get current date info
    const now = new Date();
    const tahun = now.getFullYear();
    const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()];

    // Get last nomor surat from database for this document type and year
    let query = `
      SELECT nomor_surat 
      FROM document_archives 
      WHERE jenis_dokumen = $1
        AND EXTRACT(YEAR FROM created_at) = $2
    `;

    const params: any[] = [jenisDokumen, tahun];

    // Filter by kelurahan if provided
    if (kelurahanId) {
      query += ` AND kelurahan_id = $3`;
      params.push(kelurahanId);
    }

    query += ` ORDER BY created_at DESC LIMIT 1`;
    
    console.log('🔍 Generate Nomor Surat - Query:', query);
    console.log('🔍 Generate Nomor Surat - Params:', params);
    
    const result = await db.query(query, params);
    
    console.log('🔍 Generate Nomor Surat - Result rows:', result.rows.length);

    let nomorUrut = 1; // Default start from 1

    if (result.rows.length > 0) {
      const lastNomorSurat = result.rows[0].nomor_surat;
      console.log('🔍 Generate Nomor Surat - Last nomor found:', lastNomorSurat);

      // Extract nomor urut from last nomor surat
      // Different format for each document type
      let extractedNumber = 0;

      if (jenisDokumen === 'SKTM') {
        // Format: B/(nomor)/400.3.8.8/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.3\.8\.8\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Belum Memiliki Rumah') {
        // Format: B/(nomor)/648/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/648\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Keterangan Suami Istri' || jenisDokumen === 'Surat Keterangan Suami Istri') {
        // Format: B/(nomor)/400.8.2.7/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.7\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Surat Keterangan Usaha') {
        // Format: B/(nomor)/500.3.3/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/500\.3\.3\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Keterangan Belum Menikah' || jenisDokumen === 'Belum Menikah') {
        // Format: B/(nomor)/400.12.3.2/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.12\.3\.2\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Umum' || jenisDokumen === 'Surat Keterangan Umum') {
        // Format: B/(nomor)/400.8.2.2/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.2\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Formulir KTP' || jenisDokumen === 'Pengantar KTP' || jenisDokumen === 'Surat Pengantar KTP') {
        // Format: B/(nomor)/400.8.2.3/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.3\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
        }
      } else if (jenisDokumen === 'Pengantar Nikah') {
        // Format: B/(nomor)/400.8.2.7/(bulan)/(tahun)
        const match = lastNomorSurat.match(/^B\/(\d+)\/400\.8\.2\.7\//);
        if (match) {
          extractedNumber = parseInt(match[1], 10);
          console.log('🔍 Pengantar Nikah - Extracted number:', extractedNumber);
        } else {
          console.log('⚠️ Pengantar Nikah - Regex tidak cocok dengan:', lastNomorSurat);
        }
      }

      if (extractedNumber > 0) {
        nomorUrut = extractedNumber + 1;
        console.log('🔍 Generate Nomor Surat - Next nomor urut:', nomorUrut);
      } else {
        console.log('⚠️ Generate Nomor Surat - Tidak bisa extract nomor, mulai dari 1');
      }
    } else {
      console.log('ℹ️ Generate Nomor Surat - Tidak ada data sebelumnya, mulai dari 1');
    }

    // Format nomor urut with leading zeros (3 digits)
    const nomorUrutFormatted = nomorUrut.toString().padStart(3, '0');
    console.log('🔍 Generate Nomor Surat - Formatted nomor urut:', nomorUrutFormatted);

    // Generate nomor surat based on document type
    let nomorSurat = '';

    switch (jenisDokumen) {
      case 'SKTM':
        nomorSurat = `B/${nomorUrutFormatted}/400.3.8.8/${bulanRomawi}/${tahun}`;
        break;
      case 'Belum Memiliki Rumah':
        nomorSurat = `B/${nomorUrutFormatted}/648/${bulanRomawi}/${tahun}`;
        break;
      case 'Keterangan Suami Istri':
      case 'Surat Keterangan Suami Istri':
        nomorSurat = `B/${nomorUrutFormatted}/400.8.2.7/${bulanRomawi}/${tahun}`;
        break;
      case 'Surat Keterangan Usaha':
        nomorSurat = `B/${nomorUrutFormatted}/500.3.3/${bulanRomawi}/${tahun}`;
        break;
      case 'Keterangan Belum Menikah':
      case 'Belum Menikah':
        nomorSurat = `B/${nomorUrutFormatted}/400.12.3.2/${bulanRomawi}/${tahun}`;
        break;
      case 'Umum':
      case 'Surat Keterangan Umum':
        nomorSurat = `B/${nomorUrutFormatted}/400.8.2.2/${bulanRomawi}/${tahun}`;
        break;
      case 'Formulir KTP':
      case 'Pengantar KTP':
      case 'Surat Pengantar KTP':
        nomorSurat = `B/${nomorUrutFormatted}/400.8.2.3/${bulanRomawi}/${tahun}`;
        break;
      case 'Pengantar Nikah':
        nomorSurat = `B/${nomorUrutFormatted}/400.8.2.7/${bulanRomawi}/${tahun}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Jenis dokumen tidak dikenali' },
          { status: 400 }
        );
    }

    console.log('✅ Generate Nomor Surat - Final nomor surat:', nomorSurat);
    
    return NextResponse.json({
      success: true,
      nomorSurat,
      nomorUrut,
      bulanRomawi,
      tahun,
      jenisDokumen
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate nomor surat',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
