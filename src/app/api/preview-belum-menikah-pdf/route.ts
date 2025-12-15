import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * API untuk generate preview PDF Belum Menikah menggunakan Puppeteer
 * Tidak disimpan ke database, hanya untuk preview
 */
export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const formData = await request.json();

    // Get HTML from preview-html API
    const htmlResponse = await fetch(`${request.nextUrl.origin}/api/preview-belum-menikah-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!htmlResponse.ok) {
      throw new Error('Gagal membuat HTML preview');
    }

    const htmlContent = await htmlResponse.text();

    // Generate PDF using Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();
    console.log('PDF generated with Puppeteer');

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview_belum_menikah.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate preview PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
