const fs = require('fs');
const https = require('https');

const JSON_PATH = './productos_truper.json';
const DATOS_MENSUALES_FILE = './datos_mensuales.json';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'es-MX,es;q=0.9'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function extractRelatedCodes(html, ownCode) {
    const codes = new Set();
    const regex = /ficha_tecnica\/controllers\/index\.php\?codigo=(\d+)/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const code = match[1];
        if (code !== ownCode) codes.add(code);
    }
    return Array.from(codes);
}

async function main() {
    console.log('🔗 Extracting related products ONLY for new items of June 2026...');
    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const datosMensuales = JSON.parse(fs.readFileSync(DATOS_MENSUALES_FILE, 'utf8'));
    const nuevosCodes = datosMensuales.nuevos || [];

    if (nuevosCodes.length === 0) {
        console.log("No new products to process.");
        return;
    }

    console.log(`Loaded ${nuevosCodes.length} new product codes to process.`);

    const codeToIdx = {};
    for (let i = 0; i < products.length; i++) {
        codeToIdx[products[i].codigo] = i;
    }

    for (let i = 0; i < nuevosCodes.length; i++) {
        const code = nuevosCodes[i];
        const pidx = codeToIdx[code];
        if (pidx === undefined) {
            console.log(`⚠️ Code ${code} not found in products database.`);
            continue;
        }

        const p = products[pidx];
        try {
            const url = 'https://www.truper.com/CatVigente/buscador?palabra=' + p.codigo;
            const html = await fetchPage(url);
            const related = extractRelatedCodes(html, p.codigo);

            if (related.length > 0) {
                const relObjs = related.map(rc => {
                    const idx = codeToIdx[rc];
                    if (idx !== undefined) {
                        const rp = products[idx];
                        return {
                            codigo: rc,
                            clave: rp.clave || '',
                            nombre: rp.nombre || rp.descripcion_csv || '',
                            imagen: (rp.imagenes && rp.imagenes[0]) || ''
                        };
                    } else {
                        return { codigo: rc, clave: '', nombre: '', imagen: '' };
                    }
                });

                products[pidx].productos_relacionados = relObjs;
                products[pidx].relacionados = relObjs;
                console.log(`✅ ${p.codigo} (${p.clave}) → ${related.length} relacionados`);
            } else {
                products[pidx].productos_relacionados = [];
                products[pidx].relacionados = [];
                console.log(`⚪ ${p.codigo} (${p.clave}) → sin relacionados`);
            }
        } catch (err) {
            console.log(`❌ ${p.codigo} — Error: ${err.message}`);
        }
        await sleep(300);
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
    console.log("Database saved successfully.");
}

main().catch(console.error);
