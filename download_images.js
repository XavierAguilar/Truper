/**
 * TRUPER — Descargador de Imágenes de Productos + Logos de Marcas
 * 
 * Descarga todas las imágenes del catálogo a carpeta local.
 * - Productos: images/productos/{codigo}/{archivo}
 * - Logos: images/marcas/{marca}.png
 * 
 * Features: concurrencia 10, retry 3x, reanudable, rate limiting,
 * progreso en progreso_images.json para el Monitor.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const JSON_PATH = './productos_truper.json';
const IMAGES_DIR = './images';
const PRODUCTOS_DIR = path.join(IMAGES_DIR, 'productos');
const MARCAS_DIR = path.join(IMAGES_DIR, 'marcas');

const CONCURRENCY = 10;
const DELAY_MS = 100;
const MAX_RETRIES = 3;
const SAVE_EVERY = 100;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Crear directorios si no existen
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Descargar archivo HTTP/HTTPS con timeout y retry
function downloadFile(url, destPath, retries) {
    retries = retries || 0;
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://www.truper.com/'
            },
            timeout: 20000
        }, (res) => {
            // Manejar redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath, retries).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error('HTTP ' + res.statusCode));
            }

            const dir = path.dirname(destPath);
            ensureDir(dir);

            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                // Verificar que el archivo no está vacío
                const stats = fs.statSync(destPath);
                if (stats.size < 100) {
                    fs.unlinkSync(destPath);
                    reject(new Error('Archivo vacío (' + stats.size + ' bytes)'));
                } else {
                    resolve(stats.size);
                }
            });
            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => { });
                reject(err);
            });
        });
        req.on('error', (err) => {
            if (retries < MAX_RETRIES) {
                setTimeout(() => {
                    downloadFile(url, destPath, retries + 1).then(resolve).catch(reject);
                }, 1000 * (retries + 1));
            } else {
                reject(err);
            }
        });
        req.on('timeout', () => {
            req.destroy();
            if (retries < MAX_RETRIES) {
                setTimeout(() => {
                    downloadFile(url, destPath, retries + 1).then(resolve).catch(reject);
                }, 1000 * (retries + 1));
            } else {
                reject(new Error('Timeout después de ' + MAX_RETRIES + ' intentos'));
            }
        });
    });
}

// Convertir URL de Truper a ruta local
function urlToLocalPath(url, codigo) {
    try {
        const urlObj = new URL(url);
        const filename = path.basename(urlObj.pathname);
        return path.join(PRODUCTOS_DIR, String(codigo), filename);
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('📸 TRUPER — Descargador de Imágenes');
    console.log('=====================================');
    console.log('Dirs: ' + PRODUCTOS_DIR + ' | ' + MARCAS_DIR);
    console.log('Concurrencia: ' + CONCURRENCY + ' | Retry: ' + MAX_RETRIES + 'x\n');

    ensureDir(PRODUCTOS_DIR);
    ensureDir(MARCAS_DIR);

    const products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    console.log('📂 ' + products.length + ' productos cargados');

    // ===== PASO 1: Construir lista de descargas pendientes =====
    console.log('\n🔍 Analizando imágenes pendientes...');
    var downloads = []; // { url, destPath, codigo, clave, tipo }
    var alreadyExist = 0;
    var totalImages = 0;
    var byMarca = {}; // marca → { total, descargados, pendientes }

    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var marca = p.marca || 'Sin marca';
        if (!byMarca[marca]) byMarca[marca] = { total: 0, descargados: 0, pendientes: 0 };

        var imgs = p.imagenes || [];
        for (var j = 0; j < imgs.length; j++) {
            totalImages++;
            byMarca[marca].total++;
            var localPath = urlToLocalPath(imgs[j], p.codigo);
            if (!localPath) continue;

            if (fs.existsSync(localPath)) {
                alreadyExist++;
                byMarca[marca].descargados++;
            } else {
                downloads.push({
                    url: imgs[j],
                    destPath: localPath,
                    codigo: p.codigo,
                    clave: p.clave || '',
                    marca: marca,
                    tipo: 'producto'
                });
                byMarca[marca].pendientes++;
            }
        }
    }

    console.log('📊 Total imágenes: ' + totalImages);
    console.log('✅ Ya descargadas: ' + alreadyExist);
    console.log('⏳ Pendientes: ' + downloads.length);
    console.log('🏷️ Marcas: ' + Object.keys(byMarca).length + '\n');

    // ===== PASO 2: Descargar logos de marcas =====
    console.log('🏷️ Verificando logos de marcas...');
    var marcas = Object.keys(byMarca);
    var logosDescargados = 0;
    var logosYaExisten = 0;

    for (var m = 0; m < marcas.length; m++) {
        var marcaName = marcas[m];
        var safeName = marcaName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
        var logoPath = path.join(MARCAS_DIR, safeName + '.png');

        if (fs.existsSync(logoPath)) {
            logosYaExisten++;
            continue;
        }

        // Intentar descargar logo del sitio de Truper
        var logoUrls = [
            'https://www.truper.com/media/import/imagenes/' + marcaName.toUpperCase() + '_LOGO.jpg',
            'https://www.truper.com/media/import/imagenes/logo_' + safeName + '.jpg',
            'https://www.truper.com/media/marca/' + safeName + '.png'
        ];

        var logoDownloaded = false;
        for (var lu = 0; lu < logoUrls.length; lu++) {
            try {
                await downloadFile(logoUrls[lu], logoPath);
                logosDescargados++;
                logoDownloaded = true;
                console.log('  ✅ ' + marcaName + ' → ' + logoPath);
                break;
            } catch (e) {
                // Intentar siguiente URL
            }
        }

        if (!logoDownloaded) {
            // Crear un placeholder de texto como logo
            console.log('  ⚪ ' + marcaName + ' — Sin logo disponible (se usará badge CSS)');
        }
    }

    console.log('🏷️ Logos: ' + logosDescargados + ' descargados, ' + logosYaExisten + ' ya existían\n');

    // ===== PASO 3: Descargar imágenes de productos =====
    if (downloads.length === 0) {
        console.log('🎉 ¡Todas las imágenes ya están descargadas!');
        saveProgress(downloads.length, 0, 0, 0, alreadyExist, null, byMarca, 'completado');
        return;
    }

    console.log('📥 Descargando ' + downloads.length + ' imágenes...\n');

    var processed = 0;
    var success = 0;
    var errors = 0;
    var totalBytes = 0;
    var startTime = Date.now();
    var lastItem = null;
    var recentErrors = [];

    function saveProgress(total, proc, succ, errs, existing, last, marcaStats, estado) {
        var elapsed = (Date.now() - startTime) / 1000;
        var rate = proc > 0 ? (proc / (elapsed / 60)).toFixed(1) : '0.0';
        var remaining = total - proc;
        var eta = parseFloat(rate) > 0 ? Math.ceil(remaining / parseFloat(rate)) : 0;

        var progress = {
            script: 'download_images',
            metodo: 'HTTP descarga directa',
            estado: estado || 'procesando',
            salud: errs > total * 0.1 ? 'critical' : (errs > 20 ? 'warning' : 'healthy'),
            total: total + existing,
            total_catalogo: total + existing,
            procesados: proc + existing,
            pendientes: remaining,
            descargados: succ,
            existentes: existing,
            errores: errs,
            espacio_mb: (totalBytes / (1024 * 1024)).toFixed(1),
            tiempo_s: elapsed.toFixed(0),
            prod_por_min: rate,
            eta_min: eta,
            ultima_actualizacion: new Date().toISOString(),
            ultimo_producto: last,
            errores_detalle: recentErrors.slice(-5),
            marcas: marcaStats,
            problemas: []
        };
        if (errs > total * 0.1) progress.problemas.push('⚠️ Más del 10% de errores');
        fs.writeFileSync('./progreso_images.json', JSON.stringify(progress, null, 2), 'utf-8');
    }

    // Procesar en lotes
    for (var bi = 0; bi < downloads.length; bi += CONCURRENCY) {
        var batch = downloads.slice(bi, bi + CONCURRENCY);

        var promises = batch.map(function (item) {
            return (async function (item) {
                try {
                    var bytes = await downloadFile(item.url, item.destPath);
                    totalBytes += bytes;
                    success++;
                    if (byMarca[item.marca]) {
                        byMarca[item.marca].descargados++;
                        byMarca[item.marca].pendientes--;
                    }
                    lastItem = {
                        codigo: item.codigo,
                        clave: item.clave,
                        nombre: path.basename(item.destPath),
                        tamaño_kb: (bytes / 1024).toFixed(1),
                        relacionados: 1
                    };
                    process.stdout.write('✅ ' + item.codigo + ' ' + path.basename(item.destPath) + ' (' + (bytes / 1024).toFixed(0) + 'KB)\n');
                } catch (err) {
                    errors++;
                    recentErrors.push({ codigo: item.codigo, error: err.message, fecha: new Date().toISOString() });
                    if (recentErrors.length > 20) recentErrors.shift();
                    lastItem = {
                        codigo: item.codigo,
                        clave: item.clave,
                        nombre: path.basename(item.destPath),
                        tamaño_kb: 0,
                        relacionados: -1
                    };
                    process.stdout.write('❌ ' + item.codigo + ' ' + path.basename(item.destPath) + ' — ' + err.message + '\n');
                }
                processed++;
            })(item);
        });

        await Promise.all(promises);

        // Guardar progreso
        saveProgress(downloads.length, processed, success, errors, alreadyExist, lastItem, byMarca, 'procesando');

        if (processed % SAVE_EVERY < CONCURRENCY) {
            var elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            var rate = (processed / ((Date.now() - startTime) / 60000)).toFixed(1);
            var mb = (totalBytes / (1024 * 1024)).toFixed(1);
            console.log('\n📊 ' + processed + '/' + downloads.length + ' | ✅' + success + ' ❌' + errors + ' | ' + rate + ' imgs/min | ' + mb + 'MB | ' + elapsed + 's\n');
        }

        await sleep(DELAY_MS);
    }

    // Final
    saveProgress(downloads.length, processed, success, errors, alreadyExist, lastItem, byMarca, 'completado');

    var elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    var rate = (processed / ((Date.now() - startTime) / 60000)).toFixed(1);
    var mb = (totalBytes / (1024 * 1024)).toFixed(1);
    console.log('\n🏁 COMPLETADO');
    console.log('=============');
    console.log('Descargadas: ' + success + ' | Errores: ' + errors);
    console.log('Espacio: ' + mb + 'MB');
    console.log('Tiempo: ' + elapsed + 's (' + rate + ' imgs/min)');

    // Actualizar JSON con rutas locales
    console.log('\n📝 Actualizando productos con rutas locales...');
    var updated = 0;
    for (var pi = 0; pi < products.length; pi++) {
        var p = products[pi];
        var imgs = p.imagenes || [];
        var localPaths = [];
        for (var ii = 0; ii < imgs.length; ii++) {
            var lp = urlToLocalPath(imgs[ii], p.codigo);
            if (lp && fs.existsSync(lp)) {
                localPaths.push(lp.replace(/\\/g, '/'));
            }
        }
        if (localPaths.length > 0) {
            products[pi].imagenes_local = localPaths;
            updated++;
        }
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
    console.log('✅ ' + updated + ' productos actualizados con rutas locales');
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
