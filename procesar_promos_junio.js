const fs = require('fs');
const xlsx = require('xlsx');

console.log("╔══════════════════════════════════════════════╗");
console.log("║   PROCESADOR DE PROMOCIONES — JUNIO 2026     ║");
console.log("╚══════════════════════════════════════════════╝\n");

// 1. Leer base de datos principal
console.log("Cargando productos_truper.json...");
const productosStr = fs.readFileSync('productos_truper.json', 'utf8');
const productos = JSON.parse(productosStr);
console.log(`Se cargaron ${productos.length} productos de la base de datos.`);

// Limpiar promociones viejas (Mayo)
let limpiados = 0;
productos.forEach(p => {
    if (p.promocion) {
        delete p.promocion;
        limpiados++;
    }
});
console.log(`Se removieron las promociones viejas de ${limpiados} productos.`);

// Construir un mapa para búsqueda rápida por código
const prodMap = new Map();
productos.forEach(p => {
    prodMap.set(p.codigo.toString(), p);
});

let actualizadosExcel = 0;
let actualizadosPDF = 0;

// 2. Procesar promociones desde el Excel (productos nuevos)
console.log("\nProcesando promos_junio.xlsx (novedades)...");
if (fs.existsSync('promos_junio.xlsx')) {
    const workbook = xlsx.readFile('promos_junio.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    console.log(`Se encontraron ${excelData.length} filas en el Excel.`);

    // Omitimos la primera fila que son encabezados de nombres de columnas
    excelData.slice(1).forEach(row => {
        const codigo = row['__EMPTY'] ? row['__EMPTY'].toString().trim() : null;
        if (!codigo) return;

        const p = prodMap.get(codigo);
        if (p) {
            const dist = parseFloat(row['Distr.']);
            const may = parseFloat(row['mayoreo']);
            const med = parseFloat(row['medio may']);
            const pub = parseFloat(row['Publico']);

            if (!isNaN(dist) && !isNaN(pub)) {
                let porc = 0;
                if (p.precios && p.precios.publico) {
                    const oldPub = parseFloat(p.precios.publico);
                    if (oldPub > pub) {
                        porc = Math.round(((oldPub - pub) / oldPub) * 100);
                        porc = Math.round(porc / 5) * 5; 
                    }
                }
                if (porc === 0) porc = 10; // Fallback si no hay cambio o es nuevo de paquete

                p.promocion = {
                    porcentaje: porc,
                    precios: {
                        distribuidor: dist,
                        mayoreo: may,
                        medio_mayoreo: med,
                        publico: pub
                    }
                };
                actualizadosExcel++;
            }
        }
    });
    console.log(`✅ Promociones aplicadas desde Excel: ${actualizadosExcel} productos.`);
} else {
    console.log("⚠️ No se encontró el archivo promos_junio.xlsx, se omite.");
}

// 3. Procesar promociones desde el PDF (nacionales y de temporada)
console.log("\nProcesando pdf_text.txt (promociones generales del PDF)...");
if (fs.existsSync('pdf_text.txt')) {
    const text = fs.readFileSync('pdf_text.txt', 'utf8');
    const lines = text.split('\n');

    const pdfPromos = new Map();

    // A. Procesar tablas horizontales del PDF
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Código:')) {
            const codeTokens = line.split(/\t+/).map(t => t.trim()).filter(Boolean);
            let promoTokens = [];
            let distTokens = [];
            for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                const l = lines[j];
                if (l.includes('Promoción:')) {
                    promoTokens = l.split(/\t+/).map(t => t.trim()).filter(Boolean);
                }
                if (l.includes('Distribuidor:')) {
                    distTokens = l.split(/\t+/).map(t => t.trim()).filter(Boolean);
                }
            }

            for (let idx = 1; idx < codeTokens.length; idx++) {
                const code = codeTokens[idx];
                if (prodMap.has(code)) {
                    const promoStr = promoTokens[idx];
                    const distStr = distTokens[idx];
                    if (promoStr && distStr) {
                        const promoVal = parseFloat(promoStr.replace(/[$,\s]/g, ''));
                        const distVal = parseFloat(distStr.replace(/[$,\s]/g, ''));
                        if (!isNaN(promoVal) && !isNaN(distVal)) {
                            let pct = Math.round(((distVal - promoVal) / distVal) * 100);
                            pct = Math.round(pct / 5) * 5;
                            pdfPromos.set(code, {
                                codigo: code,
                                distNormal: distVal,
                                distPromo: promoVal,
                                porcentaje: pct
                            });
                        }
                    }
                }
            }
        }
    }

    // B. Procesar líneas individuales con regex vertical
    const regex = /(\b\d{5,6}\b).*?\$[\s]*([\d,]+(?:\.\d{2})?).*?\$[\s]*([\d,]+(?:\.\d{2})?)/;
    lines.forEach(line => {
        if (line.includes('Código:')) return;
        const match = line.match(regex);
        if (match) {
            const code = match[1];
            if (prodMap.has(code)) {
                const promoVal = parseFloat(match[2].replace(/[$,\s]/g, ''));
                const distVal = parseFloat(match[3].replace(/[$,\s]/g, ''));
                if (!isNaN(promoVal) && !isNaN(distVal)) {
                    let pct = Math.round(((distVal - promoVal) / distVal) * 100);
                    pct = Math.round(pct / 5) * 5;
                    // Evitar sobreescribir si ya se capturó
                    if (!pdfPromos.has(code)) {
                        pdfPromos.set(code, {
                            codigo: code,
                            distNormal: distVal,
                            distPromo: promoVal,
                            porcentaje: pct
                        });
                    }
                }
            }
        }
    });

    console.log(`Se extrajeron ${pdfPromos.size} promociones válidas del PDF.`);

    // Aplicar las promociones del PDF si no estaban ya en Excel
    for (const [code, promoData] of pdfPromos) {
        const p = prodMap.get(code);
        if (p) {
            // Si ya fue actualizado por Excel (que tiene precios de todos los niveles exactos), lo respetamos
            if (p.promocion) {
                continue;
            }

            if (p.precios) {
                const pct = promoData.porcentaje;
                const dist = promoData.distPromo;
                // Calcular proporcionalmente los otros niveles
                const may = Math.round(p.precios.mayoreo * (1 - pct / 100) * 100) / 100;
                const med = Math.round(p.precios.medioMayoreo * (1 - pct / 100) * 100) / 100;
                const pub = Math.round(p.precios.publico * (1 - pct / 100) * 100) / 100;

                p.promocion = {
                    porcentaje: pct,
                    precios: {
                        distribuidor: dist,
                        mayoreo: may,
                        medio_mayoreo: med,
                        publico: pub
                    }
                };
                actualizadosPDF++;
            }
        }
    }
    console.log(`✅ Promociones aplicadas desde PDF: ${actualizadosPDF} productos.`);
} else {
    console.log("⚠️ No se encontró pdf_text.txt, se omite.");
}

