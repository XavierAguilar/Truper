/**
 * importar_precios.js — Importador Mensual de Precios Truper
 * 
 * Lee el CSV más reciente de la carpeta "lista/" y actualiza
 * productos_truper.json con los 4 precios (con IVA):
 *   - Mayoreo (col 11)
 *   - Distribuidor (col 12)
 *   - Público (col 13)
 *   - Medio Mayoreo (col 19)
 * 
 * Uso: node importar_precios.js
 */

const fs = require('fs');
const path = require('path');

// ===== CONFIGURACIÓN =====
const LISTA_DIR = path.join(__dirname, 'lista');
const PRODUCTOS_FILE = path.join(__dirname, 'productos_truper.json');
const DATOS_MENSUALES_FILE = path.join(__dirname, 'datos_mensuales.json');

// Índices de columnas en el CSV (0-based)
const COL = {
    codigo: 0,
    clave: 1,
    descripcion: 2,
    ean: 8,             // I - código de barras EAN
    mayoreo: 11,       // L - precio mayoreo con IVA
    distribuidor: 12,   // M - precio distribuidor con IVA
    publico: 13,        // N - precio público con IVA
    medioMayoreo: 19,   // T - Precio Medio Mayoreo con IVA
    marca: 17           // R - Marca
};

// ===== FUNCIONES AUXILIARES =====

/** Buscar el CSV más reciente en la carpeta lista/ */
function encontrarCSVReciente() {
    const archivos = fs.readdirSync(LISTA_DIR)
        .filter(f => f.toLowerCase().endsWith('.csv'))
        .map(f => ({
            nombre: f,
            ruta: path.join(LISTA_DIR, f),
            fecha: fs.statSync(path.join(LISTA_DIR, f)).mtimeMs
        }))
        .sort((a, b) => b.fecha - a.fecha);

    if (archivos.length === 0) {
        console.error('❌ No se encontró ningún archivo CSV en:', LISTA_DIR);
        process.exit(1);
    }

    console.log(`📄 CSV encontrado: ${archivos[0].nombre}`);
    return archivos[0].ruta;
}

/** Parsear una línea CSV respetando comillas */
function parsearLineaCSV(linea) {
    const valores = [];
    let enComillas = false, actual = '';
    for (let i = 0; i < linea.length; i++) {
        const ch = linea[i];
        if (ch === '"') { enComillas = !enComillas; continue; }
        if (ch === ',' && !enComillas) { valores.push(actual.trim()); actual = ''; continue; }
        if (ch === '\r') continue;
        actual += ch;
    }
    valores.push(actual.trim());
    return valores;
}

/** Convertir texto a número de precio, retorna null si no es válido */
function parsearPrecio(texto) {
    if (!texto || texto === '') return null;
    const limpio = texto.replace(/[$,\s]/g, '');
    const num = parseFloat(limpio);
    return isNaN(num) ? null : Math.round(num * 100) / 100;
}

