// Test: Fetch a family product page, extract CSRF token + session cookies,
// then call the findProductsCod API to get individual product data.

const fs = require('fs');

async function test() {
    // Step 1: Load the family page to get CSRF token and session cookie
    console.log('Step 1: Loading family page for 100103...');
    const pageResp = await fetch(
        'https://www.truper.com/ficha_tecnica/controllers/index.php?codigo=100103&origen=nal',
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    );
    const html = await pageResp.text();

    // Extract CSRF token
    const tokenMatch = html.match(/csrf-token.*?content="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : null;
    console.log('  Token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');

    // Extract cookies
    const setCookies = pageResp.headers.getSetCookie ? pageResp.headers.getSetCookie() : [];
    const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');
    console.log('  Cookies:', cookieStr ? cookieStr.substring(0, 100) + '...' : 'NONE');

    if (!token) {
        console.log('ERROR: No CSRF token found');
        return;
    }

    // Step 2: Call the findProductsCod API
    console.log('\nStep 2: Calling findProductsCod API for code 100103...');
    const apiResp = await fetch('https://www.truper.com/ficha_tecnica/findProductsCod', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
            'Accept': 'application/json',
            'Cookie': cookieStr,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.truper.com/ficha_tecnica/'
        },
        body: JSON.stringify({ producto: '100103' })
    });

    console.log('  API Status:', apiResp.status);
    const apiText = await apiResp.text();
    console.log('  Response length:', apiText.length);
    console.log('  First 500 chars:', apiText.substring(0, 500));

    // Save full response for analysis
    if (apiResp.status === 200) {
        fs.writeFileSync('api_response_100103.json', apiText, 'utf-8');
        console.log('\n  Saved full response to api_response_100103.json');

        // Try parsing as JSON
        try {
            const data = JSON.parse(apiText);
            console.log('  Type:', typeof data);
            if (Array.isArray(data)) {
                console.log('  Array length:', data.length);
                data.forEach((item, i) => {
                    console.log(`  [${i}] length: ${typeof item === 'string' ? item.length : JSON.stringify(item).length} chars`);
                    if (typeof item === 'string') {
                        console.log(`  [${i}] preview:`, item.substring(0, 200));
                    }
                });
            }
        } catch (e) {
            console.log('  Not JSON:', e.message);
        }
    }
}

test().catch(console.error);
