/**
 * marcar_nuevos.js — Marca productos nuevos desde Truper
 * 
 * Scrape la lista de productos nuevos de:
 *   https://www.truper.com/CatVigente/productosNuevos?page=1..N
 * 
 * Marca con "es_nuevo: true" los que aparezcan en la lista.
 * Quita la marca a los que ya NO aparezcan.
 * 
 * Uso: node marcar_nuevos.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PRODUCTOS_FILE = path.join(__dirname, 'productos_truper.json');
const PROGRESO_FILE = path.join(__dirname, 'progreso_nuevos.json');
const BASE_URL = 'https://www.truper.com/CatVigente/productosNuevos?page=';

// ===== FUNCIONES AUXILIARES =====

function guardarProgreso(estado, paginasProcesadas, totalPaginas, codigosEncontrados, marcados = 0) {
    const progreso = {
        estado: estado, // 'ejecutando' o 'completado'
        salud: estado === 'error' ? 'critical' : 'healthy',
        total_paginas: totalPaginas || 0,
        procesados: paginasProcesadas,
        pendientes: (totalPaginas || 0) - paginasProcesadas,
        codigos_encontrados: codigosEncontrados,
        marcados: marcados,
        ultima_actualizacion: new Date().toISOString()
    };
    fs.writeFileSync(PROGRESO_FILE, JSON.stringify(progreso, null, 2), 'utf8');
}

/** Hacer GET request con https nativo (retorna promesa) */
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/** Extraer códigos de producto del HTML de una página */
function extraerCodigos(html) {
    const codigos = new Set();
    // Patrón: ?codigo=XXXXX en los enlaces de ficha técnica
    const regex = /[?&]codigo=(\d+)/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        codigos.add(match[1]);
    }
    return codigos;
}

/** Detectar número total de páginas del HTML */
function detectarTotalPaginas(html) {
    // Buscar el número de página más alto en los enlaces de paginación
    const regex = /productosNuevos\?page=(\d+)/g;
    let max = 1, match;
    while ((match = regex.exec(html)) !== null) {
        const num = parseInt(match[1]);
        if (num > max) max = num;
    }
    return max;
}

/** Espera con delay */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== PROCESO PRINCIPAL =====
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║    MARCADOR DE PRODUCTOS NUEVOS — TRUPER    ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // 1. Obtener primera página para saber el total
    console.log('🔍 Descargando página 1...');
    const html1 = await fetchPage(BASE_URL + '1');
    const totalPaginas = detectarTotalPaginas(html1);
    console.log(`📄 Total de páginas detectadas: ${totalPaginas}`);
    
    // Iniciar progreso
    guardarProgreso('ejecutando', 1, totalPaginas, 0);

    // 2. Extraer códigos de todas las páginas
    const todosLosCodigos = new Set();
    const codigosPag1 = extraerCodigos(html1);
    codigosPag1.forEach(c => todosLosCodigos.add(c));
    console.log(`   Página 1: ${codigosPag1.size} códigos`);

    for (let page = 2; page <= totalPaginas; page++) {
        try {
            const html = await fetchPage(BASE_URL + page);
            const codigos = extraerCodigos(html);
            codigos.forEach(c => todosLosCodigos.add(c));

            if (page % 10 === 0 || page === totalPaginas) {
                console.log(`   Página ${page}/${totalPaginas}: ${codigos.size} códigos (total acumulado: ${todosLosCodigos.size})`);
            }
            guardarProgreso('ejecutando', page, totalPaginas, todosLosCodigos.size);

            // Delay para no sobrecargar el servidor
            await delay(200);
        } catch (err) {
            console.log(`   ⚠️  Error en página ${page}: ${err.message}`);
        }
    }

    console.log(`\n✅ Total códigos nuevos encontrados: ${todosLosCodigos.size}`);

    // 3. Cargar productos y actualizar
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, 'utf8'));
    console.log(`📁 Productos en JSON: ${productos.length}`);

    let marcados = 0;
    let desmarcados = 0;
    let noEncontrados = 0;

    const indicePorCodigo = new Map();
    productos.forEach((p, i) => indicePorCodigo.set(p.codigo, i));

    // Primero: quitar marca "es_nuevo" de TODOS
    for (const producto of productos) {
        if (producto.es_nuevo) {
            producto.es_nuevo = false;
            desmarcados++;
        }
    }

    // Luego: marcar solo los que están en la lista de Truper
    for (const codigo of todosLosCodigos) {
        const idx = indicePorCodigo.get(codigo);
        if (idx !== undefined) {
            if (productos[idx].es_nuevo) {
                // Ya estaba marcado (no contar como desmarcado)
                desmarcados--;
            }
            productos[idx].es_nuevo = true;
            marcados++;
        } else {
            noEncontrados++;
        }
    }

    // 4. Guardar
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2), 'utf8');

    // 5. Reporte
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║           REPORTE PRODUCTOS NUEVOS           ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  🆕 Marcados como NUEVO:       ${String(marcados).padStart(13)} ║`);
    console.log(`║  ❌ Etiqueta removida:          ${String(desmarcados).padStart(13)} ║`);
    console.log(`║  ⚠️  No encontrados en JSON:    ${String(noEncontrados).padStart(13)} ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('\n✨ Proceso completado.');

    guardarProgreso('completado', totalPaginas, totalPaginas, todosLosCodigos.size, marcados);
}

main().catch(err => {
    console.error('❌ Error fatal:', err.message);
    guardarProgreso('error', 0, 0, 0, 0);
    process.exit(1);
});
