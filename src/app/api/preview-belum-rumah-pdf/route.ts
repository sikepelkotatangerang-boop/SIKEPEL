import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * API untuk generate preview PDF Surat Keterangan Belum Memiliki Rumah menggunakan Puppeteer
 * Hanya untuk preview, tidak disimpan ke database
 */
export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const formData = await request.json();

    console.log('Generating preview PDF for Belum Rumah with Puppeteer...');

    // Generate HTML (call preview API)
    const htmlResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/preview-belum-rumah-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!htmlResponse.ok) {
      throw new Error('Failed to generate HTML');
    }

    const htmlContent = await htmlResponse.text();
    console.log('HTML generated for preview');

    // Launch Puppeteer
    console.log('Launching Puppeteer for preview...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    console.log('Generating preview PDF...');
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      scale: 1,
    });

    const pdfBuffer = Buffer.from(pdfUint8Array);
    console.log('Preview PDF generated, size:', pdfBuffer.length, 'bytes');

    // Close browser
    await browser.close();
    browser = null;

    // Return PDF for preview (not saved)
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview-belum-rumah.pdf"', // inline for preview
      },
    });

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    
    // Close browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
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