// ===== PROCESO PRINCIPAL =====
function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   IMPORTADOR DE PRECIOS — CATÁLOGO TRUPER   ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // 1. Leer el CSV más reciente
    const rutaCSV = encontrarCSVReciente();
    const contenidoCSV = fs.readFileSync(rutaCSV, 'latin1');
    const lineas = contenidoCSV.split('\n').filter(l => l.trim());

    // Saltar la línea de encabezado
    const encabezados = parsearLineaCSV(lineas[0]);
    console.log(`📊 Columnas detectadas: ${encabezados.length}`);
    console.log(`📦 Filas de datos: ${lineas.length - 1}`);
    console.log('');

    // 2. Parsear todos los productos del CSV
    const productosCSV = new Map();
    let erroresParseado = 0;

    for (let i = 1; i < lineas.length; i++) {
        const vals = parsearLineaCSV(lineas[i]);
        const codigo = vals[COL.codigo];
        if (!codigo) { erroresParseado++; continue; }

        productosCSV.set(codigo, {
            codigo: codigo,
            clave: vals[COL.clave] || '',
            descripcion: vals[COL.descripcion] || '',
            marca: vals[COL.marca] || '',
            ean: vals[COL.ean] || '',
            precios: {
                distribuidor: parsearPrecio(vals[COL.distribuidor]),
                mayoreo: parsearPrecio(vals[COL.mayoreo]),
                medioMayoreo: parsearPrecio(vals[COL.medioMayoreo]),
                publico: parsearPrecio(vals[COL.publico])
            }
        });
    }

    console.log(`✅ Productos parseados del CSV: ${productosCSV.size}`);
    if (erroresParseado > 0) console.log(`⚠️  Líneas con error de parseo: ${erroresParseado}`);

    // 3. Cargar el JSON actual
    let productos = [];
    if (fs.existsSync(PRODUCTOS_FILE)) {
        productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE, 'utf8'));
        console.log(`📁 Productos en JSON actual: ${productos.length}`);
    } else {
        console.log('⚠️  No se encontró productos_truper.json, se creará uno nuevo');
    }
    console.log('');

    // 4. Cruzar datos — Índice de productos JSON por código
    const indicePorCodigo = new Map();
    productos.forEach((p, i) => indicePorCodigo.set(p.codigo, i));

    // Contadores para el reporte
    let actualizados = 0;
    let nuevos = 0;
    let descontinuados = 0;
    let sinCambio = 0;
    const listaNuevos = [];
    const listaDescontinuados = [];
    const preciosAnteriores = new Map();

    // 4a. Actualizar/agregar productos del CSV
    for (const [codigo, datosCSV] of productosCSV) {
        const idxJSON = indicePorCodigo.get(codigo);

        if (idxJSON !== undefined) {
            // Producto existente — actualizar precios
            const producto = productos[idxJSON];
            const preciosViejos = producto.precios || {};
            preciosAnteriores.set(codigo, { ...preciosViejos });

            producto.precios = datosCSV.precios;
            producto.ean = datosCSV.ean || producto.ean || '';

            // Si estaba marcado como descontinuado, reactivarlo
            if (producto.descontinuado) {
                delete producto.descontinuado;
            }

            // Verificar si cambió
            const cambio = JSON.stringify(preciosViejos) !== JSON.stringify(datosCSV.precios);
            if (cambio) actualizados++;
            else sinCambio++;
        } else {
            // Producto nuevo — agregar con ficha parcial
            productos.push({
                codigo: datosCSV.codigo,
                clave: datosCSV.clave,
                nombre: datosCSV.descripcion,
                descripcion_csv: datosCSV.descripcion,
                marca: datosCSV.marca,
                precios: datosCSV.precios,
                ean: datosCSV.ean,
                imagenes: [],
                caracteristicas: [],
                especificaciones: {},
                alias_busqueda: [],
                origen: 'lista_precios'
            });
            nuevos++;
            listaNuevos.push(datosCSV.codigo);
        }
    }

    // 4b. Marcar descontinuados (en JSON pero no en CSV)
    for (const producto of productos) {
        if (!productosCSV.has(producto.codigo) && !producto.descontinuado) {
            producto.descontinuado = true;
            delete producto.precios;
            descontinuados++;
            listaDescontinuados.push(producto.codigo);
        }
    }

    // 5. Calcular volatilidad de precios
    const subieron = [];
    const bajaron = [];

    for (const [codigo, datosCSV] of productosCSV) {
        const viejos = preciosAnteriores.get(codigo);
        if (!viejos || !viejos.publico) continue;
        const precioViejo = viejos.publico;
        const precioNuevo = datosCSV.precios.publico;
        if (!precioNuevo) continue;

        if (precioNuevo > precioViejo) {
            subieron.push({ codigo, anterior: precioViejo, actual: precioNuevo });
        } else if (precioNuevo < precioViejo) {
            bajaron.push({ codigo, anterior: precioViejo, actual: precioNuevo });
        }
    }

    // 6. Guardar JSON actualizado
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2), 'utf8');
    console.log(`💾 JSON guardado: ${productos.length} productos`);

    // 7. Guardar datos mensuales
    const datosMensuales = {
        fechaActualizacion: new Date().toISOString().split('T')[0],
        archivoCSV: path.basename(rutaCSV),
        nuevos: listaNuevos,
        descontinuados: listaDescontinuados,
        volatiles: {
            subieron: subieron.slice(0, 50),
            bajaron: bajaron.slice(0, 50)
        },
        descuentos: [] // Se llenará cuando se procesen los PDFs
    };
    fs.writeFileSync(DATOS_MENSUALES_FILE, JSON.stringify(datosMensuales, null, 2), 'utf8');
    console.log(`💾 Datos mensuales guardados en: datos_mensuales.json`);

    // 8. Imprimir reporte
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║              REPORTE DE CAMBIOS              ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  📦 Total productos ahora:    ${String(productos.length).padStart(13)} ║`);
    console.log(`║  ✅ Precios actualizados:      ${String(actualizados).padStart(13)} ║`);
    console.log(`║  🔄 Sin cambio de precio:      ${String(sinCambio).padStart(13)} ║`);
    console.log(`║  🆕 Productos nuevos:          ${String(nuevos).padStart(13)} ║`);
    console.log(`║  ❌ Descontinuados:            ${String(descontinuados).padStart(13)} ║`);
    console.log(`║  📈 Subieron de precio:        ${String(subieron.length).padStart(13)} ║`);
    console.log(`║  📉 Bajaron de precio:         ${String(bajaron.length).padStart(13)} ║`);
    console.log('╚══════════════════════════════════════════════╝');

    if (listaNuevos.length > 0) {
        console.log(`\n🆕 Códigos nuevos: ${listaNuevos.join(', ')}`);
    }
    if (listaDescontinuados.length > 0) {
        console.log(`\n❌ Códigos descontinuados: ${listaDescontinuados.join(', ')}`);
    }

    console.log('\n✨ Importación completada exitosamente.');
}

main();