// 4. Guardar base de datos consolidada
console.log("\nGuardando base de datos productos_truper.json...");
fs.writeFileSync('productos_truper.json', JSON.stringify(productos, null, 2), 'utf8');

// 5. Guardar en datos_mensuales.json el resumen de promociones
console.log("Actualizando datos_mensuales.json...");
if (fs.existsSync('datos_mensuales.json')) {
    const datosMensuales = JSON.parse(fs.readFileSync('datos_mensuales.json', 'utf8'));
    // Listar todos los códigos que tienen promoción activa
    const totalPromos = productos.filter(p => p.promocion).map(p => p.codigo);
    datosMensuales.descuentos = totalPromos;
    fs.writeFileSync('datos_mensuales.json', JSON.stringify(datosMensuales, null, 2), 'utf8');
    console.log(`Se guardaron ${totalPromos.length} códigos de descuento en datos_mensuales.json.`);
}

console.log("\n╔══════════════════════════════════════════════╗");
console.log(`║ RESUMEN: Promociones totales aplicadas: ${String(actualizadosExcel + actualizadosPDF).padStart(4)} ║`);
console.log(`║   - Desde Excel (nuevos):            ${String(actualizadosExcel).padStart(4)} ║`);
console.log(`║   - Desde PDF (temporada/nacionales): ${String(actualizadosPDF).padStart(4)} ║`);
console.log("╚══════════════════════════════════════════════╝\n");
console.log("🏁 Proceso de promociones completado exitosamente.");
