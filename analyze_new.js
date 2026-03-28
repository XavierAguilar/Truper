// Analyze sample_100139.html for new content types
const { parse } = require('node-html-parser');
const fs = require('fs');
const html = fs.readFileSync('sample_100139.html', 'utf8');
const root = parse(html);

// 1. Catalog URL with page number
const catLinks = [];
root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes('CatVigente')) catLinks.push(href);
});
console.log('=== CATALOG LINKS ===');
catLinks.forEach(l => {
    const pageMatch = l.match(/-(\d+)\.html/);
    console.log(' URL:', l);
    console.log(' Page:', pageMatch ? pageMatch[1] : 'N/A');
});

// 2. Brand logo
const brand = root.querySelector('[class*="mark_id"]') || root.querySelector('.tamanio_mark');
console.log('\n=== BRAND ===');
console.log(brand ? brand.toString().substring(0, 300) : 'NOT FOUND');

// 3. Certification panel content
const certPanel = root.querySelector('#fill-tabpanel-2');
console.log('\n=== CERTIFICATIONS ===');
if (certPanel) {
    const imgs = certPanel.querySelectorAll('img');
    console.log('Images found:', imgs.length);
    imgs.forEach((img, i) => {
        console.log(' img[' + i + ']:', img.getAttribute('src'), 'alt:', img.getAttribute('alt'));
    });
    const rows = certPanel.querySelectorAll('tr');
    console.log('Rows:', rows.length);
    rows.forEach((row, i) => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        console.log(' row[' + i + ']:', 'th=' + (th ? th.text.trim().substring(0, 60) : 'none'), 'td=' + (td ? td.text.trim().substring(0, 60) : 'none'));
    });
}

// 4. All tabs/panels present
const tabs = root.querySelectorAll('.nav-link');
console.log('\n=== TABS ===');
tabs.forEach(t => console.log(' ', t.text.trim()));

// 5. Any new content sections
const refacciones = root.querySelector('#fill-tabpanel-0');
console.log('\n=== REFACCIONES/EXTRAS ===');
if (refacciones) {
    console.log('Has tabpanel-0:', refacciones.text.trim().substring(0, 200));
}

// 6. Videos
const videos = root.querySelectorAll('[id*="video"], [class*="video"]');
console.log('\n=== VIDEOS ===');
console.log('Found:', videos.length);
