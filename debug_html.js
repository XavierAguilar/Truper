// Fetch one product page and save raw HTML for inspection
const fs = require('fs');

async function main() {
    const url = 'https://www.truper.com/ficha_tecnica/controllers/index.php?codigo=100048&origen=nal';
    const resp = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml'
        },
        redirect: 'follow'
    });
    const html = await resp.text();
    fs.writeFileSync('sample_page.html', html, 'utf-8');
    console.log('Saved HTML, length:', html.length);

    // Show relevant sections
    const { parse } = require('node-html-parser');
    const root = parse(html);

    // Find all h1, h2, h3
    console.log('\n=== HEADINGS ===');
    ['h1', 'h2', 'h3', 'h4', 'h5'].forEach(tag => {
        root.querySelectorAll(tag).forEach(el => {
            console.log(`${tag}: "${el.text.trim().substring(0, 100)}"`);
        });
    });

    // Find product title - try different patterns
    console.log('\n=== TITLE PATTERNS ===');
    const titleEl = root.querySelector('.ficha-title') || root.querySelector('.product-title') || root.querySelector('h1');
    console.log('ficha-title/product-title/h1:', titleEl ? titleEl.text.trim() : 'NOT FOUND');

    // Find elements with class containing 'title' or 'name'
    ['title', 'name', 'producto', 'descripcion', 'feature', 'caract'].forEach(kw => {
        root.querySelectorAll(`[class*="${kw}"]`).forEach(el => {
            console.log(`[class*="${kw}"]: class="${el.classNames}" text="${el.text.trim().substring(0, 80)}"`);
        });
    });

    // Look at the structure around key text
    console.log('\n=== STRUCTURE AROUND PRODUCT NAME ===');
    const nameText = 'Llave ajustable';
    const allElements = root.querySelectorAll('*');
    for (const el of allElements) {
        if (el.text.includes(nameText) && el.childNodes.length <= 3 && el.text.trim().length < 200) {
            console.log(`Tag: ${el.tagName}, Class: "${el.classNames}", Text: "${el.text.trim().substring(0, 120)}"`);
        }
    }

    // Show all UL > LI items
    console.log('\n=== LIST ITEMS ===');
    root.querySelectorAll('li').forEach(li => {
        const text = li.text.trim();
        if (text.length > 5 && text.length < 200) {
            console.log(`LI: "${text.substring(0, 100)}"`);
        }
    });

    // Show class names of main containers
    console.log('\n=== KEY DIVS ===');
    root.querySelectorAll('div[class]').forEach(div => {
        const cls = div.classNames;
        if (cls && (cls.includes('product') || cls.includes('ficha') || cls.includes('info') || cls.includes('desc') || cls.includes('feature') || cls.includes('spec'))) {
            console.log(`DIV class="${cls}" (${div.text.trim().substring(0, 60)})`);
        }
    });
}

main();
