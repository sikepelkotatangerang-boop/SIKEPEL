import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * API untuk generate PDF preview Surat Keterangan Umum menggunakan Puppeteer
 * Untuk preview cepat tanpa menyimpan ke database
 */
export async function POST(request: NextRequest) {
  let browser = null;
  try {
    const formData = await request.json();

    // Get HTML from preview API
    const htmlResponse = await fetch(`${request.nextUrl.origin}/api/preview-umum-html`, {
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

    // Launch Puppeteer
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
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    // Close browser
    await browser.close();

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview_umum.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Close browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
