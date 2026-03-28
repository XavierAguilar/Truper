/**
 * Script para descargar imágenes de módulos del catálogo Truper.
 * 
 * Lee modulos_progreso.json (generado por descargar_modulos.js) y descarga 
 * las imágenes únicas de módulos a la carpeta modulos/.
 * 
 * Uso: node descargar_modulos_imgs.js
 * Re-ejecutable mensualmente — solo descarga imágenes nuevas/faltantes.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// === CONFIGURACIÓN ===
const PROGRESS_FILE = path.join(__dirname, 'modulos_progreso.json');
const OUTPUT_DIR = path.join(__dirname, 'modulos');
const STATS_FILE = path.join(__dirname, 'modulos_imgs_stats.json');
const CONCURRENCY = 10; // Descargas simultáneas (solo imágenes, rápido)
const DELAY_MS = 100; // Delay mínimo entre lotes
const RETRY_MAX = 3;

// === UTILIDADES ===
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { timeout: 20000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                downloadFile(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                resolve({ ok: false, status: res.statusCode });
                return;
            }
            const file = fs.createWriteStream(dest);
            let bytes = 0;
            res.on('data', chunk => bytes += chunk.length);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve({ ok: true, bytes }); });
            file.on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// === PROCESO PRINCIPAL ===
async function main() {
    console.log('=== DESCARGADOR DE IMÁGENES DE MÓDULOS ===\n');

    // Verificar progreso de extracción
    if (!fs.existsSync(PROGRESS_FILE)) {
        console.error('❌ No se encontró modulos_progreso.json');
        console.error('   Ejecuta primero: node descargar_modulos.js');
        process.exit(1);
    }

    // Cargar progreso y extraer módulos únicos
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    const moduleIds = new Set();
    Object.values(progress).forEach(entry => {
        if (entry.moduleId) moduleIds.add(entry.moduleId);
    });
    console.log(`📋 ${Object.keys(progress).length} productos con módulo asignado`);
    console.log(`📸 ${moduleIds.size} módulos únicos encontrados\n`);

    // Crear directorio de salida
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Verificar cuáles ya existen
    const existing = new Set();
    fs.readdirSync(OUTPUT_DIR).forEach(f => {
        if (f.endsWith('.jpg')) {
            const stat = fs.statSync(path.join(OUTPUT_DIR, f));
            if (stat.size > 500) { // Archivo válido (no vacío/corrupto)
                existing.add(f.replace('.jpg', ''));
            }
        }
    });

    const toDownload = [...moduleIds].filter(id => !existing.has(id));
    console.log(`✅ ${existing.size} ya descargadas`);
    console.log(`⬇️  ${toDownload.length} por descargar\n`);

    let lastModule = '';
    let errorList = [];

    function saveStats(total, desc, dl, err, elapsed, bytes, estado, pending) {
        const prodPorMin = elapsed > 0 ? ((dl) / (elapsed / 60)).toFixed(1) : 0;
        const data = {
            total_catalogo: total,
            total: total,
            procesados: desc + dl,
            pendientes: Math.max(0, pending - dl),
            errores: err,
            tiempo_s: Math.round(elapsed),
            prod_por_min: parseFloat(prodPorMin),
            productos_por_minuto: parseFloat(prodPorMin),
            pct_lote: parseFloat((((desc + dl) / total) * 100).toFixed(1)),
            ultima_actualizacion: new Date().toISOString(),
            estado: estado,
            salud: err > dl * 0.2 ? 'critical' : (err > dl * 0.05 ? 'warning' : 'healthy'),
            ultimo_producto: lastModule ? { codigo: lastModule, clave: '', nombre: '' } : null,
            descargados: dl,
            existentes: desc,
            espacio_mb: (bytes / (1024 * 1024)).toFixed(1),
            problemas: errorList.slice(-20)
        };
        fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
    }

    if (toDownload.length === 0) {
        console.log('🎉 ¡Todas las imágenes ya están descargadas!');
        saveStats(moduleIds.size, existing.size, 0, 0, 0, 0, 'completado', 0);
        return;
    }

    // Estadísticas
    const startTime = Date.now();
    let downloaded = 0;
    let errors = 0;
    let totalBytes = 0;

    // Procesar en lotes
    for (let i = 0; i < toDownload.length; i += CONCURRENCY) {
        const batch = toDownload.slice(i, i + CONCURRENCY);

        const promises = batch.map(async (moduleId) => {
            const url = `https://www.truper.com/BibliotecaContenidoDigital/CatVigente/modulos/${moduleId}.jpg`;
            const dest = path.join(OUTPUT_DIR, `${moduleId}.jpg`);

            let retries = 0;
            while (retries <= RETRY_MAX) {
                try {
                    const result = await downloadFile(url, dest);
                    if (result.ok) {
                        downloaded++;
                        totalBytes += result.bytes || 0;
                        lastModule = moduleId;
                        return;
                    } else {
                        errors++;
                        errorList.push(`Módulo ${moduleId} — HTTP ${result.status}`);
                        return;
                    }
                } catch (err) {
                    retries++;
                    if (retries > RETRY_MAX) {
                        errors++;
                        errorList.push(`Módulo ${moduleId} — ${err.message}`);
                        return;
                    }
                    await sleep(1000);
                }
            }
        });

        await Promise.all(promises);

        // Guardar stats
        const elapsed = (Date.now() - startTime) / 1000;
        saveStats(moduleIds.size, existing.size, downloaded, errors, elapsed, totalBytes, 'procesando', toDownload.length);

        // Progreso
        const pct = (((existing.size + downloaded) / moduleIds.size) * 100).toFixed(1);
        const rate = (downloaded / (elapsed || 1)).toFixed(1);
        const eta = rate > 0 ? Math.round((toDownload.length - downloaded) / rate) : '?';
        process.stdout.write(`\r📸 ${pct}% | ${existing.size + downloaded}/${moduleIds.size} | ⬇️  ${downloaded} nuevas | 💾 ${(totalBytes / (1024 * 1024)).toFixed(1)} MB | ⚡ ${rate}/s | ETA: ${eta}s | Último: ${lastModule}`);

        await sleep(DELAY_MS);
    }

    // Stats finales
    const elapsed = (Date.now() - startTime) / 1000;
    saveStats(moduleIds.size, existing.size, downloaded, errors, elapsed, totalBytes, 'completado', toDownload.length);

    console.log('\n\n=== COMPLETADO ===');
    console.log(`✅ Descargadas: ${downloaded}`);
    console.log(`📸 Total en disco: ${existing.size + downloaded}`);
    console.log(`💾 Espacio: ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`⏱️  Tiempo: ${elapsed.toFixed(0)}s`);
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
