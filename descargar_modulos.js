/**
 * Script para extraer y descargar imágenes de módulos del catálogo Truper.
 * 
 * Para cada producto, busca en Truper la URL del módulo correspondiente,
 * extrae el ID del módulo, y descarga la imagen localmente.
 * 
 * Uso: node descargar_modulos.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// === CONFIGURACIÓN ===
const PRODUCTS_FILE = path.join(__dirname, 'productos_truper.json');
const OUTPUT_DIR = path.join(__dirname, 'modulos');
const PROGRESS_FILE = path.join(__dirname, 'modulos_progreso.json');
const CONCURRENCY = 8; // Peticiones simultáneas
const DELAY_MS = 300; // Delay entre lotes
const RETRY_MAX = 2;

// === UTILIDADES ===
function fetchUrl(url, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { timeout }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { timeout: 30000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                downloadFile(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
            file.on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// === EXTRAER MODULE ID ===
function extractModuleId(html) {
    // Buscar URLs que contengan /modulos/ seguido de un número
    const regex = /\/modulos\/\/?\/?(\d+)\.jpg/g;
    let match;
    const ids = new Set();
    while ((match = regex.exec(html)) !== null) {
        ids.add(match[1]);
    }
    return Array.from(ids);
}

// Extraer también los códigos de productos hermanos del mismo módulo
function extractModuleCodes(html) {
    const regex = /codigo=(\d+)/g;
    let match;
    const codes = new Set();
    while ((match = regex.exec(html)) !== null) {
        codes.add(match[1]);
    }
    return Array.from(codes);
}

// === PROCESO PRINCIPAL ===
async function main() {
    console.log('=== EXTRACTOR DE MÓDULOS DEL CATÁLOGO TRUPER ===\n');

    // Cargar productos
    if (!fs.existsSync(PRODUCTS_FILE)) {
        console.error('❌ No se encontró productos_truper.json');
        process.exit(1);
    }
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    console.log(`📦 ${products.length} productos cargados\n`);

    // Crear directorio de salida
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Cargar progreso previo
    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        console.log(`📋 Progreso previo: ${Object.keys(progress).length} productos ya procesados\n`);
    }

    // Estadísticas
    let stats = {
        total: products.length,
        processed: Object.keys(progress).length,
        modulesFound: 0,
        modulesDownloaded: 0,
        errors: 0,
        skipped: 0,
        startTime: Date.now(),
        errorList: [] // Lista de errores detallados
    };

    // Contar módulos ya descargados
    const existingModules = new Set();
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.readdirSync(OUTPUT_DIR).forEach(f => {
            if (f.endsWith('.jpg')) existingModules.add(f.replace('.jpg', ''));
        });
    }
    stats.modulesDownloaded = existingModules.size;

    // Mapeo código → módulo (para evitar buscar productos del mismo módulo)
    const codeToModule = {};
    Object.entries(progress).forEach(([code, data]) => {
        if (data.moduleId) codeToModule[code] = data.moduleId;
    });

    // Productos pendientes
    const pending = products.filter(p => !progress[p.codigo]);
    console.log(`⏳ ${pending.length} productos pendientes de procesar\n`);

    // Función para guardar progreso
    function saveProgress() {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
        // Guardar stats para el monitor (formato compatible con renderDashboard)
        const procesados = Object.keys(progress).length;
        const pendientes = stats.total - procesados;
        const elapsedSec = (Date.now() - stats.startTime) / 1000;
        const prodPorMin = elapsedSec > 0 ? ((procesados - (stats.initialProcessed || 0)) / (elapsedSec / 60)).toFixed(1) : 0;
        const monitorData = {
            total_catalogo: stats.total,
            total: stats.total,
            procesados: procesados,
            pendientes: pendientes,
            errores: stats.errors,
            tiempo_s: Math.round(elapsedSec),
            prod_por_min: parseFloat(prodPorMin),
            productos_por_minuto: parseFloat(prodPorMin),
            pct_lote: parseFloat(((procesados / stats.total) * 100).toFixed(1)),
            ultima_actualizacion: new Date().toISOString(),
            estado: pendientes <= 0 ? 'completado' : 'procesando',
            salud: stats.errors > procesados * 0.2 ? 'critical' : (stats.errors > procesados * 0.05 ? 'warning' : 'healthy'),
            ultimo_producto: stats.lastProduct ? { codigo: stats.lastCode || '', clave: stats.lastClave || '', nombre: 'Módulo: ' + (stats.lastModuleId || '—') } : null,
            modulos_unicos: new Set(Object.values(codeToModule)).size,
            modulos_descargados: existingModules.size,
            ultimo_modulo_id: stats.lastModuleId || '',
            problemas: stats.errorList.slice(-20) // Últimos 20 errores para el monitor
        };
        fs.writeFileSync(path.join(__dirname, 'modulos_stats.json'), JSON.stringify(monitorData, null, 2));
    }
    stats.initialProcessed = Object.keys(progress).length;

    // Procesar en lotes
    for (let i = 0; i < pending.length; i += CONCURRENCY) {
        const batch = pending.slice(i, i + CONCURRENCY);

        const promises = batch.map(async (product) => {
            const code = product.codigo;

            // Buscar en Truper
            let retries = 0;
            while (retries <= RETRY_MAX) {
                try {
                    const url = `https://www.truper.com/CatVigente/buscador?palabra=${code}`;
                    const res = await fetchUrl(url);

                    if (res.statusCode !== 200) {
                        progress[code] = { moduleId: null, error: `HTTP ${res.statusCode}`, timestamp: new Date().toISOString() };
                        stats.errors++;
                        stats.errorList.push(`${code} (${product.clave || ''}) — HTTP ${res.statusCode}`);
                        return;
                    }

                    const moduleIds = extractModuleId(res.body);
                    const hermanos = extractModuleCodes(res.body);

                    if (moduleIds.length > 0) {
                        const moduleId = moduleIds[0]; // Usar el primer módulo encontrado
                        progress[code] = {
                            moduleId,
                            hermanos,
                            timestamp: new Date().toISOString()
                        };
                        codeToModule[code] = moduleId;
                        stats.modulesFound++;
                        stats.lastProduct = `${code} (${product.clave || ''})`;
                        stats.lastCode = code;
                        stats.lastClave = product.clave || '';
                        stats.lastModuleId = moduleId;

                        // Asignar mismo módulo a los hermanos
                        hermanos.forEach(hCode => {
                            if (!progress[hCode]) {
                                progress[hCode] = { moduleId, source: 'hermano', timestamp: new Date().toISOString() };
                                codeToModule[hCode] = moduleId;
                            }
                        });

                        // Descargar imagen si no existe
                        if (!existingModules.has(moduleId)) {
                            const imgUrl = `https://www.truper.com/BibliotecaContenidoDigital/CatVigente/modulos/${moduleId}.jpg`;
                            const dest = path.join(OUTPUT_DIR, `${moduleId}.jpg`);
                            try {
                                const ok = await downloadFile(imgUrl, dest);
                                if (ok) {
                                    existingModules.add(moduleId);
                                    stats.modulesDownloaded++;
                                }
                            } catch (dlErr) {
                                // No fatal, la imagen podría no existir
                            }
                        }
                    } else {
                        progress[code] = { moduleId: null, error: 'no_module_found', timestamp: new Date().toISOString() };
                        stats.errorList.push(`${code} (${product.clave || ''}) — Sin módulo en Truper`);
                    }
                    return; // Éxito, salir del retry
                } catch (err) {
                    retries++;
                    if (retries > RETRY_MAX) {
                        progress[code] = { moduleId: null, error: err.message, timestamp: new Date().toISOString() };
                        stats.errors++;
                        stats.errorList.push(`${code} (${product.clave || ''}) — ${err.message}`);
                    }
                    await sleep(2000);
                }
            }
        });

        await Promise.all(promises);

        // Guardar progreso en cada lote para el monitor en tiempo real
        saveProgress();

        // Imprimir progreso
        const processed = Object.keys(progress).length;
        const pct = ((processed / stats.total) * 100).toFixed(1);
        const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0);
        const rate = (processed / (elapsed || 1)).toFixed(1);
        const eta = rate > 0 ? Math.round((stats.total - processed) / rate) : '?';

        process.stdout.write(`\r📊 ${pct}% | ${processed}/${stats.total} | 📸 ${existingModules.size} módulos | ⚡ ${rate}/s | ETA: ${eta}s | Último: ${stats.lastProduct || '...'}`);

        await sleep(DELAY_MS);
    }

    // Guardar progreso final
    saveProgress();

    console.log('\n\n=== COMPLETADO ===');
    console.log(`✅ Productos procesados: ${Object.keys(progress).length}`);
    console.log(`📸 Módulos únicos encontrados: ${new Set(Object.values(codeToModule)).size}`);
    console.log(`💾 Imágenes descargadas: ${existingModules.size}`);
    console.log(`❌ Errores: ${stats.errors}`);
    console.log(`⏩ Reutilizados: ${stats.skipped}`);

    // Actualizar productos_truper.json con los moduleIds
    console.log('\n📝 Actualizando productos_truper.json con módulos...');
    let updated = 0;
    products.forEach(p => {
        if (codeToModule[p.codigo]) {
            p.modulo_id = codeToModule[p.codigo];
            p.modulo_imagen_url = `https://www.truper.com/BibliotecaContenidoDigital/CatVigente/modulos/${codeToModule[p.codigo]}.jpg`;
            p.modulo_imagen_local = `modulos/${codeToModule[p.codigo]}.jpg`;
            updated++;
        }
    });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`✅ ${updated} productos actualizados con su módulo`);
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
