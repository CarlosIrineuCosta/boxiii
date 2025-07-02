const puppeteer = require('puppeteer');

async function testServerAccess() {
    const browser = await puppeteer.launch({ 
        headless: true,
        timeout: 10000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(8000); // 8 second timeout
        
        console.log('🔍 Testing Boxiii Server Access...');
        console.log('Server IP: 147.79.110.46\n');
        
        // Test Builder App (Admin)
        console.log('📝 Testing Builder App (Admin Interface)...');
        try {
            await page.goto('http://147.79.110.46:3001', { waitUntil: 'networkidle0', timeout: 8000 });
            const builderTitle = await page.title();
            const builderContent = await page.content();
            
            console.log(`✅ Builder - Status: ACCESSIBLE`);
            console.log(`   Title: ${builderTitle}`);
            console.log(`   Content length: ${builderContent.length} chars`);
            
            // Check if it's showing actual content or error
            if (builderContent.includes('Builder') || builderContent.includes('Dashboard') || builderContent.includes('Create')) {
                console.log(`   Content: VALID (contains expected Builder elements)`);
            } else if (builderContent.includes('404') || builderContent.includes('Not Found')) {
                console.log(`   Content: ERROR (404 or Not Found)`);
            } else {
                console.log(`   Content: UNKNOWN (no clear indicators)`);
            }
        } catch (error) {
            console.log(`❌ Builder - Status: FAILED`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
        
        // Test Viewer App (Public)
        console.log('👀 Testing Viewer App (Public Interface)...');
        try {
            await page.goto('http://147.79.110.46:3000', { waitUntil: 'networkidle0', timeout: 8000 });
            const viewerTitle = await page.title();
            const viewerContent = await page.content();
            
            console.log(`✅ Viewer - Status: ACCESSIBLE`);
            console.log(`   Title: ${viewerTitle}`);
            console.log(`   Content length: ${viewerContent.length} chars`);
            
            // Check if it's showing actual content or error
            if (viewerContent.includes('Viewer') || viewerContent.includes('Boxes') || viewerContent.includes('My Boxes')) {
                console.log(`   Content: VALID (contains expected Viewer elements)`);
            } else if (viewerContent.includes('404') || viewerContent.includes('Not Found')) {
                console.log(`   Content: ERROR (404 or Not Found)`);
            } else {
                console.log(`   Content: UNKNOWN (no clear indicators)`);
            }
        } catch (error) {
            console.log(`❌ Viewer - Status: FAILED`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
        
        // Test API Backend
        console.log('🔧 Testing API Backend...');
        try {
            await page.goto('http://147.79.110.46:5001/docs', { waitUntil: 'networkidle0', timeout: 8000 });
            const apiTitle = await page.title();
            const apiContent = await page.content();
            
            console.log(`✅ API - Status: ACCESSIBLE`);
            console.log(`   Title: ${apiTitle}`);
            
            if (apiContent.includes('FastAPI') || apiContent.includes('Swagger') || apiContent.includes('OpenAPI')) {
                console.log(`   Content: VALID (FastAPI docs loaded)`);
            } else {
                console.log(`   Content: UNKNOWN (no FastAPI indicators)`);
            }
        } catch (error) {
            console.log(`❌ API - Status: FAILED`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
        
        // Test specific wellness interface (mentioned in CLAUDE.md)
        console.log('🧘 Testing Wellness Interface...');
        try {
            await page.goto('http://147.79.110.46/wellness.html', { waitUntil: 'networkidle0', timeout: 8000 });
            const wellnessTitle = await page.title();
            const wellnessContent = await page.content();
            
            console.log(`✅ Wellness - Status: ACCESSIBLE`);
            console.log(`   Title: ${wellnessTitle}`);
            
            if (wellnessContent.includes('wellness') || wellnessContent.includes('Ana') || wellnessContent.includes('card')) {
                console.log(`   Content: VALID (wellness interface loaded)`);
            } else {
                console.log(`   Content: UNKNOWN (no wellness indicators)`);
            }
        } catch (error) {
            console.log(`❌ Wellness - Status: FAILED`);
            console.log(`   Error: ${error.message}`);
        }
        
    } finally {
        await browser.close();
    }
}

// Run the test
testServerAccess().catch(console.error);