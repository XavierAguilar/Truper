const fs = require('fs');

console.log("==========================================");
console.log("   AUTOMATED VERIFICATION - JUNE 2026     ");
console.log("==========================================\n");

// 1. Check main JSON
if (!fs.existsSync('productos_truper.json')) {
    console.error("❌ ERROR: productos_truper.json does not exist!");
    process.exit(1);
}
console.log("✅ OK: productos_truper.json exists.");

let products = [];
try {
    products = JSON.parse(fs.readFileSync('productos_truper.json', 'utf8'));
    console.log(`✅ OK: parsed products database with ${products.length} products.`);
} catch (e) {
    console.error("❌ ERROR parsing productos_truper.json:", e.message);
    process.exit(1);
}

// 2. Check split minified files
const parts = [
    'productos_truper_min_part1.json',
    'productos_truper_min_part2.json',
    'productos_truper_min_part3.json',
    'productos_truper_min_part4.json'
];

let totalPartProducts = 0;
parts.forEach(part => {
    if (!fs.existsSync(part)) {
        console.error(`❌ ERROR: ${part} does not exist!`);
        return;
    }
    try {
        const pData = JSON.parse(fs.readFileSync(part, 'utf8'));
        console.log(`✅ OK: ${part} exists and contains ${pData.length} products.`);
        totalPartProducts += pData.length;
    } catch (e) {
        console.error(`❌ ERROR parsing ${part}:`, e.message);
    }
});

if (totalPartProducts === products.length) {
    console.log(`✅ OK: Total split products (${totalPartProducts}) matches master database (${products.length}).\n`);
} else {
    console.error(`❌ ERROR: Total split products (${totalPartProducts}) does not match master database (${products.length})!\n`);
}

// 3. Check new products of June 2026
console.log("=== NEW PRODUCTS OF JUNE 2026 (Sample of 3) ===");
const datosMensuales = JSON.parse(fs.readFileSync('datos_mensuales.json', 'utf8'));
const nuevos = datosMensuales.nuevos || [];
console.log(`Total new products detected this month: ${nuevos.length}`);

let sampleNuevos = nuevos.slice(0, 3);
sampleNuevos.forEach(code => {
    const p = products.find(prod => prod.codigo == code);
    if (!p) {
        console.error(`❌ ERROR: New product ${code} not found in database!`);
        return;
    }
    console.log(`Product ${code} (${p.clave}):`);
    console.log(`  Name:   ${p.nombre}`);
    console.log(`  Precios normal: `, p.precios);
    console.log(`  Promo:  `, p.promocion ? p.promocion : "NO PROMO ACTIVE");
    console.log(`  Imgs:   `, p.imagenes ? p.imagenes.length : 0);
    console.log(`  Specs:  `, p.especificaciones ? Object.keys(p.especificaciones).length : 0);
});

// 4. Check some promo products
console.log("\n=== PROMO PRODUCTS ACTIVE IN JUNE 2026 (Sample of 3) ===");
const promos = products.filter(p => p.promocion);
console.log(`Total active promotions: ${promos.length}`);

if (promos.length > 0) {
    const samplePromos = promos.slice(0, 3);
    samplePromos.forEach(p => {
        console.log(`Promo Product ${p.codigo} (${p.clave}):`);
        console.log(`  Name:   ${p.nombre}`);
        console.log(`  Pct:    ${p.promocion.porcentaje}%`);
        console.log(`  Normal: `, p.precios);
        console.log(`  Promo:  `, p.promocion.precios);
    });
} else {
    console.error("❌ ERROR: No active promotions found in database!");
}

console.log("\n==========================================");
console.log("          VERIFICATION FINISHED           ");
console.log("==========================================");
