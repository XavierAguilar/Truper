/**
 * TRUPER — Extractor de Productos Relacionados (por módulo específico)
 * 
 * Usa el hash #image-X del URL del catálogo para identificar exactamente
 * qué módulo clickear, y extrae solo los productos de ESE módulo.
 */

const fs = require('fs');
const puppeteer = require('puppeteer');

const JSON_PATH = './productos_truper.json';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Extraer el índice del módulo del hash del URL
// Ejemplo: #image-4 → módulo index 3 (0-based, image-1 = 0)
function getModuleIndex(catalogUrl) {
    if (!catalogUrl) return -1;
    const match = catalogUrl.match(/#image-(\d+)/);
    if (!match) return -1;
    return parseInt(match[1]) - 1; // image-1 = index 0
}

async function extractModuleProducts(page, moduleIndex) {
    // Hacer clic en el módulo específico
    const clicked = await page.evaluate((idx) => {
        const modules = document.querySelectorAll('a.moduloBig');
        if (modules[idx]) { modules[idx].click(); return true; }
        return false;
    }, moduleIndex);

    if (!clicked) return [];
    await sleep(2500);

    // Hover y clic en botón "Ficha técnica"
    try { await page.hover('.ver_ficha'); } catch (_) { }
    await sleep(800);
    try { await page.click('.ver_ficha'); } catch (_) { }
    await sleep(800);

    // Extraer productos del dropdown
    const products = await page.evaluate(() => {
        const prods = [];

        // Buscar en el dropdown del botón Ficha técnica
        const containers = document.querySelectorAll(
            '.ver_ficha + div, #verFicha + div, .group_ficha div'
        );
        for (const c of containers) {
            c.querySelectorAll('a[href*="codigo="]').forEach(a => {
                const href = a.getAttribute('href') || '';
                const m = href.match(/codigo=(\d+)/);
                if (m) {
                    const spans = a.querySelectorAll('span');
                    const cod = m[1];
                    if (!prods.some(p => p.codigo === cod)) {
                        prods.push({
                            codigo: cod,
                            clave: spans.length >= 2 ? spans[1].textContent.trim() : ''
                        });
                    }
                }
            });
        }

        // Si no encontró en dropdown, buscar en el modal fancybox
        if (prods.length === 0) {
            document.querySelectorAll('.fancybox-content, .fancybox-slide--current').forEach(fc => {
                fc.querySelectorAll('a[href*="codigo="]').forEach(a => {
                    const href = a.getAttribute('href') || '';
                    const m = href.match(/codigo=(\d+)/);
                    if (m) {
                        const spans = a.querySelectorAll('span');
                        const cod = m[1];
                        if (!prods.some(p => p.codigo === cod)) {
                            prods.push({ codigo: cod, clave: spans.length >= 2 ? spans[1].textContent.trim() : '' });
                        }
                    }
                });
            });
        }

        return prods;
    });

    // Cerrar modal
    await page.keyboard.press('Escape');
    await sleep(600);
    // Asegurar cierre
    await page.evaluate(() => {
        const btn = document.querySelector('.fancybox-close-small, .fancybox-button--close');
        if (btn) btn.click();
    });
    await sleep(400);

    return products;
}

async function main() {
    console.log('🔗 TRUPER — Extracción de Productos Relacionados');
    console.log('================================================\n');

    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log('📂 ' + products.length + ' productos cargados\n');

    // Agrupar por URL base del catálogo
    const pageGroups = {};
    for (const p of products) {
        if (!p.catalogo_url) continue;
        const baseUrl = p.catalogo_url.split('#')[0];
        if (!pageGroups[baseUrl]) pageGroups[baseUrl] = [];
        pageGroups[baseUrl].push(p);
    }

    const uniquePages = Object.keys(pageGroups);
    console.log('📄 ' + uniquePages.length + ' páginas de catálogo únicas\n');

    var totalRelations = 0;
    var errors = 0;
    var startTime = Date.now();

    function saveProgress(completed, estado) {
        var progress = {
            script: 'extract_related',
            estado: estado || 'procesando',
            salud: errors > uniquePages.length * 0.2 ? 'critical' : (errors > 3 ? 'warning' : 'healthy'),
            total: uniquePages.length,
            total_productos: products.length,
            procesados: completed,
            pendientes: uniquePages.length - completed,
            relaciones_encontradas: totalRelations,
            errores: errors,
            tiempo_s: ((Date.now() - startTime) / 1000).toFixed(0),
            prod_por_min: ((completed / ((Date.now() - startTime) / 60000)) || 0).toFixed(1),
            ultima_actualizacion: new Date().toISOString(),
            problemas: []
        };
        if (errors > uniquePages.length * 0.2) progress.problemas.push('⚠️ Muchos errores de extracción');
        fs.writeFileSync('./progreso_related.json', JSON.stringify(progress, null, 2), 'utf-8');
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    // Bloquear imágenes para velocidad
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (['image', 'font', 'media'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    for (let pi = 0; pi < uniquePages.length; pi++) {
        const catalogUrl = uniquePages[pi];
        const prods = pageGroups[catalogUrl];
        console.log('[' + (pi + 1) + '/' + uniquePages.length + '] ' + catalogUrl.split('/').pop());

        try {
            await page.goto(catalogUrl, { waitUntil: 'networkidle2', timeout: 45000 });
            await sleep(4000);

            const moduleCount = await page.evaluate(() =>
                document.querySelectorAll('a.moduloBig').length
            );
            console.log('   📦 ' + moduleCount + ' módulos en la página');

            // Para cada producto, abrir EXACTAMENTE su módulo usando el hash
            // Necesitamos agrupar por módulo para no abrir el mismo módulo dos veces
            const moduleCache = {}; // moduleIndex -> products[]

            for (const p of prods) {
                const modIdx = getModuleIndex(p.catalogo_url);
                console.log('   🎯 ' + p.codigo + ' ' + p.clave + ' → módulo #' + (modIdx + 1));

                if (modIdx < 0 || modIdx >= moduleCount) {
                    console.log('      ⚠ Módulo inválido (hash no encontrado)');
                    continue;
                }

                // Si ya extraímos este módulo, reusar datos
                if (moduleCache[modIdx]) {
                    const cached = moduleCache[modIdx];
                    p.productos_relacionados = cached
                        .filter(mp => mp.codigo !== p.codigo)
                        .map(mp => ({ codigo: mp.codigo, clave: mp.clave }));
                    console.log('      📋 (del caché) ' + p.productos_relacionados.length + ' variantes');
                    continue;
                }

                // Extraer productos de este módulo
                const moduleProds = await extractModuleProducts(page, modIdx);
                moduleCache[modIdx] = moduleProds;

                if (moduleProds.length > 0) {
                    p.productos_relacionados = moduleProds
                        .filter(mp => mp.codigo !== p.codigo)
                        .map(mp => ({ codigo: mp.codigo, clave: mp.clave }));
                    console.log('      ✅ ' + p.productos_relacionados.length + ' variantes: ' +
                        p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));
                } else {
                    console.log('      ❌ No se encontraron variantes en el módulo');
                }
            }

        } catch (err) {
            console.log('   ❌ Error: ' + err.message);
            errors++;
        }

        saveProgress(pi + 1, 'procesando');
        console.log('');
    }

    await browser.close();
    console.log('🔍 Navegador cerrado\n');

    // Cruce de datos: si A tiene a B, B también debe tener a A
    console.log('🔄 Cruzando datos...');
    for (const p of products) {
        if (!p.productos_relacionados || p.productos_relacionados.length === 0) continue;
        for (const rel of p.productos_relacionados) {
            const other = products.find(x => x.codigo === rel.codigo);
            if (other && (!other.productos_relacionados || other.productos_relacionados.length === 0)) {
                other.productos_relacionados = [
                    { codigo: p.codigo, clave: p.clave },
                    ...p.productos_relacionados.filter(r => r.codigo !== other.codigo)
                ];
                console.log('   🔄 ' + other.codigo + ' ← cruzado desde ' + p.codigo);
            }
        }
    }

    // Respaldo: hermanos de familia
    for (const p of products) {
        if ((!p.productos_relacionados || p.productos_relacionados.length === 0) &&
            p.productos_hermanos && p.productos_hermanos.length > 1) {
            p.productos_relacionados = p.productos_hermanos
                .filter(h => h.codigo !== p.codigo)
                .map(h => ({ codigo: h.codigo, clave: h.texto || '' }));
            console.log('   👨‍👩‍👧 ' + p.codigo + ' ← ' + p.productos_relacionados.length + ' hermanos');
        }
    }

    // Enriquecer con nombre e imagen del JSON
    for (const p of products) {
        if (!p.productos_relacionados) p.productos_relacionados = [];
        p.productos_relacionados = p.productos_relacionados.map(rel => {
            const found = products.find(x => x.codigo === rel.codigo);
            return {
                codigo: rel.codigo,
                clave: found ? found.clave : rel.clave,
                nombre: found ? found.nombre : '',
                imagen: found && found.imagenes.length > 0 ? found.imagenes[0] : ''
            };
        });
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
    totalRelations = products.reduce((a, p) => a + p.productos_relacionados.length, 0);
    saveProgress(uniquePages.length, 'completado');

    // Resumen
    console.log('\n================================================');
    const conRel = products.filter(p => p.productos_relacionados.length > 0);
    const totalRel = products.reduce((a, p) => a + p.productos_relacionados.length, 0);
    console.log('📊 RESUMEN:');
    console.log('   🔗 Total relaciones: ' + totalRel);
    console.log('   ✅ Con variantes: ' + conRel.length + '/' + products.length);
    conRel.forEach(p => {
        console.log('      ' + p.codigo + ' ' + p.clave + ': ' +
            p.productos_relacionados.map(r => r.codigo + ' ' + r.clave).join(', '));
    });
    const sinRel = products.filter(p => p.productos_relacionados.length === 0);
    console.log('   ❌ Sin variantes: ' + sinRel.length);
    sinRel.forEach(p => console.log('      ' + p.codigo + ' ' + p.clave));
    console.log('\n🏁 ¡Completado!');
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
