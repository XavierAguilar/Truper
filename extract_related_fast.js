/**
 * TRUPER — Extractor RÁPIDO de Productos Relacionados
 * 
 * Usa el buscador web de Truper (HTTP GET) para extraer códigos relacionados.
 * NO usa Puppeteer — solo fetch HTTP + regex.
 * Velocidad estimada: 30-60 prod/min (vs 1.7 con Puppeteer)
 */

const fs = require('fs');
const https = require('https');

const JSON_PATH = './productos_truper.json';
const CONCURRENCY = 5;       // Peticiones simultáneas
const DELAY_MS = 200;        // Delay entre lotes para no sobrecargar el servidor
const SAVE_EVERY = 50;       // Guardar JSON cada N productos procesados

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Hacer fetch HTTP con timeout
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

// Extraer códigos relacionados del HTML del buscador
function extractRelatedCodes(html, ownCode) {
    const codes = new Set();
    // Buscar todas las URLs de ficha técnica: codigo=XXXXX
    const regex = /ficha_tecnica\/controllers\/index\.php\?codigo=(\d+)/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const code = match[1];
        if (code !== ownCode) codes.add(code);
    }
    return Array.from(codes);
}

// Extraer nombre/clave del código desde la página
function extractCodeInfo(html, code) {
    // Buscar patrón: código\n  CLAVE
    const regex = new RegExp(code + '\\s+([A-Z0-9\\-]+)', 'g');
    const match = regex.exec(html);
    return match ? match[1] : '';
}

async function main() {
    console.log('🚀 TRUPER — Extracción RÁPIDA de Productos Relacionados');
    console.log('=========================================================');
    console.log('Método: HTTP GET al buscador de Truper (sin Puppeteer)\n');

    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log('📂 ' + products.length + ' productos cargados');

    // Crear mapa código → índice para búsqueda rápida
    const codeToIdx = {};
    for (let i = 0; i < products.length; i++) {
        codeToIdx[products[i].codigo] = i;
    }

    // Filtrar productos que aún no tienen relacionados
    const pending = products.filter(p => !p.relacionados || p.relacionados.length === 0);
    console.log('⏳ ' + pending.length + ' productos sin relacionados');
    console.log('✅ ' + (products.length - pending.length) + ' ya procesados');
    console.log('🔄 Concurrencia: ' + CONCURRENCY + ' | Delay: ' + DELAY_MS + 'ms\n');

    let processed = 0;
    let found = 0;
    let noRelation = 0;
    let errors = 0;
    let totalRelations = 0;
    let lastProduct = null;
    let recentErrors = [];
    const startTime = Date.now();
    const alreadyDone = products.length - pending.length;

    function saveProgress(estado) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed > 0 ? (processed / (elapsed / 60)).toFixed(1) : '0.0';
        const remaining = pending.length - processed;
        const eta = parseFloat(rate) > 0 ? Math.ceil(remaining / parseFloat(rate)) : 0;
        const totalDone = alreadyDone + processed;
        const pctGlobal = products.length > 0 ? ((totalDone / products.length) * 100).toFixed(1) : 0;

        const progress = {
            script: 'extract_related',
            metodo: 'HTTP fetch (rápido)',
            estado: estado || 'procesando',
            salud: errors > pending.length * 0.2 ? 'critical' : (errors > 10 ? 'warning' : 'healthy'),
            total: pending.length,
            total_catalogo: products.length,
            total_productos: products.length,
            procesados: processed,
            pendientes: remaining,
            ya_tenia: alreadyDone,
            con_relaciones: found,
            sin_relaciones: noRelation,
            relaciones_encontradas: totalRelations,
            pct_global: parseFloat(pctGlobal),
            errores: errors,
            tiempo_s: elapsed.toFixed(0),
            prod_por_min: rate,
            eta_min: eta,
            ultima_actualizacion: new Date().toISOString(),
            ultimo_producto: lastProduct,
            errores_detalle: recentErrors.slice(-5),
            problemas: []
        };
        if (errors > pending.length * 0.2) progress.problemas.push('⚠️ Muchos errores');
        fs.writeFileSync('./progreso_related.json', JSON.stringify(progress, null, 2), 'utf-8');
    }

    // Procesar en lotes
    for (let i = 0; i < pending.length; i += CONCURRENCY) {
        const batch = pending.slice(i, i + CONCURRENCY);

        const promises = batch.map(async (p) => {
            try {
                const url = 'https://www.truper.com/CatVigente/buscador?palabra=' + p.codigo;
                const html = await fetchPage(url);
                const related = extractRelatedCodes(html, p.codigo);

                if (related.length > 0) {
                    // Construir objetos de relacionados con info del catálogo
                    const relObjs = related.map(code => {
                        const idx = codeToIdx[code];
                        if (idx !== undefined) {
                            const rp = products[idx];
                            return {
                                codigo: code,
                                clave: rp.clave || '',
                                nombre: rp.nombre || rp.descripcion_csv || '',
                                imagen: (rp.imagenes && rp.imagenes[0]) || ''
                            };
                        } else {
                            return { codigo: code, clave: extractCodeInfo(html, code), nombre: '', imagen: '' };
                        }
                    });

                    // Guardar en el producto
                    const pidx = codeToIdx[p.codigo];
                    if (pidx !== undefined) {
                        products[pidx].productos_relacionados = relObjs;
                    }

                    found++;
                    totalRelations += related.length;
                    lastProduct = { codigo: p.codigo, clave: p.clave || '', nombre: p.nombre || p.descripcion_csv || '', relacionados: related.length };
                    process.stdout.write('✅ ' + p.codigo + ' (' + p.clave + ') → ' + related.length + ' relacionados\n');
                } else {
                    noRelation++;
                    lastProduct = { codigo: p.codigo, clave: p.clave || '', nombre: p.nombre || p.descripcion_csv || '', relacionados: 0 };
                    process.stdout.write('⚪ ' + p.codigo + ' (' + p.clave + ') → sin relacionados\n');
                }
            } catch (err) {
                errors++;
                recentErrors.push({ codigo: p.codigo, error: err.message, fecha: new Date().toISOString() });
                if (recentErrors.length > 10) recentErrors.shift();
                lastProduct = { codigo: p.codigo, clave: p.clave || '', nombre: p.nombre || '', relacionados: -1 };
                process.stdout.write('❌ ' + p.codigo + ' — ' + err.message + '\n');
            }
            processed++;
        });

        await Promise.all(promises);

        // Guardar progreso cada lote
        saveProgress('procesando');
        if (processed % SAVE_EVERY < CONCURRENCY) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (processed / ((Date.now() - startTime) / 60000)).toFixed(1);
            console.log('\n📊 Progreso: ' + processed + '/' + pending.length + ' | ✅' + found + ' ⚪' + noRelation + ' | ' + rate + ' prod/min | ' + totalRelations + ' relaciones | ' + errors + ' errores | ' + elapsed + 's\n');
            fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
        }

        await sleep(DELAY_MS);
    }

    // Guardar resultado final
    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
    saveProgress('completado');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (processed / ((Date.now() - startTime) / 60000)).toFixed(1);
    console.log('\n🏁 COMPLETADO');
    console.log('=============');
    console.log('Procesados: ' + processed);
    console.log('Con relacionados: ' + found);
    console.log('Total relaciones: ' + totalRelations);
    console.log('Errores: ' + errors);
    console.log('Tiempo: ' + elapsed + 's (' + rate + ' prod/min)');
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
