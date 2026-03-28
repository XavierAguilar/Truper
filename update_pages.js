/**
 * TRUPER — Actualizador de Páginas de Catálogo
 * 
 * Script independiente que actualiza SOLO el número de página de catálogo
 * para cada producto en productos_truper.json, sin re-scrapear toda la data.
 * 
 * Útil cuando Truper publica un nuevo catálogo cada mes y cambian los números de página.
 * 
 * Uso: node update_pages.js
 */

const fs = require('fs');

const JSON_PATH = './productos_truper.json';
const TRUPER_BASE = 'https://www.truper.com';
const BASE_URL = 'https://www.truper.com/ficha_tecnica/controllers/index.php';
const API_URL = 'https://www.truper.com/ficha_tecnica/findProductsCod';
const DELAY_MS = 1000;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function resolveUrl(rawUrl) {
    if (!rawUrl) return '';
    let url = rawUrl.replace(/__DIR__\/(\.\.\/)*/g, `${TRUPER_BASE}/`);
    url = url.replace(/([^:])\/\//g, '$1/');
    if (!url.startsWith('http')) url = `${TRUPER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
    return url;
}

function extractCatalogPage(url) {
    if (!url) return null;
    const match = url.match(/-(\d+)\.html/);
    return match ? parseInt(match[1]) : null;
}

async function main() {
    console.log('📖 TRUPER — Actualización de Páginas de Catálogo');
    console.log('=================================================\n');

    if (!fs.existsSync(JSON_PATH)) {
        console.log('❌ No se encontró', JSON_PATH, '- ejecuta scraper.js primero');
        return;
    }

    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log(`📂 ${products.length} productos a actualizar\n`);

    let updated = 0, errors = 0, unchanged = 0;

    // Get initial session
    let csrfToken = null, sessionCookies = '';

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const progress = `[${i + 1}/${products.length}]`;
        const oldPage = p.pagina_catalogo;

        try {
            // Fetch the product page to get catalog link
            const resp = await fetch(`${BASE_URL}?codigo=${p.codigo}&origen=nal`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const setCookies = resp.headers.getSetCookie ? resp.headers.getSetCookie() : [];
            if (setCookies.length > 0) sessionCookies = setCookies.map(c => c.split(';')[0]).join('; ');

            const html = await resp.text();
            const tokenMatch = html.match(/csrf-token.*?content="([^"]+)"/);
            if (tokenMatch) csrfToken = tokenMatch[1];

            let catalogUrl = '';

            // Check if family product — need API call for individual catalog link
            if (html.includes('id="select_hijos"') && csrfToken && sessionCookies) {
                try {
                    const apiResp = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                            'Cookie': sessionCookies,
                            'User-Agent': 'Mozilla/5.0',
                            'Referer': 'https://www.truper.com/ficha_tecnica/'
                        },
                        body: JSON.stringify({ producto: p.codigo })
                    });
                    const frags = JSON.parse(await apiResp.text());
                    const combined = frags.join('');
                    const catMatch = combined.match(/href="([^"]*CatVigente[^"]*)"/);
                    if (catMatch) catalogUrl = resolveUrl(catMatch[1]);
                    await sleep(300);
                } catch (e) {
                    // Fallback: search in the main page
                    const catMatch = html.match(/href="([^"]*CatVigente[^"]*)"/);
                    if (catMatch) catalogUrl = resolveUrl(catMatch[1]);
                }
            } else {
                const catMatch = html.match(/href="([^"]*CatVigente[^"]*)"/);
                if (catMatch) catalogUrl = resolveUrl(catMatch[1]);
            }

            const newPage = extractCatalogPage(catalogUrl);

            if (newPage !== oldPage) {
                p.pagina_catalogo = newPage;
                p.catalogo_url = catalogUrl || p.catalogo_url;
                console.log(`${progress} ${p.codigo} ${p.clave}: P.${oldPage || '-'} → P.${newPage || '-'} ✏️`);
                updated++;
            } else {
                console.log(`${progress} ${p.codigo} ${p.clave}: P.${newPage || '-'} (sin cambios)`);
                unchanged++;
            }
        } catch (err) {
            console.log(`${progress} ${p.codigo} ${p.clave}: ❌ ${err.message}`);
            errors++;
        }

        if (i < products.length - 1) await sleep(DELAY_MS);
    }

    // Save updated JSON
    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');

    console.log('\n=================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✏️  Actualizados: ${updated}`);
    console.log(`   ✅ Sin cambios: ${unchanged}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('\n🏁 ¡Actualización completada!');
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
