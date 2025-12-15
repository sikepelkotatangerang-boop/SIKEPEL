/**
 * Script untuk test API documents
 * Run: node scripts/test-api.js
 */

async function testAPI() {
  try {
    console.log('🧪 Testing API /api/documents...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    // Test 1: Get all documents
    console.log('Test 1: GET /api/documents');
    const response1 = await fetch(`${baseUrl}/api/documents?page=1&limit=10&search=`);
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('');
    
    // Test 2: Get with kelurahanId filter
    console.log('Test 2: GET /api/documents?kelurahanId=1');
    const response2 = await fetch(`${baseUrl}/api/documents?page=1&limit=10&search=&kelurahanId=1`);
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    console.log('');
    
    // Test 3: Test endpoint
    console.log('Test 3: GET /api/documents/test');
    const response3 = await fetch(`${baseUrl}/api/documents/test`);
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
