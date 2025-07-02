const puppeteer = require('puppeteer');

async function testVPSFunctionality() {
  console.log('🚀 Testing VPS functionality with Puppeteer...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Root IP (should show Viewer)
    console.log('📍 Testing http://147.79.110.46/ (should be Viewer)');
    try {
      await page.goto('http://147.79.110.46/', { waitUntil: 'networkidle0', timeout: 10000 });
      const title = await page.title();
      const heading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      
      console.log(`   Title: ${title}`);
      console.log(`   H1: ${heading}`);
      console.log(`   Body preview: ${bodyText.replace(/\n/g, ' ')}`);
      console.log(`   ✅ Root IP accessible\n`);
    } catch (error) {
      console.log(`   ❌ Error accessing root: ${error.message}\n`);
    }
    
    // Test 2: /admin route (should show Builder)
    console.log('📍 Testing http://147.79.110.46/admin (should be Builder)');
    try {
      await page.goto('http://147.79.110.46/admin', { waitUntil: 'networkidle0', timeout: 10000 });
      const title = await page.title();
      const heading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      
      console.log(`   Title: ${title}`);
      console.log(`   H1: ${heading}`);
      console.log(`   Body preview: ${bodyText.replace(/\n/g, ' ')}`);
      console.log(`   ✅ /admin accessible\n`);
    } catch (error) {
      console.log(`   ❌ Error accessing /admin: ${error.message}\n`);
    }
    
    // Test 3: API endpoints
    console.log('📍 Testing API endpoints');
    
    const apiTests = [
      '/api/creators',
      '/api/sets',
      '/api/'
    ];
    
    for (const endpoint of apiTests) {
      try {
        const response = await page.goto(`http://147.79.110.46${endpoint}`, { 
          waitUntil: 'networkidle0', 
          timeout: 10000 
        });
        const status = response.status();
        const text = await page.evaluate(() => document.body.innerText);
        
        console.log(`   ${endpoint}: Status ${status}`);
        console.log(`   Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        
        if (status === 200) {
          console.log(`   ✅ ${endpoint} working`);
        } else {
          console.log(`   ❌ ${endpoint} failed`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
      console.log('');
    }
    
    // Test 4: Check Docker containers on VPS
    console.log('📍 Checking Docker containers on VPS');
    
  } finally {
    await browser.close();
  }
}

testVPSFunctionality().catch(console.error);